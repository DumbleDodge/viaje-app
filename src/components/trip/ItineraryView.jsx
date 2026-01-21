import React, { useState } from 'react';
import {
  Box, Container, Card, Stack, Typography, IconButton, Chip, Paper,
  Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button,
  Collapse, CardActionArea, InputBase, InputAdornment, Backdrop, CircularProgress
} from '@mui/material';
import dayjs from 'dayjs';

//S3
import { uploadFileToR2, deleteFileFromR2 } from '../../utils/storageClient';


// LIBRERÍA DND (Migrada a Dnd-Kit)
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor,
  useSensors, TouchSensor, DragOverlay, MouseSensor, defaultDropAnimationSideEffects, useDroppable
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy
} from "@dnd-kit/sortable";

// Iconos
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import StickyNote2Icon from "@mui/icons-material/StickyNote2";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import DirectionsIcon from "@mui/icons-material/Directions";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import MapIcon from "@mui/icons-material/Map";
import ChecklistRtlIcon from '@mui/icons-material/ChecklistRtl';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CloseIcon from "@mui/icons-material/Close";
import PlaceIcon from "@mui/icons-material/Place";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import LinkIcon from "@mui/icons-material/Link";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import SmartAttachmentChip from '../common/SmartAttachmentChip';

import { useTheme } from "@mui/material";
import { supabase } from '../../supabaseClient';
import { useTripContext } from '../../TripContext';
import SortableItem from '../common/SortableItem';



function ItineraryView({ trip, items, setItems, isReorderMode, onEnableReorder, tripId, onOpenAttachment, refreshTrigger }) {
  const theme = useTheme();

  // 1. SOLUCIÓN ERROR: Sacamos userProfile del contexto
  const { userProfile } = useTripContext();

  // Estados Locales
  const [openItemModal, setOpenItemModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newItem, setNewItem] = useState({ type: "place", title: "", time: "10:00", mapsLink: "", description: "", flightNumber: "", terminal: "", gate: "", origin: "", destination: "" });
  const [selectedDate, setSelectedDate] = useState("");

  // Archivos
  const [files, setFiles] = useState([]);
  const [existingAttachments, setExistingAttachments] = useState([]);
  const [filesToDelete, setFilesToDelete] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Estados Visuales
  const [isNotesExpanded, setIsNotesExpanded] = useState(false);
  const [editNotesOpen, setEditNotesOpen] = useState(false);
  const [tripNotes, setTripNotes] = useState(trip?.notes || "");
  const [isChecklistExpanded, setIsChecklistExpanded] = useState(false);
  const [newCheckItem, setNewCheckItem] = useState('');

  // Estados Borrado
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);


  const [expandingUrl, setExpandingUrl] = useState(false); // <--- NUEVO ESTADO

  // --- CONFIGURACIÓN TIPOS ---
  const getTypeConfig = (type) => {
    switch (type) {
      case "flight": return { icon: <FlightTakeoffIcon fontSize="small" />, label: "Vuelo", ...theme.palette.custom.flight };
      case "food": return { icon: <RestaurantIcon fontSize="small" />, label: "Comida", ...theme.palette.custom.food };
      case "transport": return { icon: <DirectionsIcon fontSize="small" />, label: "Transporte", ...theme.palette.custom.transport };
      default: return { icon: <LocationOnIcon fontSize="small" />, label: "Lugar", ...theme.palette.custom.place };
    }
  };

  const handleDisplayModeClick = (item) => {
    if (item.mapsLink) window.open(item.mapsLink);
  };

  // --- 2. SOLUCIÓN UBICACIÓN: Función Helper Recuperada ---
  // --- FUNCIÓN INTELIGENTE DE UBICACIÓN ---
  const fetchLocationFromUrl = async (urlInput) => {
    if (!urlInput) return { locationName: null, finalUrl: urlInput };

    let lat = null, lng = null;
    let finalUrl = urlInput; // Por defecto la misma

    // A. ¿Es un link corto? (maps.app.goo.gl) -> Preguntar al servidor
    if (urlInput.includes('goo.gl') || urlInput.includes('maps.app.goo.gl') || !urlInput.includes('@')) {
      try {
        console.log("🔍 Expandiendo URL corta...");
        const { data, error } = await supabase.functions.invoke('expand-url', {
          body: { url: urlInput }
        });

        if (!error && data && data.lat) {
          lat = data.lat;
          lng = data.lng;
          console.log("📍 Coordenadas recuperadas del servidor:", lat, lng);
          finalUrl = data.final || urlInput; // <--- GUARDAMOS LA URL EXPANDIDA
        }
      } catch (e) {
        console.warn("Fallo al expandir URL en servidor", e);
      }
    }

    // B. Si no conseguimos nada (o es link largo), intentamos extracción local
    if (!lat) {
      try {
        const pinMatch = urlInput.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
        if (pinMatch) { lat = pinMatch[1]; lng = pinMatch[2]; }
        else {
          const viewMatch = urlInput.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
          if (viewMatch) { lat = viewMatch[1]; lng = viewMatch[2]; }
        }
      } catch (e) { }
    }

    // C. Geocoding Inverso (De números a texto)
    let locationName = null;
    if (lat && lng) {
      try {
        const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=es`);
        const data = await res.json();
        const city = data.city || data.locality || data.principalSubdivision;
        const country = data.countryName;
        if (city && country) locationName = `${city}, ${country}`;
        else locationName = city || country;
      } catch (e) { }
    }

    return { locationName, finalUrl }; // <--- DEVOLVEMOS AMBOS
  };

  // --- HANDLERS ITEMS ---
  const openCreate = (date) => {
    setNewItem({ type: 'place', title: '', time: '10:00', mapsLink: '', description: '', flightNumber: '', terminal: '', gate: '', origin: '', destination: '' });
    setFiles([]); setExistingAttachments([]); setFilesToDelete([]); setSelectedDate(date); setIsEditing(false); setOpenItemModal(true);
  };

  const openEdit = (item) => {
    setNewItem({ ...item, mapsLink: item.mapsLink || '' }); setSelectedDate(item.date); setExistingAttachments(item.attachments || []); setFiles([]); setFilesToDelete([]); setEditingId(item.id); setIsEditing(true); setOpenItemModal(true);
  };

  const deleteAttachment = (index) => {
    const attachmentToRemove = existingAttachments[index];
    if (attachmentToRemove.path) setFilesToDelete(prev => [...prev, attachmentToRemove.path]);
    const updated = [...existingAttachments];
    updated.splice(index, 1);
    setExistingAttachments(updated);
  };

  const handleSaveItem = async () => {
    // 1. Comprobación de límites de almacenamiento
    const newFilesSize = files.reduce((acc, file) => acc + file.size, 0);
    const LIMIT_FREE = 20 * 1024 * 1024;
    const LIMIT_PRO = 200 * 1024 * 1024;
    const currentLimit = userProfile?.is_pro ? LIMIT_PRO : LIMIT_FREE;

    // 1. Activar spinner si hay URL de mapa
    if (newItem.mapsLink) setExpandingUrl(true);
    setUploading(true);

    if ((userProfile?.storage_used || 0) + newFilesSize > currentLimit) {
      alert(`⚠️ No tienes suficiente espacio.\n\nLímite: ${userProfile?.is_pro ? '200MB' : '20MB'}\nUsado: ${(userProfile?.storage_used / 1024 / 1024).toFixed(1)}MB`);
      return;
    }

    setUploading(true);
    try {
      // 2. Borrar archivos eliminados
      if (filesToDelete.length > 0) {
        await Promise.all(filesToDelete.map(path => deleteFileFromR2(path)));
      }

      let finalAttachments = [...existingAttachments];

      // 3. Subir nuevos archivos
      if (files.length > 0) {
        for (const file of files) {
          const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
          const filePath = `${tripId}/${Date.now()}_${safeName}`;

          const publicUrl = await uploadFileToR2(file, filePath);

          // Actualizar contador de almacenamiento en BD
          await supabase.rpc('increment_storage', {
            amount: file.size,
            user_id: (await supabase.auth.getUser()).data.user.id
          });

          finalAttachments.push({
            name: file.name,
            url: publicUrl,
            path: filePath,
            type: file.type
          });
        }
      }

      // 4. Calcular Ubicación Automática
      const { locationName, finalUrl } = await fetchLocationFromUrl(newItem.mapsLink);

      // 5. Preparar objeto para DB
      const itemData = {
        trip_id: tripId,
        date: selectedDate,
        order_index: Date.now(),
        type: newItem.type,
        title: newItem.title,
        time: newItem.time,
        description: newItem.description,

        // BORRADA LA ANTIGUA

        flight_number: newItem.flightNumber,
        origin: newItem.origin,
        destination: newItem.destination,
        terminal: newItem.terminal,
        gate: newItem.gate,

        location_name: locationName,
        maps_link: finalUrl, // <--- ÚNICA Y CORRECTA

        attachments: finalAttachments
      };


      if (isEditing) {
        const { order_index, ...updateData } = itemData;
        await supabase.from('trip_items').update(updateData).eq('id', editingId);
        // Actualizamos estado local inmediatamente
        setItems(prev => prev.map(i => i.id === editingId ? { ...i, ...itemData } : i));
      } else {
        const { data } = await supabase.from('trip_items').insert([itemData]).select();
        if (data) {
          const newLocalItem = { ...data[0], mapsLink: data[0].maps_link, flightNumber: data[0].flight_number };
          setItems(prev => [...prev, newLocalItem]);
        }
      }
      setOpenItemModal(false);
      setFiles([]);
      setFilesToDelete([]);
    } catch (e) {
      console.error(e);
      alert("Error guardando: " + e.message);
    } finally {
      setUploading(false);
      setExpandingUrl(false); // <--- DESACTIVAR AL TERMINAR
    }
  };

  // --- BORRADO ---
  const confirmDelete = (id) => { setItemToDelete(id); setDeleteConfirmOpen(true); };
  const executeDelete = async () => {
    if (itemToDelete) {
      const { error } = await supabase.from('trip_items').delete().eq('id', itemToDelete);
      if (!error) setItems(prev => prev.filter(i => i.id !== itemToDelete));
    }
    setDeleteConfirmOpen(false); setItemToDelete(null);
  };

  // --- NOTAS & CHECKLIST ---
  const handleSaveNotes = async () => { await supabase.from('trips').update({ notes: tripNotes }).eq('id', tripId); setEditNotesOpen(false); };
  const handleAddCheckItem = async () => { if (!newCheckItem.trim()) return; const currentList = trip.checklist || []; const updatedList = [...currentList, { text: newCheckItem, done: false }]; await supabase.from('trips').update({ checklist: updatedList }).eq('id', tripId); setNewCheckItem(''); };
  const handleToggleCheckItem = async (index) => { const currentList = trip.checklist || []; const updatedList = [...currentList]; updatedList[index] = { ...updatedList[index], done: !updatedList[index].done }; await supabase.from('trips').update({ checklist: updatedList }).eq('id', tripId); };
  const handleDeleteCheckItem = async (index) => { const currentList = trip.checklist || []; const updatedList = [...currentList]; updatedList.splice(index, 1); await supabase.from('trips').update({ checklist: updatedList }).eq('id', tripId); };

  // --- DRAG AND DROP (DND-KIT) ---
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
    // AQUI ES DONDE AJUSTAMOS EL DELAY
    useSensor(TouchSensor, { activationConstraint: { delay: 500, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
    if (navigator.vibrate && navigator.userActivation?.hasBeenActive) {
      try { navigator.vibrate(50); } catch (e) { }
    }
    if (onEnableReorder && !isReorderMode) {
      onEnableReorder(true);
    }
    document.body.style.overflow = 'hidden';
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeItem = items.find(i => i.id === active.id);
    const overItem = items.find(i => i.id === over.id);

    if (!activeItem) return;

    const activeDay = activeItem.date;
    const overDay = overItem ? overItem.date : over.id; // over.id puede ser la fecha del droppable vacío

    if (activeDay !== overDay) {
      setItems((prev) => {
        const activeIndex = prev.findIndex(i => i.id === active.id);
        const newItems = [...prev];
        newItems[activeIndex] = { ...prev[activeIndex], date: overDay };
        return newItems;
      });
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);
    document.body.style.overflow = '';

    if (!over) return;

    // 1. Identificar Día Destino de forma robusta
    const overItem = items.find(i => i.id === over.id);
    const targetDate = overItem ? overItem.date : over.id;

    const activeItem = items.find(i => i.id === active.id);
    if (!activeItem || !targetDate) return;

    // 2. Preparar Items del Día Destino
    // Usamos state local fresco para asegurarnos de que tenemos los datos más recientes
    // INCLUSO si handleDragOver falló o no se renderizó aún
    let allItems = [...items];
    const activeIndexGlobal = allItems.findIndex(i => i.id === active.id);

    // FORZAMOS la actualización de la fecha en nuestra copia local si no coincide
    if (allItems[activeIndexGlobal].date !== targetDate) {
      allItems[activeIndexGlobal] = { ...allItems[activeIndexGlobal], date: targetDate };
    }

    // 3. Ordenar dentro del día destino
    const dayItems = allItems
      .filter(i => i.date === targetDate)
      .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

    const oldIndex = dayItems.findIndex(i => i.id === active.id);
    const newIndex = overItem ? dayItems.findIndex(i => i.id === overItem.id) : dayItems.length - 1;

    let newOrderedDayItems = arrayMove(dayItems, oldIndex, newIndex);

    // FIX: Actualizamos el order_index en el estado local YA MISMO
    // Si no hacemos esto, al volver a renderizar (que ordena por order_index), se revierten
    newOrderedDayItems = newOrderedDayItems.map((item, index) => ({
      ...item,
      order_index: index
    }));

    // 4. Reconstruimos la lista global
    const otherItems = allItems.filter(i => i.date !== targetDate);
    const finalItems = [...otherItems, ...newOrderedDayItems];

    setItems(finalItems);

    // 5. Persistencia
    const updates = newOrderedDayItems.map((item, index) => ({
      id: item.id,
      trip_id: tripId,
      date: targetDate,
      order_index: index,
      title: item.title,
      type: item.type
    }));

    const { error } = await supabase.from('trip_items').upsert(updates);
    if (error) console.error("Error saving order", error);
  };

  const handleDragCancel = () => {
    setActiveId(null);
    document.body.style.overflow = '';
  };


  let days = [];
  try { const s = trip?.startDate ? dayjs(trip.startDate) : dayjs(); const e = trip?.endDate ? dayjs(trip.endDate) : s; for (let i = 0; i <= Math.max(0, e.diff(s, "day")); i++) days.push(s.add(i, "day").format("YYYY-MM-DD")); } catch (e) { }


  // Helper para renderizar tarjeta (usado en lista y overlay)
  const renderCard = (item, isOverlay = false) => {
    const themeColor = theme.palette.custom?.[item.type] || theme.palette.custom.place;
    const config = getTypeConfig(item.type);
    const isFlight = item.type === 'flight';

    return (
      <Card
        sx={{
          bgcolor: 'background.paper', p: 1.2, display: 'flex', gap: 1.5, alignItems: 'flex-start', borderRadius: '14px',
          border: isReorderMode ? (isOverlay ? `2px solid ${theme.palette.primary.main}` : `1px dashed ${theme.palette.primary.main}`) : 'none',
          boxShadow: isOverlay ? '0 20px 40px rgba(0,0,0,0.3)' : '0 2px 4px rgba(0,0,0,0.03)',
          transform: isOverlay ? 'scale(1.05)' : 'none',
          userSelect: 'none',
          width: '100%' // Important for sortable
        }}>

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 40 }}>
          <Box sx={{ width: 40, height: 40, bgcolor: config.bg, color: config.color, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{React.cloneElement(config.icon, { sx: { fontSize: 20 } })}</Box>
          {item.time && <Typography variant="caption" sx={{ mt: 0.5, fontWeight: 700, color: 'text.secondary', fontSize: '0.65rem', lineHeight: 1 }}>{item.time}</Typography>}
        </Box>

        <Box flexGrow={1} minWidth={0} pt={0.2}>
          <Typography variant="subtitle2" fontWeight="700" lineHeight={1.2} fontSize="0.9rem">{item.title}</Typography>
          {isFlight && (item.flightNumber || item.terminal || item.gate) && (<Stack direction="row" gap={0.8} mt={0.5} flexWrap="wrap">{item.flightNumber && <Chip label={item.flightNumber} size="small" sx={{ bgcolor: themeColor.bg, color: themeColor.color, height: 20, fontSize: '0.65rem', fontWeight: 700, border: 'none' }} />}{(item.terminal || item.gate) && <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', fontWeight: 600, mt: 0.3 }}>{item.terminal && `T${item.terminal}`} {item.gate && `• P${item.gate}`}</Typography>}</Stack>)}
          {item.location_name && (<Stack direction="row" alignItems="center" gap={0.5} mt={0.3} sx={{ opacity: 0.8 }}><PlaceIcon sx={{ fontSize: 13, color: themeColor.color }} /><Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 600, color: 'text.secondary', textTransform: 'capitalize' }} noWrap>{item.location_name}</Typography></Stack>)}
          {item.description && <Typography variant="body2" color="text.secondary" fontSize="0.75rem" noWrap sx={{ mt: 0.3 }}>{item.description}</Typography>}
          {item.attachments && item.attachments.length > 0 && (<Stack direction="row" gap={0.5} mt={0.8} flexWrap="wrap">{item.attachments.map((att, i) => (<SmartAttachmentChip key={i} attachment={att} onOpen={onOpenAttachment} refreshTrigger={refreshTrigger} />))}</Stack>)}
        </Box>

        <Box>
          {isReorderMode ? (
            <Stack direction="column">
              <IconButton size="small" onClick={() => openEdit(item)} sx={{ p: 0.5, color: 'primary.main' }}><EditIcon fontSize="small" /></IconButton>
              <IconButton size="small" onClick={() => confirmDelete(item.id)} sx={{ p: 0.5, color: 'error.main' }}><DeleteForeverIcon fontSize="small" /></IconButton>
            </Stack>
          ) : (
            item.mapsLink && <IconButton size="small" onClick={() => handleDisplayModeClick(item)} sx={{ color: themeColor.color, opacity: 0.8, p: 0.5 }}><MapIcon fontSize="small" /></IconButton>
          )}
        </Box>
      </Card>
    );
  };


  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <Container maxWidth="sm" sx={{ py: 2, pb: 10 }}>

        {/* CABECERA: NOTAS Y TAREAS */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 4, alignItems: 'start' }}>
          {/* TARJETA NOTAS */}
          <Card sx={{
            bgcolor: '#fffbeb',
            border: '1px solid #fde68a',
            color: '#92400e',
            borderRadius: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            userSelect: 'none', WebkitUserSelect: 'none'
          }}>
            <CardActionArea onClick={() => setIsNotesExpanded(!isNotesExpanded)} sx={{ p: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" gap={1.5} alignItems="center">
                  <Box sx={{
                    bgcolor: 'rgba(255,255,255,0.6)',
                    p: 0.8, borderRadius: '12px', width: 40, height: 40,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <StickyNote2Icon sx={{ color: '#b45309' }} />
                  </Box>
                  <Typography variant="subtitle2" fontWeight="800">Notas</Typography>
                </Stack>
                <KeyboardArrowDownIcon sx={{ transform: isNotesExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.2s', color: '#b45309' }} />
              </Stack>
            </CardActionArea>
            <Collapse in={isNotesExpanded}>
              <Box sx={{ p: 2, pt: 0 }}>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line', opacity: 0.9, mb: 2, fontSize: '0.85rem' }}>{trip.notes || "Sin notas."}</Typography>
                <Button size="small" fullWidth onClick={() => setEditNotesOpen(true)} sx={{ bgcolor: 'rgba(255,255,255,0.6)', borderRadius: '12px', fontWeight: 700, color: '#b45309' }}>Editar</Button>
              </Box>
            </Collapse>
          </Card>

          {/* TARJETA TAREAS */}
          <Card sx={{
            bgcolor: theme.palette.mode === 'light' ? '#E3F2FD' : '#0D1B2A',
            border: theme.palette.mode === 'light' ? '1px solid #BBDEFB' : '1px solid #1E3A8A',
            color: theme.palette.mode === 'light' ? '#1565C0' : '#90CAF9',
            borderRadius: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            userSelect: 'none', WebkitUserSelect: 'none'
          }}>
            <CardActionArea onClick={() => setIsChecklistExpanded(!isChecklistExpanded)} sx={{ p: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" gap={1.5} alignItems="center">
                  <Box sx={{
                    bgcolor: theme.palette.mode === 'light' ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.1)',
                    p: 0.8, borderRadius: '12px', width: 40, height: 40,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <ChecklistRtlIcon />
                  </Box>
                  <Typography variant="subtitle2" fontWeight="800">Tareas</Typography>
                </Stack>
                <Stack direction="row" gap={0.5} alignItems="center">
                  {(trip.checklist || []).length > 0 && (
                    <Chip
                      label={`${(trip.checklist || []).filter(i => i.done).length}/${(trip.checklist || []).length}`}
                      size="small"
                      sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800, bgcolor: 'rgba(255,255,255,0.5)', color: 'inherit' }}
                    />
                  )}
                  <KeyboardArrowDownIcon sx={{ transform: isChecklistExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.2s' }} />
                </Stack>
              </Stack>
            </CardActionArea>
            <Collapse in={isChecklistExpanded}>
              <Box sx={{ p: 2, pt: 0 }}>
                <Stack spacing={1} mb={2}>
                  {(trip.checklist || []).map((item, idx) => (
                    <Box key={idx} display="flex" alignItems="center" gap={1} sx={{ opacity: item.done ? 0.5 : 1 }}>
                      <IconButton size="small" onClick={() => handleToggleCheckItem(idx)} sx={{ p: 0, color: item.done ? 'inherit' : 'primary.main' }}>
                        {item.done ? <CheckBoxIcon fontSize="small" /> : <CheckBoxOutlineBlankIcon fontSize="small" />}
                      </IconButton>
                      <Typography variant="caption" sx={{ textDecoration: item.done ? 'line-through' : 'none', flexGrow: 1, fontWeight: 600, cursor: 'pointer' }} onClick={() => handleToggleCheckItem(idx)}>{item.text}</Typography>
                      <IconButton size="small" onClick={() => handleDeleteCheckItem(idx)} sx={{ p: 0, opacity: 0.5 }}><CloseIcon sx={{ fontSize: 14 }} /></IconButton>
                    </Box>
                  ))}
                </Stack>
                <Paper component="form" sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', borderRadius: '12px', boxShadow: 'none', border: '1px solid rgba(0,0,0,0.1)' }} onSubmit={(e) => { e.preventDefault(); handleAddCheckItem(); }}>
                  <InputBase sx={{ ml: 1, flex: 1, fontSize: '0.8rem' }} placeholder="Añadir tarea..." value={newCheckItem} onChange={(e) => setNewCheckItem(e.target.value)} />
                  <IconButton type="submit" sx={{ p: '5px', color: 'primary.main' }} disabled={!newCheckItem.trim()}><AddIcon fontSize="small" /></IconButton>
                </Paper>
              </Box>
            </Collapse>
          </Card>
        </Box>

        {/* LISTA DE DÍAS */}
        {days.map((d) => {
          const itemsOfDay = items
            .filter(i => i.date === d)
            .sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
          // NOTA: Con dnd-kit, el orden en el estado "items" (modificado por dragOver) es la fuente de la verdad visual

          return (
            <Box key={d} mb={2.5}>
              <Paper elevation={0} sx={{ bgcolor: theme.palette.mode === 'light' ? '#F3F4F6' : '#1C1C1E', borderRadius: '20px', p: 1, minHeight: '80px', border: '1px solid rgba(0,0,0,0.05)' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1} pl={0.5} pr={0.5} pt={0.5}>
                  <Chip label={dayjs(d).format('dddd D [de] MMMM')} sx={{ bgcolor: theme.palette.custom.dateChip.bg, color: theme.palette.custom.dateChip.color, fontWeight: 800, fontSize: '0.85rem', height: 32, borderRadius: '10px', textTransform: 'capitalize', border: theme.palette.mode === 'light' ? '1px solid rgba(103, 80, 164, 0.2)' : 'none' }} />
                  <IconButton onClick={() => openCreate(d)} size="small" sx={{ bgcolor: 'background.paper', color: 'primary.main', width: 28, height: 28, boxShadow: 1 }}><AddIcon sx={{ fontSize: 16 }} /></IconButton>
                </Stack>


                {/* ZONA SORTABLE DEL DÍA. USAMOS SortableContext. */}
                {/* Para que funcione el drag entre listas, cada día actúa como contenedor sortable. 
                    El ID del contexto es confuso, pero el "items" prop es la lista de IDs que contiene. */}

                <SortableContext
                  id={d} // El ID del container es la fecha
                  items={itemsOfDay.map(i => i.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <DroppableDay id={d}>
                    {itemsOfDay.length === 0 ? (
                      <Box onClick={() => openCreate(d)} sx={{ py: 2, textAlign: 'center', cursor: 'pointer', borderRadius: '12px', border: `2px dashed ${theme.palette.divider}`, opacity: 0.6 }}>
                        <Typography variant="caption" fontWeight="700" color="text.secondary" fontSize="0.75rem">Sin planes (Toca para añadir)</Typography>
                      </Box>
                    ) : (
                      <Stack spacing={0.8}>
                        {itemsOfDay.map((item) => (
                          <SortableItem key={item.id} id={item.id}>
                            {renderCard(item)}
                          </SortableItem>
                        ))}
                      </Stack>
                    )}
                  </DroppableDay>
                </SortableContext>
              </Paper>
            </Box>
          )
        })}
      </Container>


      <Dialog open={openItemModal} onClose={() => setOpenItemModal(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: '28px', p: 1 } }}>
        <DialogTitle sx={{ textAlign: 'center', fontWeight: '800' }}>{isEditing ? "Editar Evento" : "Nuevo Evento"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>{['place', 'food', 'transport', 'flight'].map(t => { const cfg = getTypeConfig(t); const isSel = newItem.type === t; return (<Paper key={t} elevation={0} onClick={() => setNewItem({ ...newItem, type: t })} sx={{ cursor: 'pointer', borderRadius: '12px', p: 1, border: `2px solid ${isSel ? cfg.color : 'transparent'}`, bgcolor: isSel ? cfg.bg : 'action.hover', display: 'flex', alignItems: 'center', gap: 1, position: 'relative', overflow: 'hidden' }}><Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: 'background.paper', color: cfg.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{React.cloneElement(cfg.icon, { fontSize: 'small' })}</Box><Typography variant="body2" fontWeight={700} fontSize="0.8rem" color={isSel ? 'text.primary' : 'text.secondary'}>{cfg.label}</Typography>{isSel && <CheckCircleOutlineIcon sx={{ position: 'absolute', top: 4, right: 4, fontSize: 14, color: cfg.color }} />}</Paper>) })}</Box>
            {newItem.type === 'flight' ? (<><TextField label="Aerolínea" variant="filled" size="small" InputProps={{ disableUnderline: true, style: { borderRadius: 12 } }} value={newItem.title} onChange={e => setNewItem({ ...newItem, title: e.target.value })} /><Stack direction="row" gap={1}><TextField label="Origen" fullWidth variant="filled" size="small" InputProps={{ disableUnderline: true, style: { borderRadius: 12 } }} value={newItem.origin || ''} onChange={e => setNewItem({ ...newItem, origin: e.target.value.toUpperCase() })} /><TextField label="Destino" fullWidth variant="filled" size="small" InputProps={{ disableUnderline: true, style: { borderRadius: 12 } }} value={newItem.destination || ''} onChange={e => setNewItem({ ...newItem, destination: e.target.value.toUpperCase() })} /></Stack><Stack direction="row" gap={1}><TextField label="Nº Vuelo" fullWidth variant="filled" size="small" InputProps={{ disableUnderline: true, style: { borderRadius: 12 } }} value={newItem.flightNumber} onChange={e => setNewItem({ ...newItem, flightNumber: e.target.value })} /><TextField label="Hora" type="time" fullWidth variant="filled" size="small" InputProps={{ disableUnderline: true, style: { borderRadius: 12 } }} value={newItem.time} onChange={e => setNewItem({ ...newItem, time: e.target.value })} /></Stack><Stack direction="row" gap={1}><TextField label="Terminal" fullWidth variant="filled" size="small" InputProps={{ disableUnderline: true, style: { borderRadius: 12 } }} value={newItem.terminal} onChange={e => setNewItem({ ...newItem, terminal: e.target.value })} /><TextField label="Puerta" fullWidth variant="filled" size="small" InputProps={{ disableUnderline: true, style: { borderRadius: 12 } }} value={newItem.gate} onChange={e => setNewItem({ ...newItem, gate: e.target.value })} /></Stack></>) : (<><TextField label={newItem.type === "transport" ? "Nombre Transporte" : "Nombre del Sitio"} variant="filled" size="small" InputProps={{ disableUnderline: true, style: { borderRadius: 12 } }} value={newItem.title} onChange={(e) => setNewItem({ ...newItem, title: e.target.value })} /><TextField label="Dirección / Link" variant="filled" size="small" InputProps={{ disableUnderline: true, style: { borderRadius: 12 }, endAdornment: <InputAdornment position="end"><LinkIcon fontSize="small" /></InputAdornment> }} value={newItem.mapsLink} onChange={(e) => setNewItem({ ...newItem, mapsLink: e.target.value })} /><TextField label="Hora" type="time" fullWidth variant="filled" size="small" InputProps={{ disableUnderline: true, style: { borderRadius: 12 } }} value={newItem.time} onChange={e => setNewItem({ ...newItem, time: e.target.value })} /></>)}
            <TextField label="Notas" multiline rows={2} variant="filled" size="small" InputProps={{ disableUnderline: true, style: { borderRadius: 12 } }} value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} />
            {existingAttachments.length > 0 && (<Stack gap={1} p={1} bgcolor="action.hover" borderRadius={2}>{existingAttachments.map((a, i) => (<Box key={i} display="flex" justifyContent="space-between" alignItems="center"><Typography variant="caption" noWrap sx={{ maxWidth: 180 }}>{a.name}</Typography><IconButton size="small" onClick={() => deleteAttachment(i)}><CloseIcon fontSize="small" /></IconButton></Box>))}</Stack>)}
            <Button variant="outlined" component="label" startIcon={<AttachFileIcon />} sx={{ borderStyle: "dashed", py: 1.5, borderColor: "text.disabled", color: "text.secondary", borderRadius: "12px", textTransform: 'none' }}>{files.length > 0 ? `Subir ${files.length} archivos` : "Adjuntar archivos"}<input type="file" multiple hidden onChange={(e) => setFiles(Array.from(e.target.files))} /></Button>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}><Button onClick={() => setOpenItemModal(false)} sx={{ color: 'text.secondary', fontWeight: 700 }}>Cancelar</Button><Button variant="contained" onClick={handleSaveItem} disabled={uploading} sx={{ borderRadius: '50px', px: 4, fontWeight: 800 }}>{uploading ? "Subiendo..." : "Guardar"}</Button></DialogActions>
      </Dialog>

      <Dialog open={editNotesOpen} onClose={() => setEditNotesOpen(false)} fullWidth maxWidth="xs"><DialogTitle>Notas</DialogTitle><DialogContent><TextField autoFocus multiline rows={6} fullWidth value={tripNotes} onChange={e => setTripNotes(e.target.value)} /></DialogContent><DialogActions><Button onClick={handleSaveNotes} variant="contained">Guardar</Button></DialogActions></Dialog>

      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}><DialogTitle sx={{ fontWeight: 800 }}>¿Borrar evento?</DialogTitle><DialogContent><Typography variant="body2" color="text.secondary">Esta acción no se puede deshacer.</Typography></DialogContent><DialogActions><Button onClick={() => setDeleteConfirmOpen(false)} sx={{ color: 'text.secondary', fontWeight: 600 }}>Cancelar</Button><Button onClick={executeDelete} variant="contained" color="error" autoFocus sx={{ borderRadius: '12px', fontWeight: 700 }}>Borrar</Button></DialogActions></Dialog>

      {/* LOADING SPINNER PRO */}
      <Backdrop
        sx={{
          zIndex: (theme) => theme.zIndex.modal + 10,
          backdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(0, 0, 0, 0.4)'
        }}
        open={expandingUrl}
      >
        <Paper
          elevation={24}
          sx={{
            p: 4,
            borderRadius: '32px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
            minWidth: 280,
            background: theme.palette.mode === 'light' ? 'rgba(255, 255, 255, 0.95)' : '#1e1e1e',
          }}
        >
          <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress
              size={80}
              thickness={2}
              sx={{ color: theme.palette.primary.main, opacity: 0.5 }}
            />
            <Box
              sx={{
                position: 'absolute',
                color: '#FF7043',
                animation: 'bounce 1s infinite',
                '@keyframes bounce': {
                  '0%, 100%': { transform: 'translateY(0)' },
                  '50%': { transform: 'translateY(-10px)' }
                }
              }}
            >
              <LocationOnIcon sx={{ fontSize: 40 }} />
            </Box>
          </Box>
          <Box textAlign="center">
            <Typography variant="h6" fontWeight="800">
              Localizando...
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Extrayendo coordenadas del mapa
            </Typography>
          </Box>
        </Paper>
      </Backdrop>

      {/* GLOBAL DRAG OVERLAY */}
      <DragOverlay>
        {activeId ? (() => {
          const activeItem = items.find(i => i.id === activeId);
          return activeItem ? renderCard(activeItem, true) : null;
        })() : null}
      </DragOverlay>

    </DndContext>
  );
}

// Helper para zona droppable
function DroppableDay({ id, children }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div ref={setNodeRef} style={{ minHeight: 60, backgroundColor: isOver ? 'rgba(0,0,0,0.02)' : 'transparent', borderRadius: '12px', transition: 'background-color 0.2s' }}>
      {children}
    </div>
  );
}

export default ItineraryView;