import React, { useState, useEffect, useMemo } from "react";
import {
  createTheme,
  ThemeProvider,
  CssBaseline,
  useTheme,
  Box,
  AppBar,
  Toolbar,
  Typography,
  Fab,
  Container,
  Card,
  CardContent,
  Button,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  CircularProgress,
  CardMedia,
  CardActionArea,
  Chip,
  Tooltip,
  Alert,
  Snackbar,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  InputAdornment,
  ToggleButton,
  ToggleButtonGroup,
  Menu,
  ListItemIcon,
  Divider,
} from "@mui/material";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  useParams,
} from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/es";
import relativeTime from 'dayjs/plugin/relativeTime'; // <--- AÑADE ESTO
import { get, set } from "idb-keyval";
dayjs.extend(relativeTime); // <--- AÑADE ESTO
// Añade 'Collapse' a los imports de @mui/material
import {
  // ... tus otros imports ...
  Collapse,
} from "@mui/material";

// Añade 'KeyboardArrowDownIcon' a los imports de iconos
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import {
  // ... lo que ya tengas ...
  Drawer,
} from "@mui/material";

// Nuevos iconos
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber"; // Icono de Ticket
import QrCode2Icon from "@mui/icons-material/QrCode2"; // Icono de QR falso decorativo
import FlightLandIcon from "@mui/icons-material/FlightLand";
import DescriptionIcon from "@mui/icons-material/Description";
// --- DND KIT IMPORTS ---
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  TouchSensor,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

dayjs.locale("es");

// --- ICONOS ---
import AddIcon from "@mui/icons-material/Add";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import GoogleIcon from "@mui/icons-material/Google";
import LogoutIcon from "@mui/icons-material/Logout";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import MapIcon from "@mui/icons-material/Map";
import DirectionsIcon from "@mui/icons-material/Directions";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import ShareIcon from "@mui/icons-material/Share";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CloudQueueIcon from "@mui/icons-material/CloudQueue";
import FlightIcon from "@mui/icons-material/Flight";
import StickyNote2Icon from "@mui/icons-material/StickyNote2";
import LinkIcon from "@mui/icons-material/Link";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import StarIcon from "@mui/icons-material/Star";
import ListIcon from "@mui/icons-material/List";
import PlaceIcon from "@mui/icons-material/Place";
import EuroIcon from "@mui/icons-material/Euro";
import GroupIcon from "@mui/icons-material/Group";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";
import HandshakeIcon from "@mui/icons-material/Handshake";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import CheckIcon from "@mui/icons-material/Check";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";

// --- FIREBASE ---
import { auth, googleProvider, db } from "./firebase";
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
} from "firebase/auth";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  orderBy,
  doc,
  deleteDoc,
  updateDoc,
  arrayUnion,
  writeBatch,
} from "firebase/firestore";

// --- DEFINICIÓN DE TEMAS (LIGHT / DARK) ---
const getDesignTokens = (mode) => ({
  palette: {
    mode,
    primary: { main: "#6750A4", light: "#EADDFF", contrastText: "#FFFFFF" },
    secondary: { main: "#625B71", light: "#E8DEF8" },
    ...(mode === "light"
      ? {
        // CAMBIO 1: Fondo gris suave (estilo app moderna) en lugar de blanco puro
        background: { default: '#FFFFFF', paper: '#FFFFFF' },
        text: { primary: "#1C1B1F", secondary: "#49454F" },
        custom: {
          flight: { bg: "#D7E3FF", color: "#001B3D", border: "transparent" },
          food: { bg: "#FFE0B2", color: "#E65100", border: "transparent" },
          place: { bg: "#FFCDD2", color: "#C62828", border: "transparent" },
          transport: {
            bg: "#C4EED0",
            color: "#00210E",
            border: "transparent",
          },
          note: {
            bg: "#fffbeb",
            color: "#92400e",
            border: "#fde68a",
            titleColor: "#b45309",
          },
          dateChip: { bg: "#efddff", color: "#000000" },
          filterActive: { bg: "primary.main", color: "#FFFFFF" },
        },
      }
      : {
        background: { default: '#000000', paper: '#1C1C1E' },
        text: { primary: "#E6E1E5", secondary: "#CAC4D0" },
        custom: {
          flight: { bg: "#36517d", color: "#d4e3ff", border: "#4b648a" },
          food: { bg: "#704216", color: "#ffdbc2", border: "#8f5820" },
          place: { bg: "#692222", color: "#ffdad6", border: "#8c3333" },
          transport: { bg: "#1b3622", color: "#bcebe0", border: "#2e5739" },
          note: {
            bg: "#3d3614",
            color: "#FFF8E1",
            border: "#5e5423",
            titleColor: "#f7df94",
          },
          dateChip: { bg: "#4F378B", color: "#EADDFF" },
          filterActive: { bg: "primary.main", color: "primary.contrastText" },
        },
      }),
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h6: { fontSize: "1rem", fontWeight: 700, letterSpacing: 0 },
    subtitle1: { fontWeight: 600, fontSize: "0.9rem" },
    body2: { letterSpacing: 0.15, fontSize: "0.8rem" },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: "50px", padding: "6px 20px", boxShadow: "none" },
      },
    },
    // CAMBIO 2: Tarjetas estilo "Elevado limpio"
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: "16px", // Bordes redondeados pero no excesivos
          // Sombra suave grisácea en modo claro, nada en oscuro
          boxShadow:
            theme.palette.mode === "light"
              ? "0 2px 12px rgba(0,0,0,0.06)"
              : "0 4px 10px rgba(0,0,0,0.3)",
          border: "none", // IMPORTANTE: Quitamos el borde por defecto
          backgroundImage: "none",
          // Microinteracción: se eleva un poquito al pasar el ratón
          transition: "transform 0.2s, box-shadow 0.2s",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow:
              theme.palette.mode === "light"
                ? "0 6px 16px rgba(0,0,0,0.1)"
                : "0 6px 16px rgba(0,0,0,0.4)",
          },
        }),
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: "28px",
          padding: "8px",
          backgroundImage: "none",
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          borderRadius: "16px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
          backgroundColor: "#EADDFF",
          color: "#21005D",
          "&:hover": { backgroundColor: "#D0BCFF" },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": { borderRadius: "8px" },
          "& .MuiFilledInput-root": {
            borderTopLeftRadius: "4px",
            borderTopRightRadius: "4px",
          },
        },
      },
    },
    MuiChip: { styleOverrides: { root: { borderRadius: "8px" } } },
    MuiAppBar: {
      styleOverrides: {
        root: { boxShadow: "none", borderBottom: "1px solid rgba(0,0,0,0.05)" },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          borderRadius: "10px",
          textTransform: "none",
          border: "1px solid rgba(0,0,0,0.12)",
        },
      },
    },
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: ({ theme }) => ({
          "&.Mui-selected": {
            color:
              theme.palette.mode === "dark"
                ? "#FFFFFF"
                : theme.palette.primary.main,
          },
          "& .MuiBottomNavigationAction-label.Mui-selected": {
            color:
              theme.palette.mode === "dark"
                ? "#FFFFFF"
                : theme.palette.primary.main,
            fontWeight: 700,
          },
        }),
      },
    },
  },
});

// --- UTILIDADES ---
async function findOrCreateFolder(folderName, accessToken, parentId = null) {
  let query = `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  if (parentId) query += ` and '${parentId}' in parents`;
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
      query
    )}&fields=files(id)`,
    { method: "GET", headers: { Authorization: "Bearer " + accessToken } }
  );
  if (res.status === 401) throw new Error("TOKEN_EXPIRED");
  const data = await res.json();
  if (data.files && data.files.length > 0) return data.files[0].id;
  const meta = {
    name: folderName,
    mimeType: "application/vnd.google-apps.folder",
    parents: parentId ? [parentId] : undefined,
  };
  const create = await fetch("https://www.googleapis.com/drive/v3/files", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + accessToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(meta),
  });
  return (await create.json()).id;
}
// Actualizamos la función para recibir 'participants'
async function uploadToGoogleDrive(file, accessToken, folderId, participants = []) {
  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify({ name: file.name, parents: [folderId] })], { type: 'application/json' }));
  form.append('file', file);

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink', { method: 'POST', headers: { 'Authorization': 'Bearer ' + accessToken }, body: form, });

  if (res.status === 401) throw new Error("TOKEN_EXPIRED");
  if (!res.ok) throw new Error('Error subida');

  const fileData = await res.json();

  // 1. Permiso General (para ver el link)
  await fetch(`https://www.googleapis.com/drive/v3/files/${fileData.id}/permissions`, {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + accessToken, 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'reader', type: 'anyone' })
  });

  // 2. Permiso Explícito para los participantes (para que salga en "Compartido conmigo")
  // Filtramos para no compartirlo con nosotros mismos (el dueño)
  const others = participants.filter(email => email !== auth.currentUser?.email);

  for (const email of others) {
    try {
      await fetch(`https://www.googleapis.com/drive/v3/files/${fileData.id}/permissions`, {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + accessToken, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'reader',
          type: 'user',
          emailAddress: email
        })
      });
    } catch (e) {
      console.warn(`No se pudo compartir con ${email}`, e);
    }
  }

  return fileData;
}
async function cacheFileLocal(fileId, accessToken) {
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    { headers: { Authorization: "Bearer " + accessToken } }
  );
  if (response.status === 401) throw new Error("TOKEN_EXPIRED");
  const blob = await response.blob();
  await set(`file_${fileId}`, blob);
}
async function getFileFromCache(fileId) {
  try {
    return await get(`file_${fileId}`);
  } catch (e) {
    return null;
  }
}
async function getRefreshedToken() {
  const res = await signInWithPopup(auth, googleProvider);
  const c = GoogleAuthProvider.credentialFromResult(res);
  sessionStorage.setItem("googleAccessToken", c.accessToken);
  return c.accessToken;
}

// --- COMPONENTES VISUALES ---
function SortableItem({ id, children, disabled }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : 1,
    position: "relative",
    // ESTO ES IMPORTANTE: Evita que al tocar la tarjeta el móvil haga scroll
    touchAction: disabled ? "auto" : "none",
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {" "}
      {children}{" "}
    </div>
  );
}

const SmartAttachmentChip = ({ attachment, onOpen, refreshTrigger }) => {
  const [isOffline, setIsOffline] = useState(false);
  useEffect(() => {
    const c = async () => {
      if (attachment.fileId)
        setIsOffline(!!(await getFileFromCache(attachment.fileId)));
    };
    c();
  }, [attachment, refreshTrigger]);
  return (
    <Chip
      label={attachment.name}
      onClick={() => onOpen(attachment)}
      icon={
        isOffline ? (
          <CheckCircleOutlineIcon
            style={{ fontSize: 16, color: isOffline ? "#1B5E20" : "inherit" }}
          />
        ) : (
          <CloudQueueIcon style={{ fontSize: 16 }} />
        )
      }
      sx={{
        height: "24px",
        fontSize: "0.75rem",
        fontWeight: 600,
        maxWidth: "100%",
        cursor: "pointer",
        bgcolor: isOffline ? "#E8F5E9" : "action.selected",
        border: isOffline ? "1px solid #A5D6A7" : "1px solid rgba(0,0,0,0.1)",
        color: isOffline ? "#1B5E20" : "text.primary",
      }}
    />
  );
};

const TripCoverImage = ({ url, place, height }) => {
  const imageSrc =
    url && url.length > 5
      ? url
      : `https://loremflickr.com/800/400/${encodeURIComponent(
        place
      )},landscape/all`;
  return (
    <CardMedia
      component="img"
      height={height}
      image={imageSrc}
      sx={{
        filter: "brightness(0.95)",
        objectFit: "cover",
        height: height,
        width: "100%",
      }}
      onError={(e) => {
        e.target.src = `https://loremflickr.com/800/400/${encodeURIComponent(
          place
        )},landscape/all`;
      }}
    />
  );
};

// --- PANTALLA LOGIN ---
function LoginScreen({ onLogin }) {
  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        p: 3,
        background: "background.default",
      }}
    >
      <Box
        sx={{
          p: 5,
          textAlign: "center",
          bgcolor: "background.paper",
          borderRadius: "28px",
        }}
      >
        <Box
          sx={{
            bgcolor: "primary.main",
            width: 64,
            height: 64,
            borderRadius: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto",
            mb: 3,
          }}
        >
          {" "}
          <FlightTakeoffIcon sx={{ fontSize: 32, color: "white" }} />{" "}
        </Box>
        <Typography
          variant="h4"
          fontWeight="800"
          gutterBottom
          sx={{ color: "text.primary" }}
        >
          Viajes App
        </Typography>
        <Button
          variant="contained"
          size="large"
          startIcon={<GoogleIcon />}
          onClick={onLogin}
          sx={{ mt: 3, bgcolor: "#6750A4", color: "white" }}
        >
          Entrar con Google
        </Button>
      </Box>
    </Box>
  );
}

// --- PANTALLA HOME ---
// --- PANTALLA HOME REDISEÑADA ---
function HomeScreen({ user, onLogout, toggleTheme, mode }) {
  const [trips, setTrips] = useState([]);
  const [openModal, setOpenModal] = useState(false);

  // Estados para compartir/editar (igual que antes)
  const [openShare, setOpenShare] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [shareTripId, setShareTripId] = useState(null);
  const [editTripData, setEditTripData] = useState({ id: '', title: '', place: '', startDate: '', endDate: '', coverImageUrl: '' });
  const [newTrip, setNewTrip] = useState({ title: '', place: '', startDate: '', endDate: '', coverImageUrl: '' });

  const [anchorElUser, setAnchorElUser] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();

  // Carga de viajes
  useEffect(() => {
    if (!user?.email) return;
    const u = onSnapshot(query(collection(db, "trips"), where("participants", "array-contains", user.email), orderBy("startDate", "asc")), (s) => {
      setTrips(s.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return u;
  }, [user]);

  // Funciones de gestión (Igual que antes)
  const handleSave = async () => { if (!newTrip.title) return; await addDoc(collection(db, "trips"), { ...newTrip, participants: [user.email], ownerId: user.uid, aliases: {}, createdAt: new Date(), notes: '' }); setOpenModal(false); setNewTrip({ title: '', place: '', startDate: '', endDate: '', coverImageUrl: '' }); };
  const openEdit = (e, trip) => { e.stopPropagation(); setEditTripData({ ...trip }); setOpenEditModal(true); };
  const handleUpdateTrip = async () => { const { id, ...data } = editTripData; await updateDoc(doc(db, "trips", id), data); setOpenEditModal(false); };
  const handleDelete = async (e, id) => { e.stopPropagation(); if (confirm("¿Eliminar viaje completo?")) await deleteDoc(doc(db, "trips", id)); };
  const handleShare = async () => { if (!shareEmail) return; try { await updateDoc(doc(db, "trips", shareTripId), { participants: arrayUnion(shareEmail) }); alert("¡Invitado!"); setOpenShare(false); setShareEmail(''); } catch (e) { alert("Error"); } };

  // SEPARAR EL PRÓXIMO VIAJE DEL RESTO
  const today = dayjs().startOf('day');
  // Filtramos viajes futuros o actuales
  const upcomingTrips = trips.filter(t => dayjs(t.endDate).isAfter(today) || dayjs(t.endDate).isSame(today));
  // El primero es el "Hero"
  const nextTrip = upcomingTrips.length > 0 ? upcomingTrips[0] : null;
  // El resto son la lista
  const otherTrips = trips.filter(t => t.id !== nextTrip?.id);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 12 }}>

      {/* 1. CABECERA PERSONALIZADA */}
      <Box sx={{ px: 3, pt: 4, pb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" fontWeight="800" color="text.primary">
            Hola, {user.displayName ? user.displayName.split(' ')[0] : 'Viajero'} 👋
          </Typography>
          <Typography variant="body2" color="text.secondary" fontWeight="500">
            ¿Listo para la próxima aventura?
          </Typography>
        </Box>
        <IconButton onClick={(e) => setAnchorElUser(e.currentTarget)} sx={{ p: 0 }}>
          <Avatar src={user.photoURL} sx={{ width: 44, height: 44, border: `2px solid ${theme.palette.primary.main}` }} />
        </IconButton>
      </Box>

      {/* Menú de usuario (Igual que antes) */}
      <Menu sx={{ mt: '45px' }} id="menu-appbar" anchorEl={anchorElUser} anchorOrigin={{ vertical: 'top', horizontal: 'right' }} keepMounted transformOrigin={{ vertical: 'top', horizontal: 'right' }} open={Boolean(anchorElUser)} onClose={() => setAnchorElUser(null)} PaperProps={{ style: { borderRadius: 16 } }} >
        <MenuItem onClick={toggleTheme}><ListItemIcon>{mode === 'light' ? <DarkModeIcon fontSize="small" /> : <LightModeIcon fontSize="small" />}</ListItemIcon><Typography textAlign="center">Modo {mode === 'light' ? 'Oscuro' : 'Claro'}</Typography></MenuItem>
        <Divider />
        <MenuItem onClick={onLogout}><ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon><Typography textAlign="center" color="error">Cerrar Sesión</Typography></MenuItem>
      </Menu>

      <Container maxWidth="sm" sx={{ px: 2 }}>

        {/* 2. TARJETA HERO (EL PRÓXIMO VIAJE) */}
        {nextTrip && (
          <Box mb={4} mt={2}>
            <Typography variant="subtitle2" fontWeight="800" sx={{ mb: 1.5, ml: 1, color: 'text.secondary', letterSpacing: 1, textTransform: 'uppercase', fontSize: '0.75rem' }}>
              PRÓXIMA PARADA 🚀
            </Typography>
            <Card
              onClick={() => navigate(`/trip/${nextTrip.id}`)}
              sx={{
                borderRadius: '28px',
                overflow: 'hidden',
                position: 'relative',
                cursor: 'pointer',
                boxShadow: '0 20px 40px -10px rgba(0,0,0,0.3)',
                transition: 'transform 0.3s',
                '&:hover': { transform: 'scale(1.02)' }
              }}
            >
              {/* Imagen Grande */}
              <Box sx={{ height: 280, width: '100%', position: 'relative' }}>
                <TripCoverImage url={nextTrip.coverImageUrl} place={nextTrip.place} height="100%" />
                {/* Degradado oscuro para que se lea el texto */}
                <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 50%)' }} />

                {/* Botones de acción flotantes */}
                {/* Botones de acción flotantes (HERO) */}
<Box position="absolute" top={16} right={16} display="flex" gap={1} sx={{ zIndex: 10 }}>
    {/* Compartir */}
    <IconButton size="small" onClick={(e) => { e.stopPropagation(); setShareTripId(nextTrip.id); setOpenShare(true); }} sx={{ bgcolor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', color: 'white', '&:hover':{bgcolor:'rgba(255,255,255,0.4)'} }}>
        <ShareIcon fontSize="small"/>
    </IconButton>
    
    {/* Editar */}
    <IconButton size="small" onClick={(e) => openEdit(e, nextTrip)} sx={{ bgcolor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', color: 'white', '&:hover':{bgcolor:'rgba(255,255,255,0.4)'} }}>
        <EditIcon fontSize="small"/>
    </IconButton>

    {/* Borrar (NUEVO) */}
    <IconButton size="small" onClick={(e) => handleDelete(e, nextTrip.id)} sx={{ bgcolor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', color: '#FF8A80', '&:hover':{bgcolor:'rgba(255,60,60,0.4)'} }}>
        <DeleteForeverIcon fontSize="small"/>
    </IconButton>
</Box>

                {/* Textos sobre la imagen */}
                <Box sx={{ position: 'absolute', bottom: 0, left: 0, p: 3, width: '100%' }}>
                  <Chip label={dayjs(nextTrip.startDate).fromNow()} size="small" sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 700, mb: 1, border: 'none' }} />
                  <Typography variant="h4" fontWeight="800" sx={{ color: 'white', mb: 0.5, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                    {nextTrip.place}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
                    {nextTrip.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', mt: 1, display: 'block' }}>
                    {dayjs(nextTrip.startDate).format('D MMM')} - {dayjs(nextTrip.endDate).format('D MMM')}
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Box>
        )}

        {/* 3. LISTA DEL RESTO DE VIAJES */}
        {otherTrips.length > 0 && (
          <Box>
            <Typography variant="subtitle2" fontWeight="800" sx={{ mb: 1.5, ml: 1, color: 'text.secondary', letterSpacing: 1, textTransform: 'uppercase', fontSize: '0.75rem' }}>
              OTROS VIAJES
            </Typography>

            {otherTrips.map(trip => (
              <Card key={trip.id} sx={{ mb: 2, borderRadius: '20px', bgcolor: 'background.paper', overflow: 'hidden',position: 'relative' }}>
                <CardActionArea onClick={() => navigate(`/trip/${trip.id}`)} sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'stretch' }}>
                  {/* Imagen cuadrada izquierda */}
                  <Box sx={{ width: 100, minWidth: 100, height: 100, position: 'relative' }}>
                    <TripCoverImage url={trip.coverImageUrl} place={trip.place} height="100%" />
                  </Box>

                  {/* Info */}
                  {/* Info de la tarjeta */}
<CardContent sx={{ flexGrow: 1, py: 1, px: 2, display:'flex', flexDirection:'column', justifyContent:'center' }}>
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        {/* CAMBIO CLAVE: Añadimos pr: 12 (unos 96px) para dejar hueco a los 3 botones */}
        <Box sx={{ width: '100%', pr: 12 }}>
            <Typography 
                variant="subtitle1" 
                fontWeight="800" 
                sx={{ 
                    color: 'text.primary', 
                    lineHeight: 1.2, 
                    mb: 0.5,
                    // Opcional: Si quieres que si es muy largo salgan puntos suspensivos (...)
                    // whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                    // O si prefieres que baje de línea (mejor), déjalo como está.
                }}
            >
                {trip.title}
            </Typography>
            
            <Stack direction="row" alignItems="center" gap={0.5} color="text.secondary"> 
                <LocationOnIcon sx={{ fontSize: 14, color: theme.palette.custom.place.color }}/> 
                <Typography variant="caption" fontWeight="600" noWrap>{trip.place}</Typography> 
            </Stack>
        </Box>
    </Stack>
    
    <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1, bgcolor: theme.palette.mode==='light'?'#F3F4F6':'rgba(255,255,255,0.05)', alignSelf: 'flex-start', px: 1, py: 0.3, borderRadius: '6px', fontWeight: 600 }}> 
        {dayjs(trip.startDate).format('D MMM')} - {dayjs(trip.endDate).format('D MMM YYYY')} 
    </Typography>
</CardContent>
                </CardActionArea>

                {/* Botones de acción (Absolutos para no romper layout) */}
                {/* Botones de acción (OTROS VIAJES) */}
<Box position="absolute" top={8} right={8} sx={{ zIndex: 10, display: 'flex', gap: 0.5 }}>
   {/* Compartir (NUEVO) */}
   <IconButton size="small" onClick={(e) => { e.stopPropagation(); setShareTripId(trip.id); setOpenShare(true); }} sx={{ color: 'text.secondary', bgcolor: theme.palette.mode==='light'?'rgba(255,255,255,0.8)':'rgba(0,0,0,0.5)', backdropFilter:'blur(4px)', '&:hover':{bgcolor:'action.hover', color: 'primary.main'} }}>
       <ShareIcon fontSize="small"/>
   </IconButton>

   {/* Editar (NUEVO) */}
   <IconButton size="small" onClick={(e) => openEdit(e, trip)} sx={{ color: 'text.secondary', bgcolor: theme.palette.mode==='light'?'rgba(255,255,255,0.8)':'rgba(0,0,0,0.5)', backdropFilter:'blur(4px)', '&:hover':{bgcolor:'action.hover', color: 'primary.main'} }}>
       <EditIcon fontSize="small"/>
   </IconButton>

   {/* Borrar (EXISTENTE) */}
   <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDelete(e, trip.id); }} sx={{ color: '#E57373', bgcolor: theme.palette.mode==='light'?'rgba(255,255,255,0.8)':'rgba(0,0,0,0.5)', backdropFilter:'blur(4px)', '&:hover':{bgcolor:'#FFEBEE'} }}>
       <DeleteForeverIcon fontSize="small"/>
   </IconButton>
</Box>
              </Card>
            ))}
          </Box>
        )}

        {/* Estado vacío si no hay viajes */}
        {trips.length === 0 && (
          <Box textAlign="center" mt={10} opacity={0.6}>
            <FlightTakeoffIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" fontWeight="700">Sin viajes todavía</Typography>
            <Typography variant="body2">Dale al botón + para empezar tu aventura</Typography>
          </Box>
        )}

      </Container>

      {/* FAB (Botón flotante) */}
      <Fab variant="extended" onClick={() => setOpenModal(true)} sx={{ position: 'fixed', bottom: 24, right: 24, bgcolor: 'primary.main', color: 'white', fontWeight: 700, borderRadius: '20px', boxShadow: '0 10px 20px -5px rgba(0,0,0,0.3)', '&:hover': { bgcolor: 'primary.dark' } }}>
        <AddIcon sx={{ mr: 1, fontSize: 20 }} /> Nuevo Viaje
      </Fab>

      {/* ... (TUS MODALES SIGUEN IGUAL AQUÍ ABAJO) ... */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="xs"> <DialogTitle sx={{ fontWeight: 700, textAlign: 'center' }}>Nuevo Viaje</DialogTitle> <DialogContent> <Stack spacing={2} mt={1}> <TextField label="Título" fullWidth variant="filled" InputProps={{ disableUnderline: true }} value={newTrip.title} onChange={e => setNewTrip({ ...newTrip, title: e.target.value })} /> <TextField label="Lugar" fullWidth variant="filled" InputProps={{ disableUnderline: true }} value={newTrip.place} onChange={e => setNewTrip({ ...newTrip, place: e.target.value })} /> <Stack direction="row" gap={2}> <TextField type="date" label="Inicio" fullWidth InputProps={{ disableUnderline: true }} variant="filled" InputLabelProps={{ shrink: true }} value={newTrip.startDate} onChange={e => setNewTrip({ ...newTrip, startDate: e.target.value })} /> <TextField type="date" label="Fin" fullWidth InputProps={{ disableUnderline: true }} variant="filled" InputLabelProps={{ shrink: true }} value={newTrip.endDate} onChange={e => setNewTrip({ ...newTrip, endDate: e.target.value })} /> </Stack> <TextField label="URL Foto Portada (Opcional)" fullWidth variant="filled" InputProps={{ disableUnderline: true, startAdornment: <LinkIcon sx={{ color: 'text.secondary', mr: 1 }} /> }} value={newTrip.coverImageUrl} onChange={e => setNewTrip({ ...newTrip, coverImageUrl: e.target.value })} /> </Stack> </DialogContent> <DialogActions sx={{ p: 3, justifyContent: 'center' }}> <Button onClick={() => setOpenModal(false)} sx={{ color: 'text.secondary', bgcolor: 'transparent !important' }}>Cancelar</Button> <Button variant="contained" onClick={handleSave} disableElevation sx={{ bgcolor: 'primary.main', color: 'white' }}>Crear Viaje</Button> </DialogActions> </Dialog>
      <Dialog open={openEditModal} onClose={() => setOpenEditModal(false)} fullWidth maxWidth="xs"> <DialogTitle sx={{ fontWeight: 700 }}>Editar Viaje</DialogTitle> <DialogContent> <Stack spacing={2} mt={1}> <TextField label="Título" fullWidth variant="filled" InputProps={{ disableUnderline: true }} value={editTripData.title} onChange={e => setEditTripData({ ...editTripData, title: e.target.value })} /> <TextField label="Lugar" fullWidth variant="filled" InputProps={{ disableUnderline: true }} value={editTripData.place} onChange={e => setEditTripData({ ...editTripData, place: e.target.value })} /> <Stack direction="row" gap={2}> <TextField type="date" label="Inicio" fullWidth variant="filled" InputProps={{ disableUnderline: true }} InputLabelProps={{ shrink: true }} value={editTripData.startDate} onChange={e => setEditTripData({ ...editTripData, startDate: e.target.value })} /> <TextField type="date" label="Fin" fullWidth variant="filled" InputProps={{ disableUnderline: true }} InputLabelProps={{ shrink: true }} value={editTripData.endDate} onChange={e => setEditTripData({ ...editTripData, endDate: e.target.value })} /> </Stack> <TextField label="URL Foto Portada" fullWidth variant="filled" InputProps={{ disableUnderline: true }} value={editTripData.coverImageUrl} onChange={e => setEditTripData({ ...editTripData, coverImageUrl: e.target.value })} /> </Stack> </DialogContent> <DialogActions sx={{ p: 3 }}> <Button onClick={() => setOpenEditModal(false)} sx={{ bgcolor: 'transparent !important' }}>Cancelar</Button> <Button variant="contained" onClick={handleUpdateTrip} sx={{ bgcolor: 'primary.main', color: 'white' }}>Guardar</Button> </DialogActions> </Dialog>
      <Dialog open={openShare} onClose={() => setOpenShare(false)} fullWidth maxWidth="xs"> <DialogTitle sx={{ fontWeight: 700 }}>Invitar</DialogTitle> <DialogContent> <TextField autoFocus label="Email Gmail" type="email" fullWidth variant="filled" InputProps={{ disableUnderline: true }} value={shareEmail} onChange={e => setShareEmail(e.target.value)} sx={{ mt: 1 }} /> </DialogContent> <DialogActions sx={{ p: 3 }}> <Button onClick={() => setOpenShare(false)} sx={{ bgcolor: 'transparent !important' }}>Cancelar</Button> <Button variant="contained" onClick={handleShare} sx={{ bgcolor: 'primary.main', color: 'white' }}>Enviar</Button> </DialogActions> </Dialog>
    </Box>
  );
}
// --- COMPONENTE DE MAPA ---
function TripMap({ spots, theme }) {
  // Calculamos el centro del mapa basado en los puntos (o default a Madrid)
  const defaultCenter = [40.4168, -3.7038];
  const validSpots = spots.filter((s) => s.lat && s.lng);
  const center =
    validSpots.length > 0
      ? [validSpots[0].lat, validSpots[0].lng]
      : defaultCenter;

  // Función para crear iconos personalizados HTML con los colores de tu tema
  const createCustomIcon = (category) => {
    let color = theme.palette.custom.place.color;
    let bg = theme.palette.custom.place.bg;
    let iconHTML = '<div style="font-size:16px">📍</div>'; // Default

    // Asignamos iconos según categoría (Mismos que en tu lista)
    if (category === "Comida") {
      color = theme.palette.custom.food.color;
      bg = theme.palette.custom.food.bg;
      iconHTML = "🍔";
    }
    if (category === "Super") {
      color = theme.palette.custom.place.color;
      bg = theme.palette.custom.place.bg;
      iconHTML = "🛒";
    }
    if (category === "Gasolina") {
      color = theme.palette.custom.transport.color;
      bg = theme.palette.custom.transport.bg;
      iconHTML = "⛽";
    }
    if (category === "Visita") {
      color = theme.palette.custom.place.color;
      bg = theme.palette.custom.place.bg;
      iconHTML = "📷";
    }
    if (category === "Salud") {
      color = "#d32f2f";
      bg = "#ffebee";
      iconHTML = "🏥";
    }

    return L.divIcon({
      className: "custom-marker",
      html: `<div style="
        background-color: ${bg}; 
        color: ${color};
        width: 36px; height: 36px; 
        border-radius: 50%; 
        border: 2px solid white;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        display: flex; align-items: center; justify-content: center;
        font-size: 18px;
      ">${iconHTML}</div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 36], // La punta del pin abajo centro
      popupAnchor: [0, -36],
    });
  };

  return (
    <Box
      sx={{
        height: "70vh",
        width: "100%",
        borderRadius: "24px",
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        position: "relative",
        zIndex: 0,
      }}
    >
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" // Mapa estilo "Clean"
        />
        {validSpots.map((spot) => (
          <Marker
            key={spot.id}
            position={[spot.lat, spot.lng]}
            icon={createCustomIcon(spot.category)}
          >
            <Popup>
              <Typography variant="subtitle2" fontWeight="700">
                {spot.name}
              </Typography>
              <Typography variant="caption">{spot.description}</Typography>
              {spot.mapsLink && (
                <Button
                  size="small"
                  fullWidth
                  sx={{ mt: 1 }}
                  onClick={() => window.open(spot.mapsLink, "_blank")}
                >
                  Abrir GPS
                </Button>
              )}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </Box>
  );
}
function SpotsView({ tripId, openCreateSpot, onEdit, isEditMode }) {
  const [spots, setSpots] = useState([]);
  const [filterTag, setFilterTag] = useState('Todos');
  const theme = useTheme();

  // Carga de datos
  useEffect(() => {
    const u = onSnapshot(collection(db, "trips", tripId, "spots"), (s) => {
      const loaded = s.docs.map(d => ({ id: d.id, ...d.data() }));
      loaded.sort((a, b) => (a.order || 0) - (b.order || 0));
      setSpots(loaded);
    });
    return u;
  }, [tripId]);

  const allTags = ['Todos', ...new Set(spots.flatMap(s => s.tags || []).map(t => t.trim()))];
  const filteredSpots = filterTag === 'Todos' ? spots : spots.filter(s => s.tags?.includes(filterTag));

  const CATEGORY_ORDER = ['Comida', 'Visita', 'Super', 'Gasolina', 'Salud', 'Otro'];
  const groupedSpots = filteredSpots.reduce((groups, spot) => { const category = spot.category || 'Otro'; if (!groups[category]) groups[category] = []; groups[category].push(spot); return groups; }, {});

  const getCategoryConfig = (cat) => { switch (cat) { case 'Comida': return { icon: <RestaurantIcon />, label: '🍔 Comida', ...theme.palette.custom.food }; case 'Super': return { icon: <ShoppingCartIcon />, label: '🛒 Supermercado', ...theme.palette.custom.place }; case 'Gasolina': return { icon: <LocalGasStationIcon />, label: '⛽ Gasolinera', ...theme.palette.custom.transport }; case 'Visita': return { icon: <CameraAltIcon />, label: '📷 Turismo', ...theme.palette.custom.place }; case 'Salud': return { icon: <LocalHospitalIcon />, label: '🏥 Salud', bg: theme.palette.mode === 'light' ? '#FFDAD6' : '#411616', color: theme.palette.mode === 'light' ? '#410002' : '#ffb4ab', border: theme.palette.mode === 'light' ? '#FFB4AB' : '#691d1d' }; default: return { icon: <StarIcon />, label: '⭐ Otros', ...theme.palette.custom.place }; } };
  const handleDeleteSpot = async (id) => { if (confirm("¿Borrar sitio?")) await deleteDoc(doc(db, "trips", tripId, "spots", id)); };

  // Sensores DND
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEndSpot = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const activeSpot = spots.find(s => s.id === active.id);
    const overSpot = spots.find(s => s.id === over.id);
    if (!activeSpot || !overSpot || activeSpot.category !== overSpot.category) return;
    const category = activeSpot.category || 'Otro';
    const categorySpots = spots.filter(s => (s.category || 'Otro') === category).sort((a, b) => (a.order || 0) - (b.order || 0));
    const oldIndex = categorySpots.findIndex(s => s.id === active.id);
    const newIndex = categorySpots.findIndex(s => s.id === over.id);
    const reorderedCategorySpots = arrayMove(categorySpots, oldIndex, newIndex);
    const batch = writeBatch(db);
    reorderedCategorySpots.forEach((spot, index) => { const ref = doc(db, "trips", tripId, "spots", spot.id); batch.update(ref, { order: index }); });
    await batch.commit();
  };

  const isDndEnabled = isEditMode && filterTag === 'Todos';

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndSpot}>
      <Box pb={12} pt={2}>
        {/* FILTROS DE ETIQUETAS */}
        <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 2, px: 2, '&::-webkit-scrollbar': { display: 'none' } }}>
          {allTags.map(tag => (
            <Chip key={tag} label={tag} onClick={() => setFilterTag(tag)}
              sx={{ bgcolor: filterTag === tag ? theme.palette.custom.filterActive.bg : (theme.palette.mode === 'light' ? '#FDFDFD' : 'background.paper'), color: filterTag === tag ? theme.palette.custom.filterActive.color : 'text.secondary', fontWeight: 600, border: '1px solid', borderColor: 'divider' }} />
          ))}
        </Box>

        <Container maxWidth="sm">
          {CATEGORY_ORDER.map(catName => {
            const catSpots = groupedSpots[catName];
            if (!catSpots || catSpots.length === 0) return null;
            const config = getCategoryConfig(catName);

            return (
              <Box key={catName} mb={3}>

                {/* WRAPPER GRIS (ESTILO GRUPO) */}
                <Paper
                  elevation={0}
                  sx={{
                    bgcolor: theme.palette.mode === 'light' ? '#F3F4F6' : '#1C1C1E',
                    borderRadius: '24px',
                    p: 1, // Padding compacto
                    overflow: 'hidden'
                  }}
                >
                  {/* CABECERA DE CATEGORÍA */}
                  <Typography variant="h6" sx={{ color: config.color, ml: 1, mb: 1, mt: 0.5, fontWeight: 800, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 1 }}>
                    {config.label}
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, opacity: 0.5 }}>{catSpots.length}</Typography>
                  </Typography>

                  <SortableContext items={catSpots.map(s => s.id)} strategy={verticalListSortingStrategy} disabled={!isDndEnabled}>
                    <Stack spacing={0.8}> {/* Espaciado compacto */}
                      {catSpots.map(spot => (
                        <SortableItem key={spot.id} id={spot.id} disabled={!isDndEnabled}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                              <Card sx={{
                                bgcolor: 'background.paper',
                                minHeight: isEditMode ? '72px' : 'auto', // Altura compacta
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                transform: isEditMode ? 'scale(0.98)' : 'none',
                                border: isEditMode ? `1px dashed ${theme.palette.primary.main}` : 'none',
                                cursor: isDndEnabled ? 'grab' : 'default',
                                display: 'flex',
                                alignItems: 'center',
                                borderRadius: '16px', // Bordes a juego
                                boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                              }}>
                                {/* AQUI ESTABA EL ERROR: Usamos Box, no CardContent */}
                                <Box sx={{ p: 1.2, display: 'flex', gap: 1.2, alignItems: 'center', width: '100%' }}>
                                  {/* ICONO COMPACTO (36px) */}
                                  <Box sx={{ width: 36, height: 36, bgcolor: config.bg, color: config.color, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
                                    {React.cloneElement(config.icon, { sx: { fontSize: 20 } })}
                                  </Box>

                                  <Box flexGrow={1} minWidth={0}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="start">
                                      <Typography variant="subtitle2" fontWeight="700" color="text.primary" lineHeight={1.2}>{spot.name}</Typography>
                                      {!isEditMode && spot.mapsLink && (<IconButton size="small" sx={{ color: config.color, opacity: 0.8, p: 0.5, mt: -0.5 }} onClick={() => window.open(spot.mapsLink, '_blank')}><DirectionsIcon sx={{ fontSize: 18 }} /></IconButton>)}
                                    </Stack>

                                    {spot.description && <Typography variant="body2" sx={{ opacity: 0.8, fontSize: '0.75rem', color: 'text.secondary', mt: 0.2 }} noWrap>{spot.description}</Typography>}

                                    <Stack direction="row" gap={0.5} mt={0.5} flexWrap="wrap">
                                      {spot.tags?.map(tag => <Chip key={tag} label={`#${tag}`} size="small" sx={{ height: 18, fontSize: '0.6rem', bgcolor: 'action.hover', border: 'none', '& .MuiChip-label': { px: 1, py: 0 } }} />)}
                                    </Stack>
                                  </Box>
                                </Box>
                              </Card>
                            </Box>

                            {isEditMode && (
                              <Stack direction="column" spacing={0.5} justifyContent="center" alignItems="center">
                                <IconButton onClick={() => onEdit(spot)} sx={{ bgcolor: 'white', color: 'primary.main', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', width: 32, height: 32 }}><EditIcon sx={{ fontSize: 18 }} /></IconButton>
                                <IconButton onClick={() => handleDeleteSpot(spot.id)} sx={{ bgcolor: '#FFEBEE', color: '#D32F2F', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', width: 32, height: 32 }}><DeleteForeverIcon sx={{ fontSize: 18 }} /></IconButton>
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
          })}
        </Container>
        <Fab variant="extended" color="secondary" onClick={openCreateSpot} sx={{ position: 'fixed', bottom: 100, right: 24, zIndex: 10 }}><AddIcon sx={{ mr: 1 }} /> Sitio</Fab>
      </Box>
    </DndContext>
  );
}
function ExpensesView({ trip, tripId, userEmail }) {
  const [expenses, setExpenses] = useState([]);
  const [openExpenseModal, setOpenExpenseModal] = useState(false);
  const [openAliasModal, setOpenAliasModal] = useState(false);
  const [openSettleModal, setOpenSettleModal] = useState(false);
  const [newExpense, setNewExpense] = useState({
    title: "",
    amount: "",
    payer: userEmail,
    date: dayjs().format("YYYY-MM-DD"),
  });
  const [splitType, setSplitType] = useState("equal");
  const [manualShares, setManualShares] = useState({});
  const [aliases, setAliases] = useState({});
  const [settleData, setSettleData] = useState({
    debtor: "",
    creditor: "",
    amount: 0,
  });
  const [editingId, setEditingId] = useState(null);

  const theme = useTheme();
  const manualInputProps = useMemo(
    () => ({
      disableUnderline: true,
      style: {
        borderRadius: 8,
        backgroundColor: theme.palette.background.paper,
      },
      endAdornment: <InputAdornment position="end">€</InputAdornment>,
    }),
    [theme]
  );

  useEffect(() => {
    const q = query(
      collection(db, "trips", tripId, "expenses"),
      orderBy("date", "desc")
    );
    const u = onSnapshot(q, (s) =>
      setExpenses(s.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    return u;
  }, [tripId]);
  useEffect(() => {
    setAliases(trip.aliases || {});
  }, [trip]);
  const getName = (email) => aliases[email] || email.split("@")[0];

  const handleSaveAlias = async () => {
    await updateDoc(doc(db, "trips", tripId), { aliases: aliases });
    setOpenAliasModal(false);
  };
  const handleSaveExpense = async () => {
    if (!newExpense.title || !newExpense.amount) return;
    const amountFloat = parseFloat(newExpense.amount);
    let finalSplit = {};
    if (splitType === "equal") {
      const partCount = trip.participants.length;
      const share = amountFloat / partCount;
      trip.participants.forEach((p) => (finalSplit[p] = share));
    } else {
      const currentTotal = Object.values(manualShares).reduce(
        (a, b) => a + parseFloat(b || 0),
        0
      );
      if (Math.abs(currentTotal - amountFloat) > 0.05) {
        alert(`Error suma manual`);
        return;
      }
      trip.participants.forEach(
        (p) => (finalSplit[p] = parseFloat(manualShares[p] || 0))
      );
    }
    const expenseData = {
      ...newExpense,
      amount: amountFloat,
      split: finalSplit,
      createdAt: new Date(),
    };
    if (editingId) {
      const { createdAt, ...dataToUpdate } = expenseData;
      await updateDoc(
        doc(db, "trips", tripId, "expenses", editingId),
        dataToUpdate
      );
    } else {
      await addDoc(collection(db, "trips", tripId, "expenses"), expenseData);
    }
    setOpenExpenseModal(false);
    setNewExpense({
      title: "",
      amount: "",
      payer: userEmail,
      date: dayjs().format("YYYY-MM-DD"),
    });
    setSplitType("equal");
    setEditingId(null);
    setManualShares({});
  };
  const handleOpenEdit = (exp) => {
    setEditingId(exp.id);
    setNewExpense({
      title: exp.title,
      amount: exp.amount,
      payer: exp.payer,
      date: exp.date,
    });
    if (exp.split) {
      const values = Object.values(exp.split);
      const isAllEqual = values.every((v) => Math.abs(v - values[0]) < 0.01);
      if (isAllEqual) {
        setSplitType("equal");
        setManualShares({});
      } else {
        setSplitType("manual");
        setManualShares(exp.split);
      }
    } else {
      setSplitType("equal");
    }
    setOpenExpenseModal(true);
  };
  const handleOpenCreate = () => {
    setEditingId(null);
    setNewExpense({
      title: "",
      amount: "",
      payer: userEmail,
      date: dayjs().format("YYYY-MM-DD"),
    });
    setSplitType("equal");
    setManualShares({});
    setOpenExpenseModal(true);
  };
  const handleManualShareChange = (email, value) => {
    setManualShares((prev) => ({ ...prev, [email]: value }));
  };
  const handleSettleUp = async () => {
    const splitData = {};
    splitData[settleData.creditor] = parseFloat(settleData.amount);
    trip.participants.forEach((p) => {
      if (p !== settleData.creditor) splitData[p] = 0;
    });
    await addDoc(collection(db, "trips", tripId, "expenses"), {
      title: "REEMBOLSO",
      amount: parseFloat(settleData.amount),
      payer: settleData.debtor,
      date: dayjs().format("YYYY-MM-DD"),
      split: splitData,
      isReimbursement: true,
      createdAt: new Date(),
    });
    setOpenSettleModal(false);
  };
  const openPayModal = (debtor, amount) => {
    setSettleData({
      debtor: debtor,
      creditor: "",
      amount: Math.abs(amount).toFixed(2),
    });
    setOpenSettleModal(true);
  };
  const handleDelete = async (id) => {
    if (confirm("¿Eliminar gasto?"))
      await deleteDoc(doc(db, "trips", tripId, "expenses", id));
  };
  const { total, balances } = useMemo(() => {
    if (!trip.participants || trip.participants.length === 0)
      return { total: 0, balances: {} };
    let totalSpent = 0;
    const bals = {};
    trip.participants.forEach((p) => (bals[p] = 0));
    expenses.forEach((e) => {
      if (!e.isReimbursement) totalSpent += e.amount || 0;
      if (bals[e.payer] !== undefined) bals[e.payer] += e.amount || 0;
      if (e.split) {
        Object.keys(e.split).forEach((person) => {
          if (bals[person] !== undefined) bals[person] -= e.split[person];
        });
      } else {
        const share = e.amount / trip.participants.length;
        trip.participants.forEach((p) => (bals[p] -= share));
      }
    });
    return { total: totalSpent, balances: bals };
  }, [expenses, trip.participants]);
  const sortedExpenses = useMemo(() => {
    return [...expenses].sort((a, b) => {
      const dateA = dayjs(a.date);
      const dateB = dayjs(b.date);
      if (dateA.isAfter(dateB)) return -1;
      if (dateA.isBefore(dateB)) return 1;
      return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
    });
  }, [expenses]);
  const formatMoney = (amount) =>
    new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(amount);

  const greenBg = theme.palette.mode === "dark" ? "#1b3320" : "#E8F5E9";
  const redBg = theme.palette.mode === "dark" ? "#3e1a1a" : "#FFEBEE";
  const greenText = theme.palette.mode === "dark" ? "#81c784" : "#2E7D32";
  const redText = theme.palette.mode === "dark" ? "#e57373" : "#C62828";

  return (
    <Box pb={12} pt={2}>
      <Container maxWidth="sm">
        <Card
          sx={{
            mb: 3,
            borderRadius: "16px",
            bgcolor: "primary.main",
            color: "primary.contrastText",
            boxShadow: "none",
          }}
        >
          <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, opacity: 0.9 }}
              >
                TOTAL VIAJE
              </Typography>
              <Box textAlign="right">
                <Typography variant="h6" fontWeight="700" lineHeight={1}>
                  {formatMoney(total)}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  ({formatMoney(total / (trip.participants?.length || 1))}/p)
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={1}
        >
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 700, ml: 1, color: "text.primary" }}
          >
            Balances
          </Typography>
          <IconButton
            size="small"
            onClick={() => setOpenAliasModal(true)}
            sx={{ bgcolor: "action.hover" }}
          >
            <SettingsSuggestIcon fontSize="small" />
          </IconButton>
        </Stack>
        <Stack spacing={1} mb={4}>
          {trip.participants &&
            trip.participants.map((p) => {
              const bal = balances[p] || 0;
              const isPositive = bal >= 0;
              return (
                <Card
                  key={p}
                  sx={{
                    borderRadius: "12px",
                    bgcolor: "background.paper",
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  {" "}
                  <Box
                    p={1.5}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    {" "}
                    <Stack direction="row" gap={1.5} alignItems="center">
                      {" "}
                      <Avatar
                        sx={{
                          width: 28,
                          height: 28,
                          bgcolor: isPositive ? greenBg : redBg,
                          color: isPositive ? greenText : redText,
                          fontSize: "0.8rem",
                          fontWeight: 700,
                        }}
                      >
                        {getName(p).charAt(0).toUpperCase()}
                      </Avatar>{" "}
                      <Box>
                        {" "}
                        <Typography
                          variant="body2"
                          fontWeight="600"
                          lineHeight={1.1}
                          color="text.primary"
                        >
                          {getName(p)}
                        </Typography>{" "}
                        <Typography
                          variant="caption"
                          sx={{
                            color: isPositive ? greenText : redText,
                            fontWeight: 700,
                          }}
                        >
                          {isPositive ? "Le deben " : "Debe "}
                          {formatMoney(Math.abs(bal))}
                        </Typography>{" "}
                      </Box>{" "}
                    </Stack>{" "}
                    {!isPositive && Math.abs(bal) > 0.01 && (
                      <Button
                        size="small"
                        startIcon={<HandshakeIcon sx={{ fontSize: 14 }} />}
                        onClick={() => openPayModal(p, bal)}
                        sx={{
                          bgcolor: redBg,
                          color: redText,
                          fontSize: "0.7rem",
                          px: 1,
                          py: 0.2,
                          minWidth: 0,
                          borderRadius: "8px",
                        }}
                      >
                        Pagar
                      </Button>
                    )}{" "}
                  </Box>{" "}
                </Card>
              );
            })}
        </Stack>
        <Typography
          variant="subtitle1"
          sx={{ mb: 1.5, fontWeight: 700, ml: 1, color: "text.primary" }}
        >
          Movimientos
        </Typography>
        {sortedExpenses.length === 0 && (
          <Typography
            color="text.secondary"
            textAlign="center"
            mt={4}
            fontSize="0.9rem"
          >
            No hay gastos recientes.
          </Typography>
        )}
        {sortedExpenses.map((exp) => {
          const isReimbursement = exp.isReimbursement;
          const bgCard = isReimbursement
            ? theme.palette.mode === "dark"
              ? "#122619"
              : "#F1F8E9"
            : "background.paper";
          const borderCard = isReimbursement
            ? theme.palette.mode === "dark"
              ? "#1D4028"
              : "#C8E6C9"
            : "none";
          const iconBg = isReimbursement
            ? theme.palette.mode === "dark"
              ? "#1b4d24"
              : "#DCEDC8"
            : "action.selected";
          const textColor = isReimbursement
            ? theme.palette.mode === "dark"
              ? "#a5d6a7"
              : "success.main"
            : "text.primary";

          return (
            <Card
              key={exp.id}
              sx={{
                mb: 1,
                borderRadius: "12px",
                bgcolor: bgCard,
                border: isReimbursement ? `1px solid ${borderCard}` : "none",
              }}
            >
              {" "}
              <Box p={1.5} display="flex" gap={1.5} alignItems="center">
                {" "}
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "10px",
                    bgcolor: iconBg,
                    color: isReimbursement ? textColor : "inherit",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {" "}
                  {isReimbursement ? (
                    <HandshakeIcon sx={{ fontSize: 18 }} />
                  ) : (
                    <Typography fontSize="1rem">💸</Typography>
                  )}{" "}
                </Box>{" "}
                <Box flexGrow={1}>
                  {" "}
                  <Typography
                    variant="body2"
                    fontWeight="700"
                    lineHeight={1.2}
                    color={textColor}
                  >
                    {exp.title}
                  </Typography>{" "}
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", lineHeight: 1.1 }}
                  >
                    {isReimbursement ? "De" : "Por"} {getName(exp.payer)} •{" "}
                    {dayjs(exp.date).format("D MMM")}
                  </Typography>{" "}
                  {exp.split &&
                    !isReimbursement &&
                    !Object.values(exp.split).every(
                      (v) =>
                        Math.abs(
                          v - exp.amount / Object.keys(exp.split).length
                        ) < 0.01
                    ) && (
                      <Typography
                        variant="caption"
                        sx={{
                          display: "block",
                          color: "primary.main",
                          fontSize: "0.65rem",
                        }}
                      >
                        Reparto manual
                      </Typography>
                    )}{" "}
                </Box>{" "}
                <Box textAlign="right">
                  {" "}
                  <Typography
                    variant="body2"
                    fontWeight="700"
                    color={textColor}
                  >
                    {formatMoney(exp.amount)}
                  </Typography>{" "}
                  <Stack
                    direction="row"
                    justifyContent="flex-end"
                    alignItems="center"
                  >
                    {" "}
                    <IconButton
                      size="small"
                      onClick={() => handleOpenEdit(exp)}
                      sx={{ p: 0.5, mt: 0, color: "text.secondary" }}
                    >
                      <EditIcon sx={{ fontSize: 16 }} />
                    </IconButton>{" "}
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(exp.id)}
                      sx={{ p: 0.5, mt: 0, color: "text.secondary" }}
                    >
                      <DeleteForeverIcon sx={{ fontSize: 16 }} />
                    </IconButton>{" "}
                  </Stack>{" "}
                </Box>{" "}
              </Box>{" "}
            </Card>
          );
        })}
      </Container>
      <Fab
        variant="extended"
        onClick={handleOpenCreate}
        sx={{
          position: "fixed",
          bottom: 100,
          right: 24,
          zIndex: 10,
          bgcolor: "secondary.main",
          color: "secondary.contrastText",
          boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
        }}
      >
        {" "}
        <AddIcon sx={{ mr: 1, fontSize: 20 }} /> Gasto{" "}
      </Fab>
      <Dialog
        open={openExpenseModal}
        onClose={() => setOpenExpenseModal(false)}
        fullWidth
        maxWidth="xs"
      >
        {" "}
        <DialogTitle sx={{ fontWeight: 700, textAlign: "center" }}>
          {editingId ? "Editar Gasto" : "Añadir Gasto"}
        </DialogTitle>{" "}
        <DialogContent>
          {" "}
          <Stack spacing={2} mt={1}>
            {" "}
            <TextField
              label="Concepto"
              fullWidth
              variant="filled"
              InputProps={{ disableUnderline: true }}
              value={newExpense.title}
              onChange={(e) =>
                setNewExpense({ ...newExpense, title: e.target.value })
              }
            />{" "}
            <TextField
              label="Cantidad Total"
              type="number"
              fullWidth
              variant="filled"
              InputProps={{
                disableUnderline: true,
                startAdornment: (
                  <InputAdornment position="start">€</InputAdornment>
                ),
              }}
              value={newExpense.amount}
              onChange={(e) =>
                setNewExpense({ ...newExpense, amount: e.target.value })
              }
            />{" "}
            <FormControl fullWidth variant="filled">
              {" "}
              <InputLabel
                disableAnimation
                shrink={true}
                sx={{ position: "relative", left: -12, top: 10, mb: 1 }}
              >
                Pagado por
              </InputLabel>{" "}
              <Select
                value={newExpense.payer}
                onChange={(e) =>
                  setNewExpense({ ...newExpense, payer: e.target.value })
                }
                disableUnderline
                variant="filled"
                sx={{ borderRadius: 2, bgcolor: "action.hover", mt: 0 }}
              >
                {" "}
                {trip.participants &&
                  trip.participants.map((p) => (
                    <MenuItem key={p} value={p}>
                      {getName(p)}
                    </MenuItem>
                  ))}{" "}
              </Select>{" "}
            </FormControl>{" "}
            <ToggleButtonGroup
              value={splitType}
              exclusive
              onChange={(e, val) => {
                if (val) setSplitType(val);
              }}
              fullWidth
              sx={{ mt: 1 }}
            >
              {" "}
              <ToggleButton value="equal">
                <GroupIcon sx={{ mr: 1, fontSize: 18 }} /> Iguales
              </ToggleButton>{" "}
              <ToggleButton value="manual">
                <PlaylistAddCheckIcon sx={{ mr: 1, fontSize: 18 }} /> Manual
              </ToggleButton>{" "}
            </ToggleButtonGroup>{" "}
            {splitType === "manual" && (
              <Box sx={{ bgcolor: "action.hover", p: 2, borderRadius: 3 }}>
                {" "}
                <Typography
                  variant="caption"
                  sx={{
                    mb: 1,
                    display: "block",
                    fontWeight: 600,
                    color: "text.secondary",
                  }}
                >
                  Distribuir {newExpense.amount || 0}€:
                </Typography>{" "}
                {trip.participants &&
                  trip.participants.map((p) => (
                    <Box
                      key={p}
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      mb={1}
                    >
                      {" "}
                      <Typography variant="body2" noWrap sx={{ width: "40%" }}>
                        {getName(p)}
                      </Typography>{" "}
                      <TextField
                        type="number"
                        variant="filled"
                        size="small"
                        hiddenLabel
                        InputProps={manualInputProps}
                        value={manualShares[p] ?? ""}
                        onChange={(e) =>
                          handleManualShareChange(p, e.target.value)
                        }
                        sx={{ width: "50%" }}
                      />{" "}
                    </Box>
                  ))}{" "}
              </Box>
            )}{" "}
            <TextField
              type="date"
              label="Fecha"
              fullWidth
              variant="filled"
              InputProps={{ disableUnderline: true }}
              value={newExpense.date}
              onChange={(e) =>
                setNewExpense({ ...newExpense, date: e.target.value })
              }
            />{" "}
          </Stack>{" "}
        </DialogContent>{" "}
        <DialogActions sx={{ p: 3, justifyContent: "center" }}>
          {" "}
          <Button
            onClick={() => setOpenExpenseModal(false)}
            sx={{ color: "text.secondary" }}
          >
            Cancelar
          </Button>{" "}
          <Button
            variant="contained"
            onClick={handleSaveExpense}
            sx={{
              bgcolor: "primary.main",
              color: "white",
              borderRadius: "50px",
              px: 4,
            }}
          >
            Guardar
          </Button>{" "}
        </DialogActions>{" "}
      </Dialog>
      <Dialog
        open={openAliasModal}
        onClose={() => setOpenAliasModal(false)}
        fullWidth
        maxWidth="xs"
      >
        {" "}
        <DialogTitle sx={{ fontWeight: 700 }}>Nombres / Alias</DialogTitle>{" "}
        <DialogContent>
          {" "}
          <Stack spacing={2} mt={1}>
            {" "}
            {trip.participants &&
              trip.participants.map((email) => (
                <TextField
                  key={email}
                  label={email}
                  variant="filled"
                  size="small"
                  InputProps={{
                    disableUnderline: true,
                    style: { borderRadius: 12 },
                  }}
                  value={aliases[email] || ""}
                  onChange={(e) =>
                    setAliases({ ...aliases, [email]: e.target.value })
                  }
                  placeholder={email.split("@")[0]}
                />
              ))}{" "}
          </Stack>{" "}
        </DialogContent>{" "}
        <DialogActions sx={{ p: 2 }}>
          {" "}
          <Button
            onClick={() => setOpenAliasModal(false)}
            sx={{ color: "text.secondary" }}
          >
            Cancelar
          </Button>{" "}
          <Button
            onClick={handleSaveAlias}
            variant="contained"
            sx={{ bgcolor: "primary.main", color: "white" }}
          >
            Guardar
          </Button>{" "}
        </DialogActions>{" "}
      </Dialog>
      <Dialog
        open={openSettleModal}
        onClose={() => setOpenSettleModal(false)}
        fullWidth
        maxWidth="xs"
      >
        {" "}
        <DialogTitle sx={{ fontWeight: 700 }}>Saldar Deuda</DialogTitle>{" "}
        <DialogContent>
          {" "}
          <Stack spacing={2} mt={1}>
            {" "}
            <TextField
              label="Quién paga"
              fullWidth
              variant="filled"
              disabled
              value={getName(settleData.debtor)}
              InputProps={{ disableUnderline: true }}
            />{" "}
            <FormControl fullWidth variant="filled">
              {" "}
              <InputLabel shrink>Para quién</InputLabel>{" "}
              <Select
                value={settleData.creditor}
                onChange={(e) =>
                  setSettleData({ ...settleData, creditor: e.target.value })
                }
                disableUnderline
                displayEmpty
                sx={{ borderRadius: 2, bgcolor: "action.hover" }}
              >
                {" "}
                <MenuItem value="" disabled>
                  Selecciona al receptor
                </MenuItem>{" "}
                {trip.participants &&
                  trip.participants
                    .filter((p) => balances[p] > 0)
                    .map((p) => (
                      <MenuItem key={p} value={p}>
                        {getName(p)} (Le deben {formatMoney(balances[p])})
                      </MenuItem>
                    ))}{" "}
              </Select>{" "}
            </FormControl>{" "}
            <TextField
              label="Cantidad"
              type="number"
              fullWidth
              variant="filled"
              InputProps={{
                disableUnderline: true,
                startAdornment: (
                  <InputAdornment position="start">€</InputAdornment>
                ),
              }}
              value={settleData.amount}
              onChange={(e) =>
                setSettleData({ ...settleData, amount: e.target.value })
              }
            />{" "}
          </Stack>{" "}
        </DialogContent>{" "}
        <DialogActions sx={{ p: 2 }}>
          {" "}
          <Button
            onClick={() => setOpenSettleModal(false)}
            sx={{ color: "text.secondary" }}
          >
            Cancelar
          </Button>{" "}
          <Button
            onClick={handleSettleUp}
            variant="contained"
            disabled={!settleData.creditor || !settleData.amount}
            color="success"
            sx={{ color: "white" }}
          >
            Registrar Pago
          </Button>{" "}
        </DialogActions>{" "}
      </Dialog>
    </Box>
  );
}

// --- DETALLE VIAJE (REORDENACIÓN + EDICIÓN SITIOS) ---
function TripDetailScreen() {
  const [isSavingSpot, setIsSavingSpot] = useState(false);
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [currentView, setCurrentView] = useState(0);
  const [items, setItems] = useState([]);
  const [caching, setCaching] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [editNotesOpen, setEditNotesOpen] = useState(false);
  const [tripNotes, setTripNotes] = useState("");
  const [openItemModal, setOpenItemModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [newItem, setNewItem] = useState({
    type: "place",
    title: "",
    time: "10:00",
    mapsLink: "",
    description: "",
    flightNumber: "",
    terminal: "",
    gate: "",
  });
  const [files, setFiles] = useState([]);
  const [existingAttachments, setExistingAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  // Estado para saber si la tarjeta de notas está expandida o comprimida
  const [isNotesExpanded, setIsNotesExpanded] = useState(false);

  //Wallet
  const [openWallet, setOpenWallet] = useState(false);
  // SPOT STATE UPDATED
  const [openSpotModal, setOpenSpotModal] = useState(false);
  const [newSpot, setNewSpot] = useState({
    name: "",
    category: "Comida",
    description: "",
    mapsLink: "",
    tags: "",
  });
  const [editingSpotId, setEditingSpotId] = useState(null);
  const [isEditModeSpots, setIsEditModeSpots] = useState(false);

  const [isReorderMode, setIsReorderMode] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    const u = onSnapshot(doc(db, "trips", tripId), (d) => {
      if (d.exists()) {
        setTrip({ id: d.id, ...d.data() });
        setTripNotes(d.data().notes || "");
      }
    });
    return u;
  }, [tripId]);
  // Busca este useEffect en TripDetailScreen
  useEffect(() => {
    const u = onSnapshot(
      query(
        collection(db, "trips", tripId, "items"),
        // CAMBIO AQUÍ: Usamos 'order' en vez de 'time'
        // Esto respeta tu Drag & Drop y evita que salten al editar
        orderBy("order", "asc")
      ),
      (s) => setItems(s.docs.map(d => ({ id: d.id, ...d.data() })))
    );
    return u;
  }, [tripId]);

  const openCreate = (date) => {
    setNewItem({
      type: 'place',
      title: '',
      time: '10:00',
      mapsLink: '',
      description: '',
      flightNumber: '',
      terminal: '',
      gate: '',
      origin: '',      // <--- AÑADIR ESTO
      destination: ''  // <--- AÑADIR ESTO
    });
    setFiles([]);
    setExistingAttachments([]);
    setSelectedDate(date);
    setIsEditing(false);
    setOpenItemModal(true);
  };
  const openEdit = (item) => {
    setNewItem({ ...item });
    setSelectedDate(item.date);
    const old = item.attachments || [];
    if (item.pdfUrl) old.push({ name: "Adjunto", url: item.pdfUrl });
    setExistingAttachments(old);
    setFiles([]);
    setEditingId(item.id);
    setIsEditing(true);
    setOpenItemModal(true);
  };

  const handleOpenCreateSpot = () => {
    setEditingSpotId(null);
    setNewSpot({
      name: "",
      category: "Comida",
      description: "",
      mapsLink: "",
      tags: "",
    });
    setOpenSpotModal(true);
  };
  const handleOpenEditSpot = (spot) => {
    setEditingSpotId(spot.id);
    setNewSpot({
      name: spot.name,
      category: spot.category || "Comida",
      description: spot.description || "",
      mapsLink: spot.mapsLink || "",
      tags: spot.tags ? spot.tags.join(", ") : "",
    });
    setOpenSpotModal(true);
  };

  // Helper para leer enlaces cortos (VERSIÓN 2: USANDO ALLORIGINS)

  // Helper robusto para leer enlaces cortos
  // Helper robusto con "Rueda de Repuesto" (Multi-proxy)

  const resolveShortLink = async (url) => {
    // Lista de proxies gratuitos para probar en orden
    const proxies = [
      // Opción A: CorsProxy (El que tenías)
      (u) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
      // Opción B: CodeTabs (La rueda de repuesto)
      (u) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`,
    ];

    for (const createProxyUrl of proxies) {
      try {
        const proxyUrl = createProxyUrl(url);
        console.log("Probando proxy:", proxyUrl); // Para depurar

        const response = await fetch(proxyUrl);

        // Si este proxy falla (502, 403, etc), saltamos al siguiente del bucle
        if (!response.ok) continue;

        const html = await response.text();

        // Buscamos la URL REAL en la etiqueta meta og:url
        const metaRegex =
          /content="(https:\/\/www\.google\.com\/maps\/place\/[^"]+)"/;
        const match = html.match(metaRegex);

        if (match && match[1]) {
          const longUrl = match[1];

          // Intentamos extraer coordenadas de la URL larga recuperada
          // Formato preciso !3d...!4d...
          const pinMatch = longUrl.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
          if (pinMatch)
            return {
              lat: parseFloat(pinMatch[1]),
              lng: parseFloat(pinMatch[2]),
            };

          // Formato standard @lat,lng
          const viewMatch = longUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
          if (viewMatch)
            return {
              lat: parseFloat(viewMatch[1]),
              lng: parseFloat(viewMatch[2]),
            };
        }
      } catch (e) {
        console.warn("Un proxy falló, probando el siguiente...");
      }
    }

    // Si llegamos aquí, es que todos los proxies fallaron
    return null;
  };

  // Función maestra de coordenadas (ahora es ASYNC)
  const getCoords = async (url) => {
    if (!url) return null;

    // Si es enlace corto, llamamos a la función de arriba
    if (url.includes("goo.gl") || url.includes("maps.app.goo.gl")) {
      return await resolveShortLink(url);
    }

    // ... el resto de validaciones para enlaces largos que ya tenías ...
    const pinMatch = url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
    if (pinMatch)
      return { lat: parseFloat(pinMatch[1]), lng: parseFloat(pinMatch[2]) };

    const viewMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (viewMatch)
      return { lat: parseFloat(viewMatch[1]), lng: parseFloat(viewMatch[2]) };

    const qMatch = url.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (qMatch)
      return { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) };

    return null;
  };
  // 1. NUEVA FUNCIÓN MEJORADA PARA EXTRAER COORDENADAS
  const extractCoordsFromLink = (url) => {
    if (!url) return null;

    try {
      // CASO 1: Formato "Data" (El más preciso para pines exactos)
      // Ej: .../place/Sitio/.../data=!3d40.416!4d-3.703
      const pinRegex = /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/;
      const pinMatch = url.match(pinRegex);
      if (pinMatch)
        return { lat: parseFloat(pinMatch[1]), lng: parseFloat(pinMatch[2]) };

      // CASO 2: Formato "Viewport" (El clásico con @)
      // Ej: google.com/maps/@40.416,-3.703,15z
      const viewRegex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
      const viewMatch = url.match(viewRegex);
      if (viewMatch)
        return { lat: parseFloat(viewMatch[1]), lng: parseFloat(viewMatch[2]) };

      // CASO 3: Formato "Query" (Búsqueda directa por lat,lng)
      // Ej: google.com/maps/search/?api=1&query=40.416,-3.703
      const qRegex = /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/;
      const qMatch = url.match(qRegex);
      if (qMatch)
        return { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) };

      // CASO 4: Enlaces móviles largos (cid) a veces redirigen, pero sin backend es difícil.
      // Si no coincide nada, devolvemos null.
    } catch (e) {
      console.error("Error parseando URL", e);
    }

    return null;
  };

  // 2. ACTUALIZAMOS EL GUARDADO (SOLO LINK, SIN BUSCAR POR NOMBRE)
  const handleSaveSpot = async () => {
    if (!newSpot.name) return;

    // Limpieza de etiquetas
    const tagsArray = newSpot.tags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t !== "");

    const spotData = {
      ...newSpot,
      tags: tagsArray,
      // Ya no guardamos lat/lng
    };

    if (editingSpotId) {
      await updateDoc(
        doc(db, "trips", tripId, "spots", editingSpotId),
        spotData
      );
    } else {
      await addDoc(collection(db, "trips", tripId, "spots"), {
        ...spotData,
        order: Date.now(),
      });
    }
    setOpenSpotModal(false);
  };
  const getTypeConfig = (type) => {
    switch (type) {
      case "flight":
        return {
          icon: <FlightTakeoffIcon fontSize="small" />,
          label: "Vuelo",
          ...theme.palette.custom.flight,
        };
      case "food":
        return {
          icon: <RestaurantIcon fontSize="small" />,
          label: "Comida",
          ...theme.palette.custom.food,
        };
      case "transport":
        return {
          icon: <DirectionsIcon fontSize="small" />,
          label: "Transporte",
          ...theme.palette.custom.transport,
        };
      default:
        return {
          icon: <LocationOnIcon fontSize="small" />,
          label: "Lugar",
          ...theme.palette.custom.place,
        };
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      // Configuración específica para móviles
      activationConstraint: {
        delay: 250, // Tienes que mantener pulsado 250ms para coger la tarjeta
        tolerance: 5, // Puedes mover el dedo 5px sin cancelar la espera
      },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const activeItem = items.find((i) => i.id === active.id);
    if (!activeItem) return;
    const date = activeItem.date;
    const itemsOfDay = items
      .filter((i) => i.date === date)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    const oldIndex = itemsOfDay.findIndex((i) => i.id === active.id);
    const newIndex = itemsOfDay.findIndex((i) => i.id === over.id);
    const reorderedItems = arrayMove(itemsOfDay, oldIndex, newIndex);
    setItems((prevItems) => {
      const otherItems = prevItems.filter((i) => i.date !== date);
      return [...otherItems, ...reorderedItems];
    });
    const batch = writeBatch(db);
    reorderedItems.forEach((item, index) => {
      const ref = doc(db, "trips", tripId, "items", item.id);
      batch.update(ref, { order: index });
    });
    await batch.commit();
  };
  const handleSaveItem = async () => {
    if (!newItem.title) return;
    setUploading(true);

    // Lógica de subida de archivos (se mantiene igual)
    let finalAttachments = [...existingAttachments];
    let token = sessionStorage.getItem('googleAccessToken');
    if (files.length > 0) {
      try {
        if (!token) throw new Error("TOKEN_EXPIRED");
        const rootId = await findOrCreateFolder("Viajes App", token);
        const tripIdFolder = await findOrCreateFolder(trip.title, token, rootId);
        for (const file of files) {
          const data = await uploadToGoogleDrive(file, token, tripIdFolder, trip.participants);
          finalAttachments.push({ name: file.name, url: data.webViewLink, fileId: data.id });
        }
      } catch (e) {
        alert("Error subida (Revisa login)");
        setUploading(false);
        return;
      }
    }

    // --- AQUÍ ESTÁ EL CAMBIO CLAVE ---

    // 1. Datos básicos del ítem
    const itemData = {
      ...newItem,
      date: selectedDate,
      attachments: finalAttachments,
      pdfUrl: null
    };

    if (isEditing) {
      // 2. MODO EDICIÓN: Guardamos SIN tocar 'order' ni 'createdAt'
      // Así se queda exactamente en la posición donde lo dejaste
      await updateDoc(doc(db, "trips", tripId, "items", editingId), itemData);
    } else {
      // 3. MODO CREACIÓN: Aquí sí añadimos 'order' para que vaya al final
      await addDoc(collection(db, "trips", tripId, "items"), {
        ...itemData,
        order: Date.now(),
        createdAt: new Date()
      });
    }

    setOpenItemModal(false);
    setUploading(false);
  };
  const handleSaveNotes = async () => {
    await updateDoc(doc(db, "trips", tripId), { notes: tripNotes });
    setEditNotesOpen(false);
  };
  const deleteAttachment = (index) => {
    const updated = [...existingAttachments];
    updated.splice(index, 1);
    setExistingAttachments(updated);
  };
  const handleCacheAll = async () => {
    if (!confirm(`¿Descargar Offline?`)) return;
    setCaching(true);
    try {
      let t = sessionStorage.getItem("googleAccessToken");
      if (!t) t = await getRefreshedToken();
      for (const item of items)
        if (item.attachments)
          for (const att of item.attachments)
            if (att.fileId)
              try {
                await cacheFileLocal(att.fileId, t);
              } catch (e) { }
      setShowToast(true);
      setRefreshTrigger((p) => p + 1);
    } catch (e) {
      alert("Error");
    }
    setCaching(false);
  };
  const openAttachment = async (att) => {
    // 1. PRIMERO INTENTAMOS ABRIR LA VERSIÓN LOCAL (OFFLINE)
    if (att.fileId) {
      const b = await getFileFromCache(att.fileId);
      if (b) return window.open(URL.createObjectURL(b));
    }

    // 2. SI NO EXISTE, ABRIMOS LA URL DE DRIVE INMEDIATAMENTE
    // (Para que el usuario no espere)
    window.open(att.url, '_blank');

    // 3. MAGIA: EN SEGUNDO PLANO, LO DESCARGAMOS PARA EL FUTURO
    if (att.fileId) {
      try {
        // Obtenemos token (silenciosamente si es posible)
        let t = sessionStorage.getItem('googleAccessToken');
        // Si no hay token, intentamos refrescarlo (puede pedir login si caducó hace mucho)
        if (!t) t = await getRefreshedToken();

        // Descargamos y guardamos en caché
        await cacheFileLocal(att.fileId, t);

        // Actualizamos la UI para que el chip se ponga verde (Check)
        setRefreshTrigger(prev => prev + 1);

        // Opcional: Mostrar un aviso discreto
        // console.log("Archivo guardado offline para la próxima");
      } catch (e) {
        console.warn("No se pudo auto-descargar en segundo plano", e);
      }
    }
  };
  const handleDeleteItem = async (id) => {
    if (confirm("¿Eliminar evento?"))
      await deleteDoc(doc(db, "trips", tripId, "items", id));
  };

  if (!trip)
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <CircularProgress />
      </Box>
    );
  let days = [];
  try {
    const s = trip.startDate ? dayjs(trip.startDate) : dayjs();
    const e = trip.endDate ? dayjs(trip.endDate) : s;
    for (let i = 0; i <= Math.max(0, e.diff(s, "day")); i++)
      days.push(s.add(i, "day").format("YYYY-MM-DD"));
  } catch (e) { }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default", pb: 10 }}>
        {/* --- NUEVO HEADER MODERNO CON EFECTO GLASS --- */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            // CAMBIO AQUÍ: Bajamos a 0.45 para que sea mucho más transparente
            bgcolor:
              theme.palette.mode === "light"
                ? "rgba(245, 247, 250, 0.45)"
                : "rgba(18, 18, 18, 0.45)",
            // CAMBIO AQUÍ: Subimos un poco el blur para que el texto siga siendo legible
            backdropFilter: "blur(24px)",
            borderBottom: `1px solid ${theme.palette.mode === "light"
                ? "rgba(0,0,0,0.05)"
                : "rgba(255,255,255,0.05)"
              }`,
            color: "text.primary",
            top: 0,
            zIndex: 1100,
          }}
        >
          <Toolbar sx={{ justifyContent: "space-between", py: 1 }}>
            {" "}
            {/* py:1 da un poco más de aire vertical */}
            {/* 1. BOTÓN ATRÁS (Circular y destacado) */}
            <IconButton
              onClick={() => navigate("/")}
              sx={{
                bgcolor:
                  theme.palette.mode === "light"
                    ? "#FFFFFF"
                    : "rgba(255,255,255,0.1)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                mr: 2,
                "&:hover": { bgcolor: theme.palette.action.hover },
              }}
            >
              <ArrowBackIcon fontSize="small" />
            </IconButton>
            {/* 2. TÍTULO Y LUGAR */}
            <Box sx={{ flexGrow: 1, overflow: "hidden" }}>
              {/* Título más grande y bold */}
              <Typography
                variant="h6"
                noWrap
                sx={{
                  fontWeight: 800,
                  fontSize: "1.1rem",
                  lineHeight: 1.2,
                  letterSpacing: "-0.02em",
                }}
              >
                {trip.title}
              </Typography>

              {/* Etiqueta de Lugar estilo "Pill" */}
              <Stack direction="row" alignItems="center" spacing={0.5} mt={0.5}>
                <Box
                  sx={{
                    bgcolor: theme.palette.custom.place.bg,
                    borderRadius: "6px",
                    px: 0.8,
                    py: 0.2,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <LocationOnIcon
                    sx={{
                      fontSize: 12,
                      color: theme.palette.custom.place.color,
                      mr: 0.5,
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      color: theme.palette.custom.place.color,
                    }}
                  >
                    {trip.place}
                  </Typography>
                </Box>
              </Stack>
            </Box>
            {/* 3. BOTONES DE ACCIÓN (Agrupados) */}
            <Stack direction="row" spacing={1}>
              {/* Botón MODO EDICIÓN (Unificado para Itinerario y Sitios) */}
              {(currentView === 0 || currentView === 1) && (
                <IconButton
                  onClick={() => currentView === 0 ? setIsReorderMode(!isReorderMode) : setIsEditModeSpots(!isEditModeSpots)}
                  sx={{
                    // 1. Si está activo (Modo Edición): Texto blanco. Si no: Color primario (Indigo)
                    color: (isReorderMode || isEditModeSpots) ? 'white' : 'primary.main',

                    // 2. Fondo: Blanco puro en reposo (para que resalte sobre el gris), Primario al activar
                    bgcolor: (isReorderMode || isEditModeSpots)
                      ? 'primary.main'
                      : (theme.palette.mode === 'light' ? '#FFFFFF' : 'rgba(255,255,255,0.1)'),

                    // 3. Sombras y bordes para que parezca un botón físico "clickable"
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    border: `1px solid ${theme.palette.mode === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)'}`,

                    '&:hover': {
                      bgcolor: (isReorderMode || isEditModeSpots)
                        ? 'primary.dark'
                        : (theme.palette.mode === 'light' ? '#F3F4F6' : 'rgba(255,255,255,0.2)')
                    }
                  }}
                >
                  {/* Lógica de Icono: Tick si está activo, Lápiz si está en reposo */}
                  {(isReorderMode || isEditModeSpots)
                    ? <CheckIcon fontSize="small" />
                    : <EditIcon fontSize="small" />
                  }
                </IconButton>
              )}
              {/* BOTÓN WALLET (SOLO VISIBLE SI HAY VUELOS O TRANSPORTE) */}
              {items.some(i => i.type === 'flight' || i.type === 'transport') && (
                <IconButton
                  onClick={() => setOpenWallet(true)}
                  sx={{
                    color: openWallet ? 'white' : 'secondary.main',
                    bgcolor: openWallet ? 'secondary.main' : (theme.palette.mode === 'light' ? '#FFFFFF' : 'rgba(255,255,255,0.1)'),
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    border: `1px solid ${theme.palette.mode === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)'}`,
                    '&:hover': { bgcolor: 'secondary.main', color: 'white' }
                  }}
                >
                  <ConfirmationNumberIcon fontSize="small" />
                </IconButton>
              )}
              {/* Botón Descargar */}
              <IconButton
                onClick={handleCacheAll}
                disabled={caching}
                sx={{
                  // 1. El icono se lleva el color protagonista (Primario vibrante)
                  color: caching ? "text.disabled" : theme.palette.primary.main,

                  // 2. El fondo se unifica con el botón de "Atrás" (Limpio y legible)
                  bgcolor:
                    theme.palette.mode === "light"
                      ? "#FFFFFF"
                      : "rgba(255,255,255,0.1)", // Gris cristal en modo oscuro

                  // 3. Le damos la misma sombra suave
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",

                  // 4. Hover suave
                  "&:hover": {
                    bgcolor:
                      theme.palette.mode === "light"
                        ? "#F3F4F6"
                        : "rgba(255,255,255,0.2)",
                  },
                }}
              >
                {caching ? (
                  <CircularProgress size={20} />
                ) : (
                  <CloudDownloadIcon fontSize="small" />
                )}
              </IconButton>
            </Stack>
          </Toolbar>
        </AppBar>

        {/* VISTAS */}
        {currentView === 0 && (
          <Container maxWidth="sm" sx={{ py: 2 }}>
            {/* --- NOTAS EXPANDIBLES (ACORDEÓN) --- */}
            <Card
              sx={{
                mb: 3,
                bgcolor: theme.palette.custom.note.bg, // Amarillo suave
                border: `1px solid ${theme.palette.custom.note.border}`,
                color: theme.palette.custom.note.titleColor,
                borderRadius: "24px", // Muy redondeado (Material Expressive)
                overflow: "hidden", // Necesario para que la animación no se salga
                transition: "all 0.3s ease",
                boxShadow: isNotesExpanded
                  ? "0 8px 20px rgba(0,0,0,0.05)"
                  : "none", // Sombra solo al abrir
              }}
            >
              {/* CABECERA (Siempre visible - Click para abrir/cerrar) */}
              <CardActionArea
                onClick={() => setIsNotesExpanded(!isNotesExpanded)}
                sx={{ px: 2.5, py: 1.5 }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Stack direction="row" gap={1.5} alignItems="center">
                    {/* Icono de Nota */}
                    <Box
                      sx={{
                        bgcolor: "rgba(255,255,255,0.5)",
                        p: 0.5,
                        borderRadius: "8px",
                        display: "flex",
                      }}
                    >
                      <StickyNote2Icon sx={{ fontSize: 20 }} />
                    </Box>
                    <Typography variant="subtitle2" fontWeight="700">
                      Notas del Viaje
                    </Typography>
                  </Stack>

                  {/* Icono de Flecha (Gira según estado) */}
                  <KeyboardArrowDownIcon
                    sx={{
                      transform: isNotesExpanded
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                      transition: "transform 0.3s",
                    }}
                  />
                </Stack>
              </CardActionArea>

              {/* CONTENIDO (Oculto - Se muestra al expandir) */}
              <Collapse in={isNotesExpanded}>
                <Divider
                  sx={{
                    borderColor: theme.palette.custom.note.border,
                    opacity: 0.5,
                  }}
                />
                <Box sx={{ p: 2.5, pt: 2 }}>
                  {/* El texto de la nota */}
                  <Typography
                    variant="body2"
                    sx={{
                      whiteSpace: "pre-line",
                      opacity: 0.9,
                      mb: 2,
                      lineHeight: 1.6,
                    }}
                  >
                    {trip.notes || "No hay notas guardadas aún."}
                  </Typography>

                  {/* Botón para Editar (Solo visible si está abierto) */}
                  <Button
                    size="small"
                    startIcon={<EditIcon sx={{ fontSize: 16 }} />}
                    onClick={() => setEditNotesOpen(true)}
                    sx={{
                      bgcolor: "rgba(255,255,255,0.6)",
                      color: theme.palette.custom.note.titleColor,
                      borderRadius: "12px",
                      textTransform: "none",
                      fontWeight: 700,
                      "&:hover": { bgcolor: "rgba(255,255,255,0.9)" },
                    }}
                  >
                    Editar contenido
                  </Button>
                </Box>
              </Collapse>
            </Card>

            {days.map((d, idx) => {
              const itemsOfDay = items.filter(i => i.date === d).sort((a, b) => (a.order || 0) - (b.order || 0));
              const isDayEmpty = itemsOfDay.length === 0;

              return (
                <Box key={d} mb={3}>

                  {/* EL WRAPPER GLOBAL (Gris) */}
                  <Paper
                    elevation={0}
                    sx={{
                      bgcolor: theme.palette.mode === 'light' ? '#F3F4F6' : '#1C1C1E',
                      borderRadius: '24px',
                      p: 1,
                      border: 'none',
                      overflow: 'hidden'
                    }}
                  >
                    {/* 1. CABECERA CON CHIP MORADO GRANDE */}
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5} pl={0.5} pr={0.5} pt={0.5}>

                      {/* AQUÍ ESTÁ EL CAMBIO: Todo el texto dentro del Chip Morado */}
                      <Chip
                        label={dayjs(d).format('dddd D [de] MMMM')}
                        sx={{
                          bgcolor: theme.palette.custom.dateChip.bg, // El morado de tu tema
                          color: theme.palette.custom.dateChip.color, // El texto (negro o oscuro)
                          fontWeight: 800,
                          fontSize: '0.9rem',
                          height: 36, // Un poco más alto para que tenga presencia
                          borderRadius: '12px', // Bordes suaves
                          textTransform: 'capitalize',
                          border: 'none',
                          px: 0.5,
                          boxShadow: '0 2px 4px rgba(0,0,0,0.05)' // Sombrita suave para elevarlo del gris
                        }}
                      />

                      {/* Botón Añadir */}
                      <IconButton
                        onClick={() => openCreate(d)}
                        size="small"
                        sx={{
                          bgcolor: theme.palette.mode === 'light' ? '#FFFFFF' : 'rgba(255,255,255,0.1)',
                          color: 'primary.main',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                          width: 32, height: 32,
                          '&:hover': { bgcolor: 'primary.main', color: 'white' }
                        }}
                      >
                        <AddIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Stack>

                    {/* 2. CONTENIDO (Igual que antes) */}
                    {isDayEmpty ? (
                      <Box
                        onClick={() => openCreate(d)}
                        sx={{
                          py: 3,
                          textAlign: 'center',
                          cursor: 'pointer',
                          borderRadius: '16px',
                          border: `2px dashed ${theme.palette.divider}`,
                          bgcolor: 'rgba(255,255,255,0.5)',
                          opacity: 0.6,
                          transition: '0.2s',
                          '&:hover': { opacity: 1, borderColor: 'primary.main' }
                        }}
                      >
                        <Typography variant="caption" fontWeight="700" color="text.secondary">Sin planes</Typography>
                      </Box>
                    ) : (
                      <SortableContext items={itemsOfDay.map(i => i.id)} strategy={verticalListSortingStrategy}>
                        <Stack spacing={0.8}>
                          {itemsOfDay.map((item, index) => {
                            const themeColor = theme.palette.custom?.[item.type] || theme.palette.custom.place;
                            const config = getTypeConfig(item.type);
                            const isFlight = item.type === 'flight';
                            const atts = item.attachments || [];
                            if (item.pdfUrl) atts.push({ name: 'Adjunto', url: item.pdfUrl });

                            const cardContent = (
                              <Card sx={{
                                bgcolor: 'background.paper',
                                overflow: 'hidden',
                                minHeight: isReorderMode ? '72px' : 'auto',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                transform: isReorderMode ? 'scale(0.98)' : 'none',
                                border: isReorderMode ? `1px dashed ${theme.palette.primary.main}` : 'none',
                                cursor: isReorderMode ? 'grab' : 'default',
                                display: 'flex',
                                alignItems: 'center',
                                borderRadius: '16px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                              }}>
                                <Box sx={{ p: 1.2, display: 'flex', gap: 1.2, alignItems: 'flex-start', width: '100%' }}>
                                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 36, pt: 0.5 }}>
                                    <Box sx={{ width: 36, height: 36, bgcolor: themeColor.bg, color: themeColor.color, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.05)', flexShrink: 0 }}>
                                      {React.cloneElement(config.icon, { sx: { fontSize: 20 } })}
                                    </Box>
                                    <Typography variant="caption" fontWeight="700" sx={{ mt: 0.3, color: 'text.secondary', fontSize: '0.65rem', lineHeight: 1 }}>{item.time}</Typography>
                                  </Box>
                                  <Box flexGrow={1} minWidth={0} pt={0.3}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="start">
                                      <Typography variant="subtitle2" fontWeight="700" lineHeight={1.2} sx={{ mb: 0.2, fontSize: '0.85rem', color: 'text.primary' }}>{item.title}</Typography>
                                      {!isReorderMode && (item.mapsLink || item.type === 'place') && (
                                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); const target = item.mapsLink || `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(item.title)}&dir_action=navigate`; window.open(target, '_blank'); }} sx={{ color: themeColor.color, opacity: 0.8, mt: -0.5, p: 0.5 }}><MapIcon sx={{ fontSize: 18 }} /></IconButton>
                                      )}
                                    </Stack>
                                    {!isReorderMode && (
                                      <>
                                        {isFlight && (item.flightNumber || item.terminal || item.gate) && (<Stack direction="row" gap={0.5} mt={0} flexWrap="wrap">{item.flightNumber && <Chip label={item.flightNumber} size="small" sx={{ bgcolor: themeColor.bg, color: themeColor.color, height: 18, fontSize: '0.6rem', fontWeight: 600, border: 'none', '& .MuiChip-label': { px: 1, py: 0 } }} />}{(item.terminal || item.gate) && <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>{item.terminal && `T${item.terminal}`} {item.gate && ` • P${item.gate}`}</Typography>}</Stack>)}
                                        {item.description && (<Typography variant="body2" sx={{ mt: 0.3, color: 'text.secondary', fontSize: '0.75rem', lineHeight: 1.3 }}>{item.description}</Typography>)}
                                        {atts.length > 0 && (<Stack direction="row" gap={0.5} mt={0.8} flexWrap="wrap">{atts.map((att, i) => (<SmartAttachmentChip key={i} attachment={att} onOpen={openAttachment} refreshTrigger={refreshTrigger} />))}</Stack>)}
                                      </>
                                    )}
                                  </Box>
                                </Box>
                              </Card>
                            );

                            return (
                              <SortableItem key={item.id} id={item.id} disabled={!isReorderMode}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>{cardContent}</Box>
                                  {isReorderMode && (
                                    <Stack direction="column" spacing={0.5} justifyContent="center" alignItems="center">
                                      <IconButton onClick={(e) => { e.stopPropagation(); openEdit(item); }} sx={{ bgcolor: 'white', color: 'primary.main', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', width: 32, height: 32 }}><EditIcon sx={{ fontSize: 18 }} /></IconButton>
                                      <IconButton onClick={(e) => { e.stopPropagation(); handleDeleteItem(item.id); }} sx={{ bgcolor: '#FFEBEE', color: '#D32F2F', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', width: 32, height: 32 }}><DeleteForeverIcon sx={{ fontSize: 18 }} /></IconButton>
                                    </Stack>
                                  )}
                                </Box>
                              </SortableItem>
                            );
                          })}
                        </Stack>
                      </SortableContext>
                    )}
                  </Paper>
                </Box>
              )
            })}
          </Container>
        )}

        {currentView === 1 && (
          <SpotsView
            tripId={tripId}
            openCreateSpot={handleOpenCreateSpot}
            onEdit={handleOpenEditSpot}
            isEditMode={isEditModeSpots}
          />
        )}
        {currentView === 2 && trip && (
          <ExpensesView
            trip={trip}
            tripId={tripId}
            userEmail={auth.currentUser?.email}
          />
        )}

        <Paper sx={{
          position: 'fixed',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 20,
          borderRadius: '24px',

          // Fondo translúcido
          bgcolor: theme.palette.mode === 'light' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(30, 30, 30, 0.6)',
          backdropFilter: 'blur(20px)',

          // --- CAMBIO CLAVE AQUÍ ---
          // En modo Light: Borde grisáceo (0,0,0,0.1) para separar del fondo
          // En modo Dark: Borde blanquecino (255,255,255,0.12) para iluminar
          border: `1px solid ${theme.palette.mode === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.12)'}`,

          // Sombra un poco más marcada para elevarlo
          boxShadow: theme.palette.mode === 'light'
            ? '0 10px 40px -10px rgba(0,0,0,0.1)'
            : '0 10px 40px -10px rgba(0,0,0,0.5)',

          overflow: 'hidden',
          padding: '0 8px',
          maxWidth: '90%',
          width: 'auto'
        }}>
          <BottomNavigation
            showLabels={false}
            value={currentView}
            onChange={(e, val) => setCurrentView(val)}
            sx={{
              bgcolor: "transparent",
              height: 64,
              width: "auto",
              gap: 1,
            }}
          >
            <BottomNavigationAction
              label="Itinerario"
              icon={<ListIcon />}
              sx={{
                color: "text.secondary",
                minWidth: 80,
                borderRadius: "20px",
                "&.Mui-selected": {
                  paddingTop: 0,
                  "& .MuiSvgIcon-root": { color: "primary.main" },
                },
                "&.Mui-selected .MuiSvgIcon-root": {
                  bgcolor: "secondary.light",
                  width: 56,
                  height: 32,
                  borderRadius: "16px",
                  py: 0.5,
                  boxSizing: "content-box",
                },
              }}
            />
            <BottomNavigationAction
              label="Sitios"
              icon={<PlaceIcon />}
              sx={{
                color: "text.secondary",
                minWidth: 80,
                borderRadius: "20px",
                "&.Mui-selected": {
                  paddingTop: 0,
                  "& .MuiSvgIcon-root": { color: "primary.main" },
                },
                "&.Mui-selected .MuiSvgIcon-root": {
                  bgcolor: "secondary.light",
                  width: 56,
                  height: 32,
                  borderRadius: "16px",
                  py: 0.5,
                  boxSizing: "content-box",
                },
              }}
            />
            <BottomNavigationAction
              label="Gastos"
              icon={<EuroIcon />}
              sx={{
                color: "text.secondary",
                minWidth: 80,
                borderRadius: "20px",
                "&.Mui-selected": {
                  paddingTop: 0,
                  "& .MuiSvgIcon-root": { color: "primary.main" },
                },
                "&.Mui-selected .MuiSvgIcon-root": {
                  bgcolor: "secondary.light",
                  width: 56,
                  height: 32,
                  borderRadius: "16px",
                  py: 0.5,
                  boxSizing: "content-box",
                },
              }}
            />
          </BottomNavigation>
        </Paper>

        {/* MODAL CREAR ITEM (Itinerario) */}
        <Dialog
          open={openItemModal}
          onClose={() => setOpenItemModal(false)}
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle
            sx={{ textAlign: "center", fontWeight: "bold", fontSize: "1.1rem" }}
          >
            {isEditing ? "Editar" : "Nuevo Evento"}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} mt={1}>
              {/* --- SELECTOR DE CATEGORÍA VISUAL (GRID AJUSTADO) --- */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 2 }}>
                {['place', 'food', 'transport', 'flight'].map(t => {
                  const cfg = getTypeConfig(t);
                  const isSel = newItem.type === t;

                  return (
                    <Paper
                      key={t}
                      elevation={0}
                      onClick={() => setNewItem({ ...newItem, type: t })}
                      sx={{
                        cursor: 'pointer',
                        borderRadius: '12px', // Un poco menos redondo para ahorrar espacio
                        p: 1, // Menos padding para que no se salga
                        border: `2px solid ${isSel ? cfg.color : 'transparent'}`,
                        bgcolor: isSel ? cfg.bg : (theme.palette.mode === 'light' ? '#F3F4F6' : 'rgba(255,255,255,0.05)'),
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1, // Menos separación entre icono y texto
                        transition: 'all 0.2s',
                        position: 'relative',
                        overflow: 'hidden', // Asegura que nada se salga del borde
                        '&:hover': { bgcolor: isSel ? cfg.bg : theme.palette.action.hover }
                      }}
                    >
                      {/* Círculo del Icono (Más compacto) */}
                      <Box sx={{
                        width: 32, height: 32, // Reducido de 40 a 32
                        borderRadius: '8px',
                        bgcolor: isSel ? 'white' : 'background.paper',
                        color: cfg.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                        flexShrink: 0 // Evita que el icono se aplaste
                      }}>
                        {React.cloneElement(cfg.icon, { fontSize: 'small' })} {/* Icono tamaño small */}
                      </Box>

                      {/* Texto */}
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        sx={{ fontSize: '0.8rem', lineHeight: 1.1 }} // Texto ajustado
                        color={isSel ? 'text.primary' : 'text.secondary'}
                      >
                        {cfg.label}
                      </Typography>

                      {/* Check visual (Absoluto para no ocupar espacio) */}
                      {isSel && (
                        <CheckCircleOutlineIcon
                          sx={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            fontSize: 14,
                            color: cfg.color,
                            opacity: 0.8
                          }}
                        />
                      )}
                    </Paper>
                  )
                })}
              </Box>
              {newItem.type === 'flight' ? (
                <>
                  <TextField label="Nombre Vuelo (ej: Iberia)" fullWidth variant="filled" InputProps={{ disableUnderline: true }} size="small" value={newItem.title} onChange={e => setNewItem({ ...newItem, title: e.target.value })} />

                  {/* --- NUEVOS CAMPOS: ORIGEN Y DESTINO --- */}
                  <Stack direction="row" gap={1}>
                    <TextField
                      label="Origen (ej: MAD)"
                      fullWidth variant="filled"
                      InputProps={{ disableUnderline: true }}
                      size="small"
                      value={newItem.origin || ''}
                      onChange={e => setNewItem({ ...newItem, origin: e.target.value.toUpperCase() })} // Lo forzamos a mayúsculas
                    />
                    <TextField
                      label="Destino (ej: LHR)"
                      fullWidth variant="filled"
                      InputProps={{ disableUnderline: true }}
                      size="small"
                      value={newItem.destination || ''}
                      onChange={e => setNewItem({ ...newItem, destination: e.target.value.toUpperCase() })}
                    />
                  </Stack>

                  <Stack direction="row" gap={1}>
                    <TextField label="Nº Vuelo" fullWidth variant="filled" InputProps={{ disableUnderline: true }} size="small" value={newItem.flightNumber} onChange={e => setNewItem({ ...newItem, flightNumber: e.target.value })} />
                    <TextField label="Hora Salida" type="time" fullWidth variant="filled" InputProps={{ disableUnderline: true }} size="small" value={newItem.time} onChange={e => setNewItem({ ...newItem, time: e.target.value })} />
                  </Stack>
                  <Stack direction="row" gap={1}>
                    <TextField label="Terminal" fullWidth variant="filled" InputProps={{ disableUnderline: true }} size="small" value={newItem.terminal} onChange={e => setNewItem({ ...newItem, terminal: e.target.value })} />
                    <TextField label="Puerta" fullWidth variant="filled" InputProps={{ disableUnderline: true }} size="small" value={newItem.gate} onChange={e => setNewItem({ ...newItem, gate: e.target.value })} />
                  </Stack>
                </>
              ) : (
                <>
                  <TextField
                    label={
                      newItem.type === "transport" ? "Transporte" : "Nombre"
                    }
                    fullWidth
                    variant="filled"
                    InputProps={{ disableUnderline: true }}
                    size="small"
                    value={newItem.title}
                    onChange={(e) =>
                      setNewItem({ ...newItem, title: e.target.value })
                    }
                  />
                  <TextField
                    label="Dirección / Link"
                    fullWidth
                    variant="filled"
                    InputProps={{
                      disableUnderline: true,
                      // CAMBIO: Ponemos el icono al final (endAdornment) para que no choque con el texto
                      endAdornment: <LocationOnIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                    }}
                    size="small"
                    value={newItem.mapsLink}
                    onChange={(e) =>
                      setNewItem({ ...newItem, mapsLink: e.target.value })
                    }
                  />
                  <TextField
                    label="Hora"
                    type="time"
                    fullWidth
                    variant="filled"
                    InputProps={{ disableUnderline: true }}
                    size="small"
                    value={newItem.time}
                    onChange={(e) =>
                      setNewItem({ ...newItem, time: e.target.value })
                    }
                  />
                </>
              )}
              <TextField
                label="Notas"
                multiline
                rows={2}
                fullWidth
                variant="filled"
                InputProps={{ disableUnderline: true }}
                size="small"
                value={newItem.description || ""}
                onChange={(e) =>
                  setNewItem({ ...newItem, description: e.target.value })
                }
              />
              {existingAttachments.length > 0 && (
                <Stack
                  gap={1}
                  p={1}
                  bgcolor="background.paper"
                  borderRadius={2}
                >
                  {existingAttachments.map((a, i) => (
                    <Box
                      key={i}
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography
                        variant="caption"
                        noWrap
                        sx={{ maxWidth: 180 }}
                      >
                        {a.name}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => deleteAttachment(i)}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Stack>
              )}
              <Button
                variant="outlined"
                component="label"
                startIcon={<AttachFileIcon />}
                sx={{
                  borderStyle: "dashed",
                  py: 1.5,
                  borderColor: "action.disabled",
                  color: "text.secondary",
                  borderRadius: "12px",
                }}
              >
                {files.length > 0
                  ? `Subir ${files.length}`
                  : "Adjuntar archivos"}
                <input
                  type="file"
                  multiple
                  hidden
                  onChange={(e) => setFiles(Array.from(e.target.files))}
                />
              </Button>
              {isEditing && (
                <Button
                  color="error"
                  startIcon={<DeleteForeverIcon />}
                  onClick={() => {
                    if (confirm("¿Borrar?")) {
                      deleteDoc(doc(db, "trips", tripId, "items", editingId));
                      setOpenItemModal(false);
                    }
                  }}
                >
                  Eliminar Evento
                </Button>
              )}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button
              onClick={() => setOpenItemModal(false)}
              sx={{
                color: "text.secondary",
                bgcolor: "transparent !important",
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              disabled={uploading}
              onClick={handleSaveItem}
              sx={{ bgcolor: "primary.main", color: "white" }}
            >
              {uploading ? "..." : "Guardar"}
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={editNotesOpen}
          onClose={() => setEditNotesOpen(false)}
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle sx={{ fontWeight: 700 }}>Notas Rápidas</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              multiline
              rows={6}
              fullWidth
              variant="filled"
              InputProps={{ disableUnderline: true }}
              value={tripNotes}
              onChange={(e) => setTripNotes(e.target.value)}
              placeholder="Ej: Wifi: 1234, Seguro..."
              sx={{ mt: 1 }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button
              onClick={() => setEditNotesOpen(false)}
              sx={{ bgcolor: "transparent !important" }}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={handleSaveNotes}
              sx={{ bgcolor: "primary.main", color: "white" }}
            >
              Guardar
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={openSpotModal}
          onClose={() => setOpenSpotModal(false)}
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle sx={{ fontWeight: 700 }}>Nuevo Sitio</DialogTitle>
          <DialogContent>
            <Stack spacing={2} mt={1}>
              <TextField
                label="Nombre del sitio"
                variant="filled"
                fullWidth
                size="small"
                InputProps={{ disableUnderline: true }}
                value={newSpot.name}
                onChange={(e) =>
                  setNewSpot({ ...newSpot, name: e.target.value })
                }
              />
              <FormControl fullWidth variant="filled" size="small">
                <InputLabel shrink sx={{ left: -12, top: -5 }}>
                  Categoría
                </InputLabel>
                <Select
                  value={newSpot.category}
                  onChange={(e) =>
                    setNewSpot({ ...newSpot, category: e.target.value })
                  }
                  disableUnderline
                  sx={{ borderRadius: 2, bgcolor: "action.hover" }}
                >
                  <MenuItem value="Comida">🍔 Comida</MenuItem>
                  <MenuItem value="Super">🛒 Supermercado</MenuItem>
                  <MenuItem value="Gasolina">⛽ Gasolinera</MenuItem>
                  <MenuItem value="Visita">📷 Turismo</MenuItem>
                  <MenuItem value="Salud">🏥 Salud</MenuItem>
                  <MenuItem value="Otro">⭐ Otro</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Link Maps"
                variant="filled"
                fullWidth
                size="small"
                InputProps={{ disableUnderline: true }}
                value={newSpot.mapsLink}
                onChange={(e) =>
                  setNewSpot({ ...newSpot, mapsLink: e.target.value })
                }
              />
              <TextField
                label="Descripción"
                multiline
                rows={2}
                variant="filled"
                fullWidth
                size="small"
                InputProps={{ disableUnderline: true }}
                value={newSpot.description}
                onChange={(e) =>
                  setNewSpot({ ...newSpot, description: e.target.value })
                }
              />
              <TextField
                label="Etiquetas"
                variant="filled"
                fullWidth
                size="small"
                placeholder="barato, cena"
                InputProps={{ disableUnderline: true }}
                value={newSpot.tags}
                onChange={(e) =>
                  setNewSpot({ ...newSpot, tags: e.target.value })
                }
              />
            </Stack>
          </DialogContent>
          {/* ... dentro del Dialog de openSpotModal ... */}

          <DialogActions sx={{ p: 3 }}>
            {/* Botón Cancelar */}
            <Button
              onClick={() => setOpenSpotModal(false)}
              sx={{
                bgcolor: "transparent !important",
                color: "text.secondary",
              }}
            >
              Cancelar
            </Button>

            {/* Botón Guardar (CAMBIADO) */}
            <Button
              variant="contained"
              onClick={handleSaveSpot}
              disabled={isSavingSpot} // Se deshabilita mientras carga
              sx={{
                bgcolor: "primary.main",
                color: "white",
                minWidth: 100, // Para que no cambie de tamaño al salir el spinner
              }}
            >
              {/* Si está guardando muestra el círculo, si no, el texto */}
              {isSavingSpot ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Guardar"
              )}
            </Button>
          </DialogActions>
        </Dialog>
        <Snackbar
          open={showToast}
          autoHideDuration={3000}
          onClose={() => setShowToast(false)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setShowToast(false)}
            severity="success"
            sx={{ width: "100%", borderRadius: 3 }}
          >
            ¡Descargado para Offline!
          </Alert>
        </Snackbar>
      </Box>
      {/* --- DRAWER TIPO WALLET (BILLETES) --- */}
      <Drawer
        anchor="bottom"
        open={openWallet}
        onClose={() => setOpenWallet(false)}
        PaperProps={{
          sx: {
            borderTopLeftRadius: "32px",
            borderTopRightRadius: "32px",
            maxHeight: "85vh",
            bgcolor: theme.palette.mode === "light" ? "#F3F4F6" : "#0F172A",
            pb: 4,
          },
        }}
      >
        {/* Tirador decorativo */}
        <Box
          sx={{
            width: 40,
            height: 4,
            bgcolor: "text.disabled",
            borderRadius: 2,
            mx: "auto",
            mt: 2,
            mb: 1,
            opacity: 0.3,
          }}
        />

        <Box p={3}>
          <Typography variant="h6" fontWeight="800" mb={3} textAlign="center">
            Mis Billetes
          </Typography>

          {/* Filtramos solo vuelos y transporte */}
          {items.filter((i) => i.type === "flight" || i.type === "transport")
            .length === 0 ? (
            <Box textAlign="center" py={4} color="text.secondary">
              <Typography>No tienes vuelos ni transporte guardados.</Typography>
            </Box>
          ) : (
            <Stack spacing={3}>
              {items
                .filter((i) => i.type === "flight" || i.type === "transport")
                .map((item) => {
                  const isFlight = item.type === "flight";
                  const color = isFlight
                    ? theme.palette.primary.main
                    : theme.palette.secondary.main;
                  const colorLight = isFlight
                    ? theme.palette.primary.light
                    : theme.palette.secondary.light;

                  return (
                    <Card
                      key={item.id}
                      sx={{
                        borderRadius: "24px",
                        overflow: "visible",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                        bgcolor: "background.paper",
                      }}
                    >
                      {/* CABECERA DEL BILLETE */}
                      <Box
                        sx={{
                          bgcolor: color,
                          color: "white",
                          p: 2.5,
                          position: "relative",
                        }}
                      >
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Stack direction="row" gap={1} alignItems="center">
                            {isFlight ? (
                              <FlightTakeoffIcon />
                            ) : (
                              <DirectionsIcon />
                            )}
                            <Typography variant="h6" fontWeight="800">
                              {item.title}
                            </Typography>
                          </Stack>
                          <Typography variant="h6" fontWeight="800">
                            {item.time}
                          </Typography>
                        </Stack>
                        <Typography
                          variant="caption"
                          sx={{ opacity: 0.8, display: "block", mt: 0.5 }}
                        >
                          {dayjs(item.date).format("dddd, D MMMM YYYY")}
                        </Typography>
                      </Box>

                      {/* CUERPO DEL BILLETE */}
                      <CardContent sx={{ p: 3 }}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          mb={3}
                        >
                          <Box>
                            <Typography variant="caption" color="text.secondary" fontWeight="700">ORIGEN</Typography>
                            {/* CAMBIO AQUÍ: Usamos item.origin o un guion si no hay nada */}
                            <Typography variant="h4" fontWeight="800" color="text.primary">
                              {item.origin || '---'}
                            </Typography>
                          </Box>
                          {/* AVIÓN CENTRAL (Limpio y apuntando a la derecha) */}
                          <Box display="flex" alignItems="center" justifyContent="center" px={2} sx={{ opacity: 0.3 }}>
                            {/* Usamos FlightIcon normal y lo giramos 90 grados a la derecha */}
                            <FlightIcon sx={{ transform: 'rotate(90deg)', fontSize: 32, color: 'text.primary' }} />
                          </Box>

                          <Box textAlign="right">
                            <Typography variant="caption" color="text.secondary" fontWeight="700">DESTINO</Typography>
                            {/* CAMBIO AQUÍ: Usamos item.destination */}
                            <Typography variant="h4" fontWeight="800" color="text.primary">
                              {item.destination || '---'}
                            </Typography>
                          </Box>
                        </Stack>

                        {/* DATOS DEL VUELO */}
                        <Box
                          sx={{
                            bgcolor:
                              theme.palette.mode === "light"
                                ? "#F9FAFB"
                                : "#1e293b",
                            p: 2,
                            borderRadius: "16px",
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr 1fr",
                            gap: 2,
                          }}
                        >
                          <Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              fontWeight="700"
                            >
                              VUELO
                            </Typography>
                            <Typography variant="subtitle1" fontWeight="800">
                              {item.flightNumber || "-"}
                            </Typography>
                          </Box>
                          <Box textAlign="center">
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              fontWeight="700"
                            >
                              PUERTA
                            </Typography>
                            <Typography variant="subtitle1" fontWeight="800">
                              {item.gate || "-"}
                            </Typography>
                          </Box>
                          <Box textAlign="right">
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              fontWeight="700"
                            >
                              ASIENTO
                            </Typography>
                            <Typography variant="subtitle1" fontWeight="800">
                              24F
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>

                      {/* PIE CON CÓDIGO QR Y LISTA DE BILLETES */}
                      <Box
                        sx={{
                          borderTop: "2px dashed #E5E7EB",
                          position: "relative",
                          p: 2,
                          bgcolor:
                            theme.palette.mode === "light" ? "#FAFAFA" : "#111",
                        }}
                      >
                        {/* Muescas laterales decorativas */}
                        <Box
                          sx={{
                            position: "absolute",
                            top: -10,
                            left: -10,
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            bgcolor:
                              theme.palette.mode === "light"
                                ? "#F3F4F6"
                                : "#0F172A",
                          }}
                        />
                        <Box
                          sx={{
                            position: "absolute",
                            top: -10,
                            right: -10,
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            bgcolor:
                              theme.palette.mode === "light"
                                ? "#F3F4F6"
                                : "#0F172A",
                          }}
                        />

                        <Stack direction="row" gap={2} alignItems="flex-start">
                          {/* COLUMNA IZQ: QR DECORATIVO */}
                          <Box sx={{ opacity: 0.3, pt: 0.5 }}>
                            <QrCode2Icon sx={{ fontSize: 48 }} />
                          </Box>

                          {/* COLUMNA DER: LISTA DE ADJUNTOS */}
                          <Box flexGrow={1}>
                            <Typography
                              variant="caption"
                              sx={{
                                letterSpacing: 2,
                                fontWeight: 800,
                                color: "text.secondary",
                                mb: 1,
                                display: "block",
                              }}
                            >
                              BOARDING PASSES
                            </Typography>

                            {!item.attachments?.length ? (
                              <Typography
                                variant="caption"
                                color="text.disabled"
                                fontStyle="italic"
                              >
                                Sin archivos adjuntos
                              </Typography>
                            ) : (
                              <Stack spacing={1}>
                                {item.attachments.map((att, index) => (
                                  <CardActionArea
                                    key={index}
                                    onClick={() => openAttachment(att)}
                                    sx={{
                                      p: 1,
                                      borderRadius: "8px",
                                      border: "1px solid",
                                      borderColor: "divider",
                                      bgcolor: "background.paper",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1.5,
                                      transition: "0.2s",
                                      "&:hover": {
                                        bgcolor: theme.palette.action.hover,
                                      },
                                    }}
                                  >
                                    {/* Icono PDF rojo pequeño */}
                                    <Box
                                      sx={{
                                        bgcolor: "#FFEBEE",
                                        color: "#D32F2F",
                                        borderRadius: "4px",
                                        p: 0.5,
                                        display: "flex",
                                      }}
                                    >
                                      <Typography
                                        variant="caption"
                                        fontWeight="bold"
                                        fontSize="0.6rem"
                                      >
                                        PDF
                                      </Typography>
                                    </Box>

                                    {/* Nombre del archivo */}
                                    <Typography
                                      variant="body2"
                                      fontWeight="600"
                                      noWrap
                                      sx={{ maxWidth: "180px" }}
                                    >
                                      {att.name}
                                    </Typography>
                                  </CardActionArea>
                                ))}
                              </Stack>
                            )}
                          </Box>
                        </Stack>
                      </Box>
                    </Card>
                  );
                })}
            </Stack>
          )}
        </Box>
      </Drawer>
    </DndContext>
  );
}

// MAIN
function App() {
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState("light");
  useEffect(() => {
    const savedMode = localStorage.getItem("themeMode");
    if (savedMode) setMode(savedMode);
  }, []);
  const toggleTheme = () => {
    const newMode = mode === "light" ? "dark" : "light";
    setMode(newMode);
    localStorage.setItem("themeMode", newMode);
  };
  const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);
  useEffect(() => {
    onAuthStateChanged(auth, (u) => setUser(u));
  }, []);
  const handleLogin = async () => {
    try {
      const r = await signInWithPopup(auth, googleProvider);
      const c = GoogleAuthProvider.credentialFromResult(r);
      if (c?.accessToken)
        sessionStorage.setItem("googleAccessToken", c.accessToken);
    } catch (e) {
      console.error(e);
    }
  };
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          {!user ? (
            <Route path="*" element={<LoginScreen onLogin={handleLogin} />} />
          ) : (
            <>
              {" "}
              <Route
                path="/"
                element={
                  <HomeScreen
                    user={user}
                    onLogout={() => signOut(auth)}
                    toggleTheme={toggleTheme}
                    mode={mode}
                  />
                }
              />
              <Route path="/trip/:tripId" element={<TripDetailScreen />} />
            </>
          )}
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
