import React, { useState, useEffect, useMemo } from 'react';
import { 
  createTheme, ThemeProvider, CssBaseline, useTheme,
  Box, AppBar, Toolbar, Typography, Fab, Container, Card, CardContent, 
  Button, Avatar, IconButton, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField, Stack, CircularProgress, CardMedia, 
  CardActionArea, Chip, Tooltip, Alert, Snackbar, MenuItem, Select, 
  FormControl, InputLabel, BottomNavigation, BottomNavigationAction, 
  Paper, InputAdornment, ToggleButton, ToggleButtonGroup, Menu, 
  ListItemIcon, Divider
} from '@mui/material';
import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { get, set } from 'idb-keyval'; 

// --- DND KIT IMPORTS ---
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, TouchSensor } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

dayjs.locale('es');

// --- ICONOS ---
import AddIcon from '@mui/icons-material/Add';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import GoogleIcon from '@mui/icons-material/Google';
import LogoutIcon from '@mui/icons-material/Logout';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MapIcon from '@mui/icons-material/Map'; 
import DirectionsIcon from '@mui/icons-material/Directions';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import ShareIcon from '@mui/icons-material/Share';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import FlightIcon from '@mui/icons-material/Flight';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import LinkIcon from '@mui/icons-material/Link';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import StarIcon from '@mui/icons-material/Star';
import ListIcon from '@mui/icons-material/List'; 
import PlaceIcon from '@mui/icons-material/Place'; 
import EuroIcon from '@mui/icons-material/Euro'; 
import GroupIcon from '@mui/icons-material/Group';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import HandshakeIcon from '@mui/icons-material/Handshake';
import SwapVertIcon from '@mui/icons-material/SwapVert'; 
import CheckIcon from '@mui/icons-material/Check';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'; 
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

// --- FIREBASE ---
import { auth, googleProvider, db } from './firebase'; 
import { signInWithPopup, signOut, onAuthStateChanged, GoogleAuthProvider } from 'firebase/auth';
import { collection, addDoc, query, where, onSnapshot, orderBy, doc, deleteDoc, updateDoc, arrayUnion, writeBatch } from 'firebase/firestore';

// --- DEFINICIÓN DE TEMAS (LIGHT / DARK) ---
const getDesignTokens = (mode) => ({
  palette: {
    mode,
    primary: { main: '#6750A4', light: '#EADDFF', contrastText: '#FFFFFF' }, 
    secondary: { main: '#625B71', light: '#E8DEF8' },
    ...(mode === 'light'
      ? {
          background: { default: '#FDFDFD', paper: '#FFFFFF' },
          text: { primary: '#1C1B1F', secondary: '#49454F' },
          custom: {
            flight: { bg: '#D7E3FF', color: '#001B3D', border: '#AFC6FF' }, 
            food:   { bg: '#FFE0B2', color: '#E65100', border: '#FFCC80' }, 
            place:  { bg: '#FFCDD2', color: '#C62828', border: '#EF9A9A' }, 
            transport: { bg: '#C4EED0', color: '#00210E', border: '#6DD58C' }, 
            note:   { bg: '#fffbeb', color: '#92400e', border: '#fde68a', titleColor: '#b45309' },
            dateChip: { bg: '#efddff', color: '#000000' },
            filterActive: { bg: 'primary.main', color: '#FFFFFF' } 
          }
        }
      : {
          background: { default: '#121212', paper: '#1E1E1E' },
          text: { primary: '#E6E1E5', secondary: '#CAC4D0' },
          custom: {
            flight: { bg: '#36517d', color: '#d4e3ff', border: '#4b648a' }, 
            food:   { bg: '#704216', color: '#ffdbc2', border: '#8f5820' }, 
            place:  { bg: '#692222', color: '#ffdad6', border: '#8c3333' }, 
            transport: { bg: '#1b3622', color: '#bcebe0', border: '#2e5739' }, 
            note:   { bg: '#3d3614', color: '#FFF8E1', border: '#5e5423', titleColor: '#f7df94' },
            dateChip: { bg: '#4F378B', color: '#EADDFF' }, 
            filterActive: { bg: 'primary.main', color: 'primary.contrastText' }
          }
        }),
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h6: { fontSize: '1rem', fontWeight: 700, letterSpacing: 0 },
    subtitle1: { fontWeight: 600, fontSize: '0.9rem' },
    body2: { letterSpacing: 0.15, fontSize: '0.8rem' },
    button: { textTransform: 'none', fontWeight: 600 }
  },
  components: {
    MuiButton: { styleOverrides: { root: { borderRadius: '50px', padding: '6px 20px', boxShadow: 'none' } } },
    MuiCard: { 
      styleOverrides: { 
        root: ({ theme }) => ({ 
          borderRadius: '12px', 
          boxShadow: 'none', 
          border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.12)' : '#E0E0E0'}`, 
          backgroundImage: 'none' 
        }) 
      } 
    },
    MuiDialog: { styleOverrides: { paper: { borderRadius: '28px', padding: '8px', backgroundImage:'none' } } },
    MuiFab: { styleOverrides: { root: { borderRadius: '16px', boxShadow: '0 4px 10px rgba(0,0,0,0.3)', backgroundColor: '#EADDFF', color: '#21005D', '&:hover':{backgroundColor:'#D0BCFF'} } } },
    MuiTextField: { styleOverrides: { root: { '& .MuiOutlinedInput-root': { borderRadius: '8px' }, '& .MuiFilledInput-root': { borderTopLeftRadius: '4px', borderTopRightRadius: '4px' } } } },
    MuiChip: { styleOverrides: { root: { borderRadius: '8px' } } },
    MuiAppBar: { styleOverrides: { root: { boxShadow: 'none', borderBottom: '1px solid rgba(0,0,0,0.05)' } } }, 
    MuiToggleButton: { styleOverrides: { root: { borderRadius: '10px', textTransform:'none', border: '1px solid rgba(0,0,0,0.12)' } } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiBottomNavigationAction: {
        styleOverrides: {
            root: ({ theme }) => ({
                '&.Mui-selected': {
                    color: theme.palette.mode === 'dark' ? '#FFFFFF' : theme.palette.primary.main
                },
                '& .MuiBottomNavigationAction-label.Mui-selected': {
                    color: theme.palette.mode === 'dark' ? '#FFFFFF' : theme.palette.primary.main,
                    fontWeight: 700 
                }
            })
        }
    }
  }
});

// --- UTILIDADES ---
async function findOrCreateFolder(folderName, accessToken, parentId = null) {
  let query = `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  if (parentId) query += ` and '${parentId}' in parents`;
  const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id)`, { method: 'GET', headers: { 'Authorization': 'Bearer ' + accessToken } });
  if (res.status === 401) throw new Error("TOKEN_EXPIRED");
  const data = await res.json();
  if (data.files && data.files.length > 0) return data.files[0].id;
  const meta = { name: folderName, mimeType: 'application/vnd.google-apps.folder', parents: parentId ? [parentId] : undefined };
  const create = await fetch('https://www.googleapis.com/drive/v3/files', { method: 'POST', headers: { 'Authorization': 'Bearer ' + accessToken, 'Content-Type': 'application/json' }, body: JSON.stringify(meta) });
  return (await create.json()).id;
}
async function uploadToGoogleDrive(file, accessToken, folderId) {
  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify({ name: file.name, parents: [folderId] })], { type: 'application/json' }));
  form.append('file', file);
  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink', { method: 'POST', headers: { 'Authorization': 'Bearer ' + accessToken }, body: form, });
  if (res.status === 401) throw new Error("TOKEN_EXPIRED");
  if (!res.ok) throw new Error('Error subida');
  const fileData = await res.json();
  await fetch(`https://www.googleapis.com/drive/v3/files/${fileData.id}/permissions`, { method: 'POST', headers: { 'Authorization': 'Bearer ' + accessToken, 'Content-Type': 'application/json' }, body: JSON.stringify({ role: 'reader', type: 'anyone' }) });
  return fileData;
}
async function cacheFileLocal(fileId, accessToken) {
  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, { headers: { 'Authorization': 'Bearer ' + accessToken } });
  if (response.status === 401) throw new Error("TOKEN_EXPIRED");
  const blob = await response.blob();
  await set(`file_${fileId}`, blob);
}
async function getFileFromCache(fileId) { try { return await get(`file_${fileId}`); } catch (e) { return null; } }
async function getRefreshedToken() {
  const res = await signInWithPopup(auth, googleProvider);
  const c = GoogleAuthProvider.credentialFromResult(res);
  sessionStorage.setItem('googleAccessToken', c.accessToken);
  return c.accessToken;
}

// --- COMPONENTES VISUALES ---
function SortableItem({ id, children, disabled }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, zIndex: isDragging ? 999 : 1, position: 'relative' };
  return ( <div ref={setNodeRef} style={style} {...attributes} {...listeners}> {children} </div> );
}

const SmartAttachmentChip = ({ attachment, onOpen, refreshTrigger }) => {
  const [isOffline, setIsOffline] = useState(false);
  useEffect(() => { const c = async () => { if (attachment.fileId) setIsOffline(!!await getFileFromCache(attachment.fileId)); }; c(); }, [attachment, refreshTrigger]);
  return (
    <Chip label={attachment.name} onClick={() => onOpen(attachment)} icon={isOffline ? <CheckCircleOutlineIcon style={{fontSize:16, color: isOffline ? '#1B5E20' : 'inherit'}}/> : <CloudQueueIcon style={{fontSize:16}}/>} sx={{ height: '24px', fontSize: '0.75rem', fontWeight: 600, maxWidth: '100%', cursor:'pointer', bgcolor: isOffline ? '#E8F5E9' : 'action.selected', border: isOffline ? '1px solid #A5D6A7' : '1px solid rgba(0,0,0,0.1)', color: isOffline ? '#1B5E20' : 'text.primary' }} />
  );
};

const TripCoverImage = ({ url, place, height }) => {
  const imageSrc = (url && url.length > 5) ? url : `https://loremflickr.com/800/400/${encodeURIComponent(place)},landscape/all`;
  return (
    <CardMedia component="img" height={height} image={imageSrc} sx={{ filter:'brightness(0.95)', objectFit:'cover', height: height, width: '100%' }} onError={(e) => { e.target.src = `https://loremflickr.com/800/400/${encodeURIComponent(place)},landscape/all`; }} />
  );
};

// --- PANTALLAS ---
function LoginScreen({ onLogin }) {
  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: 3, background: 'background.default' }}>
      <Box sx={{ p: 5, textAlign: 'center', bgcolor: 'background.paper', borderRadius: '28px' }}> 
        <Box sx={{ bgcolor: 'primary.main', width: 64, height: 64, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', mb: 3 }}> <FlightTakeoffIcon sx={{ fontSize: 32, color: 'white' }} /> </Box>
        <Typography variant="h4" fontWeight="800" gutterBottom sx={{color: 'text.primary'}}>Viajes App</Typography>
        <Button variant="contained" size="large" startIcon={<GoogleIcon />} onClick={onLogin} sx={{ mt: 3, bgcolor: '#6750A4', color: 'white' }}>Entrar con Google</Button>
      </Box>
    </Box>
  );
}

function HomeScreen({ user, onLogout, toggleTheme, mode }) {
  const [trips, setTrips] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [openShare, setOpenShare] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [shareTripId, setShareTripId] = useState(null);
  const [newTrip, setNewTrip] = useState({ title: '', place: '', startDate: '', endDate: '', coverImageUrl: '' });
  const [editTripData, setEditTripData] = useState({ id: '', title: '', place: '', startDate: '', endDate: '', coverImageUrl: '' });
  
  const [anchorElUser, setAnchorElUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { if(!user?.email) return; const u = onSnapshot(query(collection(db,"trips"), where("participants", "array-contains", user.email), orderBy("startDate","asc")),(s)=>setTrips(s.docs.map(d=>({id:d.id,...d.data()})))); return u; },[user]);

  const handleSave = async () => { if(!newTrip.title) return; await addDoc(collection(db,"trips"), { ...newTrip, participants: [user.email], ownerId: user.uid, aliases: {}, createdAt: new Date(), notes: '' }); setOpenModal(false); setNewTrip({title:'',place:'',startDate:'',endDate:'', coverImageUrl: ''}); };
  const openEdit = (e, trip) => { e.stopPropagation(); setEditTripData({ ...trip }); setOpenEditModal(true); };
  const handleUpdateTrip = async () => { const { id, ...data } = editTripData; await updateDoc(doc(db, "trips", id), data); setOpenEditModal(false); };
  const handleDelete = async (e,id) => { e.stopPropagation(); if(confirm("¿Eliminar viaje completo?")) await deleteDoc(doc(db,"trips",id)); };
  const handleShare = async () => { if(!shareEmail) return; try { await updateDoc(doc(db, "trips", shareTripId), { participants: arrayUnion(shareEmail) }); alert("¡Invitado!"); setOpenShare(false); setShareEmail(''); } catch (e) { alert("Error"); } };

  return (
    <>
      <AppBar position="sticky" sx={{ bgcolor: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', color: 'text.primary' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 800 }}>Mis Viajes</Typography>
          <IconButton onClick={(e) => setAnchorElUser(e.currentTarget)} sx={{ p: 0 }}><Avatar src={user.photoURL} sx={{width:32,height:32}}/></IconButton>
          <Menu sx={{ mt: '45px' }} id="menu-appbar" anchorEl={anchorElUser} anchorOrigin={{ vertical: 'top', horizontal: 'right' }} keepMounted transformOrigin={{ vertical: 'top', horizontal: 'right' }} open={Boolean(anchorElUser)} onClose={() => setAnchorElUser(null)} PaperProps={{ style: { borderRadius: 16 } }} >
            <MenuItem onClick={toggleTheme}><ListItemIcon>{mode === 'light' ? <DarkModeIcon fontSize="small"/> : <LightModeIcon fontSize="small"/>}</ListItemIcon><Typography textAlign="center">Modo {mode === 'light' ? 'Oscuro' : 'Claro'}</Typography></MenuItem>
            <Divider />
            <MenuItem onClick={onLogout}><ListItemIcon><LogoutIcon fontSize="small" color="error"/></ListItemIcon><Typography textAlign="center" color="error">Cerrar Sesión</Typography></MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Container maxWidth="sm" sx={{ pb: 12, pt: 2 }}>
        {trips.map(trip => (
          <Card key={trip.id} sx={{ mb: 1.5, position: 'relative', overflow: 'hidden', bgcolor: 'background.paper' }}>
            <CardActionArea onClick={() => navigate(`/trip/${trip.id}`)} sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'stretch' }}>
              <Box sx={{ width: 80, minWidth: 80, height: 80, position: 'relative' }}> <TripCoverImage url={trip.coverImageUrl} place={trip.place} height="100%" /> </Box>
              <CardContent sx={{ flexGrow: 1, py: 1, px: 2, display:'flex', flexDirection:'column', justifyContent:'center' }}>
                <Typography variant="subtitle1" sx={{ color: 'text.primary', lineHeight: 1.1, mb: 0.2 }}>{trip.title}</Typography>
                <Stack direction="row" alignItems="center" gap={0.5} color="text.secondary" mb={0.2}> <LocationOnIcon sx={{ fontSize: 14, color: 'primary.main' }}/> <Typography variant="caption" sx={{ fontWeight: 500 }}>{trip.place}</Typography> </Stack>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize:'0.7rem' }}> {trip.startDate ? dayjs(trip.startDate).format('D MMM') : ''} {trip.endDate ? ` - ${dayjs(trip.endDate).format('D MMM')}` : ''} </Typography>
              </CardContent>
            </CardActionArea>
            <Box position="absolute" top={4} right={4} display="flex" sx={{ zIndex: 2 }}>
               <IconButton size="small" onClick={(e) => { e.stopPropagation(); setShareTripId(trip.id); setOpenShare(true); }} sx={{ color: 'text.secondary', p:0.5 }}><ShareIcon sx={{fontSize:16}}/></IconButton>
               <IconButton size="small" onClick={(e) => openEdit(e, trip)} sx={{ color: 'text.secondary', p:0.5 }}><EditIcon sx={{fontSize:16}}/></IconButton>
               <IconButton size="small" onClick={(e) => handleDelete(e, trip.id)} sx={{ color: '#E57373', p:0.5 }}><DeleteForeverIcon sx={{fontSize:16}}/></IconButton>
            </Box>
          </Card>
        ))}
      </Container>
      <Fab variant="extended" onClick={() => setOpenModal(true)} sx={{ position: 'fixed', bottom: 24, right: 24 }}> <AddIcon sx={{ mr: 1, fontSize: 20 }} /> Nuevo Viaje </Fab>
      {/* ... MODALES HOME ... */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="xs"> <DialogTitle sx={{fontWeight:700, textAlign:'center'}}>Nuevo Viaje</DialogTitle> <DialogContent> <Stack spacing={2} mt={1}> <TextField label="Título" fullWidth variant="filled" InputProps={{disableUnderline:true}} value={newTrip.title} onChange={e=>setNewTrip({...newTrip,title:e.target.value})}/> <TextField label="Lugar" fullWidth variant="filled" InputProps={{disableUnderline:true}} value={newTrip.place} onChange={e=>setNewTrip({...newTrip,place:e.target.value})}/> <Stack direction="row" gap={2}> <TextField type="date" label="Inicio" fullWidth InputProps={{disableUnderline:true}} variant="filled" InputLabelProps={{shrink:true}} value={newTrip.startDate} onChange={e=>setNewTrip({...newTrip,startDate:e.target.value})}/> <TextField type="date" label="Fin" fullWidth InputProps={{disableUnderline:true}} variant="filled" InputLabelProps={{shrink:true}} value={newTrip.endDate} onChange={e=>setNewTrip({...newTrip,endDate:e.target.value})}/> </Stack> <TextField label="URL Foto Portada (Opcional)" fullWidth variant="filled" InputProps={{disableUnderline:true, startAdornment: <LinkIcon sx={{color: 'text.secondary', mr: 1}} />}} value={newTrip.coverImageUrl} onChange={e=>setNewTrip({...newTrip, coverImageUrl: e.target.value})} /> </Stack> </DialogContent> <DialogActions sx={{p:3, justifyContent:'center'}}> <Button onClick={()=>setOpenModal(false)} sx={{color:'text.secondary', bgcolor:'transparent !important'}}>Cancelar</Button> <Button variant="contained" onClick={handleSave} disableElevation sx={{bgcolor:'primary.main', color:'white'}}>Crear Viaje</Button> </DialogActions> </Dialog>
      <Dialog open={openEditModal} onClose={() => setOpenEditModal(false)} fullWidth maxWidth="xs"> <DialogTitle sx={{fontWeight:700}}>Editar Viaje</DialogTitle> <DialogContent> <Stack spacing={2} mt={1}> <TextField label="Título" fullWidth variant="filled" InputProps={{disableUnderline:true}} value={editTripData.title} onChange={e=>setEditTripData({...editTripData,title:e.target.value})}/> <TextField label="Lugar" fullWidth variant="filled" InputProps={{disableUnderline:true}} value={editTripData.place} onChange={e=>setEditTripData({...editTripData,place:e.target.value})}/> <Stack direction="row" gap={2}> <TextField type="date" label="Inicio" fullWidth variant="filled" InputProps={{disableUnderline:true}} InputLabelProps={{shrink:true}} value={editTripData.startDate} onChange={e=>setEditTripData({...editTripData,startDate:e.target.value})}/> <TextField type="date" label="Fin" fullWidth variant="filled" InputProps={{disableUnderline:true}} InputLabelProps={{shrink:true}} value={editTripData.endDate} onChange={e=>setEditTripData({...editTripData,endDate:e.target.value})}/> </Stack> <TextField label="URL Foto Portada" fullWidth variant="filled" InputProps={{disableUnderline:true}} value={editTripData.coverImageUrl} onChange={e=>setEditTripData({...editTripData, coverImageUrl: e.target.value})}/> </Stack> </DialogContent> <DialogActions sx={{p:3}}> <Button onClick={()=>setOpenEditModal(false)} sx={{bgcolor:'transparent !important'}}>Cancelar</Button> <Button variant="contained" onClick={handleUpdateTrip} sx={{bgcolor:'primary.main', color:'white'}}>Guardar</Button> </DialogActions> </Dialog>
      <Dialog open={openShare} onClose={() => setOpenShare(false)} fullWidth maxWidth="xs"> <DialogTitle sx={{fontWeight:700}}>Invitar</DialogTitle> <DialogContent> <TextField autoFocus label="Email Gmail" type="email" fullWidth variant="filled" InputProps={{disableUnderline:true}} value={shareEmail} onChange={e=>setShareEmail(e.target.value)} sx={{mt:1}} /> </DialogContent> <DialogActions sx={{p:3}}> <Button onClick={()=>setOpenShare(false)} sx={{bgcolor:'transparent !important'}}>Cancelar</Button> <Button variant="contained" onClick={handleShare} sx={{bgcolor:'primary.main', color:'white'}}>Enviar</Button> </DialogActions> </Dialog>
    </>
  );
}

function SpotsView({ tripId, openCreateSpot, onEdit, isEditMode }) {
  const [spots, setSpots] = useState([]);
  const [filterTag, setFilterTag] = useState('Todos');
  useEffect(() => { const u = onSnapshot(collection(db, "trips", tripId, "spots"), (s) => setSpots(s.docs.map(d => ({ id: d.id, ...d.data() })))); return u; }, [tripId]);
  const allTags = ['Todos', ...new Set(spots.flatMap(s => s.tags || []).map(t => t.trim()))];
  const filteredSpots = filterTag === 'Todos' ? spots : spots.filter(s => s.tags?.includes(filterTag));
  const CATEGORY_ORDER = ['Comida', 'Visita', 'Super', 'Gasolina', 'Salud', 'Otro'];
  const groupedSpots = filteredSpots.reduce((groups, spot) => { const category = spot.category || 'Otro'; if (!groups[category]) groups[category] = []; groups[category].push(spot); return groups; }, {});
  
  const theme = useTheme();
  const getCategoryConfig = (cat) => { switch(cat) { case 'Comida': return { icon: <RestaurantIcon/>, label: '🍔 Comida', ...theme.palette.custom.food }; case 'Super': return { icon: <ShoppingCartIcon/>, label: '🛒 Supermercado', ...theme.palette.custom.place }; case 'Gasolina': return { icon: <LocalGasStationIcon/>, label: '⛽ Gasolinera', ...theme.palette.custom.transport }; case 'Visita': return { icon: <CameraAltIcon/>, label: '📷 Turismo', ...theme.palette.custom.place }; case 'Salud': return { icon: <LocalHospitalIcon/>, label: '🏥 Salud', bg: theme.palette.mode==='light'?'#FFDAD6':'#411616', color:theme.palette.mode==='light'?'#410002':'#ffb4ab', border:theme.palette.mode==='light'?'#FFB4AB':'#691d1d' }; default: return { icon: <StarIcon/>, label: '⭐ Otros', ...theme.palette.custom.place }; } };
  
  const handleDeleteSpot = async (id) => { if(confirm("¿Borrar sitio?")) await deleteDoc(doc(db,"trips",tripId,"spots",id)); };
  return (
    <Box pb={12} pt={2}>
      <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 2, px: 2, '&::-webkit-scrollbar':{display:'none'} }}> {allTags.map(tag => ( <Chip key={tag} label={tag} onClick={() => setFilterTag(tag)} 
          sx={{ bgcolor: filterTag === tag ? theme.palette.custom.filterActive.bg : (theme.palette.mode === 'light' ? '#FDFDFD' : 'background.paper'), color: filterTag === tag ? theme.palette.custom.filterActive.color : 'text.secondary', fontWeight: 600, border: '1px solid', borderColor: 'divider' }} /> ))} 
      </Box>
      <Container maxWidth="sm">
        {CATEGORY_ORDER.map(catName => { const catSpots = groupedSpots[catName]; if (!catSpots || catSpots.length === 0) return null; const config = getCategoryConfig(catName); return ( <Box key={catName} mb={3}> <Typography variant="subtitle2" sx={{color: config.color, ml:1, mb:1, fontWeight:700}}>{config.label}</Typography> {catSpots.map(spot => ( <Card key={spot.id} sx={{ mb: 1, bgcolor: 'background.paper' }}> <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'center', py: 1.5, '&:last-child': { pb: 1.5 } }}> <Box sx={{ bgcolor: config.bg, color: config.color, width:36, height:36, borderRadius: '8px', display:'flex', alignItems:'center', justifyContent:'center' }}>{config.icon}</Box> <Box flexGrow={1}> <Typography variant="subtitle2" fontWeight="700" color="text.primary">{spot.name}</Typography> <Typography variant="body2" sx={{opacity:0.8, fontSize:'0.8rem', color:'text.secondary'}} noWrap>{spot.description}</Typography> <Stack direction="row" gap={0.5} mt={0.5} flexWrap="wrap"> {spot.tags?.map(tag => <Chip key={tag} label={`#${tag}`} size="small" sx={{ height: 18, fontSize: '0.65rem', bgcolor: 'action.hover', border:'none' }} />)} </Stack> </Box> <Stack> 
        {!isEditMode && spot.mapsLink && (<IconButton size="small" sx={{ color:config.color, opacity:0.8 }} onClick={() => window.open(spot.mapsLink, '_blank')}><DirectionsIcon fontSize="small" /></IconButton>)}
        {isEditMode && ( <> <IconButton size="small" onClick={() => onEdit(spot)} sx={{ color:'text.secondary', opacity:0.8 }}><EditIcon fontSize="small" /></IconButton> <IconButton size="small" onClick={() => handleDeleteSpot(spot.id)} sx={{ color:'#E57373', opacity:0.8 }}><DeleteForeverIcon fontSize="small" /></IconButton> </> )}
        </Stack> </CardContent> </Card> ))} </Box> ) })}
      </Container>
      <Fab variant="extended" color="secondary" onClick={openCreateSpot} sx={{ position: 'fixed', bottom: 100, right: 24, zIndex:10 }}><AddIcon sx={{mr:1}}/> Sitio</Fab>
    </Box>
  );
}

function ExpensesView({ trip, tripId, userEmail }) {
  const [expenses, setExpenses] = useState([]);
  const [openExpenseModal, setOpenExpenseModal] = useState(false);
  const [openAliasModal, setOpenAliasModal] = useState(false);
  const [openSettleModal, setOpenSettleModal] = useState(false); 
  const [newExpense, setNewExpense] = useState({ title: '', amount: '', payer: userEmail, date: dayjs().format('YYYY-MM-DD') });
  const [splitType, setSplitType] = useState('equal');
  const [manualShares, setManualShares] = useState({});
  const [aliases, setAliases] = useState({});
  const [settleData, setSettleData] = useState({ debtor: '', creditor: '', amount: 0 }); 
  const [editingId, setEditingId] = useState(null); 
  
  const theme = useTheme(); 
  const manualInputProps = useMemo(() => ({ disableUnderline:true, style:{borderRadius:8, backgroundColor: theme.palette.background.paper}, endAdornment: <InputAdornment position="end">€</InputAdornment> }), [theme]);

  useEffect(() => { const q = query(collection(db, "trips", tripId, "expenses"), orderBy("date", "desc")); const u = onSnapshot(q, (s) => setExpenses(s.docs.map(d => ({ id: d.id, ...d.data() })))); return u; }, [tripId]);
  useEffect(() => { setAliases(trip.aliases || {}) }, [trip]);
  const getName = (email) => aliases[email] || email.split('@')[0];
  
  const handleSaveAlias = async () => { await updateDoc(doc(db, "trips", tripId), { aliases: aliases }); setOpenAliasModal(false); };
  const handleSaveExpense = async () => { if (!newExpense.title || !newExpense.amount) return; const amountFloat = parseFloat(newExpense.amount); let finalSplit = {}; if (splitType === 'equal') { const partCount = trip.participants.length; const share = amountFloat / partCount; trip.participants.forEach(p => finalSplit[p] = share); } else { const currentTotal = Object.values(manualShares).reduce((a, b) => a + parseFloat(b || 0), 0); if (Math.abs(currentTotal - amountFloat) > 0.05) { alert(`Error suma manual`); return; } trip.participants.forEach(p => finalSplit[p] = parseFloat(manualShares[p] || 0)); } const expenseData = { ...newExpense, amount: amountFloat, split: finalSplit, createdAt: new Date() }; if (editingId) { const { createdAt, ...dataToUpdate } = expenseData; await updateDoc(doc(db, "trips", tripId, "expenses", editingId), dataToUpdate); } else { await addDoc(collection(db, "trips", tripId, "expenses"), expenseData); } setOpenExpenseModal(false); setNewExpense({ title: '', amount: '', payer: userEmail, date: dayjs().format('YYYY-MM-DD') }); setSplitType('equal'); setEditingId(null); setManualShares({}); };
  const handleOpenEdit = (exp) => { setEditingId(exp.id); setNewExpense({ title: exp.title, amount: exp.amount, payer: exp.payer, date: exp.date }); if (exp.split) { const values = Object.values(exp.split); const isAllEqual = values.every(v => Math.abs(v - values[0]) < 0.01); if (isAllEqual) { setSplitType('equal'); setManualShares({}); } else { setSplitType('manual'); setManualShares(exp.split); } } else { setSplitType('equal'); } setOpenExpenseModal(true); }
  const handleOpenCreate = () => { setEditingId(null); setNewExpense({ title: '', amount: '', payer: userEmail, date: dayjs().format('YYYY-MM-DD') }); setSplitType('equal'); setManualShares({}); setOpenExpenseModal(true); }
  const handleManualShareChange = (email, value) => { setManualShares(prev => ({...prev, [email]: value })); }
  const handleSettleUp = async () => { const splitData = {}; splitData[settleData.creditor] = parseFloat(settleData.amount); trip.participants.forEach(p => { if (p !== settleData.creditor) splitData[p] = 0; }); await addDoc(collection(db, "trips", tripId, "expenses"), { title: 'REEMBOLSO', amount: parseFloat(settleData.amount), payer: settleData.debtor, date: dayjs().format('YYYY-MM-DD'), split: splitData, isReimbursement: true, createdAt: new Date() }); setOpenSettleModal(false); };
  const openPayModal = (debtor, amount) => { setSettleData({ debtor: debtor, creditor: '', amount: Math.abs(amount).toFixed(2) }); setOpenSettleModal(true); }
  const handleDelete = async (id) => { if(confirm("¿Eliminar gasto?")) await deleteDoc(doc(db, "trips", tripId, "expenses", id)); };
  const { total, balances } = useMemo(() => { if (!trip.participants || trip.participants.length === 0) return { total: 0, balances: {} }; let totalSpent = 0; const bals = {}; trip.participants.forEach(p => bals[p] = 0); expenses.forEach(e => { if (!e.isReimbursement) totalSpent += (e.amount || 0); if (bals[e.payer] !== undefined) bals[e.payer] += (e.amount || 0); if (e.split) { Object.keys(e.split).forEach(person => { if (bals[person] !== undefined) bals[person] -= e.split[person]; }); } else { const share = e.amount / trip.participants.length; trip.participants.forEach(p => bals[p] -= share); } }); return { total: totalSpent, balances: bals }; }, [expenses, trip.participants]);
  const sortedExpenses = useMemo(() => { return [...expenses].sort((a, b) => { const dateA = dayjs(a.date); const dateB = dayjs(b.date); if (dateA.isAfter(dateB)) return -1; if (dateA.isBefore(dateB)) return 1; return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0); }); }, [expenses]);
  const formatMoney = (amount) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);

  const greenBg = theme.palette.mode === 'dark' ? '#1b3320' : '#E8F5E9';
  const redBg = theme.palette.mode === 'dark' ? '#3e1a1a' : '#FFEBEE';
  const greenText = theme.palette.mode === 'dark' ? '#81c784' : '#2E7D32';
  const redText = theme.palette.mode === 'dark' ? '#e57373' : '#C62828';

  return (
    <Box pb={12} pt={2}>
      <Container maxWidth="sm">
        <Card sx={{ mb: 3, borderRadius: '16px', bgcolor: 'primary.main', color: 'primary.contrastText', boxShadow: 'none' }}>
          <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" sx={{fontWeight: 600, opacity: 0.9}}>TOTAL VIAJE</Typography>
              <Box textAlign="right">
                 <Typography variant="h6" fontWeight="700" lineHeight={1}>{formatMoney(total)}</Typography>
                 <Typography variant="caption" sx={{opacity:0.8}}>({formatMoney(total / (trip.participants?.length || 1))}/p)</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, ml: 1, color: 'text.primary' }}>Balances</Typography>
          <IconButton size="small" onClick={() => setOpenAliasModal(true)} sx={{bgcolor:'action.hover'}}><SettingsSuggestIcon fontSize="small"/></IconButton>
        </Stack>
        <Stack spacing={1} mb={4}>
          {trip.participants && trip.participants.map(p => {
            const bal = balances[p] || 0; const isPositive = bal >= 0;
            return ( <Card key={p} sx={{ borderRadius: '12px', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}> <Box p={1.5} display="flex" justifyContent="space-between" alignItems="center"> <Stack direction="row" gap={1.5} alignItems="center"> <Avatar sx={{ width: 28, height: 28, bgcolor: isPositive ? greenBg : redBg, color: isPositive ? greenText : redText, fontSize: '0.8rem', fontWeight: 700 }}>{getName(p).charAt(0).toUpperCase()}</Avatar> <Box> <Typography variant="body2" fontWeight="600" lineHeight={1.1} color="text.primary">{getName(p)}</Typography> <Typography variant="caption" sx={{ color: isPositive ? greenText : redText, fontWeight:700 }}>{isPositive ? 'Le deben ' : 'Debe '}{formatMoney(Math.abs(bal))}</Typography> </Box> </Stack> {!isPositive && Math.abs(bal) > 0.01 && ( <Button size="small" startIcon={<HandshakeIcon sx={{fontSize:14}}/>} onClick={() => openPayModal(p, bal)} sx={{ bgcolor: redBg, color: redText, fontSize:'0.7rem', px:1, py:0.2, minWidth:0, borderRadius:'8px' }}>Pagar</Button> )} </Box> </Card> )
          })}
        </Stack>
        <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 700, ml: 1, color:'text.primary' }}>Movimientos</Typography>
        {sortedExpenses.length === 0 && <Typography color="text.secondary" textAlign="center" mt={4} fontSize="0.9rem">No hay gastos recientes.</Typography>}
        {sortedExpenses.map(exp => {
          const isReimbursement = exp.isReimbursement;
          const bgCard = isReimbursement ? (theme.palette.mode==='dark' ? '#122619' : '#F1F8E9') : 'background.paper';
          const borderCard = isReimbursement ? (theme.palette.mode==='dark' ? '#1D4028' : '#C8E6C9') : 'none';
          const iconBg = isReimbursement ? (theme.palette.mode==='dark' ? '#1b4d24' : '#DCEDC8') : 'action.selected';
          const textColor = isReimbursement ? (theme.palette.mode==='dark' ? '#a5d6a7' : 'success.main') : 'text.primary';

          return ( <Card key={exp.id} sx={{ mb: 1, borderRadius: '12px', bgcolor: bgCard, border: isReimbursement ? `1px solid ${borderCard}` : 'none' }}> <Box p={1.5} display="flex" gap={1.5} alignItems="center"> <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: iconBg, color: isReimbursement ? textColor : 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center' }}> {isReimbursement ? <HandshakeIcon sx={{fontSize:18}}/> : <Typography fontSize="1rem">💸</Typography>} </Box> <Box flexGrow={1}> <Typography variant="body2" fontWeight="700" lineHeight={1.2} color={textColor}>{exp.title}</Typography> <Typography variant="caption" color="text.secondary" sx={{display:'block', lineHeight:1.1}}>{isReimbursement ? 'De' : 'Por'} {getName(exp.payer)} • {dayjs(exp.date).format('D MMM')}</Typography> {exp.split && !isReimbursement && !Object.values(exp.split).every(v => Math.abs(v - (exp.amount/Object.keys(exp.split).length)) < 0.01) && ( <Typography variant="caption" sx={{display:'block', color:'primary.main', fontSize:'0.65rem'}}>Reparto manual</Typography> )} </Box> <Box textAlign="right"> <Typography variant="body2" fontWeight="700" color={textColor}>{formatMoney(exp.amount)}</Typography> <Stack direction="row" justifyContent="flex-end" alignItems="center"> <IconButton size="small" onClick={() => handleOpenEdit(exp)} sx={{ p: 0.5, mt: 0, color: 'text.secondary' }}><EditIcon sx={{fontSize:16}} /></IconButton> <IconButton size="small" onClick={() => handleDelete(exp.id)} sx={{ p: 0.5, mt: 0, color: 'text.secondary' }}><DeleteForeverIcon sx={{fontSize:16}} /></IconButton> </Stack> </Box> </Box> </Card> )
        })}
      </Container>
      <Fab variant="extended" onClick={handleOpenCreate} sx={{ position: 'fixed', bottom: 100, right: 24, zIndex: 10, bgcolor: 'secondary.main', color: 'secondary.contrastText', boxShadow:'0 4px 10px rgba(0,0,0,0.3)' }}> <AddIcon sx={{ mr: 1, fontSize:20 }} /> Gasto </Fab>
      <Dialog open={openExpenseModal} onClose={() => setOpenExpenseModal(false)} fullWidth maxWidth="xs"> <DialogTitle sx={{ fontWeight: 700, textAlign: 'center' }}>{editingId ? "Editar Gasto" : "Añadir Gasto"}</DialogTitle> <DialogContent> <Stack spacing={2} mt={1}> <TextField label="Concepto" fullWidth variant="filled" InputProps={{ disableUnderline: true }} value={newExpense.title} onChange={e => setNewExpense({ ...newExpense, title: e.target.value })} /> <TextField label="Cantidad Total" type="number" fullWidth variant="filled" InputProps={{ disableUnderline: true, startAdornment: <InputAdornment position="start">€</InputAdornment> }} value={newExpense.amount} onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })} /> <FormControl fullWidth variant="filled"> <InputLabel disableAnimation shrink={true} sx={{position:'relative', left: -12, top: 10, mb:1}}>Pagado por</InputLabel> <Select value={newExpense.payer} onChange={e => setNewExpense({ ...newExpense, payer: e.target.value })} disableUnderline variant="filled" sx={{ borderRadius: 2, bgcolor: 'action.hover', mt: 0 }}> {trip.participants && trip.participants.map(p => (<MenuItem key={p} value={p}>{getName(p)}</MenuItem>))} </Select> </FormControl> <ToggleButtonGroup value={splitType} exclusive onChange={(e, val) => { if(val) setSplitType(val); }} fullWidth sx={{ mt: 1 }}> <ToggleButton value="equal"><GroupIcon sx={{mr:1, fontSize:18}}/> Iguales</ToggleButton> <ToggleButton value="manual"><PlaylistAddCheckIcon sx={{mr:1, fontSize:18}}/> Manual</ToggleButton> </ToggleButtonGroup> {splitType === 'manual' && ( <Box sx={{ bgcolor:'action.hover', p:2, borderRadius: 3 }}> <Typography variant="caption" sx={{mb:1, display:'block', fontWeight:600, color:'text.secondary'}}>Distribuir {newExpense.amount || 0}€:</Typography> {trip.participants && trip.participants.map(p => ( <Box key={p} display="flex" alignItems="center" justifyContent="space-between" mb={1}> <Typography variant="body2" noWrap sx={{width:'40%'}}>{getName(p)}</Typography> <TextField type="number" variant="filled" size="small" hiddenLabel InputProps={manualInputProps} value={manualShares[p] ?? ''} onChange={(e) => handleManualShareChange(p, e.target.value)} sx={{width:'50%'}} /> </Box> ))} </Box> )} <TextField type="date" label="Fecha" fullWidth variant="filled" InputProps={{ disableUnderline: true }} value={newExpense.date} onChange={e => setNewExpense({ ...newExpense, date: e.target.value })} /> </Stack> </DialogContent> <DialogActions sx={{ p: 3, justifyContent: 'center' }}> <Button onClick={() => setOpenExpenseModal(false)} sx={{ color: 'text.secondary' }}>Cancelar</Button> <Button variant="contained" onClick={handleSaveExpense} sx={{ bgcolor: 'primary.main', color: 'white', borderRadius: '50px', px: 4 }}>Guardar</Button> </DialogActions> </Dialog>
      <Dialog open={openAliasModal} onClose={() => setOpenAliasModal(false)} fullWidth maxWidth="xs"> <DialogTitle sx={{ fontWeight: 700 }}>Nombres / Alias</DialogTitle> <DialogContent> <Stack spacing={2} mt={1}> {trip.participants && trip.participants.map(email => ( <TextField key={email} label={email} variant="filled" size="small" InputProps={{disableUnderline:true, style:{borderRadius:12}}} value={aliases[email] || ''} onChange={(e) => setAliases({...aliases, [email]: e.target.value})} placeholder={email.split('@')[0]} /> ))} </Stack> </DialogContent> <DialogActions sx={{p:2}}> <Button onClick={() => setOpenAliasModal(false)} sx={{color:'text.secondary'}}>Cancelar</Button> <Button onClick={handleSaveAlias} variant="contained" sx={{bgcolor:'primary.main', color:'white'}}>Guardar</Button> </DialogActions> </Dialog>
      <Dialog open={openSettleModal} onClose={() => setOpenSettleModal(false)} fullWidth maxWidth="xs"> <DialogTitle sx={{ fontWeight: 700 }}>Saldar Deuda</DialogTitle> <DialogContent> <Stack spacing={2} mt={1}> <TextField label="Quién paga" fullWidth variant="filled" disabled value={getName(settleData.debtor)} InputProps={{disableUnderline:true}} /> <FormControl fullWidth variant="filled"> <InputLabel shrink>Para quién</InputLabel> <Select value={settleData.creditor} onChange={(e) => setSettleData({...settleData, creditor: e.target.value})} disableUnderline displayEmpty sx={{ borderRadius: 2, bgcolor: 'action.hover' }}> <MenuItem value="" disabled>Selecciona al receptor</MenuItem> {trip.participants && trip.participants.filter(p => balances[p] > 0).map(p => (<MenuItem key={p} value={p}>{getName(p)} (Le deben {formatMoney(balances[p])})</MenuItem>))} </Select> </FormControl> <TextField label="Cantidad" type="number" fullWidth variant="filled" InputProps={{ disableUnderline: true, startAdornment: <InputAdornment position="start">€</InputAdornment> }} value={settleData.amount} onChange={(e) => setSettleData({...settleData, amount: e.target.value})} /> </Stack> </DialogContent> <DialogActions sx={{p:2}}> <Button onClick={() => setOpenSettleModal(false)} sx={{color:'text.secondary'}}>Cancelar</Button> <Button onClick={handleSettleUp} variant="contained" disabled={!settleData.creditor || !settleData.amount} color="success" sx={{color:'white'}}>Registrar Pago</Button> </DialogActions> </Dialog>
    </Box>
  );
}

// --- DETALLE VIAJE (ITINERARIO PRINCIPAL) ---
function TripDetailScreen() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [currentView, setCurrentView] = useState(0);
  const [items, setItems] = useState([]);
  const [caching, setCaching] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [editNotesOpen, setEditNotesOpen] = useState(false);
  const [tripNotes, setTripNotes] = useState('');
  const [openItemModal, setOpenItemModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [newItem, setNewItem] = useState({ type: 'place', title: '', time: '10:00', mapsLink: '', description: '', flightNumber:'', terminal:'', gate:'' });
  const [files, setFiles] = useState([]); 
  const [existingAttachments, setExistingAttachments] = useState([]); 
  const [uploading, setUploading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isReorderMode, setIsReorderMode] = useState(false); 
  
  // NUEVO ESTADO PARA LOS SPOTS QUE FALTABA AQUÍ
  const [isEditModeSpots, setIsEditModeSpots] = useState(false);
  const [openSpotModal, setOpenSpotModal] = useState(false);
  const [newSpot, setNewSpot] = useState({ name: '', category: 'Comida', description: '', mapsLink: '', tags: '' });
  const [editingSpotId, setEditingSpotId] = useState(null);
  
  const theme = useTheme();

  useEffect(() => { const u = onSnapshot(doc(db,"trips",tripId), (d) => { if(d.exists()){ setTrip({id:d.id,...d.data()}); setTripNotes(d.data().notes || ''); } }); return u; },[tripId]);
  useEffect(() => { const u=onSnapshot(query(collection(db,"trips",tripId,"items"),orderBy("time","asc")),(s)=>setItems(s.docs.map(d=>({id:d.id,...d.data()})))); return u; },[tripId]);

  const openCreate = (date) => { setNewItem({ type: 'place', title: '', time: '10:00', mapsLink: '', description:'', flightNumber:'', terminal:'', gate:'' }); setFiles([]); setExistingAttachments([]); setSelectedDate(date); setIsEditing(false); setOpenItemModal(true); };
  const openEdit = (item) => { setNewItem({ ...item }); setSelectedDate(item.date); const old = item.attachments || []; if(item.pdfUrl) old.push({ name: 'Adjunto', url: item.pdfUrl }); setExistingAttachments(old); setFiles([]); setEditingId(item.id); setIsEditing(true); setOpenItemModal(true); };

  // MANEJADORES PARA LOS SPOTS (Pasados como props a SpotsView)
  const handleOpenCreateSpot = () => {
    setEditingSpotId(null);
    setNewSpot({ name: '', category: 'Comida', description: '', mapsLink: '', tags: '' });
    setOpenSpotModal(true);
  }

  const handleOpenEditSpot = (spot) => {
    setEditingSpotId(spot.id);
    setNewSpot({
        name: spot.name,
        category: spot.category || 'Comida',
        description: spot.description || '',
        mapsLink: spot.mapsLink || '',
        tags: spot.tags ? spot.tags.join(', ') : ''
    });
    setOpenSpotModal(true);
  }

  const handleSaveSpot = async () => {
    if (!newSpot.name) return;
    const tagsArray = newSpot.tags.split(',').map(t => t.trim()).filter(t => t !== '');
    const spotData = { ...newSpot, tags: tagsArray };
    if (editingSpotId) {
        await updateDoc(doc(db, "trips", tripId, "spots", editingSpotId), spotData);
    } else {
        await addDoc(collection(db, "trips", tripId, "spots"), spotData);
    }
    setOpenSpotModal(false);
  };

  const getTypeConfig = (type) => {
     switch(type) {
       case 'flight': return { icon: <FlightTakeoffIcon fontSize="small"/>, label: 'Vuelo', ...theme.palette.custom.flight };
       case 'food':   return { icon: <RestaurantIcon fontSize="small"/>, label: 'Comida', ...theme.palette.custom.food };
       case 'transport': return { icon: <DirectionsIcon fontSize="small"/>, label: 'Transporte', ...theme.palette.custom.transport };
       default:       return { icon: <LocationOnIcon fontSize="small"/>, label: 'Lugar', ...theme.palette.custom.place };
     }
  };

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }), useSensor(TouchSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  const handleDragEnd = async (event) => { const {active, over} = event; if (!over || active.id === over.id) return; const activeItem = items.find(i => i.id === active.id); if(!activeItem) return; const date = activeItem.date; const itemsOfDay = items.filter(i => i.date === date).sort((a,b) => (a.order||0) - (b.order||0)); const oldIndex = itemsOfDay.findIndex(i => i.id === active.id); const newIndex = itemsOfDay.findIndex(i => i.id === over.id); const reorderedItems = arrayMove(itemsOfDay, oldIndex, newIndex); setItems(prevItems => { const otherItems = prevItems.filter(i => i.date !== date); return [...otherItems, ...reorderedItems]; }); const batch = writeBatch(db); reorderedItems.forEach((item, index) => { const ref = doc(db, "trips", tripId, "items", item.id); batch.update(ref, { order: index }); }); await batch.commit(); };
  const handleSaveItem = async () => { if (!newItem.title) return; setUploading(true); let finalAttachments = [...existingAttachments]; let token = sessionStorage.getItem('googleAccessToken'); if (files.length > 0) { try { if (!token) throw new Error("TOKEN_EXPIRED"); const rootId = await findOrCreateFolder("Viajes App", token); const tripIdFolder = await findOrCreateFolder(trip.title, token, rootId); for (const file of files) { const data = await uploadToGoogleDrive(file, token, tripIdFolder); finalAttachments.push({ name: file.name, url: data.webViewLink, fileId: data.id }); } } catch (e) { alert("Error subida (Revisa login)"); setUploading(false); return; } } const itemData = { ...newItem, date: selectedDate, attachments: finalAttachments, pdfUrl: null, order: Date.now(), createdAt: new Date() }; if (isEditing) await updateDoc(doc(db, "trips", tripId, "items", editingId), itemData); else await addDoc(collection(db, "trips", tripId, "items"), itemData); setOpenItemModal(false); setUploading(false); };
  const handleSaveNotes = async () => { await updateDoc(doc(db,"trips",tripId), { notes: tripNotes }); setEditNotesOpen(false); };
  const deleteAttachment = (index) => { const updated = [...existingAttachments]; updated.splice(index, 1); setExistingAttachments(updated); };
  const handleCacheAll = async () => { if (!confirm(`¿Descargar Offline?`)) return; setCaching(true); try { let t = sessionStorage.getItem('googleAccessToken'); if(!t) t=await getRefreshedToken(); for (const item of items) if (item.attachments) for (const att of item.attachments) if (att.fileId) try { await cacheFileLocal(att.fileId, t); } catch (e) {} setShowToast(true); setRefreshTrigger(p => p + 1); } catch(e) { alert("Error"); } setCaching(false); };
  const openAttachment = async (att) => { if (att.fileId) { const b = await getFileFromCache(att.fileId); if (b) return window.open(URL.createObjectURL(b)); } window.open(att.url, '_blank'); };
  const handleDeleteItem = async (id) => { if(confirm("¿Eliminar evento?")) await deleteDoc(doc(db,"trips",tripId,"items",id)); };

  if (!trip) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress/></Box>;
  let days = []; try { const s=trip.startDate?dayjs(trip.startDate):dayjs(); const e=trip.endDate?dayjs(trip.endDate):s; for(let i=0; i<=Math.max(0,e.diff(s,'day')); i++) days.push(s.add(i,'day').format('YYYY-MM-DD')); } catch(e) {}

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
    <Box sx={{ minHeight:'100vh', bgcolor:'background.default', pb:10 }}>
      <Box sx={{ position:'sticky',top:0,zIndex:10,bgcolor:'rgba(255,255,255,0.05)',backdropFilter:'blur(10px)', borderBottom:'1px solid rgba(0,0,0,0.05)' }}>
        <Toolbar>
          <IconButton onClick={()=>navigate('/')}><ArrowBackIcon sx={{color: 'text.primary'}}/></IconButton>
          <Box ml={1} flexGrow={1}>
              <Typography variant="subtitle1" lineHeight={1.1} sx={{color: 'text.primary', fontWeight: 700}}>{trip.title}</Typography>
              <Typography variant="caption" color="text.secondary">{trip.place}</Typography>
          </Box>
          {currentView === 0 && ( <Tooltip title={isReorderMode ? "Terminar" : "Reordenar"}><IconButton onClick={() => setIsReorderMode(!isReorderMode)} sx={{ color: isReorderMode ? 'secondary.main' : 'action.active' }}> {isReorderMode ? <CheckIcon /> : <SwapVertIcon />} </IconButton></Tooltip> )}
          {currentView === 1 && ( <Tooltip title={isEditModeSpots ? "Terminar" : "Editar"}><IconButton onClick={() => setIsEditModeSpots(!isEditModeSpots)} sx={{ color: isEditModeSpots ? 'secondary.main' : 'action.active' }}> {isEditModeSpots ? <CheckIcon /> : <EditIcon />} </IconButton></Tooltip> )}
          <Tooltip title="Descargar"><IconButton onClick={handleCacheAll} disabled={caching} sx={{color: caching ? 'text.disabled' : 'primary.main'}}>{caching ? <CircularProgress size={24}/> : <CloudDownloadIcon />}</IconButton></Tooltip>
        </Toolbar>
      </Box>

      {/* VISTAS */}
      {currentView === 0 && (
        <Container maxWidth="sm" sx={{ py: 2 }}>
          <Card sx={{ mb: 3, bgcolor: theme.palette.custom.note.bg, border: `1px solid ${theme.palette.custom.note.border}`, color: theme.palette.custom.note.color }}>
            <CardActionArea onClick={() => setEditNotesOpen(true)}>
              <CardContent sx={{ py: 2 }}>
                <Stack direction="row" alignItems="center" gap={1} mb={0.5}><StickyNote2Icon sx={{ fontSize: 18 }} /><Typography variant="subtitle2" fontWeight="700" sx={{color: theme.palette.custom.note.titleColor}}>NOTAS</Typography></Stack>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line', opacity: 0.9 }}>{trip.notes || "Añade códigos, seguros, wifi..."}</Typography>
              </CardContent>
            </CardActionArea>
          </Card>

          {days.map((d, idx) => {
            const itemsOfDay = items.filter(i => i.date === d).sort((a, b) => (a.order || 0) - (b.order || 0));
            return (
              <Box key={d} mb={3}>
                <Stack direction="row" justifyContent="space-between" mb={1.5} alignItems="center">
                  <Chip label={dayjs(d).format('dddd D [de] MMMM')} sx={{ bgcolor: theme.palette.custom.dateChip.bg, color: theme.palette.custom.dateChip.color, fontWeight: 700, textTransform: 'capitalize', borderRadius: '8px', height: 32, px: 0.5 }} />
                  <Button size="small" onClick={() => openCreate(d)} sx={{ bgcolor:'transparent !important', color: 'primary.main', minWidth: 'auto', px: 1, fontSize:'0.8rem' }} startIcon={<AddIcon sx={{fontSize:18}}/>}>Añadir</Button>
                </Stack>
                <SortableContext items={itemsOfDay.map(i => i.id)} strategy={verticalListSortingStrategy}>
                <Stack spacing={1}>
                  {itemsOfDay.map((item, index) => {
                    const themeColor = theme.palette.custom?.[item.type] || theme.palette.custom.place;
                    const config = getTypeConfig(item.type);
                    const isFlight = item.type==='flight';
                    const atts = item.attachments || [];
                    if(item.pdfUrl) atts.push({name:'Adjunto', url:item.pdfUrl}); 
                    
                    const content = (
                      <Card sx={{ bgcolor: 'background.paper', overflow: 'visible', transition: 'transform 0.2s', transform: isReorderMode ? 'scale(0.98)' : 'none' }}>
                        <Box sx={{ p: 1, display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                          <Box sx={{ display:'flex', flexDirection:'column', alignItems:'center', minWidth: 40, pt: 0.5 }}>
                             {/* CAJA DEL ICONO: Usamos los colores saturados aqui */}
                             <Box sx={{ width: 32, height: 32, bgcolor: themeColor.bg, color: themeColor.color, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{config.icon}</Box>
                             <Typography variant="caption" fontWeight="700" sx={{mt:0.5, color:'text.secondary', fontSize:'0.7rem'}}>{item.time}</Typography>
                          </Box>
                          <Box flexGrow={1} minWidth={0} pt={0.2}>
                             <Stack direction="row" justifyContent="space-between" alignItems="start">
                                <Typography variant="subtitle2" fontWeight="700" lineHeight={1.2} sx={{ mb: 0.5, fontSize:'0.9rem', color: 'text.primary' }}>{item.title}</Typography>
                                <Stack direction="row" alignItems="center">
                                   {isReorderMode ? (
                                     <>
                                       <Box sx={{color: 'text.secondary', cursor: 'grab', p:0.5, display:'flex'}}><DragIndicatorIcon /></Box>
                                       <IconButton size="small" onClick={() => openEdit(item)} sx={{color:'text.secondary'}}><EditIcon sx={{fontSize:20}}/></IconButton>
                                       <IconButton size="small" onClick={() => handleDeleteItem(item.id)} sx={{color:'#E57373'}}><DeleteForeverIcon sx={{fontSize:20}}/></IconButton>
                                     </>
                                   ) : (
                                     <>
                                       {(item.mapsLink || item.type === 'place') && (<IconButton size="small" onClick={() => { const target = item.mapsLink || `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(item.title)}&dir_action=navigate`; window.open(target, '_blank'); }} sx={{ color: themeColor.color, opacity: 0.8, mt:-0.5 }}><MapIcon sx={{fontSize:20}}/></IconButton>)}
                                     </>
                                   )}
                                </Stack>
                             </Stack>
                             {!isReorderMode && (
                               <>
                                 {isFlight && (item.flightNumber || item.terminal || item.gate) && (<Stack direction="row" gap={0.5} mt={0} flexWrap="wrap">{item.flightNumber && <Chip label={item.flightNumber} size="small" sx={{bgcolor: themeColor.bg, color: themeColor.color, height: 20, fontSize:'0.65rem', fontWeight: 600, border: 'none'}} />}{(item.terminal || item.gate) && <Typography variant="caption" sx={{color:'text.secondary', pt:0.2, fontSize:'0.7rem'}}>{item.terminal && `T${item.terminal}`} {item.gate && ` • P${item.gate}`}</Typography>}</Stack>)}
                                 {item.description && (<Typography variant="body2" sx={{mt:0.5, color: 'text.secondary', fontSize:'0.8rem', lineHeight:1.3}}>{item.description}</Typography>)}
                                 {atts.length > 0 && (<Stack direction="row" gap={1} mt={1} flexWrap="wrap">{atts.map((att,i) => ( <SmartAttachmentChip key={i} attachment={att} onOpen={openAttachment} refreshTrigger={refreshTrigger} /> ))}</Stack>)}
                               </>
                             )}
                          </Box>
                        </Box>
                      </Card>
                    );
                    return <SortableItem key={item.id} id={item.id} disabled={!isReorderMode}>{content}</SortableItem>;
                  })}
                </Stack>
                </SortableContext>
              </Box>
            )
          })}
        </Container>
      )}

      {currentView === 1 && <SpotsView tripId={tripId} openCreateSpot={handleOpenCreateSpot} onEdit={handleOpenEditSpot} isEditMode={isEditModeSpots} />}
      {currentView === 2 && trip && <ExpensesView trip={trip} tripId={tripId} userEmail={auth.currentUser?.email} />}

      <Paper sx={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 20, borderRadius: '50px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', bgcolor: 'background.paper', overflow: 'hidden', padding: '0 8px' }}>
        <BottomNavigation showLabels={false} value={currentView} onChange={(e, val) => setCurrentView(val)} sx={{ bgcolor: 'transparent', height: 64, width: 'auto', gap:1 }}>
          <BottomNavigationAction label="Itinerario" icon={<ListIcon />} sx={{ color: 'text.secondary', minWidth: 80, borderRadius: '20px', '&.Mui-selected': { paddingTop: 0, '& .MuiSvgIcon-root': { color: 'primary.main' } }, '&.Mui-selected .MuiSvgIcon-root': { bgcolor: 'secondary.light', width: 56, height: 32, borderRadius: '16px', py: 0.5, boxSizing: 'content-box' } }} />
          <BottomNavigationAction label="Sitios" icon={<PlaceIcon />} sx={{ color: 'text.secondary', minWidth: 80, borderRadius: '20px', '&.Mui-selected': { paddingTop: 0, '& .MuiSvgIcon-root': { color: 'primary.main' } }, '&.Mui-selected .MuiSvgIcon-root': { bgcolor: 'secondary.light', width: 56, height: 32, borderRadius: '16px', py: 0.5, boxSizing: 'content-box' } }} />
          <BottomNavigationAction label="Gastos" icon={<EuroIcon />} sx={{ color: 'text.secondary', minWidth: 80, borderRadius: '20px', '&.Mui-selected': { paddingTop: 0, '& .MuiSvgIcon-root': { color: 'primary.main' } }, '&.Mui-selected .MuiSvgIcon-root': { bgcolor: 'secondary.light', width: 56, height: 32, borderRadius: '16px', py: 0.5, boxSizing: 'content-box' } }} />
        </BottomNavigation>
      </Paper>

      {/* MODAL CREAR ITEM (Itinerario) */}
      <Dialog open={openItemModal} onClose={()=>setOpenItemModal(false)} fullWidth maxWidth="xs"><DialogTitle sx={{textAlign:'center', fontWeight:'bold', fontSize:'1.1rem'}}>{isEditing ? "Editar" : "Nuevo Evento"}</DialogTitle><DialogContent><Stack spacing={2} mt={1}><Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>{['place','food','transport','flight'].map(t => { const cfg = getTypeConfig(t); const isSel = newItem.type === t; const btnColor = theme.palette.custom[t]; return (<Button key={t} onClick={()=>setNewItem({...newItem,type:t})} startIcon={React.cloneElement(cfg.icon, { sx: { color: isSel ? btnColor.color : 'text.secondary' } })} sx={{ borderRadius: '8px', bgcolor: isSel ? btnColor.bg : 'action.hover', color: isSel ? btnColor.color : 'text.secondary', border: isSel ? `1px solid ${btnColor.border}` : '1px solid transparent', justifyContent: 'flex-start', px: 2, py: 1 }}>{cfg.label}</Button>)})}</Box>{newItem.type === 'flight' ? (<><TextField label="Nombre Vuelo" fullWidth variant="filled" InputProps={{disableUnderline:true}} size="small" value={newItem.title} onChange={e=>setNewItem({...newItem,title:e.target.value})} /><Stack direction="row" gap={1}><TextField label="Nº Vuelo" fullWidth variant="filled" InputProps={{disableUnderline:true}} size="small" value={newItem.flightNumber} onChange={e=>setNewItem({...newItem,flightNumber:e.target.value})} /><TextField label="Hora" type="time" fullWidth variant="filled" InputProps={{disableUnderline:true}} size="small" value={newItem.time} onChange={e=>setNewItem({...newItem,time:e.target.value})} /></Stack><Stack direction="row" gap={1}><TextField label="Terminal" fullWidth variant="filled" InputProps={{disableUnderline:true}} size="small" value={newItem.terminal} onChange={e=>setNewItem({...newItem,terminal:e.target.value})} /><TextField label="Puerta" fullWidth variant="filled" InputProps={{disableUnderline:true}} size="small" value={newItem.gate} onChange={e=>setNewItem({...newItem,gate:e.target.value})} /></Stack></>) : (<><TextField label={newItem.type === 'transport' ? "Transporte" : "Nombre"} fullWidth variant="filled" InputProps={{disableUnderline:true}} size="small" value={newItem.title} onChange={e=>setNewItem({...newItem,title:e.target.value})} /><TextField label="Dirección / Link" fullWidth variant="filled" InputProps={{disableUnderline:true, startAdornment:<LocationOnIcon sx={{color:'action.active', mr:1, fontSize:20}}/>}} size="small" value={newItem.mapsLink} onChange={e=>setNewItem({...newItem,mapsLink:e.target.value})} /><TextField label="Hora" type="time" fullWidth variant="filled" InputProps={{disableUnderline:true}} size="small" value={newItem.time} onChange={e=>setNewItem({...newItem,time:e.target.value})} /></>)}<TextField label="Notas" multiline rows={2} fullWidth variant="filled" InputProps={{disableUnderline:true}} size="small" value={newItem.description || ''} onChange={e=>setNewItem({...newItem,description:e.target.value})} />{existingAttachments.length > 0 && (<Stack gap={1} p={1} bgcolor="background.paper" borderRadius={2}>{existingAttachments.map((a,i)=><Box key={i} display="flex" justifyContent="space-between" alignItems="center"><Typography variant="caption" noWrap sx={{maxWidth:180}}>{a.name}</Typography><IconButton size="small" onClick={()=>deleteAttachment(i)}><CloseIcon fontSize="small"/></IconButton></Box>)}</Stack>)}<Button variant="outlined" component="label" startIcon={<AttachFileIcon/>} sx={{borderStyle:'dashed', py:1.5, borderColor: 'action.disabled', color: 'text.secondary', borderRadius:'12px'}}>{files.length>0 ? `Subir ${files.length}` : "Adjuntar archivos"}<input type="file" multiple hidden onChange={e=>setFiles(Array.from(e.target.files))}/></Button>{isEditing && <Button color="error" startIcon={<DeleteForeverIcon/>} onClick={()=>{if(confirm("¿Borrar?")){deleteDoc(doc(db,"trips",tripId,"items",editingId));setOpenItemModal(false)}}}>Eliminar Evento</Button>}</Stack></DialogContent><DialogActions sx={{p:3}}><Button onClick={()=>setOpenItemModal(false)} sx={{color:'text.secondary', bgcolor:'transparent !important'}}>Cancelar</Button><Button variant="contained" disabled={uploading} onClick={handleSaveItem} sx={{bgcolor:'primary.main', color:'white'}}>{uploading?'...':'Guardar'}</Button></DialogActions></Dialog>
      
      {/* MODAL EDITAR NOTAS */}
      <Dialog open={editNotesOpen} onClose={()=>setEditNotesOpen(false)} fullWidth maxWidth="xs"><DialogTitle sx={{fontWeight: 700}}>Notas Rápidas</DialogTitle><DialogContent><TextField autoFocus multiline rows={6} fullWidth variant="filled" InputProps={{disableUnderline:true}} value={tripNotes} onChange={e=>setTripNotes(e.target.value)} placeholder="Ej: Wifi: 1234, Seguro..." sx={{mt:1}} /></DialogContent><DialogActions sx={{p:3}}><Button onClick={()=>setEditNotesOpen(false)} sx={{bgcolor:'transparent !important'}}>Cancelar</Button><Button variant="contained" onClick={handleSaveNotes} sx={{bgcolor:'primary.main', color:'white'}}>Guardar</Button></DialogActions></Dialog>
      
      {/* MODAL NUEVO/EDITAR SITIO */}
      <Dialog open={openSpotModal} onClose={() => setOpenSpotModal(false)} fullWidth maxWidth="xs"><DialogTitle sx={{fontWeight: 700}}>Nuevo Sitio</DialogTitle><DialogContent><Stack spacing={2} mt={1}><TextField label="Nombre del sitio" variant="filled" fullWidth size="small" InputProps={{disableUnderline:true}} value={newSpot.name} onChange={e=>setNewSpot({...newSpot, name:e.target.value})} /><FormControl fullWidth variant="filled" size="small"><InputLabel shrink sx={{left:-12,top:-5}}>Categoría</InputLabel><Select value={newSpot.category} onChange={e=>setNewSpot({...newSpot, category:e.target.value})} disableUnderline sx={{ borderRadius: 2, bgcolor: 'action.hover' }}><MenuItem value="Comida">🍔 Comida</MenuItem><MenuItem value="Super">🛒 Supermercado</MenuItem><MenuItem value="Gasolina">⛽ Gasolinera</MenuItem><MenuItem value="Visita">📷 Turismo</MenuItem><MenuItem value="Salud">🏥 Salud</MenuItem><MenuItem value="Otro">⭐ Otro</MenuItem></Select></FormControl><TextField label="Link Maps" variant="filled" fullWidth size="small" InputProps={{disableUnderline:true}} value={newSpot.mapsLink} onChange={e=>setNewSpot({...newSpot, mapsLink:e.target.value})} /><TextField label="Descripción" multiline rows={2} variant="filled" fullWidth size="small" InputProps={{disableUnderline:true}} value={newSpot.description} onChange={e=>setNewSpot({...newSpot, description:e.target.value})} /><TextField label="Etiquetas" variant="filled" fullWidth size="small" placeholder="barato, cena" InputProps={{disableUnderline:true}} value={newSpot.tags} onChange={e=>setNewSpot({...newSpot, tags:e.target.value})} /></Stack></DialogContent><DialogActions sx={{p:3}}><Button onClick={()=>setOpenSpotModal(false)} sx={{bgcolor:'transparent !important'}}>Cancelar</Button><Button variant="contained" onClick={handleSaveSpot} sx={{bgcolor:'primary.main', color:'white'}}>Guardar</Button></DialogActions></Dialog>
      <Snackbar open={showToast} autoHideDuration={3000} onClose={()=>setShowToast(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}><Alert onClose={()=>setShowToast(false)} severity="success" sx={{ width: '100%', borderRadius: 3 }}>¡Descargado para Offline!</Alert></Snackbar>
    </Box>
    </DndContext>
  );
}

// MAIN
function App() {
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState('light');
  useEffect(() => { const savedMode = localStorage.getItem('themeMode'); if (savedMode) setMode(savedMode); }, []);
  const toggleTheme = () => { const newMode = mode === 'light' ? 'dark' : 'light'; setMode(newMode); localStorage.setItem('themeMode', newMode); };
  const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);
  useEffect(() => { onAuthStateChanged(auth, u => setUser(u)) }, []);
  const handleLogin = async () => { try { const r=await signInWithPopup(auth, googleProvider); const c=GoogleAuthProvider.credentialFromResult(r); if(c?.accessToken) sessionStorage.setItem('googleAccessToken',c.accessToken); } catch(e){console.error(e)} };
  return <ThemeProvider theme={theme}><CssBaseline/><BrowserRouter><Routes>{!user?<Route path="*" element={<LoginScreen onLogin={handleLogin}/>}/>:(<> <Route path="/" element={<HomeScreen user={user} onLogout={()=>signOut(auth)} toggleTheme={toggleTheme} mode={mode}/>} /><Route path="/trip/:tripId" element={<TripDetailScreen/>}/></>)}</Routes></BrowserRouter></ThemeProvider>;
}

export default App;