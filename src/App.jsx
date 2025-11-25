import React, { useState, useEffect } from 'react';
import { 
  createTheme, ThemeProvider, CssBaseline, Box, AppBar, Toolbar, 
  Typography, Fab, Container, Card, CardContent, Button, Avatar, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Stack, CircularProgress,
  CardMedia, CardActionArea, Chip, Tooltip, Alert, Snackbar
} from '@mui/material';
import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { get, set } from 'idb-keyval'; 

dayjs.locale('es');

// ICONOS
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
import DownloadIcon from '@mui/icons-material/Download';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import FlightIcon from '@mui/icons-material/Flight';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import LinkIcon from '@mui/icons-material/Link';

// FIREBASE
import { auth, googleProvider, db } from './firebase'; 
import { signInWithPopup, signOut, onAuthStateChanged, GoogleAuthProvider } from 'firebase/auth';
import { collection, addDoc, query, where, onSnapshot, orderBy, doc, getDoc, deleteDoc, updateDoc, arrayUnion } from 'firebase/firestore';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#6366f1' },
    secondary: { main: '#ec4899' },
    background: { default: '#F8FAFC', paper: '#FFFFFF' },
    text: { primary: '#1e293b', secondary: '#64748b' },
  },
  shape: { borderRadius: 16 },
  components: {
    MuiButton: { styleOverrides: { root: { borderRadius: '12px', textTransform: 'none', fontWeight: 600 } } },
    MuiCard: { styleOverrides: { root: { boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid rgba(0,0,0,0.05)' } } },
    MuiDialog: { styleOverrides: { paper: { borderRadius: '16px' } } }
  }
});

// --- FUNCIONES DRIVE Y CACHÉ ---
async function findOrCreateFolder(folderName, accessToken, parentId = null) {
  let query = `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  if (parentId) query += ` and '${parentId}' in parents`;
  const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id)`, { headers: { 'Authorization': 'Bearer ' + accessToken } });
  if (res.status === 401) throw new Error("TOKEN_EXPIRED");
  const data = await res.json();
  if (data.files?.length > 0) return data.files[0].id;
  const meta = { name: folderName, mimeType: 'application/vnd.google-apps.folder', parents: parentId ? [parentId] : undefined };
  const create = await fetch('https://www.googleapis.com/drive/v3/files', { method: 'POST', headers: { 'Authorization': 'Bearer ' + accessToken, 'Content-Type': 'application/json' }, body: JSON.stringify(meta) });
  return (await create.json()).id;
}

async function uploadToGoogleDrive(file, accessToken, folderId) {
  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify({ name: file.name, parents: [folderId] })], { type: 'application/json' }));
  form.append('file', file);
  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink', { method: 'POST', headers: { 'Authorization': 'Bearer ' + accessToken }, body: form });
  if (res.status === 401) throw new Error("TOKEN_EXPIRED");
  if (!res.ok) throw new Error('Error subida');
  return await res.json();
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

// --- COMPONENTES INTELIGENTES ---

const SmartAttachmentChip = ({ attachment, onOpen, refreshTrigger }) => {
  const [isOffline, setIsOffline] = useState(false);
  useEffect(() => { const c = async () => { if(attachment.fileId) setIsOffline(!!await getFileFromCache(attachment.fileId)) }; c(); }, [attachment, refreshTrigger]);
  return (
    <Chip 
      label={attachment.name} 
      onClick={() => onOpen(attachment)} 
      // Icono más grande
      icon={isOffline ? <CheckCircleOutlineIcon style={{fontSize:20, color:'#15803d'}}/> : <CloudQueueIcon style={{fontSize:20, color:'#0ea5e9'}}/>} 
      sx={{ 
        height: '36px', // MÁS ALTO (Facilita el dedo)
        fontSize: '0.85rem', // LETRA MÁS GRANDE
        fontWeight: 500,
        borderRadius: '8px', 
        maxWidth: '100%',
        bgcolor: isOffline ? '#f0fdf4' : '#f0f9ff',
        border: `1px solid ${isOffline ? '#86efac' : '#7dd3fc'}`,
        color: isOffline ? '#15803d' : '#0284c7',
        cursor:'pointer',
        mb: 0.5, // Un poco de margen
        '& .MuiChip-label': { display:'block', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', px: 1 }
      }} 
    />
  );
};

const TripCoverImage = ({ url, place, height }) => {
  const imageSrc = (url && url.length > 5) ? url : `https://loremflickr.com/800/400/${encodeURIComponent(place)},landscape/all`;
  return <CardMedia component="img" height={height} image={imageSrc} sx={{filter:'brightness(0.95)', objectFit:'cover'}} onError={(e) => { e.target.src = `https://loremflickr.com/800/400/${encodeURIComponent(place)},landscape/all`; }}/>;
};

// --- LOGIN ---
function LoginScreen({ onLogin }) {
  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: 3, background: 'linear-gradient(135deg, #e0e7ff 0%, #f3f4f6 100%)' }}>
      <Box sx={{ p: 5, textAlign: 'center', bgcolor: 'white', borderRadius: 4, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}>
        <Box sx={{ bgcolor: 'primary.main', width: 64, height: 64, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', mb: 3 }}>
           <FlightTakeoffIcon sx={{ fontSize: 32, color: 'white' }} />
        </Box>
        <Typography variant="h4" fontWeight="800" gutterBottom sx={{color: '#1e293b', letterSpacing: '-1px'}}>Viajes App</Typography>
        <Button variant="contained" size="large" startIcon={<GoogleIcon />} onClick={onLogin} sx={{ mt: 3, borderRadius: 3, py: 1.5, px: 3, bgcolor: '#1e293b', '&:hover': { bgcolor: '#0f172a' } }}>Entrar con Google</Button>
      </Box>
    </Box>
  );
}

// --- HOME ---
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

  useEffect(() => { if(!user?.email) return; const u = onSnapshot(query(collection(db,"trips"), where("participants", "array-contains", user.email), orderBy("startDate","asc")),(s)=>setTrips(s.docs.map(d=>({id:d.id,...d.data()})))); return u; },[user]);

  const handleSave = async () => {
    if(!newTrip.title) return;
    await addDoc(collection(db,"trips"), { ...newTrip, participants: [user.email], ownerId: user.uid, createdAt: new Date(), notes: '' }); 
    setOpenModal(false); setNewTrip({title:'',place:'',startDate:'',endDate:'', coverImageUrl: ''});
  };

  const openEdit = (e, trip) => { e.stopPropagation(); setEditTripData({ ...trip }); setOpenEditModal(true); };
  const handleUpdateTrip = async () => { const { id, ...data } = editTripData; await updateDoc(doc(db, "trips", id), data); setOpenEditModal(false); };
  const handleDelete = async (e,id) => { e.stopPropagation(); if(confirm("¿Eliminar viaje?")) await deleteDoc(doc(db,"trips",id)); };
  const handleShare = async () => { if(!shareEmail) return; try { await updateDoc(doc(db, "trips", shareTripId), { participants: arrayUnion(shareEmail) }); alert("¡Invitado!"); setOpenShare(false); setShareEmail(''); } catch (e) { alert("Error"); } };

  return (
    <>
      <AppBar position="sticky" sx={{ bgcolor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', borderBottom: '1px solid #e2e8f0', boxShadow: 'none' }}>
        <Toolbar><Typography variant="h6" sx={{ flexGrow: 1, color: '#0f172a', fontWeight: 700 }}>Mis Viajes</Typography><Avatar src={user.photoURL} sx={{width:32,height:32}}/><IconButton onClick={onLogout} size="small" sx={{ml:1}}><LogoutIcon color="action"/></IconButton></Toolbar>
      </AppBar>
      <Container maxWidth="sm" sx={{ pb: 12, pt: 3 }}>
        {trips.length === 0 && <Box textAlign="center" mt={5} opacity={0.6}><Typography>¡Empieza tu aventura!</Typography></Box>}
        {trips.map(trip => (
          <Card key={trip.id} sx={{ mb: 2, position: 'relative', borderRadius: 3, overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
            <CardActionArea onClick={() => navigate(`/trip/${trip.id}`)}>
              <TripCoverImage url={trip.coverImageUrl} place={trip.place} height="160" />
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h6" fontWeight="700" sx={{color: '#1e293b'}}>{trip.title}</Typography>
                    <Stack direction="row" alignItems="center" gap={0.5} color="text.secondary" mt={0.5}><LocationOnIcon fontSize="small" sx={{fontSize:16}}/> <Typography variant="body2">{trip.place}</Typography></Stack>
                  </Box>
                  {trip.participants && trip.participants.length > 1 && <Chip size="small" label={`${trip.participants.length} pax`} sx={{fontWeight: 600, bgcolor: '#f1f5f9'}}/>}
                </Stack>
              </CardContent>
            </CardActionArea>
            <Box position="absolute" top={8} right={8} display="flex" gap={1}>
               <IconButton size="small" onClick={(e) => { e.stopPropagation(); setShareTripId(trip.id); setOpenShare(true); }} sx={{ bgcolor: 'rgba(255,255,255,0.9)', '&:hover':{bgcolor:'white'} }}><ShareIcon fontSize="small" color="primary"/></IconButton>
               <IconButton size="small" onClick={(e) => openEdit(e, trip)} sx={{ bgcolor: 'rgba(255,255,255,0.9)', '&:hover':{bgcolor:'white'} }}><EditIcon fontSize="small" sx={{color:'gray'}}/></IconButton>
               <IconButton size="small" onClick={(e) => handleDelete(e, trip.id)} sx={{ bgcolor: 'rgba(255,255,255,0.9)', '&:hover':{bgcolor:'white'} }}><DeleteForeverIcon fontSize="small" color="error"/></IconButton>
            </Box>
          </Card>
        ))}
      </Container>
      <Fab color="primary" onClick={() => setOpenModal(true)} sx={{ position: 'fixed', bottom: 24, right: 24, boxShadow: '0 10px 15px -3px rgb(79 70 229 / 0.4)' }}><AddIcon /></Fab>
      
      {/* MODAL NUEVO */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{fontWeight:700}}>Nuevo Viaje</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField label="Título" fullWidth variant="outlined" size="small" value={newTrip.title} onChange={e=>setNewTrip({...newTrip,title:e.target.value})}/>
            <TextField label="Lugar" fullWidth variant="outlined" size="small" value={newTrip.place} onChange={e=>setNewTrip({...newTrip,place:e.target.value})}/>
            <Stack direction="row" gap={2}><TextField type="date" label="Inicio" fullWidth size="small" InputLabelProps={{shrink:true}} value={newTrip.startDate} onChange={e=>setNewTrip({...newTrip,startDate:e.target.value})}/><TextField type="date" label="Fin" fullWidth size="small" InputLabelProps={{shrink:true}} value={newTrip.endDate} onChange={e=>setNewTrip({...newTrip,endDate:e.target.value})}/></Stack>
            <TextField label="URL Foto Portada (Opcional)" fullWidth variant="outlined" size="small" placeholder="https://..." value={newTrip.coverImageUrl} onChange={e=>setNewTrip({...newTrip, coverImageUrl: e.target.value})} InputProps={{startAdornment: <LinkIcon sx={{color: 'action.active', mr: 1}} />}}/>
          </Stack>
        </DialogContent>
        <DialogActions sx={{p:2}}><Button onClick={()=>setOpenModal(false)} sx={{color:'#64748b'}}>Cancelar</Button><Button variant="contained" onClick={handleSave} disableElevation>Crear</Button></DialogActions>
      </Dialog>

      {/* MODAL EDITAR */}
      <Dialog open={openEditModal} onClose={() => setOpenEditModal(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{fontWeight:700}}>Editar Viaje</DialogTitle>
        <DialogContent><Stack spacing={2} mt={1}><TextField label="Título" fullWidth variant="outlined" size="small" value={editTripData.title} onChange={e=>setEditTripData({...editTripData,title:e.target.value})}/><TextField label="Lugar" fullWidth variant="outlined" size="small" value={editTripData.place} onChange={e=>setEditTripData({...editTripData,place:e.target.value})}/><Stack direction="row" gap={2}><TextField type="date" label="Inicio" fullWidth size="small" InputLabelProps={{shrink:true}} value={editTripData.startDate} onChange={e=>setEditTripData({...editTripData,startDate:e.target.value})}/><TextField type="date" label="Fin" fullWidth size="small" InputLabelProps={{shrink:true}} value={editTripData.endDate} onChange={e=>setEditTripData({...editTripData,endDate:e.target.value})}/></Stack><TextField label="URL Foto Portada" fullWidth variant="outlined" size="small" placeholder="https://..." value={editTripData.coverImageUrl} onChange={e=>setEditTripData({...editTripData, coverImageUrl: e.target.value})} InputProps={{startAdornment: <LinkIcon sx={{color: 'gray', mr: 1}} />}}/></Stack></DialogContent><DialogActions sx={{p:2}}><Button onClick={()=>setOpenEditModal(false)} sx={{color:'#64748b'}}>Cancelar</Button><Button variant="contained" onClick={handleUpdateTrip} disableElevation>Guardar</Button></DialogActions>
      </Dialog>

      {/* MODAL COMPARTIR */}
      <Dialog open={openShare} onClose={() => setOpenShare(false)} fullWidth maxWidth="xs"><DialogTitle sx={{fontWeight:700}}>Invitar</DialogTitle><DialogContent><TextField autoFocus label="Email Gmail" type="email" fullWidth variant="outlined" value={shareEmail} onChange={e=>setShareEmail(e.target.value)} /></DialogContent><DialogActions sx={{p:2}}><Button onClick={()=>setOpenShare(false)} sx={{color:'#64748b'}}>Cancelar</Button><Button variant="contained" onClick={handleShare} disableElevation>Enviar</Button></DialogActions></Dialog>
    </>
  );
}

// --- DETALLE VIAJE (LIMPIO + BOTÓN GRANDE) ---
function TripDetailScreen() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
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

  useEffect(() => { const u = onSnapshot(doc(db,"trips",tripId), (d) => { if(d.exists()){ setTrip({id:d.id,...d.data()}); setTripNotes(d.data().notes || ''); } }); return u; },[tripId]);
  useEffect(() => { const u=onSnapshot(query(collection(db,"trips",tripId,"items"),orderBy("time","asc")),(s)=>setItems(s.docs.map(d=>({id:d.id,...d.data()})))); return u; },[tripId]);

  const openCreate = (date) => { setNewItem({ type: 'place', title: '', time: '10:00', mapsLink: '', description:'', flightNumber:'', terminal:'', gate:'' }); setFiles([]); setExistingAttachments([]); setSelectedDate(date); setIsEditing(false); setOpenItemModal(true); };
  const openEdit = (item) => { setNewItem({ ...item }); setSelectedDate(item.date); const old = item.attachments || []; if(item.pdfUrl) old.push({ name: 'Adjunto', url: item.pdfUrl }); setExistingAttachments(old); setFiles([]); setEditingId(item.id); setIsEditing(true); setOpenItemModal(true); };

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
      } catch (e) { if (e.message === "TOKEN_EXPIRED") { try { token = await getRefreshedToken(); const rootId = await findOrCreateFolder("Viajes App", token); const tripIdFolder = await findOrCreateFolder(trip.title, token, rootId); for (const file of files) { if(files.indexOf(file)===0) finalAttachments=[...existingAttachments]; const data = await uploadToGoogleDrive(file, token, tripIdFolder); finalAttachments.push({ name: file.name, url: data.webViewLink, fileId: data.id }); } } catch (re) { alert("Error sesión."); setUploading(false); return; } } else { alert("Error subida."); setUploading(false); return; } }
    }
    const itemData = { ...newItem, date: selectedDate, attachments: finalAttachments, pdfUrl: null };
    if (isEditing) await updateDoc(doc(db, "trips", tripId, "items", editingId), itemData); else await addDoc(collection(db, "trips", tripId, "items"), itemData);
    setOpenItemModal(false); setUploading(false);
  };

  const handleSaveNotes = async () => { await updateDoc(doc(db,"trips",tripId), { notes: tripNotes }); setEditNotesOpen(false); };
  const deleteAttachment = (index) => { const updated = [...existingAttachments]; updated.splice(index, 1); setExistingAttachments(updated); };
  const handleCacheAll = async () => { let t = sessionStorage.getItem('googleAccessToken'); if (!t) { alert("Refresca sesión."); return; } if (!confirm(`¿Descargar Offline?`)) return; setCaching(true); try { for (const item of items) if (item.attachments) for (const att of item.attachments) if (att.fileId) try { await cacheFileLocal(att.fileId, t); } catch (e) { if (e.message === "TOKEN_EXPIRED") { t = await getRefreshedToken(); await cacheFileLocal(att.fileId, t); } } setShowToast(true); } catch(e) { alert("Error descarga."); } setCaching(false); };
  const openAttachment = async (att) => { if (att.fileId) { const b = await getFileFromCache(att.fileId); if (b) return window.open(URL.createObjectURL(b)); } window.open(att.url, '_blank'); };

  if (!trip) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress/></Box>;
  let days = []; try { const s=trip.startDate?dayjs(trip.startDate):dayjs(); const e=trip.endDate?dayjs(trip.endDate):s; for(let i=0; i<=Math.max(0,e.diff(s,'day')); i++) days.push(s.add(i,'day').format('YYYY-MM-DD')); } catch(e) {}

  return (
    <Box sx={{ minHeight:'100vh', bgcolor:'#f8fafc', pb:10 }}>
      <Box sx={{ position:'sticky',top:0,zIndex:10,bgcolor:'rgba(255,255,255,0.95)',backdropFilter:'blur(10px)',borderBottom:'1px solid #e2e8f0' }}>
        <Toolbar>
          <IconButton onClick={()=>navigate('/')}><ArrowBackIcon sx={{color: '#334155'}}/></IconButton>
          <Box ml={1} flexGrow={1}>
              <Typography variant="h6" lineHeight={1.1} sx={{color: '#0f172a', fontWeight: 700}}>{trip.title}</Typography>
              <Typography variant="caption" color="text.secondary">{trip.place}</Typography>
          </Box>
          <Tooltip title="Descargar Offline"><IconButton onClick={handleCacheAll} disabled={caching} sx={{color: caching ? 'gray' : '#3b82f6'}}>{caching ? <CircularProgress size={24}/> : <CloudDownloadIcon />}</IconButton></Tooltip>
        </Toolbar>
      </Box>
      <Container maxWidth="sm" sx={{ py: 3 }}>
        
        <Card sx={{ mb: 4, borderRadius: 3, bgcolor: '#fffbeb', border: '1px solid #fde68a', boxShadow: 'none' }}>
          <CardActionArea onClick={() => setEditNotesOpen(true)}>
            <CardContent sx={{ py: 2 }}>
              <Stack direction="row" alignItems="center" gap={1} mb={0.5}><StickyNote2Icon sx={{ color: '#d97706', fontSize: 18 }} /><Typography variant="subtitle2" fontWeight="700" color="#b45309">NOTAS DEL VIAJE</Typography></Stack>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-line', color: '#92400e' }}>{trip.notes || "Añade códigos, seguros, wifi..."}</Typography>
            </CardContent>
          </CardActionArea>
        </Card>

        {days.map((d, idx) => {
          const itemsOfDay = items.filter(i => i.date === d);
          const isToday = dayjs(d).format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD');
          return (
            <Box key={d} mb={4} position="relative">
              <Box position="absolute" left={20} top={35} bottom={-10} borderLeft="2px solid #e2e8f0" zIndex={0} />
              <Stack direction="row" justifyContent="space-between" mb={2} position="relative" zIndex={1} alignItems="center">
                <Stack direction="row" gap={2} alignItems="center">
                   <Box width={40} height={40} bgcolor={isToday ? '#3b82f6' : 'white'} border={`2px solid ${isToday ? '#3b82f6' : '#cbd5e1'}`} borderRadius="10px" display="flex" flexDirection="column" alignItems="center" justifyContent="center" boxShadow={isToday ? '0 4px 6px -1px rgba(59, 130, 246, 0.5)' : 'none'}><Typography variant="h6" fontWeight={800} lineHeight={1} sx={{color: isToday?'white':'#475569'}}>{idx+1}</Typography></Box>
                   <Box><Typography variant="body1" fontWeight={700} textTransform="capitalize" sx={{color: '#334155'}}>{dayjs(d).format('dddd')}</Typography><Typography variant="caption" color="text.secondary">{dayjs(d).format('D MMM')}</Typography></Box>
                </Stack>
                <Button size="small" onClick={() => openCreate(d)} sx={{ bgcolor:'white', border:'1px solid #e2e8f0', color: '#64748b', minWidth: 'auto', px: 1.5 }}><AddIcon fontSize="small" sx={{mr: 0.5}}/> Añadir</Button>
              </Stack>

              <Stack spacing={2} pl={0} position="relative" zIndex={1}>
                {itemsOfDay.map(item => {
                  const isFlight = item.type==='flight';
                  const atts = item.attachments || [];
                  if(item.pdfUrl) atts.push({name:'Adjunto', url:item.pdfUrl}); 
                  const accentColor = isFlight ? '#3b82f6' : '#ec4899'; 
                  
                  return (
                    <Card key={item.id} sx={{ borderRadius: 3, border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)', borderLeft: `4px solid ${accentColor}`, overflow: 'visible' }}>
                      <Box sx={{ p: 2, display: 'flex', gap: 2 }}>
                        <Box sx={{ display:'flex', flexDirection:'column', alignItems:'flex-start', minWidth: 45 }}>
                           <Typography variant="h6" fontSize="0.9rem" fontWeight="700" color="text.secondary">{item.time}</Typography>
                        </Box>

                        <Box flexGrow={1} minWidth={0}>
                           {/* CABECERA TARJETA CON BOTONES */}
                           <Stack direction="row" justifyContent="space-between" alignItems="start">
                              <Box>
                                <Typography variant="subtitle1" fontWeight="700" lineHeight={1.2} sx={{color: '#1e293b'}}>{item.title}</Typography>
                                {isFlight && (item.flightNumber || item.terminal || item.gate) && (<Stack direction="row" gap={1} mt={0.5} flexWrap="wrap">{item.flightNumber && <Chip label={item.flightNumber} size="small" sx={{bgcolor: '#e0e7ff', color: '#3730a3', fontSize:'0.7rem', height: 20, fontWeight: 700, borderRadius: '4px'}} />}{(item.terminal || item.gate) && <Typography variant="caption" color="text.secondary" sx={{bgcolor:'#f1f5f9', px:0.8, py:0.2, borderRadius:'4px'}}>{item.terminal && `T${item.terminal}`} {item.gate && `• Puerta ${item.gate}`}</Typography>}</Stack>)}
                              </Box>
                              
                              <Stack direction="row" gap={0.5} ml={1}>
                                 <IconButton size="small" onClick={() => openEdit(item)} sx={{ color:'#94a3b8', width:32, height:32 }}><EditIcon style={{fontSize:18}}/></IconButton>
                                 
                                 {/* BOTONES GRANDES DE ACCIÓN */}
                                 {item.type === 'place' && (
                                   <IconButton 
                                     sx={{ bgcolor: '#eff6ff', color: '#3b82f6', width: 42, height: 42, borderRadius: '12px', '&:hover': {bgcolor:'#dbeafe'} }}
                                     onClick={() => { const target = item.mapsLink || `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(item.title)}&dir_action=navigate`; window.open(target, '_blank'); }}>
                                     {(item.mapsLink && item.mapsLink.startsWith('http')) ? <MapIcon/> : <DirectionsIcon/>}
                                   </IconButton>
                                 )}
                                 {isFlight && item.flightNumber && (
                                   <IconButton 
                                     sx={{ bgcolor: '#eff6ff', color: '#3b82f6', width: 42, height: 42, borderRadius: '12px', '&:hover': {bgcolor:'#dbeafe'} }}
                                     onClick={() => window.open(`https://www.flightradar24.com/data/flights/${item.flightNumber.replace(/\s/g,'')}`, '_blank')}>
                                       <FlightIcon/>
                                   </IconButton>
                                 )}
                              </Stack>
                           </Stack>
                           
                           {item.description && (<Box sx={{ mt: 1 }}><Typography variant="body2" color="text.secondary" fontSize="0.85rem" sx={{whiteSpace:'pre-wrap', lineHeight: 1.4}}>{item.description}</Typography></Box>)}
                           {atts.length > 0 && (<Stack direction="row" gap={1} flexWrap="wrap" mt={2}>{atts.map((att,i) => ( <SmartAttachmentChip key={i} attachment={att} onOpen={openAttachment} refreshTrigger={showToast} /> ))}</Stack>)}
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
      
      <Dialog open={openItemModal} onClose={()=>setOpenItemModal(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{textAlign:'center', fontWeight:'bold'}}>{isEditing ? "Editar" : "Nuevo"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <Stack direction="row" gap={1} bgcolor="#F3F4F6" p={0.5} borderRadius={3}>{['place','flight'].map(t => ( <Button key={t} fullWidth onClick={()=>setNewItem({...newItem,type:t})} sx={{bgcolor:newItem.type===t?'white':'transparent', borderRadius:2.5, color:newItem.type===t?'black':'text.secondary', boxShadow:newItem.type===t?'0 2px 4px rgba(0,0,0,0.05)':0}}>{t==='place'?'📍 Lugar':'✈️ Vuelo'}</Button> ))}</Stack>
            {newItem.type === 'place' ? (<><TextField label="Nombre (Título)" variant="filled" size="small" fullWidth InputProps={{disableUnderline:true, style:{borderRadius:12}}} value={newItem.title} onChange={e=>setNewItem({...newItem,title:e.target.value})} /><TextField label="Dirección / Link" variant="filled" size="small" fullWidth placeholder="Ej: Calle Pez 1" InputProps={{disableUnderline:true, style:{borderRadius:12}, startAdornment:<LocationOnIcon color="action" sx={{mr:1}}/>}} value={newItem.mapsLink} onChange={e=>setNewItem({...newItem,mapsLink:e.target.value})} /></>) : (<><TextField label="Nombre Vuelo" variant="filled" size="small" fullWidth InputProps={{disableUnderline:true, style:{borderRadius:12}}} value={newItem.title} onChange={e=>setNewItem({...newItem,title:e.target.value})} /><Stack direction="row" gap={1}><TextField label="Nº Vuelo" fullWidth variant="filled" size="small" InputProps={{disableUnderline:true, style:{borderRadius:12}}} value={newItem.flightNumber} onChange={e=>setNewItem({...newItem,flightNumber:e.target.value})} /><TextField label="Hora" type="time" fullWidth variant="filled" size="small" InputProps={{disableUnderline:true, style:{borderRadius:12}}} value={newItem.time} onChange={e=>setNewItem({...newItem,time:e.target.value})} /></Stack><Stack direction="row" gap={1}><TextField label="Terminal" fullWidth variant="filled" size="small" InputProps={{disableUnderline:true, style:{borderRadius:12}}} value={newItem.terminal} onChange={e=>setNewItem({...newItem,terminal:e.target.value})} /><TextField label="Puerta" fullWidth variant="filled" size="small" InputProps={{disableUnderline:true, style:{borderRadius:12}}} value={newItem.gate} onChange={e=>setNewItem({...newItem,gate:e.target.value})} /></Stack></>)}
            {newItem.type === 'place' && <TextField type="time" variant="filled" size="small" fullWidth InputProps={{disableUnderline:true, style:{borderRadius:12}}} value={newItem.time} onChange={e=>setNewItem({...newItem,time:e.target.value})} />}
            <TextField label="Notas / Descripción" multiline rows={2} variant="filled" size="small" fullWidth InputProps={{disableUnderline:true, style:{borderRadius:12}}} value={newItem.description || ''} onChange={e=>setNewItem({...newItem,description:e.target.value})} />
            {existingAttachments.length > 0 && (<Stack gap={1}>{existingAttachments.map((a,i)=><Box key={i} display="flex" justifyContent="space-between" bgcolor="#f0f0f0" p={1} borderRadius={2}><Typography variant="caption" noWrap sx={{maxWidth:200}}>{a.name}</Typography><IconButton size="small" onClick={()=>deleteAttachment(i)}><CloseIcon fontSize="small"/></IconButton></Box>)}</Stack>)}
            <Button variant="outlined" component="label" startIcon={<AttachFileIcon/>} sx={{borderStyle:'dashed', borderRadius:3, py:1.5}}>{files.length>0 ? `Subir ${files.length}` : "Adjuntar archivos"}<input type="file" multiple hidden onChange={e=>setFiles(Array.from(e.target.files))}/></Button>
            {isEditing && <Button color="error" startIcon={<DeleteForeverIcon/>} onClick={()=>{if(confirm("¿Borrar?")){deleteDoc(doc(db,"trips",tripId,"items",editingId));setOpenItemModal(false)}}}>Eliminar Evento</Button>}
          </Stack>
        </DialogContent>
        <DialogActions sx={{p:2}}><Button onClick={()=>setOpenItemModal(false)} sx={{color:'#64748b'}}>Cancelar</Button><Button variant="contained" disabled={uploading} onClick={handleSaveItem}>{uploading?'...':'Guardar'}</Button></DialogActions>
      </Dialog>

      <Dialog open={editNotesOpen} onClose={()=>setEditNotesOpen(false)} fullWidth maxWidth="xs"><DialogTitle sx={{fontWeight: 700}}>Notas Rápidas</DialogTitle><DialogContent><TextField autoFocus multiline rows={6} fullWidth variant="filled" InputProps={{disableUnderline:true, style:{borderRadius:12}}} value={tripNotes} onChange={e=>setTripNotes(e.target.value)} placeholder="Ej: Wifi: 1234, Seguro..." sx={{mt:1}} /></DialogContent><DialogActions sx={{p:2}}><Button onClick={()=>setEditNotesOpen(false)} sx={{color:'#64748b'}}>Cancelar</Button><Button variant="contained" onClick={handleSaveNotes} disableElevation>Guardar</Button></DialogActions></Dialog>
      <Snackbar open={showToast} autoHideDuration={3000} onClose={()=>setShowToast(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}><Alert onClose={()=>setShowToast(false)} severity="success" sx={{ width: '100%' }}>¡Descargado para Offline!</Alert></Snackbar>
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