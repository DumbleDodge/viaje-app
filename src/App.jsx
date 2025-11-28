import React, { useState, useEffect } from 'react';
import { 
  createTheme, ThemeProvider, CssBaseline, Box, AppBar, Toolbar, 
  Typography, Fab, Container, Card, CardContent, Button, Avatar, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Stack, CircularProgress,
  CardMedia, CardActionArea, Chip, Tooltip, Alert, Snackbar, MenuItem, Select, FormControl, InputLabel,
  BottomNavigation, BottomNavigationAction, Paper
} from '@mui/material';
import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { get, set } from 'idb-keyval'; 

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

// --- FIREBASE ---
import { auth, googleProvider, db } from './firebase'; 
import { signInWithPopup, signOut, onAuthStateChanged, GoogleAuthProvider } from 'firebase/auth';
import { collection, addDoc, query, where, onSnapshot, orderBy, doc, deleteDoc, updateDoc, arrayUnion } from 'firebase/firestore';

// --- TEMA MATERIAL DESIGN 3 ---
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#6750A4', light: '#EADDFF', contrastText: '#FFFFFF' }, 
    secondary: { main: '#625B71', light: '#E8DEF8' },
    background: { default: '#FDFDFD', paper: '#FFFFFF' }, 
    text: { primary: '#1C1B1F', secondary: '#49454F' },
    custom: {
      flight: { bg: '#D7E3FF', color: '#001B3D', border: '#AFC6FF' }, 
      food:   { bg: '#FFE0B2', color: '#E65100', border: '#FFCC80' }, 
      place:  { bg: '#FFCDD2', color: '#C62828', border: '#EF9A9A' }, 
      transport: { bg: '#C4EED0', color: '#00210E', border: '#6DD58C' }, 
      note:   { bg: '#FFF8E1', color: '#4E342E', border: '#FFE082' }  
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h6: { fontSize: '1rem', fontWeight: 700, letterSpacing: 0 },
    subtitle1: { fontWeight: 600, fontSize: '0.9rem' },
    body2: { letterSpacing: 0.15, fontSize: '0.8rem' },
    button: { textTransform: 'none', fontWeight: 600 }
  },
  components: {
    MuiButton: { styleOverrides: { root: { borderRadius: '50px', padding: '6px 20px', boxShadow: 'none' } } },
    MuiCard: { styleOverrides: { root: { borderRadius: '12px', boxShadow: 'none', border: '1px solid #E0E0E0', backgroundImage: 'none' } } },
    MuiDialog: { styleOverrides: { paper: { borderRadius: '28px', backgroundColor: '#FFFBFE', padding: '8px' } } },
    MuiFab: { styleOverrides: { root: { borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', backgroundColor: '#EADDFF', color: '#21005D', '&:hover':{backgroundColor:'#D0BCFF'} } } },
    MuiTextField: { styleOverrides: { root: { '& .MuiOutlinedInput-root': { borderRadius: '8px' }, '& .MuiFilledInput-root': { borderTopLeftRadius: '4px', borderTopRightRadius: '4px' } } } },
    MuiChip: { styleOverrides: { root: { borderRadius: '8px' } } },
    MuiAppBar: { styleOverrides: { root: { boxShadow: 'none', backgroundColor: '#FDFDFD', color: '#1C1B1F', borderBottom: '1px solid #F0F0F0' } } },
  }
});

// --- FUNCIONES DRIVE Y CACHÉ (Sin cambios) ---
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
const SmartAttachmentChip = ({ attachment, onOpen, refreshTrigger }) => {
  const [isOffline, setIsOffline] = useState(false);
  useEffect(() => { const c = async () => { if (attachment.fileId) setIsOffline(!!await getFileFromCache(attachment.fileId)); }; c(); }, [attachment, refreshTrigger]);
  return (
    <Chip 
      label={attachment.name} 
      onClick={() => onOpen(attachment)} 
      icon={isOffline ? <CheckCircleOutlineIcon style={{fontSize:16, color: '#1B5E20'}}/> : <CloudQueueIcon style={{fontSize:16}}/>} 
      sx={{ 
        height: '24px', 
        fontSize: '0.75rem', 
        fontWeight: 600, 
        maxWidth: '100%', 
        cursor:'pointer',
        bgcolor: isOffline ? '#E8F5E9' : '#F5F5F5', 
        border: isOffline ? '1px solid #A5D6A7' : '1px solid #E0E0E0', 
        color: isOffline ? '#1B5E20' : '#424242'
      }} 
    />
  );
};

const TripCoverImage = ({ url, place, height }) => {
  const imageSrc = (url && url.length > 5) ? url : `https://loremflickr.com/800/400/${encodeURIComponent(place)},landscape/all`;
  return (
    <CardMedia 
      component="img" 
      height={height} 
      image={imageSrc} 
      sx={{ filter:'brightness(0.95)', objectFit:'cover', height: height, width: '100%' }} 
      onError={(e) => { e.target.src = `https://loremflickr.com/800/400/${encodeURIComponent(place)},landscape/all`; }}
    />
  );
};

// --- PANTALLA LOGIN ---
function LoginScreen({ onLogin }) {
  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: 3, background: '#FDFDFD' }}>
      <Box sx={{ p: 5, textAlign: 'center', bgcolor: '#F3EDF7', borderRadius: '28px' }}> 
        <Box sx={{ bgcolor: 'primary.main', width: 64, height: 64, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', mb: 3 }}> 
           <FlightTakeoffIcon sx={{ fontSize: 32, color: 'white' }} /> 
        </Box>
        <Typography variant="h4" fontWeight="800" gutterBottom sx={{color: '#1C1B1F'}}>Viajes App</Typography>
        <Button variant="contained" size="large" startIcon={<GoogleIcon />} onClick={onLogin} sx={{ mt: 3, bgcolor: '#6750A4', color: 'white' }}>Entrar con Google</Button>
      </Box>
    </Box>
  );
}

// --- PANTALLA HOME (LISTA VIAJES) ---
function HomeScreen({ user, onLogout }) {
  const [trips, setTrips] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [openShare, setOpenShare] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [shareTripId, setShareTripId] = useState(null);
  const [newTrip, setNewTrip] = useState({ title: '', place: '', startDate: '', endDate: '', coverImageUrl: '' });
  const [editTripData, setEditTripData] = useState({ id: '', title: '', place: '', startDate: '', endDate: '', coverImageUrl: '' });
  const navigate = useNavigate();

  useEffect(() => { 
    if(!user?.email) return; 
    const u = onSnapshot(query(collection(db,"trips"), where("participants", "array-contains", user.email), orderBy("startDate","asc")),(s)=>setTrips(s.docs.map(d=>({id:d.id,...d.data()})))); 
    return u; 
  },[user]);

  const handleSave = async () => { if(!newTrip.title) return; await addDoc(collection(db,"trips"), { ...newTrip, participants: [user.email], ownerId: user.uid, createdAt: new Date(), notes: '' }); setOpenModal(false); setNewTrip({title:'',place:'',startDate:'',endDate:'', coverImageUrl: ''}); };
  const openEdit = (e, trip) => { e.stopPropagation(); setEditTripData({ ...trip }); setOpenEditModal(true); };
  const handleUpdateTrip = async () => { const { id, ...data } = editTripData; await updateDoc(doc(db, "trips", id), data); setOpenEditModal(false); };
  const handleDelete = async (e,id) => { e.stopPropagation(); if(confirm("¿Eliminar viaje completo?")) await deleteDoc(doc(db,"trips",id)); };
  const handleShare = async () => { if(!shareEmail) return; try { await updateDoc(doc(db, "trips", shareTripId), { participants: arrayUnion(shareEmail) }); alert("¡Invitado!"); setOpenShare(false); setShareEmail(''); } catch (e) { alert("Error"); } };

  return (
    <>
      <AppBar position="sticky" sx={{ bgcolor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, color: '#1C1B1F', fontWeight: 800 }}>Mis Viajes</Typography>
          <Avatar src={user.photoURL} sx={{width:32,height:32}}/>
          <IconButton onClick={onLogout} size="small" sx={{ml:1}}><LogoutIcon fontSize="small"/></IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ pb: 12, pt: 2 }}>
        {trips.map(trip => (
          <Card key={trip.id} sx={{ mb: 1.5, position: 'relative', overflow: 'hidden', bgcolor: 'white' }}>
            <CardActionArea onClick={() => navigate(`/trip/${trip.id}`)} sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'stretch' }}>
              <Box sx={{ width: 80, minWidth: 80, height: 80, position: 'relative' }}>
                 <TripCoverImage url={trip.coverImageUrl} place={trip.place} height="100%" />
              </Box>
              <CardContent sx={{ flexGrow: 1, py: 1, px: 2, display:'flex', flexDirection:'column', justifyContent:'center' }}>
                <Typography variant="subtitle1" sx={{ color: '#1C1B1F', lineHeight: 1.1, mb: 0.2 }}>{trip.title}</Typography>
                <Stack direction="row" alignItems="center" gap={0.5} color="text.secondary" mb={0.2}>
                  <LocationOnIcon sx={{ fontSize: 14, color: '#6750A4' }}/> <Typography variant="caption" sx={{ fontWeight: 500 }}>{trip.place}</Typography>
                </Stack>
                <Typography variant="caption" sx={{ color: '#757575', fontSize:'0.7rem' }}>
                   {trip.startDate ? dayjs(trip.startDate).format('D MMM') : ''} {trip.endDate ? ` - ${dayjs(trip.endDate).format('D MMM')}` : ''}
                </Typography>
              </CardContent>
            </CardActionArea>
            <Box position="absolute" top={4} right={4} display="flex" sx={{ zIndex: 2 }}>
               <IconButton size="small" onClick={(e) => { e.stopPropagation(); setShareTripId(trip.id); setOpenShare(true); }} sx={{ color: '#757575', p:0.5 }}><ShareIcon sx={{fontSize:16}}/></IconButton>
               <IconButton size="small" onClick={(e) => openEdit(e, trip)} sx={{ color: '#757575', p:0.5 }}><EditIcon sx={{fontSize:16}}/></IconButton>
               <IconButton size="small" onClick={(e) => handleDelete(e, trip.id)} sx={{ color: '#B3261E', p:0.5 }}><DeleteForeverIcon sx={{fontSize:16}}/></IconButton>
            </Box>
          </Card>
        ))}
      </Container>
      
      <Fab variant="extended" onClick={() => setOpenModal(true)} sx={{ position: 'fixed', bottom: 24, right: 24 }}>
         <AddIcon sx={{ mr: 1, fontSize: 20 }} /> Nuevo Viaje
      </Fab>
      
      <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{fontWeight:700, textAlign:'center'}}>Nuevo Viaje</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField label="Título" fullWidth variant="filled" InputProps={{disableUnderline:true}} value={newTrip.title} onChange={e=>setNewTrip({...newTrip,title:e.target.value})}/>
            <TextField label="Lugar" fullWidth variant="filled" InputProps={{disableUnderline:true}} value={newTrip.place} onChange={e=>setNewTrip({...newTrip,place:e.target.value})}/>
            <Stack direction="row" gap={2}>
              <TextField type="date" label="Inicio" fullWidth InputProps={{disableUnderline:true}} variant="filled" InputLabelProps={{shrink:true}} value={newTrip.startDate} onChange={e=>setNewTrip({...newTrip,startDate:e.target.value})}/>
              <TextField type="date" label="Fin" fullWidth InputProps={{disableUnderline:true}} variant="filled" InputLabelProps={{shrink:true}} value={newTrip.endDate} onChange={e=>setNewTrip({...newTrip,endDate:e.target.value})}/>
            </Stack>
            <TextField label="URL Foto Portada (Opcional)" fullWidth variant="filled" InputProps={{disableUnderline:true, startAdornment: <LinkIcon sx={{color: 'gray', mr: 1}} />}} value={newTrip.coverImageUrl} onChange={e=>setNewTrip({...newTrip, coverImageUrl: e.target.value})} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{p:3, justifyContent:'center'}}>
          <Button onClick={()=>setOpenModal(false)} sx={{color:'#64748b', bgcolor:'transparent !important'}}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave} disableElevation sx={{bgcolor:'#6750A4', color:'white'}}>Crear Viaje</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openEditModal} onClose={() => setOpenEditModal(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{fontWeight:700}}>Editar Viaje</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField label="Título" fullWidth variant="filled" InputProps={{disableUnderline:true}} value={editTripData.title} onChange={e=>setEditTripData({...editTripData,title:e.target.value})}/>
            <TextField label="Lugar" fullWidth variant="filled" InputProps={{disableUnderline:true}} value={editTripData.place} onChange={e=>setEditTripData({...editTripData,place:e.target.value})}/>
            <Stack direction="row" gap={2}>
              <TextField type="date" label="Inicio" fullWidth variant="filled" InputProps={{disableUnderline:true}} InputLabelProps={{shrink:true}} value={editTripData.startDate} onChange={e=>setEditTripData({...editTripData,startDate:e.target.value})}/>
              <TextField type="date" label="Fin" fullWidth variant="filled" InputProps={{disableUnderline:true}} InputLabelProps={{shrink:true}} value={editTripData.endDate} onChange={e=>setEditTripData({...editTripData,endDate:e.target.value})}/>
            </Stack>
            <TextField label="URL Foto Portada" fullWidth variant="filled" InputProps={{disableUnderline:true}} value={editTripData.coverImageUrl} onChange={e=>setEditTripData({...editTripData, coverImageUrl: e.target.value})}/>
          </Stack>
        </DialogContent>
        <DialogActions sx={{p:3}}>
          <Button onClick={()=>setOpenEditModal(false)} sx={{bgcolor:'transparent !important'}}>Cancelar</Button>
          <Button variant="contained" onClick={handleUpdateTrip} sx={{bgcolor:'#6750A4', color:'white'}}>Guardar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openShare} onClose={() => setOpenShare(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{fontWeight:700}}>Invitar</DialogTitle>
        <DialogContent>
          <TextField autoFocus label="Email Gmail" type="email" fullWidth variant="filled" InputProps={{disableUnderline:true}} value={shareEmail} onChange={e=>setShareEmail(e.target.value)} sx={{mt:1}} />
        </DialogContent>
        <DialogActions sx={{p:3}}>
          <Button onClick={()=>setOpenShare(false)} sx={{bgcolor:'transparent !important'}}>Cancelar</Button>
          <Button variant="contained" onClick={handleShare} sx={{bgcolor:'#6750A4', color:'white'}}>Enviar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

// --- VISTA SITIOS ---
function SpotsView({ tripId, openCreateSpot }) {
  const [spots, setSpots] = useState([]);
  const [filterTag, setFilterTag] = useState('Todos');

  useEffect(() => { const u = onSnapshot(collection(db, "trips", tripId, "spots"), (s) => setSpots(s.docs.map(d => ({ id: d.id, ...d.data() })))); return u; }, [tripId]);

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
    switch(cat) {
      case 'Comida': return { icon: <RestaurantIcon/>, label: '🍔 Comida', ...theme.palette.custom.food };
      case 'Super': return { icon: <ShoppingCartIcon/>, label: '🛒 Supermercado', ...theme.palette.custom.place };
      case 'Gasolina': return { icon: <LocalGasStationIcon/>, label: '⛽ Gasolinera', ...theme.palette.custom.transport };
      case 'Visita': return { icon: <CameraAltIcon/>, label: '📷 Turismo', ...theme.palette.custom.place };
      case 'Salud': return { icon: <LocalHospitalIcon/>, label: '🏥 Salud', bg:'#FFDAD6', color:'#410002', border:'#FFB4AB' };
      default: return { icon: <StarIcon/>, label: '⭐ Otros', ...theme.palette.custom.place };
    }
  };

  const handleDeleteSpot = async (id) => { if(confirm("¿Borrar sitio?")) await deleteDoc(doc(db,"trips",tripId,"spots",id)); };

  return (
    <Box pb={12} pt={2}>
      <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 2, px: 2, '&::-webkit-scrollbar':{display:'none'} }}>
        {allTags.map(tag => (
          <Chip key={tag} label={tag} onClick={() => setFilterTag(tag)} sx={{ bgcolor: filterTag === tag ? '#E8DEF8' : 'white', color: filterTag === tag ? '#1D192B' : '#49454F', fontWeight: 600, border: '1px solid #E0E0E0' }} />
        ))}
      </Box>

      <Container maxWidth="sm">
        {CATEGORY_ORDER.map(catName => {
           const catSpots = groupedSpots[catName];
           if (!catSpots || catSpots.length === 0) return null;
           const config = getCategoryConfig(catName);

           return (
             <Box key={catName} mb={3}>
               <Typography variant="subtitle2" sx={{color: config.color, ml:1, mb:1, fontWeight:700}}>{config.label}</Typography>
               {catSpots.map(spot => (
                  <Card key={spot.id} sx={{ mb: 1, bgcolor: 'white' }}>
                    <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'center', py: 1.5, '&:last-child': { pb: 1.5 } }}>
                      <Box sx={{ bgcolor: config.bg, color: config.color, width:36, height:36, borderRadius: '8px', display:'flex', alignItems:'center', justifyContent:'center' }}>{config.icon}</Box>
                      <Box flexGrow={1}>
                        <Typography variant="subtitle2" fontWeight="700">{spot.name}</Typography>
                        <Typography variant="body2" sx={{opacity:0.8, fontSize:'0.8rem'}} noWrap>{spot.description}</Typography>
                        <Stack direction="row" gap={0.5} mt={0.5} flexWrap="wrap">
                          {spot.tags?.map(tag => <Chip key={tag} label={`#${tag}`} size="small" sx={{ height: 18, fontSize: '0.65rem', bgcolor: '#F5F5F5', border:'none' }} />)}
                        </Stack>
                      </Box>
                      <Stack>
                        {spot.mapsLink && (<IconButton size="small" sx={{ color:config.color, opacity:0.8 }} onClick={() => window.open(spot.mapsLink, '_blank')}><DirectionsIcon fontSize="small" /></IconButton>)}
                        <IconButton size="small" onClick={() => handleDeleteSpot(spot.id)} sx={{ color:'gray', opacity:0.5 }}><DeleteForeverIcon fontSize="small" /></IconButton>
                      </Stack>
                    </CardContent>
                  </Card>
               ))}
             </Box>
           )
        })}
      </Container>
      <Fab variant="extended" color="secondary" onClick={openCreateSpot} sx={{ position: 'fixed', bottom: 100, right: 24, zIndex:10 }}><AddIcon sx={{mr:1}}/> Sitio</Fab>
    </Box>
  );
}

// --- DETALLE VIAJE (ITINERARIO COMPACTO) ---
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
  const [openSpotModal, setOpenSpotModal] = useState(false);
  const [newSpot, setNewSpot] = useState({ name: '', category: 'Comida', description: '', mapsLink: '', tags: '' });

  useEffect(() => { const u = onSnapshot(doc(db,"trips",tripId), (d) => { if(d.exists()){ setTrip({id:d.id,...d.data()}); setTripNotes(d.data().notes || ''); } }); return u; },[tripId]);
  useEffect(() => { const u=onSnapshot(query(collection(db,"trips",tripId,"items"),orderBy("time","asc")),(s)=>setItems(s.docs.map(d=>({id:d.id,...d.data()})))); return u; },[tripId]);

  const openCreate = (date) => { setNewItem({ type: 'place', title: '', time: '10:00', mapsLink: '', description:'', flightNumber:'', terminal:'', gate:'' }); setFiles([]); setExistingAttachments([]); setSelectedDate(date); setIsEditing(false); setOpenItemModal(true); };
  const openEdit = (item) => { setNewItem({ ...item }); setSelectedDate(item.date); const old = item.attachments || []; if(item.pdfUrl) old.push({ name: 'Adjunto', url: item.pdfUrl }); setExistingAttachments(old); setFiles([]); setEditingId(item.id); setIsEditing(true); setOpenItemModal(true); };

  const getTypeConfig = (type) => {
     switch(type) {
       case 'flight': return { icon: <FlightTakeoffIcon fontSize="small"/>, label: 'Vuelo', ...theme.palette.custom.flight };
       case 'food':   return { icon: <RestaurantIcon fontSize="small"/>, label: 'Comida', ...theme.palette.custom.food };
       case 'transport': return { icon: <DirectionsIcon fontSize="small"/>, label: 'Transporte', ...theme.palette.custom.transport };
       default:       return { icon: <LocationOnIcon fontSize="small"/>, label: 'Lugar', ...theme.palette.custom.place };
     }
  };

  const handleSaveItem = async () => {
    if (!newItem.title) return;
    setUploading(true);
    let finalAttachments = [...existingAttachments];
    let token = sessionStorage.getItem('googleAccessToken');
    if (files.length > 0) {
      try {
        if (!token) throw new Error("TOKEN_EXPIRED");
        const rootId = await findOrCreateFolder("Viajes App", token);
        const tripIdFolder = await findOrCreateFolder(trip.title, token, rootId);
        for (const file of files) { const data = await uploadToGoogleDrive(file, token, tripIdFolder); finalAttachments.push({ name: file.name, url: data.webViewLink, fileId: data.id }); }
      } catch (e) { alert("Error subida (Revisa login)"); setUploading(false); return; }
    }
    const itemData = { ...newItem, date: selectedDate, attachments: finalAttachments, pdfUrl: null };
    if (isEditing) await updateDoc(doc(db, "trips", tripId, "items", editingId), itemData); else await addDoc(collection(db, "trips", tripId, "items"), itemData);
    setOpenItemModal(false); setUploading(false);
  };

  const handleSaveSpot = async () => {
    if (!newSpot.name) return;
    const tagsArray = newSpot.tags.split(',').map(t => t.trim()).filter(t => t !== '');
    await addDoc(collection(db, "trips", tripId, "spots"), { ...newSpot, tags: tagsArray });
    setOpenSpotModal(false); setNewSpot({ name: '', category: 'Comida', description: '', mapsLink: '', tags: '' });
  };

  const handleSaveNotes = async () => { await updateDoc(doc(db,"trips",tripId), { notes: tripNotes }); setEditNotesOpen(false); };
  const deleteAttachment = (index) => { const updated = [...existingAttachments]; updated.splice(index, 1); setExistingAttachments(updated); };
  const handleCacheAll = async () => { if (!confirm(`¿Descargar Offline?`)) return; setCaching(true); try { let t = sessionStorage.getItem('googleAccessToken'); if(!t) t=await getRefreshedToken(); for (const item of items) if (item.attachments) for (const att of item.attachments) if (att.fileId) try { await cacheFileLocal(att.fileId, t); } catch (e) {} setShowToast(true); setRefreshTrigger(p => p + 1); } catch(e) { alert("Error"); } setCaching(false); };
  const openAttachment = async (att) => { if (att.fileId) { const b = await getFileFromCache(att.fileId); if (b) return window.open(URL.createObjectURL(b)); } window.open(att.url, '_blank'); };

  if (!trip) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress/></Box>;
  let days = []; try { const s=trip.startDate?dayjs(trip.startDate):dayjs(); const e=trip.endDate?dayjs(trip.endDate):s; for(let i=0; i<=Math.max(0,e.diff(s,'day')); i++) days.push(s.add(i,'day').format('YYYY-MM-DD')); } catch(e) {}

  return (
    <Box sx={{ minHeight:'100vh', bgcolor:'#FDFDFD', pb:10 }}>
      <Box sx={{ position:'sticky',top:0,zIndex:10,bgcolor:'rgba(255,255,255,0.95)',backdropFilter:'blur(10px)', borderBottom:'1px solid #F0F0F0' }}>
        <Toolbar>
          <IconButton onClick={()=>navigate('/')}><ArrowBackIcon sx={{color: '#1C1B1F'}}/></IconButton>
          <Box ml={1} flexGrow={1}>
              <Typography variant="subtitle1" lineHeight={1.1} sx={{color: '#1C1B1F', fontWeight: 700}}>{trip.title}</Typography>
              <Typography variant="caption" color="text.secondary">{trip.place}</Typography>
          </Box>
          <Tooltip title="Descargar Offline"><IconButton onClick={handleCacheAll} disabled={caching} sx={{color: caching ? 'gray' : '#6750A4'}}>{caching ? <CircularProgress size={24}/> : <CloudDownloadIcon />}</IconButton></Tooltip>
        </Toolbar>
      </Box>

      {currentView === 0 ? (
        <Container maxWidth="sm" sx={{ py: 2 }}>
          <Card sx={{ mb: 3, bgcolor: '#FFF8E1', border: '1px solid #FFE082' }}>
            <CardActionArea onClick={() => setEditNotesOpen(true)}>
              <CardContent sx={{ py: 2 }}>
                <Stack direction="row" alignItems="center" gap={1} mb={0.5}><StickyNote2Icon sx={{ fontSize: 18, color: '#F57F17' }} /><Typography variant="subtitle2" fontWeight="700" sx={{color:'#F57F17'}}>NOTAS</Typography></Stack>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line', opacity: 0.9, color: '#5D4037' }}>{trip.notes || "Añade códigos, seguros, wifi..."}</Typography>
              </CardContent>
            </CardActionArea>
          </Card>

          {days.map((d, idx) => {
            const itemsOfDay = items.filter(i => i.date === d);
            const isToday = dayjs(d).format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD');
            return (
              <Box key={d} mb={3}>
                <Stack direction="row" justifyContent="space-between" mb={1.5} alignItems="center">
                  
                  {/* CHIP FECHA ACTUALIZADO: #efddff */}
                  <Chip 
                    label={dayjs(d).format('dddd D [de] MMMM')} 
                    sx={{ 
                      bgcolor: '#efddff', 
                      color: '#000000', 
                      fontWeight: 700, 
                      textTransform: 'capitalize',
                      borderRadius: '8px', 
                      height: 32,
                      px: 0.5
                    }} 
                  />

                  <Button size="small" onClick={() => openCreate(d)} sx={{ bgcolor:'transparent !important', color: '#6750A4', minWidth: 'auto', px: 1, fontSize:'0.8rem' }} startIcon={<AddIcon sx={{fontSize:18}}/>}>Añadir</Button>
                </Stack>
                
                <Stack spacing={1}>
                  {itemsOfDay.map(item => {
                    const themeColor = theme.palette.custom?.[item.type] || theme.palette.custom.place;
                    const config = getTypeConfig(item.type);
                    const isFlight = item.type==='flight';
                    const atts = item.attachments || [];
                    if(item.pdfUrl) atts.push({name:'Adjunto', url:item.pdfUrl}); 
                    
                    return (
                      <Card key={item.id} sx={{ bgcolor: 'white', overflow: 'visible' }}>
                        <Box sx={{ p: 1, display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                          <Box sx={{ display:'flex', flexDirection:'column', alignItems:'center', minWidth: 40, pt: 0.5 }}>
                             <Box sx={{ width: 32, height: 32, bgcolor: themeColor.bg, color: themeColor.color, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{config.icon}</Box>
                             <Typography variant="caption" fontWeight="700" sx={{mt:0.5, color:'#757575', fontSize:'0.7rem'}}>{item.time}</Typography>
                          </Box>
                          <Box flexGrow={1} minWidth={0} pt={0.2}>
                             <Stack direction="row" justifyContent="space-between" alignItems="start">
                                <Typography variant="subtitle2" fontWeight="700" lineHeight={1.2} sx={{ mb: 0.5, fontSize:'0.9rem' }}>{item.title}</Typography>
                                <Stack direction="row" alignItems="center">
                                   {(item.mapsLink || item.type === 'place') && (
                                     <IconButton size="small" onClick={() => { const target = item.mapsLink || `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(item.title)}&dir_action=navigate`; window.open(target, '_blank'); }} sx={{ color: themeColor.color, opacity: 0.7, mt:-0.5 }}>
                                       <MapIcon sx={{fontSize:20}}/>
                                     </IconButton>
                                   )}
                                   <IconButton size="small" onClick={() => openEdit(item)} sx={{ color:'#BDBDBD', mt:-0.5 }}>
                                     <EditIcon sx={{fontSize:20}}/>
                                   </IconButton>
                                </Stack>
                             </Stack>

                             {isFlight && (item.flightNumber || item.terminal || item.gate) && (<Stack direction="row" gap={0.5} mt={0} flexWrap="wrap">{item.flightNumber && <Chip label={item.flightNumber} size="small" sx={{bgcolor: themeColor.bg, color: themeColor.color, height: 20, fontSize:'0.65rem', fontWeight: 600, border: 'none'}} />}{(item.terminal || item.gate) && <Typography variant="caption" sx={{color:'#757575', pt:0.2, fontSize:'0.7rem'}}>{item.terminal && `T${item.terminal}`} {item.gate && ` • P${item.gate}`}</Typography>}</Stack>)}
                             {item.description && (<Typography variant="body2" sx={{mt:0.5, color: '#616161', fontSize:'0.8rem', lineHeight:1.3}}>{item.description}</Typography>)}
                             {atts.length > 0 && (
                               <Stack direction="row" gap={1} mt={1} flexWrap="wrap">
                                  {atts.map((att,i) => ( <SmartAttachmentChip key={i} attachment={att} onOpen={openAttachment} refreshTrigger={refreshTrigger} /> ))}
                               </Stack>
                             )}
                          </Box>
                        </Box>
                      </Card>
                    )
                  })}
                </Stack>
              </Box>
            )
          })}
        </Container>
      ) : (
        <SpotsView tripId={tripId} openCreateSpot={() => setOpenSpotModal(true)} />
      )}

      <Paper sx={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 20, borderRadius: '50px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', bgcolor: '#F3EDF7', overflow: 'hidden', padding: '0 8px' }}>
        <BottomNavigation showLabels={false} value={currentView} onChange={(e, val) => setCurrentView(val)} sx={{ bgcolor: 'transparent', height: 64, width: 'auto', gap:1 }}>
          <BottomNavigationAction label="Itinerario" icon={<ListIcon />} sx={{ color: '#49454F', minWidth: 80, borderRadius: '20px', '&.Mui-selected': { paddingTop: 0, '& .MuiSvgIcon-root': { color: '#1D192B' } }, '&.Mui-selected .MuiSvgIcon-root': { bgcolor: '#E8DEF8', width: 56, height: 32, borderRadius: '16px', py: 0.5, boxSizing: 'content-box' } }} />
          <BottomNavigationAction label="Sitios" icon={<PlaceIcon />} sx={{ color: '#49454F', minWidth: 80, borderRadius: '20px', '&.Mui-selected': { paddingTop: 0, '& .MuiSvgIcon-root': { color: '#1D192B' } }, '&.Mui-selected .MuiSvgIcon-root': { bgcolor: '#E8DEF8', width: 56, height: 32, borderRadius: '16px', py: 0.5, boxSizing: 'content-box' } }} />
        </BottomNavigation>
      </Paper>

      <Dialog open={openItemModal} onClose={()=>setOpenItemModal(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{textAlign:'center', fontWeight:'bold', fontSize:'1.1rem'}}>{isEditing ? "Editar" : "Nuevo Evento"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                {['place','food','transport','flight'].map(t => { 
                    const cfg = getTypeConfig(t); 
                    const isSel = newItem.type === t; 
                    const btnColor = theme.palette.custom[t];
                    return (
                        <Button key={t} onClick={()=>setNewItem({...newItem,type:t})} startIcon={React.cloneElement(cfg.icon, { sx: { color: isSel ? btnColor.color : '#757575' } })} sx={{ borderRadius: '8px', bgcolor: isSel ? btnColor.bg : '#F5F5F5', color: isSel ? btnColor.color : '#757575', border: isSel ? `1px solid ${btnColor.border}` : '1px solid transparent', justifyContent: 'flex-start', px: 2, py: 1 }}>{cfg.label}</Button>
                    )
                })}
            </Box>
            {newItem.type === 'flight' ? (<><TextField label="Nombre Vuelo" fullWidth variant="filled" InputProps={{disableUnderline:true}} size="small" value={newItem.title} onChange={e=>setNewItem({...newItem,title:e.target.value})} /><Stack direction="row" gap={1}><TextField label="Nº Vuelo" fullWidth variant="filled" InputProps={{disableUnderline:true}} size="small" value={newItem.flightNumber} onChange={e=>setNewItem({...newItem,flightNumber:e.target.value})} /><TextField label="Hora" type="time" fullWidth variant="filled" InputProps={{disableUnderline:true}} size="small" value={newItem.time} onChange={e=>setNewItem({...newItem,time:e.target.value})} /></Stack><Stack direction="row" gap={1}><TextField label="Terminal" fullWidth variant="filled" InputProps={{disableUnderline:true}} size="small" value={newItem.terminal} onChange={e=>setNewItem({...newItem,terminal:e.target.value})} /><TextField label="Puerta" fullWidth variant="filled" InputProps={{disableUnderline:true}} size="small" value={newItem.gate} onChange={e=>setNewItem({...newItem,gate:e.target.value})} /></Stack></>) : (<><TextField label={newItem.type === 'transport' ? "Transporte" : "Nombre"} fullWidth variant="filled" InputProps={{disableUnderline:true}} size="small" value={newItem.title} onChange={e=>setNewItem({...newItem,title:e.target.value})} /><TextField label="Dirección / Link" fullWidth variant="filled" InputProps={{disableUnderline:true, startAdornment:<LocationOnIcon sx={{color:'gray', mr:1, fontSize:20}}/>}} size="small" value={newItem.mapsLink} onChange={e=>setNewItem({...newItem,mapsLink:e.target.value})} /><TextField label="Hora" type="time" fullWidth variant="filled" InputProps={{disableUnderline:true}} size="small" value={newItem.time} onChange={e=>setNewItem({...newItem,time:e.target.value})} /></>)}<TextField label="Notas" multiline rows={2} fullWidth variant="filled" InputProps={{disableUnderline:true}} size="small" value={newItem.description || ''} onChange={e=>setNewItem({...newItem,description:e.target.value})} />{existingAttachments.length > 0 && (<Stack gap={1} p={1} bgcolor="#F5F5F5" borderRadius={2}>{existingAttachments.map((a,i)=><Box key={i} display="flex" justifyContent="space-between" alignItems="center"><Typography variant="caption" noWrap sx={{maxWidth:180}}>{a.name}</Typography><IconButton size="small" onClick={()=>deleteAttachment(i)}><CloseIcon fontSize="small"/></IconButton></Box>)}</Stack>)}<Button variant="outlined" component="label" startIcon={<AttachFileIcon/>} sx={{borderStyle:'dashed', py:1.5, borderColor: '#BDBDBD', color: '#757575', borderRadius:'12px'}}>{files.length>0 ? `Subir ${files.length}` : "Adjuntar archivos"}<input type="file" multiple hidden onChange={e=>setFiles(Array.from(e.target.files))}/></Button>{isEditing && <Button color="error" startIcon={<DeleteForeverIcon/>} onClick={()=>{if(confirm("¿Borrar?")){deleteDoc(doc(db,"trips",tripId,"items",editingId));setOpenItemModal(false)}}}>Eliminar Evento</Button>}</Stack></DialogContent><DialogActions sx={{p:3}}><Button onClick={()=>setOpenItemModal(false)} sx={{color:'gray', bgcolor:'transparent !important'}}>Cancelar</Button><Button variant="contained" disabled={uploading} onClick={handleSaveItem} sx={{bgcolor:'#6750A4', color:'white'}}>{uploading?'...':'Guardar'}</Button></DialogActions></Dialog>

      <Dialog open={editNotesOpen} onClose={()=>setEditNotesOpen(false)} fullWidth maxWidth="xs"><DialogTitle sx={{fontWeight: 700}}>Notas Rápidas</DialogTitle><DialogContent><TextField autoFocus multiline rows={6} fullWidth variant="filled" InputProps={{disableUnderline:true}} value={tripNotes} onChange={e=>setTripNotes(e.target.value)} placeholder="Ej: Wifi: 1234, Seguro..." sx={{mt:1}} /></DialogContent><DialogActions sx={{p:3}}><Button onClick={()=>setEditNotesOpen(false)} sx={{bgcolor:'transparent !important'}}>Cancelar</Button><Button variant="contained" onClick={handleSaveNotes} sx={{bgcolor:'#6750A4', color:'white'}}>Guardar</Button></DialogActions></Dialog>

      <Dialog open={openSpotModal} onClose={() => setOpenSpotModal(false)} fullWidth maxWidth="xs"><DialogTitle sx={{fontWeight: 700}}>Nuevo Sitio</DialogTitle><DialogContent><Stack spacing={2} mt={1}><TextField label="Nombre del sitio" variant="filled" fullWidth size="small" InputProps={{disableUnderline:true}} value={newSpot.name} onChange={e=>setNewSpot({...newSpot, name:e.target.value})} /><FormControl fullWidth variant="filled" size="small"><InputLabel shrink sx={{left:-12,top:-5}}>Categoría</InputLabel><Select value={newSpot.category} onChange={e=>setNewSpot({...newSpot, category:e.target.value})} disableUnderline sx={{ borderRadius: 2, bgcolor: '#F5F5F5' }}><MenuItem value="Comida">🍔 Comida</MenuItem><MenuItem value="Super">🛒 Supermercado</MenuItem><MenuItem value="Gasolina">⛽ Gasolinera</MenuItem><MenuItem value="Visita">📷 Turismo</MenuItem><MenuItem value="Salud">🏥 Salud</MenuItem><MenuItem value="Otro">⭐ Otro</MenuItem></Select></FormControl><TextField label="Link Maps" variant="filled" fullWidth size="small" InputProps={{disableUnderline:true}} value={newSpot.mapsLink} onChange={e=>setNewSpot({...newSpot, mapsLink:e.target.value})} /><TextField label="Descripción" multiline rows={2} variant="filled" fullWidth size="small" InputProps={{disableUnderline:true}} value={newSpot.description} onChange={e=>setNewSpot({...newSpot, description:e.target.value})} /><TextField label="Etiquetas" variant="filled" fullWidth size="small" placeholder="barato, cena" InputProps={{disableUnderline:true}} value={newSpot.tags} onChange={e=>setNewSpot({...newSpot, tags:e.target.value})} /></Stack></DialogContent><DialogActions sx={{p:3}}><Button onClick={()=>setOpenSpotModal(false)} sx={{bgcolor:'transparent !important'}}>Cancelar</Button><Button variant="contained" onClick={handleSaveSpot} sx={{bgcolor:'#6750A4', color:'white'}}>Guardar</Button></DialogActions></Dialog>

      <Snackbar open={showToast} autoHideDuration={3000} onClose={()=>setShowToast(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}><Alert onClose={()=>setShowToast(false)} severity="success" sx={{ width: '100%', borderRadius: 3 }}>¡Descargado para Offline!</Alert></Snackbar>
    </Box>
  );
}

// MAIN
function App() {
  const [user, setUser] = useState(null);
  useEffect(() => { onAuthStateChanged(auth, u => setUser(u)) }, []);
  const handleLogin = async () => { try { const r=await signInWithPopup(auth, googleProvider); const c=GoogleAuthProvider.credentialFromResult(r); if(c?.accessToken) sessionStorage.setItem('googleAccessToken',c.accessToken); } catch(e){console.error(e)} };
  return <ThemeProvider theme={theme}><CssBaseline/><BrowserRouter><Routes>{!user?<Route path="*" element={<LoginScreen onLogin={handleLogin}/>}/>:(<> <Route path="/" element={<HomeScreen user={user} onLogout={()=>signOut(auth)}/>} /><Route path="/trip/:tripId" element={<TripDetailScreen/>}/></>)}</Routes></BrowserRouter></ThemeProvider>;
}

export default App;