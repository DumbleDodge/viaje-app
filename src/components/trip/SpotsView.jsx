import React, { useState, useEffect } from 'react';
import {
  Box, Chip, Container, Stack, Typography, Fab, IconButton, Paper, Card,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, useTheme
} from '@mui/material';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor,
  useSensors, TouchSensor, DragOverlay, MouseSensor
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy
} from "@dnd-kit/sortable";

// Iconos
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import PlaceIcon from "@mui/icons-material/Place";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import StarIcon from "@mui/icons-material/Star";
import MapIcon from "@mui/icons-material/Map";



// Imports internos
import { supabase } from '../../supabaseClient';
import { useTripContext } from '../../TripContext';
import SortableItem from '../common/SortableItem';

function SpotsView({ tripId, openCreateSpot, onEdit, isEditMode, onEnableEditMode }) {
  const { getCachedTrip, updateTripCache } = useTripContext();
  const cachedData = getCachedTrip(tripId);
  const theme = useTheme();

  // Estados
  const [spots, setSpots] = useState(cachedData.spots || []);
  const [filterTag, setFilterTag] = useState('Todos');
  const [activeId, setActiveId] = useState(null);

  // Estados Borrado
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [spotToDelete, setSpotToDelete] = useState(null);

  // --- CARGA DE DATOS ---
  useEffect(() => {
    if (cachedData.spots?.length > 0) setSpots(cachedData.spots);

    const fetchSpots = async () => {
      const { data, error } = await supabase
        .from('trip_spots')
        .select('*')
        .eq('trip_id', tripId)
        .order('order_index', { ascending: true });

      if (!error && data) {
        const mapped = data.map(s => ({
          id: s.id, name: s.name, category: s.category, description: s.description,
          mapsLink: s.maps_link, tags: s.tags || [], order: s.order_index,
          location_name: s.location_name
        }));
        setSpots(mapped);
        updateTripCache(tripId, 'spots', mapped);
      }
    };

    fetchSpots();

    const sub = supabase.channel('spots_view')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trip_spots', filter: `trip_id=eq.${tripId}` },
        () => fetchSpots())
      .subscribe();

    return () => { supabase.removeChannel(sub); };
  }, [tripId, updateTripCache]);

  // --- CONFIGURACIÓN VISUAL ---
  const allTags = ['Todos', ...new Set(spots.flatMap(s => s.tags || []).map(t => t.trim()))];
  const filteredSpots = filterTag === 'Todos' ? spots : spots.filter(s => s.tags?.includes(filterTag));
  const CATEGORY_ORDER = ['Comida', 'Visita', 'Super', 'Gasolina', 'Salud', 'Otro'];

  const groupedSpots = filteredSpots.reduce((groups, spot) => {
    const category = spot.category || 'Otro';
    if (!groups[category]) groups[category] = [];
    groups[category].push(spot);
    return groups;
  }, {});

  const getCategoryConfig = (cat) => {
    switch (cat) {
      case 'Comida': return { icon: <RestaurantIcon />, label: 'Comida', ...theme.palette.custom.food };
      case 'Super': return { icon: <ShoppingCartIcon />, label: 'Supermercado', ...theme.palette.custom.place };
      case 'Gasolina': return { icon: <LocalGasStationIcon />, label: 'Gasolinera', ...theme.palette.custom.transport };
      case 'Visita': return { icon: <CameraAltIcon />, label: 'Turismo', ...theme.palette.custom.place };
      case 'Salud': return { icon: <LocalHospitalIcon />, label: 'Salud', bg: '#ffebee', color: '#d32f2f' };
      default: return { icon: <StarIcon />, label: 'Otros', ...theme.palette.custom.place };
    }
  };

  // --- DRAG AND DROP (ROBUSTO) ---
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }), // Delay clave para móvil
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
    document.body.style.overflow = 'hidden'; // Bloquea scroll
    if (window.navigator.vibrate) window.navigator.vibrate(50);
    if (onEnableEditMode) onEnableEditMode(true); // <--- ACTIVAMOS MODO EDICIÓN
  };

  const handleDragEndSpot = async (event) => {
    setActiveId(null);
    document.body.style.overflow = ''; // Libera scroll

    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeSpot = spots.find(s => s.id === active.id);
    const overSpot = spots.find(s => s.id === over.id);

    // Solo reordenar si son de la misma categoría
    if (!activeSpot || !overSpot || (activeSpot.category || 'Otro') !== (overSpot.category || 'Otro')) return;

    const category = activeSpot.category || 'Otro';

    // Obtenemos el sub-array de esta categoría ordenado actual
    const categorySpots = spots
      .filter(s => (s.category || 'Otro') === category)
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    const oldIndex = categorySpots.findIndex(s => s.id === active.id);
    const newIndex = categorySpots.findIndex(s => s.id === over.id);

    // 1. Array Move local
    const reorderedSubList = arrayMove(categorySpots, oldIndex, newIndex);

    // 2. Reconstruir lista completa
    const otherSpots = spots.filter(s => (s.category || 'Otro') !== category);
    const newFullList = [...otherSpots, ...reorderedSubList]; // (Nota: esto agrupa por categorías visualmente, lo cual está bien)

    // 3. Actualizar Estado + Caché
    setSpots(newFullList);
    updateTripCache(tripId, 'spots', newFullList);

    // 4. Guardar en BD (Solo actualizamos los índices de la categoría afectada)
    const updates = reorderedSubList.map((spot, index) =>
      supabase.from('trip_spots').update({ order_index: index }).eq('id', spot.id)
    );

    await Promise.all(updates);
  };

  const handleDragCancel = () => {
    setActiveId(null);
    document.body.style.overflow = '';
  };

  // --- BORRADO ---
  const confirmDelete = (id) => {
    setSpotToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (spotToDelete) {
      const { error } = await supabase.from('trip_spots').delete().eq('id', spotToDelete);
      if (!error) {
        const newSpots = spots.filter(s => s.id !== spotToDelete);
        setSpots(newSpots);
        updateTripCache(tripId, 'spots', newSpots);
      }
    }
    setDeleteConfirmOpen(false);
    setSpotToDelete(null);
  };

  // DND activado siempre que estemos en "Todos" (el modo edición se activa al arrastrar)
  const isDndEnabled = filterTag === 'Todos';

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEndSpot}
      onDragCancel={handleDragCancel}
    >
      <Box pb={12} pt={2}>

        {/* FILTROS */}
        <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 2, px: 2, '&::-webkit-scrollbar': { display: 'none' } }}>
          {allTags.map(tag => (
            <Chip
              key={tag}
              label={tag}
              onClick={() => setFilterTag(tag)}
              sx={{
                bgcolor: filterTag === tag ? 'text.primary' : 'background.paper',
                color: filterTag === tag ? 'background.paper' : 'text.primary',
                fontWeight: 600,
                border: '1px solid',
                borderColor: 'divider'
              }}
            />
          ))}
        </Box>

        <Container maxWidth="sm">
          {spots.length === 0 ? (
            <Box sx={{ mt: 10, textAlign: 'center', opacity: 0.6 }}>
              <PlaceIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
              <Typography fontWeight="700">Lista vacía</Typography>
            </Box>
          ) : (
            // RENDER POR CATEGORÍAS
            CATEGORY_ORDER.map(catName => {
              const catSpots = groupedSpots[catName];
              if (!catSpots || catSpots.length === 0) return null;
              const config = getCategoryConfig(catName);

              return (
                <Box key={catName} mb={3}>
                  <Paper elevation={0} sx={{ bgcolor: theme.palette.mode === 'light' ? '#F3F4F6' : '#1C1C1E', borderRadius: '24px', p: 1 }}>
                    <Stack direction="row" alignItems="center" gap={1} mb={1} px={1}>
                      <Typography variant="h6" sx={{ color: config.color, fontWeight: 800, fontSize: '1rem' }}>{config.label}</Typography>
                      <Chip label={catSpots.length} size="small" sx={{ height: 20, bgcolor: config.bg, color: config.color, fontWeight: 700, border: 'none' }} />
                    </Stack>

                    <SortableContext items={catSpots.map(s => s.id)} strategy={verticalListSortingStrategy} disabled={!isDndEnabled}>
                      <Stack spacing={0.8}>
                        {catSpots.map(spot => (
                          <SortableItem key={spot.id} id={spot.id} disabled={!isDndEnabled}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                <Card sx={{
                                  bgcolor: 'background.paper',
                                  p: 1.2,
                                  display: 'flex',
                                  gap: 1.2,
                                  alignItems: 'center',
                                  borderRadius: '16px',
                                  border: isEditMode ? `1px dashed ${theme.palette.primary.main}` : 'none',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                }}>
                                  <Box sx={{ width: 40, height: 40, bgcolor: config.bg, color: config.color, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    {React.cloneElement(config.icon, { sx: { fontSize: 20 } })}
                                  </Box>
                                  <Box flexGrow={1} minWidth={0}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                      <Typography variant="subtitle2" fontWeight="700">{spot.name}</Typography>
                                      {!isEditMode && spot.mapsLink && (
                                        <IconButton size="small" onClick={() => window.open(spot.mapsLink, '_blank')} sx={{ p: 0.5, color: theme.palette.custom.place.color }}>
                                          <MapIcon sx={{ fontSize: 18 }} />
                                        </IconButton>
                                      )}
                                    </Stack>
                                    <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>{spot.description}</Typography>
                                    {spot.tags && spot.tags.length > 0 && (
                                      <Stack direction="row" gap={0.5} mt={0.8} flexWrap="wrap">
                                        {spot.tags.map(tag => (
                                          <Chip
                                            key={tag}
                                            label={tag}
                                            size="small"
                                            sx={{
                                              height: 18,
                                              fontSize: '0.6rem',
                                              fontWeight: 600,
                                              bgcolor: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.1)',
                                              color: 'text.secondary',
                                              border: 'none'
                                            }}
                                          />
                                        ))}
                                      </Stack>
                                    )}
                                  </Box>
                                </Card>
                              </Box>

                              {/* Botones Edición */}
                              {isEditMode && (
                                <Stack direction="column" spacing={0.5}>
                                  <IconButton onClick={() => onEdit(spot)} size="small" sx={{ color: 'primary.main', p: 0.5 }}>
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton onClick={() => confirmDelete(spot.id)} size="small" sx={{ color: 'error.main', p: 0.5 }}>
                                    <DeleteForeverIcon fontSize="small" />
                                  </IconButton>
                                </Stack>
                              )}
                            </Box>
                          </SortableItem>
                        ))}
                      </Stack>
                    </SortableContext>
                  </Paper>
                </Box>
              )
            })
          )}
        </Container>

        <Fab variant="extended" onClick={openCreateSpot} sx={{ position: 'fixed', bottom: 100, right: 24, bgcolor: 'secondary.main', color: 'white', borderRadius: '20px', fontWeight: 700, boxShadow: 3 }}>
          <AddIcon sx={{ mr: 1 }} /> Sitio
        </Fab>

        {/* MODAL BORRADO */}
        <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}>
          <DialogTitle sx={{ fontWeight: 800 }}>¿Borrar sitio?</DialogTitle>
          <DialogContent><Typography variant="body2" color="text.secondary">Desaparecerá de tu lista.</Typography></DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteConfirmOpen(false)}>Cancelar</Button>
            <Button onClick={executeDelete} variant="contained" color="error">Borrar</Button>
          </DialogActions>
        </Dialog>

        {/* DRAG OVERLAY */}
        <DragOverlay>
          {activeId ? (() => {
            const spot = spots.find(s => s.id === activeId);
            if (!spot) return null;
            const config = getCategoryConfig(spot.category || 'Otro');
            return (
              <Card sx={{ bgcolor: 'background.paper', p: 1.2, display: 'flex', gap: 1.2, alignItems: 'center', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.25)', border: `2px solid ${theme.palette.primary.main}`, transform: 'scale(1.05)', cursor: 'grabbing', touchAction: 'none' }}>
                <Box sx={{ width: 40, height: 40, bgcolor: config.bg, color: config.color, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {React.cloneElement(config.icon, { sx: { fontSize: 20 } })}
                </Box>
                <Box flexGrow={1}><Typography variant="subtitle2" fontWeight="700">{spot.name}</Typography></Box>
              </Card>
            );
          })() : null}
        </DragOverlay>

      </Box>
    </DndContext>
  );
}

export default SpotsView;