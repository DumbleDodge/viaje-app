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

// Añade el import arriba
import { TripProvider, useTripContext } from './TripContext';


// Añade 'Collapse' a los imports de @mui/material
import {
  // ... tus otros imports ...
  Collapse,
} from "@mui/material";
import ChecklistRtlIcon from '@mui/icons-material/ChecklistRtl';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
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
  useDroppable,
  DragOverlay,
  MouseSensor
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

// Añade los de Supabase
import { supabase, signInWithGoogle, signOut } from './supabaseClient';





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
        background: { default: '#0A0A0A', paper: '#1D1F21' },
        text: { primary: "#E3E3E3", secondary: "#A0A0A0" },
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
    // Fuente para Títulos (La de tu imagen)
    h4: { fontFamily: '"Poppins", sans-serif', fontWeight: 800 },
    h5: { fontFamily: '"Poppins", sans-serif', fontWeight: 800 },
    h6: { fontFamily: '"Poppins", sans-serif', fontWeight: 700 },
    subtitle1: { fontFamily: '"Poppins", sans-serif', fontWeight: 600 },
    subtitle2: { fontFamily: '"Poppins", sans-serif', fontWeight: 600 },


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
// --- COMPONENTE SortableItem (CORREGIDO PARA PERMITIR SCROLL) ---
function SortableItem({ id, children, disabled }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    // Cuando se arrastra, el original se vuelve transparente (para ver el overlay)
    opacity: isDragging ? 0.0 : 1,
    zIndex: isDragging ? 999 : 1,
    position: 'relative',

    // --- CAMBIO CLAVE AQUÍ ---
    // 'none' -> Bloqueaba el scroll.
    // 'pan-y' -> Permite hacer scroll vertical con el dedo sobre la tarjeta.
    // 'manipulation' -> También vale, permite scroll y zoom estándar.
    touchAction: 'pan-y'
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

// Componente de chip inteligente (Detecta si está offline)
const SmartAttachmentChip = ({ attachment, onOpen, refreshTrigger }) => {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const checkCache = async () => {
      if (attachment.path) {
        // Buscamos en la base de datos local (IndexedDB)
        const file = await get(attachment.path);
        setIsOffline(!!file);
      }
    };
    checkCache();
  }, [attachment, refreshTrigger]);

  return (
    <Chip
      label={attachment.name}
      onClick={(e) => { e.stopPropagation(); onOpen(attachment); }}
      // Si está offline sale en verde con check, si no, gris con nube
      icon={isOffline ? <CheckCircleOutlineIcon style={{ fontSize: 16, color: '#1B5E20' }} /> : <CloudQueueIcon style={{ fontSize: 16 }} />}
      sx={{
        height: '24px',
        fontSize: '0.75rem',
        fontWeight: 600,
        cursor: 'pointer',
        bgcolor: isOffline ? '#E8F5E9' : 'action.selected',
        border: isOffline ? '1px solid #A5D6A7' : '1px solid rgba(0,0,0,0.1)',
        color: isOffline ? '#1B5E20' : 'text.primary',
        maxWidth: '100%'
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
// --- PANTALLA LOGIN (REDISEÑO FINAL) ---
function LoginScreen({ onLogin }) {
  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: 3, bgcolor: 'background.default' }}>

      <Box sx={{ p: 5, textAlign: 'center', bgcolor: 'background.paper', borderRadius: '32px', boxShadow: '0 20px 60px rgba(0,0,0,0.05)', maxWidth: 400, width: '100%' }}>

        {/* LOGO NUEVO (Animado y limpio) */}
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1.5 }}>
          <FlightTakeoffIcon
            sx={{
              color: '#FF7043',
              fontSize: 40,
              transform: 'rotate(-10deg) translateY(4px)',
              filter: 'drop-shadow(0 4px 10px rgba(255, 112, 67, 0.4))'
            }}
          />
          <Typography variant="h3" sx={{
            fontFamily: '"Poppins", sans-serif',
            fontWeight: 800,
            color: 'text.primary',
            letterSpacing: '-0.02em'
          }}>
            Travio<span style={{ color: '#FF7043' }}>.</span>
          </Typography>
        </Box>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 5, fontWeight: 500, opacity: 0.8 }}>
          Tu compañero de viaje inteligente
        </Typography>

        <Button
          variant="contained"
          size="large"
          startIcon={<GoogleIcon />}
          onClick={onLogin}
          sx={{
            bgcolor: 'text.primary',
            color: 'background.paper',
            py: 1.8, px: 4,
            fontSize: '1rem',
            borderRadius: '20px',
            width: '100%',
            textTransform: 'none',
            fontWeight: 700,
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            transition: 'transform 0.2s',
            '&:hover': { bgcolor: '#333', transform: 'scale(1.02)' }
          }}
        >
          Continuar con Google
        </Button>
      </Box>
    </Box>
  );
}

// --- PANTALLA HOME ---
// --- PANTALLA HOME REDISEÑADA ---
function HomeScreen({ user, onLogout, toggleTheme, mode }) {
  //const [trips, setTrips] = useState([]);
  const { tripsList, fetchTripsList, userProfile, fetchUserProfile } = useTripContext();

  const trips = tripsList || [];

  // 2. Añadimos un estado para el modal de pago que usaremos luego
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [openModal, setOpenModal] = useState(false);


// --- AÑADE ESTE ESTADO ---
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    if (params.get('payment') === 'success' && user?.id) {
      // 1. En lugar del alert, abrimos el modal chulo
      setShowSuccessModal(true);
      
      // 2. Limpiamos la URL
      window.history.replaceState({}, document.title, "/");
      
      // 3. Refrescamos el perfil para que vea los 5GB ya mismo
      fetchUserProfile(user.id);
    }
  }, [user?.id, fetchUserProfile]);



  // Estados auxiliares
  const [openShare, setOpenShare] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [shareTripId, setShareTripId] = useState(null);
  const [editTripData, setEditTripData] = useState({ id: '', title: '', place: '', startDate: '', endDate: '', coverImageUrl: '' });
  const [newTrip, setNewTrip] = useState({ title: '', place: '', startDate: '', endDate: '', coverImageUrl: '' });

  const [anchorElUser, setAnchorElUser] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();

  // 1. CARGAR VIAJES Y ESCUCHAR CAMBIOS (REALTIME)
  useEffect(() => {
    // 1. Si no hay usuario, no hacemos nada
    if (!user?.id) return;

    // 2. Carga inicial (Viajes y Perfil)
    // Usamos las funciones del contexto que ya se encargan de actualizar los estados globales
    fetchTripsList(user);
    fetchUserProfile(user.id);

    // 3. Suscripción Realtime
    // Escuchamos cambios en la tabla 'trips' para que la lista se actualice sola
    const sub = supabase
      .channel('home_trips')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'trips' },
        () => {
          console.log("Cambio detectado en trips, recargando...");
          fetchTripsList(user);
        }
      )
      .subscribe();

    // 4. Limpieza al desmontar el componente
    return () => {
      supabase.removeChannel(sub);
    };

    // IMPORTANTE: Solo dependemos del ID del usuario. 
    // Al usar fetchTripsList del contexto (que ya es estable por el useCallback), 
    // no entrará en bucle.
  }, [user?.id, fetchTripsList, fetchUserProfile]);

  // 2. CREAR VIAJE
  const handleSave = async () => {
    if (!newTrip.title) return;
    const userEmail = user.email || user.user_metadata?.email;

    const { error } = await supabase.from('trips').insert([{
      title: newTrip.title,
      place: newTrip.place,
      start_date: newTrip.startDate,
      end_date: newTrip.endDate,
      cover_image_url: newTrip.coverImageUrl,
      owner_id: user.id,
      participants: [userEmail]
    }]);

    if (error) alert("Error: " + error.message);
    else {
      setOpenModal(false);
      setNewTrip({ title: '', place: '', startDate: '', endDate: '', coverImageUrl: '' });
    }
  };

  // 3. BORRAR VIAJE
  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (confirm("¿Eliminar viaje completo?")) {
      await supabase.from('trips').delete().eq('id', id);
      // El Realtime actualizará la lista solo
    }
  };

  // 4. ACTUALIZAR VIAJE
  const openEdit = (e, trip) => { e.stopPropagation(); setEditTripData({ ...trip }); setOpenEditModal(true); };

  const handleUpdateTrip = async () => {
    const { id, ...data } = editTripData;
    const { error } = await supabase.from('trips').update({
      title: data.title,
      place: data.place,
      start_date: data.startDate,
      end_date: data.endDate,
      cover_image_url: data.coverImageUrl
    }).eq('id', id);

    if (!error) setOpenEditModal(false);
  };

  // 5. COMPARTIR VIAJE
  const handleShare = async () => {
    if (!shareEmail) return;
    try {
      const { data: currentTrip, error } = await supabase.from('trips').select('participants').eq('id', shareTripId).single();
      if (error) throw error;

      const currentParticipants = currentTrip.participants || [];
      if (currentParticipants.includes(shareEmail)) {
        alert("Usuario ya invitado.");
      } else {
        await supabase.from('trips').update({ participants: [...currentParticipants, shareEmail] }).eq('id', shareTripId);
        alert("¡Invitado!");
      }
      setOpenShare(false); setShareEmail('');
    } catch (e) { console.error(e); }
  };

  // LÓGICA DE VISUALIZACIÓN
  const today = dayjs().startOf('day');
  const upcomingTrips = trips.filter(t => dayjs(t.endDate).isAfter(today) || dayjs(t.endDate).isSame(today));
  const nextTrip = upcomingTrips.length > 0 ? upcomingTrips[0] : null;
  const otherTrips = trips.filter(t => t.id !== nextTrip?.id);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 12 }}>

      {/* CABECERA (MARCA) */}
      <Box sx={{
        px: 3, pt: 3, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: theme.palette.background.default,// ANIMACIÓN 1: FADE IN SUAVE
        animation: 'fadeIn 0.8s ease-out',
        '@keyframes fadeIn': {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 }
        }
      }}>
        <Stack direction="row" alignItems="center" gap={1}>
          <FlightTakeoffIcon sx={{ color: '#FF7043', fontSize: 28, transform: 'rotate(-10deg) translateY(2px)', filter: 'drop-shadow(0 4px 6px rgba(255, 112, 67, 0.3))' }} />
          <Typography variant="h5" sx={{ fontFamily: '"Poppins", sans-serif', fontWeight: 800, color: 'text.primary', letterSpacing: '-0.02em', fontSize: '1.5rem' }}>
            Travio<span style={{ color: '#FF7043' }}>.</span>
          </Typography>
        </Stack>
        <IconButton onClick={(e) => setAnchorElUser(e.currentTarget)} sx={{ p: 0 }}>
          <Avatar src={user.user_metadata?.avatar_url} sx={{ width: 40, height: 40, border: `2px solid ${theme.palette.background.paper}`, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
        </IconButton>
      </Box>

      {/* SALUDO */}
      <Box sx={{
        px: 3, mb: 3, mt: 1,// ANIMACIÓN 2: SLIDE UP
        animation: 'slideUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)',
        '@keyframes slideUp': {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        }
      }}>
        <Typography variant="h6" color="text.secondary" fontWeight="500" sx={{ fontSize: '1rem' }}>
          Hola, <span style={{ color: theme.palette.text.primary, fontWeight: 700 }}>{user.user_metadata?.full_name?.split(' ')[0] || 'Viajero'}</span> 👋
        </Typography>
      </Box>

      <Menu
        sx={{ mt: '45px' }}
        id="menu-appbar"
        anchorEl={anchorElUser}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        keepMounted
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={Boolean(anchorElUser)}
        onClose={() => setAnchorElUser(null)}
        PaperProps={{
          style: { borderRadius: 20, width: 250, padding: '8px 0' }
        }}
      >
        {/* INFO DEL PLAN Y ALMACENAMIENTO */}
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" fontWeight="800" color="primary.main">
            PLAN {userProfile.is_pro ? 'PRO ⭐' : 'MOCHILERO'}
          </Typography>

          <Box sx={{ mt: 1.5 }}>
            <Stack direction="row" justifyContent="space-between" mb={0.5}>
              <Typography variant="caption" color="text.secondary" fontWeight="700">ESPACIO USADO</Typography>
              <Typography variant="caption" fontWeight="800">
                {(userProfile.storage_used / (1024 * 1024)).toFixed(1)} / {userProfile.is_pro ? '5 GB' : '50 MB'}
              </Typography>
            </Stack>
            <Box sx={{ height: 6, bgcolor: 'action.hover', borderRadius: 3, overflow: 'hidden' }}>
              <Box sx={{
                height: '100%',
                bgcolor: (userProfile.storage_used / (50 * 1024 * 1024)) > 0.9 && !userProfile.is_pro ? '#EF5350' : 'primary.main',
                width: `${Math.min(100, (userProfile.storage_used / (userProfile.is_pro ? 5120 * 1024 * 1024 : 50 * 1024 * 1024)) * 100)}%`,
                transition: 'width 0.5s ease-out'
              }} />
            </Box>
          </Box>

          {!userProfile.is_pro && (
            <Button
              fullWidth
              size="small"
              variant="contained"
              onClick={() => { setAnchorElUser(null); setPaywallOpen(true); }}
              sx={{ mt: 2, borderRadius: '10px', fontWeight: 'bold', fontSize: '0.7rem', py: 1 }}
            >
              Subir a Pro
            </Button>
          )}
        </Box>

        <Divider sx={{ my: 1 }} />

        <MenuItem onClick={toggleTheme}>
          <ListItemIcon>{mode === 'light' ? <DarkModeIcon fontSize="small" /> : <LightModeIcon fontSize="small" />}</ListItemIcon>
          <Typography textAlign="center">Modo {mode === 'light' ? 'Oscuro' : 'Claro'}</Typography>
        </MenuItem>
        <MenuItem onClick={onLogout}>
          <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
          <Typography textAlign="center" color="error">Cerrar Sesión</Typography>
        </MenuItem>
      </Menu>

      <Container maxWidth="sm" sx={{ px: 2, animation: 'slideUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) 0.1s backwards' }}>

        {/* 2. PRÓXIMA PARADA (HERO CARD) */}
        {nextTrip && (
          <Box mb={4} mt={2}>
            <Typography variant="subtitle2" fontWeight="800" sx={{ mb: 1.5, ml: 1, color: 'text.secondary', letterSpacing: 1, textTransform: 'uppercase', fontSize: '0.75rem' }}>
              PRÓXIMA PARADA 🚀
            </Typography>

            {(() => {
              const start = dayjs(nextTrip.startDate).startOf('day');
              const diffDays = start.diff(today, 'day');
              const isOngoing = diffDays <= 0 && dayjs(nextTrip.endDate).isAfter(today);

              return (
                <Card onClick={() => navigate(`/trip/${nextTrip.id}`)} sx={{ borderRadius: '28px', overflow: 'hidden', position: 'relative', cursor: 'pointer', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.3)', transition: 'transform 0.3s', '&:hover': { transform: 'scale(1.02)' } }}>
                  <Box sx={{ height: 320, width: '100%', position: 'relative' }}>
                    <TripCoverImage url={nextTrip.coverImageUrl} place={nextTrip.place} height="100%" />
                    <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 60%)' }} />

                    {/* CUENTA ATRÁS FLOTANTE */}
                    <Box sx={{ position: 'absolute', top: 20, left: 20, bgcolor: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '16px', p: 1.5, minWidth: 80, textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                      {isOngoing ? (
                        <Typography variant="h6" fontWeight="800" sx={{ color: '#4ADE80', lineHeight: 1 }}>ON</Typography>
                      ) : (
                        <Typography variant="h4" fontWeight="800" sx={{ color: 'white', lineHeight: 0.9 }}>{diffDays}</Typography>
                      )}
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase', fontWeight: 700, fontSize: '0.65rem', letterSpacing: 1, display: 'block', mt: 0.5 }}>{isOngoing ? 'EN RUTA' : 'DÍAS'}</Typography>
                    </Box>

                    {/* ACCIONES HERO */}
                    <Box position="absolute" top={20} right={20} display="flex" gap={1}>
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); setShareTripId(nextTrip.id); setOpenShare(true); }} sx={{ bgcolor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.6)' } }}><ShareIcon fontSize="small" /></IconButton>
                      <IconButton size="small" onClick={(e) => openEdit(e, nextTrip)} sx={{ bgcolor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.6)' } }}><EditIcon fontSize="small" /></IconButton>
                      <IconButton size="small" onClick={(e) => handleDelete(e, nextTrip.id)} sx={{ bgcolor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', color: '#FF8A80', '&:hover': { bgcolor: 'rgba(255,60,60,0.4)' } }}><DeleteForeverIcon fontSize="small" /></IconButton>
                    </Box>

                    {/* DATOS HERO */}
                    <Box sx={{ position: 'absolute', bottom: 0, left: 0, p: 3, width: '100%' }}>
                      <Typography variant="h3" fontWeight="800" sx={{ color: 'white', mb: 0.5, letterSpacing: '-1px', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>{nextTrip.place}</Typography>
                      <Stack direction="row" alignItems="center" gap={1}>
                        <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>{nextTrip.title}</Typography>
                        <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.5)' }} />
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 400 }}>{dayjs(nextTrip.startDate).format('D MMM')} - {dayjs(nextTrip.endDate).format('D MMM')}</Typography>
                      </Stack>
                    </Box>
                  </Box>
                </Card>
              );
            })()}
          </Box>
        )}

        {/* 3. OTROS VIAJES (LISTA COMPACTA UNIFICADA) */}
        {otherTrips.length > 0 && (
          <Box>
            <Typography variant="subtitle2" fontWeight="800" sx={{ mb: 1.5, ml: 1, color: 'text.secondary', letterSpacing: 1, textTransform: 'uppercase', fontSize: '0.75rem' }}>
              OTROS VIAJES
            </Typography>

            {/* CONTENEDOR GRIS UNIFICADO */}
            <Paper elevation={0} sx={{
              bgcolor: theme.palette.mode === 'light' ? '#F3F4F6' : '#1C1C1E',
              borderRadius: '24px', p: 1,
              border: 'none',
              overflow: 'hidden'
            }}>
              <Stack spacing={0.8}>
                {otherTrips.map(trip => (
                  <Card key={trip.id} sx={{ borderRadius: '16px', bgcolor: 'background.paper', overflow: 'hidden', position: 'relative', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                    <CardActionArea onClick={() => navigate(`/trip/${trip.id}`)} sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'stretch' }}>
                      <Box sx={{ width: 80, minWidth: 80, height: 80, position: 'relative' }}>
                        <TripCoverImage url={trip.coverImageUrl} place={trip.place} height="100%" />
                      </Box>
                      <CardContent sx={{ flexGrow: 1, py: 1, px: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        {/* Título con espacio reservado a la derecha para botones */}
                        <Box sx={{ width: '100%', pr: 10 }}>
                          <Typography variant="subtitle1" fontWeight="800" sx={{ color: 'text.primary', lineHeight: 1.2, mb: 0.5, fontSize: '0.95rem' }}>
                            {trip.title}
                          </Typography>
                          <Stack direction="row" alignItems="center" gap={0.5} color="text.secondary">
                            <LocationOnIcon sx={{ fontSize: 14, color: theme.palette.custom.place.color }} />
                            <Typography variant="caption" fontWeight="600" noWrap>{trip.place}</Typography>
                          </Stack>
                        </Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1, bgcolor: theme.palette.mode === 'light' ? '#F3F4F6' : 'rgba(255,255,255,0.05)', alignSelf: 'flex-start', px: 1, py: 0.3, borderRadius: '6px', fontWeight: 600 }}>
                          {dayjs(trip.startDate).format('D MMM YYYY')}
                        </Typography>
                      </CardContent>
                    </CardActionArea>

                    {/* ACCIONES FLOTANTES (Con fondo blanco/negro para resaltar) */}
                    <Box position="absolute" top={8} right={8} sx={{ zIndex: 10, display: 'flex', gap: 0.5 }}>
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); setShareTripId(trip.id); setOpenShare(true); }} sx={{ color: 'text.secondary', bgcolor: theme.palette.background.paper, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', '&:hover': { color: 'primary.main' } }}>
                        <ShareIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                      <IconButton size="small" onClick={(e) => openEdit(e, trip)} sx={{ color: 'text.secondary', bgcolor: theme.palette.background.paper, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', '&:hover': { color: 'primary.main' } }}>
                        <EditIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDelete(e, trip.id); }} sx={{ color: '#E57373', bgcolor: theme.palette.background.paper, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', '&:hover': { bgcolor: '#FFEBEE' } }}>
                        <DeleteForeverIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>
                  </Card>
                ))}
              </Stack>
            </Paper>
          </Box>
        )}

        {/* EMPTY STATE */}
        {trips.length === 0 && (
          <Box textAlign="center" mt={10} opacity={0.6}>
            <FlightTakeoffIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" fontWeight="700">Sin viajes todavía</Typography>
            <Typography variant="body2">Dale al botón + para empezar tu aventura</Typography>
          </Box>
        )}

      </Container>

      {/* FAB */}
      <Fab variant="extended" onClick={() => setOpenModal(true)} sx={{
        position: 'fixed', bottom: 24, right: 24, bgcolor: 'primary.main', color: 'white', fontWeight: 700, borderRadius: '20px', boxShadow: '0 10px 20px -5px rgba(0,0,0,0.3)', '&:hover': { bgcolor: 'primary.dark' },// ANIMACIÓN 4: POP UP ELÁSTICO (RETRASO 0.3s)
        animation: 'popIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s backwards',
        '@keyframes popIn': {
          '0%': { opacity: 0, transform: 'scale(0.8) translateY(40px)' },
          '100%': { opacity: 1, transform: 'scale(1) translateY(0)' }
        }
      }}>
        <AddIcon sx={{ mr: 1, fontSize: 20 }} /> Nuevo Viaje
      </Fab>

      {/* MODALES */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="xs"> <DialogTitle sx={{ fontWeight: 700, textAlign: 'center' }}>Nuevo Viaje</DialogTitle> <DialogContent> <Stack spacing={2} mt={1}> <TextField label="Título" fullWidth variant="filled" InputProps={{ disableUnderline: true }} value={newTrip.title} onChange={e => setNewTrip({ ...newTrip, title: e.target.value })} /> <TextField label="Lugar" fullWidth variant="filled" InputProps={{ disableUnderline: true }} value={newTrip.place} onChange={e => setNewTrip({ ...newTrip, place: e.target.value })} /> <Stack direction="row" gap={2}> <TextField type="date" label="Inicio" fullWidth InputProps={{ disableUnderline: true }} variant="filled" InputLabelProps={{ shrink: true }} value={newTrip.startDate} onChange={e => setNewTrip({ ...newTrip, startDate: e.target.value })} /> <TextField type="date" label="Fin" fullWidth InputProps={{ disableUnderline: true }} variant="filled" InputLabelProps={{ shrink: true }} value={newTrip.endDate} onChange={e => setNewTrip({ ...newTrip, endDate: e.target.value })} /> </Stack> <TextField label="URL Foto Portada (Opcional)" fullWidth variant="filled" InputProps={{ disableUnderline: true, startAdornment: <LinkIcon sx={{ color: 'text.secondary', mr: 1 }} /> }} value={newTrip.coverImageUrl} onChange={e => setNewTrip({ ...newTrip, coverImageUrl: e.target.value })} /> </Stack> </DialogContent> <DialogActions sx={{ p: 3, justifyContent: 'center' }}> <Button onClick={() => setOpenModal(false)} sx={{ color: 'text.secondary', bgcolor: 'transparent !important' }}>Cancelar</Button> <Button variant="contained" onClick={handleSave} disableElevation sx={{ bgcolor: 'primary.main', color: 'white' }}>Crear Viaje</Button> </DialogActions> </Dialog>
      <Dialog open={openEditModal} onClose={() => setOpenEditModal(false)} fullWidth maxWidth="xs"> <DialogTitle sx={{ fontWeight: 700 }}>Editar Viaje</DialogTitle> <DialogContent> <Stack spacing={2} mt={1}> <TextField label="Título" fullWidth variant="filled" InputProps={{ disableUnderline: true }} value={editTripData.title} onChange={e => setEditTripData({ ...editTripData, title: e.target.value })} /> <TextField label="Lugar" fullWidth variant="filled" InputProps={{ disableUnderline: true }} value={editTripData.place} onChange={e => setEditTripData({ ...editTripData, place: e.target.value })} /> <Stack direction="row" gap={2}> <TextField type="date" label="Inicio" fullWidth variant="filled" InputProps={{ disableUnderline: true }} InputLabelProps={{ shrink: true }} value={editTripData.startDate} onChange={e => setEditTripData({ ...editTripData, startDate: e.target.value })} /> <TextField type="date" label="Fin" fullWidth variant="filled" InputProps={{ disableUnderline: true }} InputLabelProps={{ shrink: true }} value={editTripData.endDate} onChange={e => setEditTripData({ ...editTripData, endDate: e.target.value })} /> </Stack> <TextField label="URL Foto Portada" fullWidth variant="filled" InputProps={{ disableUnderline: true }} value={editTripData.coverImageUrl} onChange={e => setEditTripData({ ...editTripData, coverImageUrl: e.target.value })} /> </Stack> </DialogContent> <DialogActions sx={{ p: 3 }}> <Button onClick={() => setOpenEditModal(false)} sx={{ bgcolor: 'transparent !important' }}>Cancelar</Button> <Button variant="contained" onClick={handleUpdateTrip} sx={{ bgcolor: 'primary.main', color: 'white' }}>Guardar</Button> </DialogActions> </Dialog>
      <Dialog open={openShare} onClose={() => setOpenShare(false)} fullWidth maxWidth="xs"> <DialogTitle sx={{ fontWeight: 700 }}>Invitar</DialogTitle> <DialogContent> <TextField autoFocus label="Email Gmail" type="email" fullWidth variant="filled" InputProps={{ disableUnderline: true }} value={shareEmail} onChange={e => setShareEmail(e.target.value)} sx={{ mt: 1 }} /> </DialogContent> <DialogActions sx={{ p: 3 }}> <Button onClick={() => setOpenShare(false)} sx={{ bgcolor: 'transparent !important' }}>Cancelar</Button> <Button variant="contained" onClick={handleShare} sx={{ bgcolor: 'primary.main', color: 'white' }}>Enviar</Button> </DialogActions> </Dialog>
      <TravioProModal open={paywallOpen} onClose={() => setPaywallOpen(false)} />
      {/* --- AÑADE ESTO --- */}
      <SuccessProModal 
        open={showSuccessModal} 
        onClose={() => setShowSuccessModal(false)} 
      />
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
  const [activeId, setActiveId] = useState(null); // Estado para el DragOverlay
  const theme = useTheme();

  // --- 1. CARGA DE DATOS (SUPABASE) ---
  useEffect(() => {
    const fetchSpots = async () => {
      const { data, error } = await supabase
        .from('trip_spots')
        .select('*')
        .eq('trip_id', tripId)
        .order('order_index', { ascending: true });

      if (!error && data) {
        const mappedSpots = data.map(s => ({
          id: s.id,
          name: s.name,
          category: s.category,
          description: s.description,
          mapsLink: s.maps_link,
          tags: s.tags || [],
          order: s.order_index,
          location_name: s.location_name
        }));
        setSpots(mappedSpots);
      }
    };

    fetchSpots();

    // Suscripción Realtime
    const sub = supabase
      .channel('spots_view')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trip_spots', filter: `trip_id=eq.${tripId}` },
        () => fetchSpots())
      .subscribe();

    return () => { supabase.removeChannel(sub); };
  }, [tripId]);

  // --- 2. LÓGICA DE FILTROS Y GRUPOS ---
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
      case 'Salud': return { icon: <LocalHospitalIcon />, label: 'Salud', bg: theme.palette.mode === 'light' ? '#FFDAD6' : '#411616', color: theme.palette.mode === 'light' ? '#410002' : '#ffb4ab', border: theme.palette.mode === 'light' ? '#FFB4AB' : '#691d1d' };
      default: return { icon: <StarIcon />, label: 'Otros', ...theme.palette.custom.place };
    }
  };

  const handleDeleteSpot = async (id) => {
    if (confirm("¿Borrar sitio?")) {
      await supabase.from('trip_spots').delete().eq('id', id);
    }
  };

  // --- 3. SENSORES DRAG & DROP ---
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEndSpot = async (event) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeSpot = spots.find(s => s.id === active.id);
    const overSpot = spots.find(s => s.id === over.id);

    // Solo permitimos reordenar si son de la misma categoría
    if (!activeSpot || !overSpot || activeSpot.category !== overSpot.category) return;

    const category = activeSpot.category || 'Otro';
    const categorySpots = spots.filter(s => (s.category || 'Otro') === category).sort((a, b) => (a.order || 0) - (b.order || 0));

    const oldIndex = categorySpots.findIndex(s => s.id === active.id);
    const newIndex = categorySpots.findIndex(s => s.id === over.id);

    const reordered = arrayMove(categorySpots, oldIndex, newIndex);

    // Actualización visual inmediata
    setSpots(prev => {
      const others = prev.filter(s => (s.category || 'Otro') !== category);
      return [...others, ...reordered];
    });

    // Guardado en BD
    const updates = reordered.map((spot, index) =>
      supabase.from('trip_spots').update({ order_index: index }).eq('id', spot.id)
    );
    await Promise.all(updates);
  };

  const isDndEnabled = isEditMode && filterTag === 'Todos';

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={(e) => {
        if (window.navigator.vibrate) window.navigator.vibrate(50);
        setActiveId(e.active.id);
      }}
      onDragEnd={handleDragEndSpot}
      onDragCancel={() => setActiveId(null)}
    >
      <Box pb={12} pt={2}>

        {/* FILTROS SUPERIORES */}
        <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 2, px: 2, '&::-webkit-scrollbar': { display: 'none' } }}>
          {allTags.map(tag => (
            <Chip key={tag} label={tag} onClick={() => setFilterTag(tag)}
              sx={{
                bgcolor: filterTag === tag ? 'text.primary' : 'background.paper',
                color: filterTag === tag ? 'background.paper' : 'text.primary',
                fontWeight: 600,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '12px'
              }} />
          ))}
        </Box>

        <Container maxWidth="sm">

          {/* ESTADO VACÍO */}
          {spots.length === 0 ? (
            <Box sx={{ mt: 10, textAlign: 'center', opacity: 0.6 }}>
              <Box sx={{ width: 80, height: 80, bgcolor: theme.palette.action.hover, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                <PlaceIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
              </Box>
              <Typography variant="h6" fontWeight="700">Lista de deseos vacía</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 250, mx: 'auto', mb: 2 }}>
                Guarda restaurantes, museos y sitios chulos.
              </Typography>
              <Button variant="outlined" onClick={openCreateSpot} sx={{ borderRadius: '20px', textTransform: 'none', fontWeight: 600 }}>Añadir primer sitio</Button>
            </Box>
          ) : (
            // LISTA DE CATEGORÍAS
            CATEGORY_ORDER.map(catName => {
              const catSpots = groupedSpots[catName];
              if (!catSpots || catSpots.length === 0) return null;
              const config = getCategoryConfig(catName);

              return (
                <Box key={catName} mb={3}>
                  {/* WRAPPER DEL GRUPO */}
                  <Paper
                    elevation={0}
                    sx={{
                      bgcolor: theme.palette.mode === 'light' ? '#F3F4F6' : '#1C1C1E',
                      borderRadius: '24px',
                      p: 1,
                      border: theme.palette.mode === 'light' ? '1px solid rgba(0,0,0,0.06)' : '1px solid rgba(255,255,255,0.08)',
                      boxShadow: theme.palette.mode === 'light' ? 'inset 0 2px 4px rgba(0,0,0,0.03)' : 'inset 0 2px 4px rgba(0,0,0,0.4)',
                      overflow: 'hidden'
                    }}
                  >
                    {/* CABECERA CATEGORÍA */}
                    <Stack direction="row" alignItems="center" gap={1} mb={1} px={1} pt={0.5}>
                      <Typography variant="h6" sx={{ color: config.color, fontWeight: 800, fontSize: '1rem' }}>
                        {config.label}
                      </Typography>
                      <Chip label={catSpots.length} size="small" sx={{ height: 20, bgcolor: config.bg, color: config.color, fontWeight: 700, border: 'none' }} />
                    </Stack>

                    <SortableContext items={catSpots.map(s => s.id)} strategy={verticalListSortingStrategy} disabled={!isDndEnabled}>
                      <Stack spacing={0.8}>
                        {catSpots.map(spot => (
                          <SortableItem key={spot.id} id={spot.id} disabled={!isDndEnabled}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                {/* TARJETA DE SITIO */}
                                <Card sx={{
                                  bgcolor: theme.palette.mode === 'light' ? '#FFFFFF' : '#2A2A2A',
                                  overflow: 'hidden',
                                  minHeight: isEditMode ? '72px' : 'auto',
                                  transition: 'transform 0.2s, box-shadow 0.2s',
                                  transform: isEditMode ? 'scale(0.98)' : 'none',

                                  // Bordes
                                  border: isEditMode ? `1px dashed ${theme.palette.primary.main}` : 'none',
                                  borderBottom: (!isEditMode && theme.palette.mode === 'light') ? '3px solid rgba(0,0,0,0.08)' : 'none',

                                  cursor: isDndEnabled ? 'grab' : 'default',
                                  display: 'flex',
                                  alignItems: 'center',
                                  borderRadius: '16px',
                                  boxShadow: theme.palette.mode === 'light' ? '0 2px 4px rgba(0,0,0,0.02)' : '0 4px 6px rgba(0,0,0,0.1)',
                                  // Importante para scroll en móvil
                                  touchAction: isDndEnabled ? 'none' : 'auto'
                                }}>
                                  <Box sx={{ p: 1.2, display: 'flex', gap: 1.2, alignItems: 'center', width: '100%' }}>
                                    {/* ICONO */}
                                    <Box sx={{ width: 36, height: 36, bgcolor: config.bg, color: config.color, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
                                      {React.cloneElement(config.icon, { sx: { fontSize: 20 } })}
                                    </Box>

                                    {/* CONTENIDO TEXTO */}
                                    <Box flexGrow={1} minWidth={0}>
                                      <Stack direction="row" justifyContent="space-between" alignItems="start">
                                        <Typography variant="subtitle2" fontWeight="700" color="text.primary" lineHeight={1.2}>{spot.name}</Typography>
                                        {!isEditMode && spot.mapsLink && (<IconButton size="small" sx={{ color: theme.palette.custom.place.color, opacity: 0.8, p: 0.5, mt: -0.5 }} onClick={() => window.open(spot.mapsLink, '_blank')}><MapIcon sx={{ fontSize: 18 }} /></IconButton>)}
                                      </Stack>
                                      {spot.location_name && (
                                        <Stack direction="row" alignItems="center" gap={0.5} mt={0.2} mb={0.2} sx={{ opacity: 0.7 }}>
                                          <PlaceIcon sx={{ fontSize: 12, color: theme.palette.custom.place.color }} />
                                          <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 600, color: 'text.secondary', textTransform: 'capitalize' }} noWrap>
                                            {spot.location_name}
                                          </Typography>
                                        </Stack>
                                      )}
                                      {spot.description && <Typography variant="body2" sx={{ opacity: 0.8, fontSize: '0.75rem', color: 'text.secondary', mt: 0.2 }} noWrap>{spot.description}</Typography>}

                                      <Stack direction="row" gap={0.5} mt={0.5} flexWrap="wrap">
                                        {spot.tags?.map(tag => <Chip key={tag} label={`#${tag}`} size="small" sx={{ height: 18, fontSize: '0.6rem', bgcolor: theme.palette.action.hover, border: 'none', '& .MuiChip-label': { px: 1, py: 0 } }} />)}
                                      </Stack>
                                    </Box>
                                  </Box>
                                </Card>
                              </Box>

                              {/* BOTONES EXTERNOS (SOLO EDICIÓN) */}
                              {isEditMode && (
                                <Stack direction="column" spacing={0.5} justifyContent="center" alignItems="center">
                                  <IconButton onClick={() => onEdit(spot)} sx={{ bgcolor: theme.palette.mode === 'light' ? 'white' : 'rgba(255,255,255,0.1)', color: 'primary.main', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', width: 32, height: 32 }}><EditIcon sx={{ fontSize: 18 }} /></IconButton>
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
            })
          )}
        </Container>

        {/* FAB */}
        <Fab variant="extended" onClick={openCreateSpot} sx={{ position: 'fixed', bottom: 100, right: 24, zIndex: 10, bgcolor: 'secondary.main', color: 'white', borderRadius: '20px', fontWeight: 700, boxShadow: '0 10px 20px -5px rgba(0,0,0,0.3)' }}>
          <AddIcon sx={{ mr: 1 }} /> Sitio
        </Fab>

        {/* --- DRAG OVERLAY (LA TARJETA FANTASMA) --- */}
        <DragOverlay>
          {activeId ? (
            (() => {
              const spot = spots.find(s => s.id === activeId);
              if (!spot) return null;
              const config = getCategoryConfig(spot.category || 'Otro');

              return (
                <Card sx={{
                  bgcolor: 'background.paper',
                  overflow: 'hidden',
                  height: '72px',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '16px',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.2)', // Sombra fuerte
                  border: `1px solid ${theme.palette.primary.main}`, // Borde azul
                  transform: 'scale(1.05)',
                  cursor: 'grabbing',
                  touchAction: 'none'
                }}>
                  <Box sx={{ p: 1.2, display: 'flex', gap: 1.2, alignItems: 'center', width: '100%' }}>
                    <Box sx={{ width: 36, height: 36, bgcolor: config.bg, color: config.color, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {React.cloneElement(config.icon, { sx: { fontSize: 20 } })}
                    </Box>
                    <Box flexGrow={1} minWidth={0}>
                      <Typography variant="subtitle2" fontWeight="700" color="text.primary" lineHeight={1.2}>{spot.name}</Typography>
                      {spot.description && <Typography variant="body2" sx={{ opacity: 0.8, fontSize: '0.75rem', color: 'text.secondary', mt: 0.2 }} noWrap>{spot.description}</Typography>}
                    </Box>
                  </Box>
                </Card>
              );
            })()
          ) : null}
        </DragOverlay>

      </Box>
    </DndContext>
  );
}
function ExpensesView({ trip, tripId, userEmail }) {
  const [expenses, setExpenses] = useState([]);

  // Modales
  const [openExpenseModal, setOpenExpenseModal] = useState(false);
  const [openAliasModal, setOpenAliasModal] = useState(false);
  const [openSettleModal, setOpenSettleModal] = useState(false);

  // Estados formularios
  const [newExpense, setNewExpense] = useState({ title: '', amount: '', payer: userEmail, date: dayjs().format('YYYY-MM-DD') });
  const [splitType, setSplitType] = useState('equal');
  const [manualShares, setManualShares] = useState({});
  const [editingAliases, setEditingAliases] = useState({});
  const [settleData, setSettleData] = useState({ debtor: '', creditor: '', amount: 0 });
  const [editingId, setEditingId] = useState(null);

  const theme = useTheme();
  const manualInputProps = useMemo(() => ({ disableUnderline: true, style: { borderRadius: 8, backgroundColor: theme.palette.background.paper }, endAdornment: <InputAdornment position="end">€</InputAdornment> }), [theme]);

  // 1. CARGA DE DATOS
  useEffect(() => {
    const fetchExpenses = async () => {
      const { data } = await supabase.from('trip_expenses').select('*').eq('trip_id', tripId).order('created_at', { ascending: false });
      if (data) setExpenses(data);
    };
    fetchExpenses();
    const sub = supabase.channel('expenses_view').on('postgres_changes', { event: '*', schema: 'public', table: 'trip_expenses', filter: `trip_id=eq.${tripId}` }, () => fetchExpenses()).subscribe();
    return () => { supabase.removeChannel(sub); };
  }, [tripId]);

  // Helpers
  const getName = (email) => {
    if (!email) return 'Anónimo';
    const cleanEmail = email.trim();
    const aliasMap = trip.aliases || {};
    return aliasMap[cleanEmail] || aliasMap[cleanEmail.toLowerCase()] || email.split('@')[0];
  };

  const formatMoney = (amount) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);

  // 2. CÁLCULOS
  const { total, balances, spendingByPerson } = useMemo(() => {
    if (!trip.participants || trip.participants.length === 0) return { total: 0, balances: {}, spendingByPerson: {} };

    let totalSpent = 0;
    const bals = {};
    const spending = {};

    trip.participants.forEach(p => { bals[p] = 0; spending[p] = 0; });

    expenses.forEach(e => {
      const amount = Number(e.amount) || 0;
      if (!e.is_reimbursement) {
        totalSpent += amount;
        if (spending[e.payer] !== undefined) spending[e.payer] += amount;
      }
      if (bals[e.payer] !== undefined) bals[e.payer] += amount;

      if (e.split_details && Object.keys(e.split_details).length > 0) {
        Object.keys(e.split_details).forEach(person => {
          if (bals[person] !== undefined) bals[person] -= Number(e.split_details[person]);
        });
      } else if (!e.is_reimbursement) {
        const share = amount / trip.participants.length;
        trip.participants.forEach(p => bals[p] -= share);
      }
    });
    return { total: totalSpent, balances: bals, spendingByPerson: spending };
  }, [expenses, trip.participants, trip.aliases]);

  // 3. HANDLERS (Igual que antes)
  const handleOpenAliasModal = () => { setEditingAliases(trip.aliases || {}); setOpenAliasModal(true); };
  const handleSaveAlias = async () => { const { error } = await supabase.from('trips').update({ aliases: editingAliases }).eq('id', tripId); if (error) alert("Error"); else setOpenAliasModal(false); };

  const handleSaveExpense = async () => {
    if (!newExpense.title || !newExpense.amount) return;
    const amountFloat = parseFloat(newExpense.amount);
    let finalSplit = null;
    if (splitType === 'manual') {
      const currentTotal = Object.values(manualShares).reduce((a, b) => a + parseFloat(b || 0), 0);
      if (Math.abs(currentTotal - amountFloat) > 0.05) { alert(`La suma no coincide`); return; }
      finalSplit = {}; trip.participants.forEach(p => finalSplit[p] = parseFloat(manualShares[p] || 0));
    }
    const expenseData = { title: newExpense.title, amount: amountFloat, payer: newExpense.payer, date: newExpense.date, trip_id: tripId, is_reimbursement: false, split_details: finalSplit };
    try {
      let savedData = null;
      if (editingId) {
        const { data, error } = await supabase.from('trip_expenses').update(expenseData).eq('id', editingId).select();
        if (error) throw error; savedData = data[0];
        setExpenses(prev => prev.map(e => e.id === editingId ? savedData : e));
      } else {
        const { data, error } = await supabase.from('trip_expenses').insert([expenseData]).select();
        if (error) throw error; savedData = data[0];
        setExpenses(prev => [savedData, ...prev]);
      }
      setOpenExpenseModal(false); setNewExpense({ title: '', amount: '', payer: userEmail, date: dayjs().format('YYYY-MM-DD') }); setManualShares({}); setSplitType('equal'); setEditingId(null);
    } catch (error) { console.error(error); }
  };

  const handleOpenEdit = (exp) => { setEditingId(exp.id); setNewExpense({ title: exp.title, amount: exp.amount, payer: exp.payer, date: exp.date }); if (exp.split_details) { setSplitType('manual'); setManualShares(exp.split_details); } else { setSplitType('equal'); setManualShares({}); } setOpenExpenseModal(true); };
  const handleDelete = async (id) => { if (confirm("¿Borrar?")) { await supabase.from('trip_expenses').delete().eq('id', id); setExpenses(prev => prev.filter(e => e.id !== id)); } };
  const openPayModal = (debtor, amount) => { setSettleData({ debtor, creditor: '', amount: Math.abs(amount).toFixed(2) }); setOpenSettleModal(true); };
  const handleSettleUp = async () => { const amount = parseFloat(settleData.amount); const reimbursementSplit = { [settleData.creditor]: amount }; const { data } = await supabase.from('trip_expenses').insert([{ title: 'REEMBOLSO', amount: amount, payer: settleData.debtor, date: dayjs().format('YYYY-MM-DD'), is_reimbursement: true, trip_id: tripId, split_details: reimbursementSplit }]).select(); setExpenses(prev => [data[0], ...prev]); setOpenSettleModal(false); };
  const handleManualShareChange = (email, value) => { setManualShares(prev => ({ ...prev, [email]: value })); }

  return (
    <Box pb={12} pt={2}>
      <Container maxWidth="sm">

        {/* 1. TARJETA TOTAL (VERSIÓN MINI) */}
        <Paper elevation={0} sx={{
          p: 1.5, // Padding reducido (antes 2.5)
          mb: 3,
          borderRadius: '20px',
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          boxShadow: '0 4px 15px -5px rgba(0,0,0,0.3)',
          position: 'relative', overflow: 'hidden'
        }}>
          <Box sx={{ position: 'absolute', top: -30, left: -30, width: 120, height: 120, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)' }} />

          <Stack direction="row" justifyContent="space-between" alignItems="center">

            {/* IZQUIERDA: TOTAL DISCRETO */}
            <Box ml={1}>
              <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 700, fontSize: '0.55rem', display: 'block', mb: 0 }}>
                TOTAL
              </Typography>
              <Typography variant="h6" fontWeight="800" sx={{ fontSize: '1.1rem', lineHeight: 1.2 }}>
                {formatMoney(total)}
              </Typography>
            </Box>

            {/* DERECHA: DESGLOSE */}
            <Box sx={{
              bgcolor: 'rgba(0,0,0,0.15)',
              borderRadius: '14px',
              py: 0.8, px: 1.2, // Padding interno más ajustado
              minWidth: 120
            }}>
              <Stack spacing={0.5}>
                {trip.participants && trip.participants.map(p => (
                  <Stack key={p} direction="row" justifyContent="space-between" alignItems="center" gap={1.5}>
                    <Stack direction="row" gap={0.8} alignItems="center">
                      <Avatar sx={{ width: 14, height: 14, fontSize: '0.45rem', bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 700 }}>
                        {getName(p).charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 600, maxWidth: 65, fontSize: '0.7rem' }} noWrap>
                        {getName(p)}
                      </Typography>
                    </Stack>
                    <Typography variant="caption" fontWeight="700" sx={{ fontSize: '0.7rem' }}>
                      {formatMoney(spendingByPerson[p] || 0)}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>

          </Stack>
        </Paper>

        {/* 2. BALANCES (DISEÑO INSET GROUPED) */}
        <Box mb={3}>
          {/* WRAPPER GRIS */}
          <Paper elevation={0} sx={{
            bgcolor: theme.palette.mode === 'light' ? '#F3F4F6' : '#1C1C1E',
            borderRadius: '24px', p: 1,
            border: theme.palette.mode === 'light' ? '1px solid rgba(0,0,0,0.06)' : '1px solid rgba(255,255,255,0.08)',
            boxShadow: theme.palette.mode === 'light' ? 'inset 0 2px 4px rgba(0,0,0,0.03)' : 'inset 0 2px 4px rgba(0,0,0,0.4)',
          }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1} px={1} pt={0.5}>
              <Typography variant="h6" fontWeight="800" sx={{ fontSize: '1rem' }}>Balances</Typography>
              <IconButton size="small" onClick={handleOpenAliasModal} sx={{ bgcolor: theme.palette.mode === 'light' ? 'white' : 'rgba(255,255,255,0.1)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <SettingsSuggestIcon fontSize="small" />
              </IconButton>
            </Stack>

            <Stack spacing={0.8}>
              {trip.participants && trip.participants.map(p => {
                const bal = balances[p] || 0;
                const isPositive = bal >= 0;
                return (
                  <Card key={p} sx={{
                    borderRadius: '16px',
                    bgcolor: theme.palette.mode === 'light' ? '#FFFFFF' : '#2A2A2A',
                    border: 'none',
                    boxShadow: theme.palette.mode === 'light' ? '0 1px 3px rgba(0,0,0,0.03)' : '0 4px 6px rgba(0,0,0,0.1)',
                    borderLeft: `5px solid ${isPositive ? '#4CAF50' : '#EF5350'}`
                  }}>
                    <Box p={1.5} display="flex" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" gap={1.5} alignItems="center">
                        <Avatar sx={{ width: 36, height: 36, bgcolor: theme.palette.action.selected, color: 'text.primary', fontWeight: 700, fontSize: '0.85rem' }}>
                          {getName(p).charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="700" lineHeight={1.2}>{getName(p)}</Typography>
                          <Typography variant="caption" sx={{ color: isPositive ? '#4CAF50' : '#EF5350', fontWeight: 700 }}>
                            {isPositive ? 'Le deben' : 'Debe'} {formatMoney(Math.abs(bal))}
                          </Typography>
                        </Box>
                      </Stack>
                      {!isPositive && Math.abs(bal) > 0.01 && (
                        <Button size="small" variant="contained" disableElevation onClick={() => openPayModal(p, bal)} sx={{ bgcolor: '#FFEBEE', color: '#D32F2F', fontSize: '0.7rem', borderRadius: '10px', fontWeight: 700, minWidth: 60, '&:hover': { bgcolor: '#FFCDD2' } }}>
                          Pagar
                        </Button>
                      )}
                    </Box>
                  </Card>
                )
              })}
            </Stack>
          </Paper>
        </Box>

        {/* 3. MOVIMIENTOS (DISEÑO INSET GROUPED) */}
        <Box mb={3}>
          <Paper elevation={0} sx={{
            bgcolor: theme.palette.mode === 'light' ? '#F3F4F6' : '#1C1C1E',
            borderRadius: '24px', p: 1,
            border: theme.palette.mode === 'light' ? '1px solid rgba(0,0,0,0.06)' : '1px solid rgba(255,255,255,0.08)',
            boxShadow: theme.palette.mode === 'light' ? 'inset 0 2px 4px rgba(0,0,0,0.03)' : 'inset 0 2px 4px rgba(0,0,0,0.4)',
            minHeight: 100
          }}>
            <Typography variant="h6" fontWeight="800" mb={1} px={1} pt={0.5} sx={{ fontSize: '1rem' }}>Movimientos</Typography>

            <Stack spacing={0.8}>
              {expenses.length === 0 && (
                <Box py={4} textAlign="center" opacity={0.5}>
                  <Typography variant="caption" fontWeight="600">No hay gastos aún</Typography>
                </Box>
              )}

              {expenses.map(exp => {
                const isReimbursement = exp.is_reimbursement;
                return (
                  <Card key={exp.id} sx={{
                    bgcolor: theme.palette.mode === 'light' ? '#FFFFFF' : '#2A2A2A',
                    borderRadius: '16px',
                    border: 'none',
                    boxShadow: theme.palette.mode === 'light' ? '0 1px 3px rgba(0,0,0,0.03)' : '0 4px 6px rgba(0,0,0,0.1)'
                  }}>
                    <Box p={1.5} display="flex" gap={1.5} alignItems="center">
                      <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: isReimbursement ? '#E8F5E9' : '#FFF3E0', color: isReimbursement ? '#2E7D32' : '#E65100', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        {isReimbursement ? <HandshakeIcon sx={{ fontSize: 20 }} /> : <EuroIcon sx={{ fontSize: 20 }} />}
                      </Box>
                      <Box flexGrow={1}>
                        <Typography variant="body2" fontWeight="700" color="text.primary" lineHeight={1.2}>{exp.title}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          {isReimbursement ? 'De' : 'Pagó'} <strong>{getName(exp.payer)}</strong>
                        </Typography>
                      </Box>
                      <Box textAlign="right">
                        <Typography variant="body2" fontWeight="800" sx={{ color: isReimbursement ? '#2E7D32' : 'text.primary' }}>{formatMoney(exp.amount)}</Typography>
                        <Stack direction="row" justifyContent="flex-end">
                          <IconButton size="small" onClick={() => handleOpenEdit(exp)} sx={{ p: 0.5, color: 'text.secondary' }}><EditIcon sx={{ fontSize: 16 }} /></IconButton>
                          <IconButton size="small" onClick={() => handleDelete(exp.id)} sx={{ p: 0.5, color: 'text.disabled' }}><DeleteForeverIcon sx={{ fontSize: 16 }} /></IconButton>
                        </Stack>
                      </Box>
                    </Box>
                  </Card>
                )
              })}
            </Stack>
          </Paper>
        </Box>
      </Container>

      {/* FAB Gasto */}
      <Fab variant="extended" onClick={() => { setEditingId(null); setNewExpense({ title: '', amount: '', payer: userEmail, date: dayjs().format('YYYY-MM-DD') }); setSplitType('equal'); setManualShares({}); setOpenExpenseModal(true); }} sx={{ position: 'fixed', bottom: 100, right: 24, zIndex: 10, bgcolor: 'secondary.main', color: 'white', borderRadius: '20px', fontWeight: 700, boxShadow: '0 10px 20px -5px rgba(0,0,0,0.3)' }}><AddIcon sx={{ mr: 1, fontSize: 20 }} /> Gasto</Fab>

      {/* MODALES (MISMOS QUE ANTES) */}
      <Dialog open={openExpenseModal} onClose={() => setOpenExpenseModal(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 700, textAlign: 'center' }}>{editingId ? "Editar Gasto" : "Añadir Gasto"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField label="Concepto" fullWidth variant="filled" InputProps={{ disableUnderline: true }} value={newExpense.title} onChange={e => setNewExpense({ ...newExpense, title: e.target.value })} />
            <TextField label="Cantidad Total" type="number" fullWidth variant="filled" InputProps={{ disableUnderline: true, startAdornment: <InputAdornment position="start">€</InputAdornment> }} value={newExpense.amount} onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })} />
            <FormControl fullWidth variant="filled">
              <InputLabel disableAnimation shrink={true} sx={{ position: 'relative', left: -12, top: 10, mb: 1 }}>Pagado por</InputLabel>
              <Select value={trip.participants?.includes(newExpense.payer) ? newExpense.payer : ''} onChange={e => setNewExpense({ ...newExpense, payer: e.target.value })} disableUnderline variant="filled" sx={{ borderRadius: 2, bgcolor: 'action.hover', mt: 0 }}>
                {(!trip.participants || trip.participants.length === 0) && (<MenuItem value="" disabled>Cargando...</MenuItem>)}
                {trip.participants && trip.participants.map(p => (<MenuItem key={p} value={p}>{getName(p)}</MenuItem>))}
              </Select>
            </FormControl>
            <ToggleButtonGroup value={splitType} exclusive onChange={(e, val) => { if (val) setSplitType(val); }} fullWidth sx={{ mt: 1 }}>
              <ToggleButton value="equal" sx={{ borderRadius: '12px !important', border: 'none', bgcolor: splitType === 'equal' ? 'action.selected' : 'transparent' }}><GroupIcon sx={{ mr: 1, fontSize: 18 }} /> Iguales</ToggleButton>
              <ToggleButton value="manual" sx={{ borderRadius: '12px !important', border: 'none', bgcolor: splitType === 'manual' ? 'action.selected' : 'transparent' }}><PlaylistAddCheckIcon sx={{ mr: 1, fontSize: 18 }} /> Manual</ToggleButton>
            </ToggleButtonGroup>
            {splitType === 'manual' && (
              <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 3 }}>
                <Typography variant="caption" sx={{ mb: 1, display: 'block', fontWeight: 600, color: 'text.secondary' }}>Distribuir {newExpense.amount || 0}€:</Typography>
                {trip.participants && trip.participants.map(p => (
                  <Box key={p} display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" noWrap sx={{ width: '40%' }}>{getName(p)}</Typography>
                    <TextField type="number" variant="filled" size="small" hiddenLabel InputProps={manualInputProps} value={manualShares[p] ?? ''} onChange={(e) => handleManualShareChange(p, e.target.value)} sx={{ width: '50%' }} />
                  </Box>
                ))}
              </Box>
            )}
            <TextField type="date" label="Fecha" fullWidth variant="filled" InputProps={{ disableUnderline: true }} value={newExpense.date} onChange={e => setNewExpense({ ...newExpense, date: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'center' }}>
          <Button onClick={() => setOpenExpenseModal(false)} sx={{ color: 'text.secondary' }}>Cancelar</Button>
          <Button variant="contained" onClick={handleSaveExpense} sx={{ bgcolor: 'primary.main', color: 'white', borderRadius: '50px', px: 4 }}>Guardar</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openAliasModal} onClose={() => setOpenAliasModal(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Nombres / Alias</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            {trip.participants && trip.participants.map(email => (
              <TextField key={email} label={email} variant="filled" size="small" InputProps={{ disableUnderline: true, style: { borderRadius: 12 } }} value={editingAliases[email] || ''} onChange={(e) => setEditingAliases({ ...editingAliases, [email]: e.target.value })} placeholder={email.split('@')[0]} />
            ))}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenAliasModal(false)} sx={{ color: 'text.secondary' }}>Cancelar</Button>
          <Button onClick={handleSaveAlias} variant="contained" sx={{ bgcolor: 'primary.main', color: 'white' }}>Guardar</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openSettleModal} onClose={() => setOpenSettleModal(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Saldar Deuda</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField label="Quién paga" fullWidth variant="filled" disabled value={getName(settleData.debtor)} InputProps={{ disableUnderline: true }} />
            <FormControl fullWidth variant="filled">
              <InputLabel shrink>Para quién</InputLabel>
              <Select value={settleData.creditor} onChange={(e) => setSettleData({ ...settleData, creditor: e.target.value })} disableUnderline displayEmpty sx={{ borderRadius: 2, bgcolor: 'action.hover' }}>
                <MenuItem value="" disabled>Selecciona al receptor</MenuItem>
                {trip.participants && trip.participants.filter(p => balances[p] > 0).map(p => (<MenuItem key={p} value={p}>{getName(p)} (Le deben {formatMoney(balances[p])})</MenuItem>))}
              </Select>
            </FormControl>
            <TextField label="Cantidad" type="number" fullWidth variant="filled" InputProps={{ disableUnderline: true, startAdornment: <InputAdornment position="start">€</InputAdornment> }} value={settleData.amount} onChange={(e) => setSettleData({ ...settleData, amount: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenSettleModal(false)} sx={{ color: 'text.secondary' }}>Cancelar</Button>
          <Button onClick={handleSettleUp} variant="contained" disabled={!settleData.creditor || !settleData.amount} color="success" sx={{ color: 'white' }}>Pagar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
// Componente auxiliar para hacer que un día entero sea una zona de "aterrizaje"
function DroppableDay({ date, children }) {
  const { setNodeRef } = useDroppable({ id: date });

  return (
    <div ref={setNodeRef} style={{ width: '100%', height: '100%' }}>
      {children}
    </div>
  );
}

// Componente inteligente que averigua la ciudad y país desde un link
// Componente inteligente que averigua la ciudad y país (VERSIÓN BIGDATA CLOUD)
const LocationText = ({ url, color }) => {
  const [locationName, setLocationName] = useState(null);

  useEffect(() => {
    if (!url) return;

    // 1. Extraemos coordenadas del link con Regex
    let lat = null, lng = null;
    try {
      const pinMatch = url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
      if (pinMatch) { lat = pinMatch[1]; lng = pinMatch[2]; }
      else {
        const viewMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (viewMatch) { lat = viewMatch[1]; lng = viewMatch[2]; }
      }
    } catch (e) { }

    // 2. Si tenemos coordenadas, preguntamos a BigDataCloud (Más estable y sin CORS)
    if (lat && lng) {
      fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=es`)
        .then(res => res.json())
        .then(data => {
          // Esta API devuelve los datos de forma muy limpia
          const city = data.city || data.locality || data.principalSubdivision;
          const country = data.countryName;

          if (city && country) {
            // Evitamos redundancia tipo "Madrid, Madrid"
            if (city === country) setLocationName(city);
            else setLocationName(`${city}, ${country}`);
          } else if (city) {
            setLocationName(city);
          }
        })
        .catch(() => setLocationName(null));
    }
  }, [url]);

  if (!locationName) return null;

  return (
    <Stack direction="row" alignItems="center" gap={0.5} mb={0.5} sx={{ opacity: 0.7 }}>
      <PlaceIcon sx={{ fontSize: 12, color: color }} />
      <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 600, color: 'text.secondary', textTransform: 'capitalize' }} noWrap>
        {locationName}
      </Typography>
    </Stack>
  );
};

// --- DETALLE VIAJE (REORDENACIÓN + EDICIÓN SITIOS) ---
// --- NUEVO TripDetailScreen CON SUPABASE ---
// IMPORTAR EL CONTEXTO

function TripDetailScreen() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
// Dentro de TripDetailScreen
const [paywallOpen, setPaywallOpen] = useState(false); 
const [paywallReason, setPaywallReason] = useState('offline');
  // 1. CONECTAR CON LA CACHÉ GLOBAL
   const { 
    getCachedTrip, 
    updateTripCache, 
    userProfile,     // <--- ESTO ES LO QUE FALTA
    fetchUserProfile // <--- Y ESTO TAMBIÉN
  } = useTripContext();
  const cachedData = getCachedTrip(tripId); // Recuperamos datos de memoria/disco

  // --- ESTADOS DE DATOS (INICIALIZADOS CON CACHÉ) ---
  // Si cachedData.trip existe, se muestra al instante. Si no, null (spinner).
  const [trip, setTrip] = useState(cachedData.trip || null);
  const [items, setItems] = useState(cachedData.items || []);

  // ... (Resto de estados de UI: currentView, modales, etc. IGUAL QUE ANTES) ...
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState(0);
  // ... copia aquí todos tus useState de modales, forms, etc ...
  // (Para abreviar no los pego todos, pero MANTENLOS)
  const [openItemModal, setOpenItemModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [newItem, setNewItem] = useState({ type: "place", title: "", time: "10:00", mapsLink: "", description: "", flightNumber: "", terminal: "", gate: "", origin: "", destination: "" });
  const [files, setFiles] = useState([]);
  const [existingAttachments, setExistingAttachments] = useState([]);
  const [filesToDelete, setFilesToDelete] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [caching, setCaching] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [editNotesOpen, setEditNotesOpen] = useState(false);
  const [tripNotes, setTripNotes] = useState(cachedData.trip?.notes || ""); // También cacheamos las notas
  const [isNotesExpanded, setIsNotesExpanded] = useState(false);
  const [isChecklistExpanded, setIsChecklistExpanded] = useState(false);
  const [newCheckItem, setNewCheckItem] = useState('');
  const [openSpotModal, setOpenSpotModal] = useState(false);
  const [newSpot, setNewSpot] = useState({ name: "", category: "Comida", description: "", mapsLink: "", tags: "" });
  const [editingSpotId, setEditingSpotId] = useState(null);
  const [isEditModeSpots, setIsEditModeSpots] = useState(false);
  const [isSavingSpot, setIsSavingSpot] = useState(false);
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [openWallet, setOpenWallet] = useState(false);
  const [activeId, setActiveId] = useState(null);


  // --- EFECTOS DE CARGA (AHORA ACTUALIZAN LA CACHÉ) ---

  // 2. SEGUNDO: Busca el useEffect que carga el usuario y cámbialo por este:
  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser(user);
        // Esto es lo que faltaba: cargar los datos Pro/Almacenamiento
        fetchUserProfile(user.id); 
      }
    };
    loadData();
  }, [fetchUserProfile]); // Se ejecutará al entrar a la pantalla

  // Cargar Viaje y Actualizar Caché
  useEffect(() => {
    const fetchTrip = async () => {
      const { data, error } = await supabase.from('trips').select('*').eq('id', tripId).single();
      if (!error) {
        const tripData = {
          id: data.id,
          title: data.title,
          place: data.place,
          startDate: data.start_date,
          endDate: data.end_date,
          coverImageUrl: data.cover_image_url,
          notes: data.notes || "",
          checklist: data.checklist || [],
          participants: data.participants || [],
          aliases: data.aliases || {}
        };

        setTrip(tripData);
        setTripNotes(data.notes || "");

        // GUARDAR EN CACHÉ GLOBAL (Para la próxima vez)
        updateTripCache(tripId, 'trip', tripData);
      }
    };

    // Si no teníamos caché, cargamos. Si teníamos, cargamos igual en background para refrescar.
    fetchTrip();

    const tripSub = supabase.channel('trip_updates')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'trips', filter: `id=eq.${tripId}` },
        (payload) => {
          const newData = payload.new;
          setTrip(prev => {
            const updated = { ...prev, notes: newData.notes, checklist: newData.checklist, aliases: newData.aliases || {} };
            updateTripCache(tripId, 'trip', updated); // Actualizar Caché
            return updated;
          });
          setTripNotes(newData.notes || "");
        })
      .subscribe();
    return () => { supabase.removeChannel(tripSub); };
  }, [tripId]);

  // Cargar Items y Actualizar Caché
  useEffect(() => {
    const fetchItems = async () => {
      const { data, error } = await supabase
        .from('trip_items')
        .select('*')
        .eq('trip_id', tripId)
        .order('order_index', { ascending: true });

      if (!error) {
        const mappedItems = data.map(i => ({
          id: i.id,
          ...i,
          date: i.date,
          time: i.time ? i.time.slice(0, 5) : '',
          mapsLink: i.maps_link,
          flightNumber: i.flight_number,
          order: i.order_index,
          location_name: i.location_name
        }));

        setItems(mappedItems);
        // GUARDAR EN CACHÉ GLOBAL
        updateTripCache(tripId, 'items', mappedItems);
      }
    };

    fetchItems();

    const itemsSub = supabase.channel('items_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trip_items', filter: `trip_id=eq.${tripId}` },
        () => fetchItems())
      .subscribe();
    return () => { supabase.removeChannel(itemsSub); };
  }, [tripId]);

  // ... (EL RESTO DEL CÓDIGO: Helpers, Handlers y Return SE QUEDAN EXACTAMENTE IGUAL) ...

  // --- HELPERS ---
  const fetchLocationFromUrl = async (url) => {
    if (!url) return null;
    let lat = null, lng = null;
    try {
      const pinMatch = url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
      if (pinMatch) { lat = pinMatch[1]; lng = pinMatch[2]; }
      else {
        const viewMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (viewMatch) { lat = viewMatch[1]; lng = viewMatch[2]; }
      }
    } catch (e) { }

    if (lat && lng) {
      try {
        const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=es`);
        const data = await res.json();
        const city = data.city || data.locality || data.principalSubdivision;
        const country = data.countryName;
        if (city && country) return city === country ? city : `${city}, ${country}`;
        return city || country || null;
      } catch (e) { return null; }
    }
    return null;
  };

  const getTypeConfig = (type) => {
    switch (type) {
      case "flight": return { icon: <FlightTakeoffIcon fontSize="small" />, label: "Vuelo", ...theme.palette.custom.flight };
      case "food": return { icon: <RestaurantIcon fontSize="small" />, label: "Comida", ...theme.palette.custom.food };
      case "transport": return { icon: <DirectionsIcon fontSize="small" />, label: "Transporte", ...theme.palette.custom.transport };
      default: return { icon: <LocationOnIcon fontSize="small" />, label: "Lugar", ...theme.palette.custom.place };
    }
  };

  // --- MANEJADORES DE ITINERARIO ---

  const openCreate = (date) => {
    setNewItem({ type: 'place', title: '', time: '10:00', mapsLink: '', description: '', flightNumber: '', terminal: '', gate: '', origin: '', destination: '' });
    setFiles([]);
    setExistingAttachments([]);
    setFilesToDelete([]); // Reset cola
    setSelectedDate(date);
    setIsEditing(false);
    setOpenItemModal(true);
  };

  const openEdit = (item) => {
    setNewItem({
      type: item.type, title: item.title, time: item.time, mapsLink: item.mapsLink || '',
      description: item.description || '', flightNumber: item.flightNumber || '',
      terminal: item.terminal || '', gate: item.gate || '', origin: item.origin || '', destination: item.destination || ''
    });
    setSelectedDate(item.date);
    setExistingAttachments(item.attachments || []);
    setFiles([]);
    setFilesToDelete([]); // Reset cola
    setEditingId(item.id);
    setIsEditing(true);
    setOpenItemModal(true);
  };

  const deleteAttachment = (index) => {
    const attachmentToRemove = existingAttachments[index];
    // Si viene de Supabase, a la cola de borrado
    if (attachmentToRemove.path) {
      setFilesToDelete(prev => [...prev, attachmentToRemove.path]);
    }
    const updated = [...existingAttachments];
    updated.splice(index, 1);
    setExistingAttachments(updated);
  };

  const handleSaveItem = async () => {
    if (!newItem.title) return;

  // --- NUEVOS LÍMITES 50MB / 5GB ---
  const LIMIT_FREE = 50 * 1024 * 1024;   // 50MB en bytes
  const LIMIT_PRO = 5120 * 1024 * 1024;  // 5GB en bytes
  
  const currentLimit = userProfile.is_pro ? LIMIT_PRO : LIMIT_FREE;
  const newFilesSize = files.reduce((acc, f) => acc + f.size, 0);

  if (userProfile.storage_used + newFilesSize > currentLimit) {
    if (!userProfile.is_pro) {
      setPaywallReason('storage'); // "Has superado tus 50MB..."
      setPaywallOpen(true);
    } else {
      alert("Has superado incluso el límite Pro de 5GB. Por favor, elimina archivos antiguos.");
    }
    return;
  }
  // -------------------------------

  setUploading(true);

    // 1. Borrar archivos eliminados de la nube
    if (filesToDelete.length > 0) {
      try {
        await supabase.storage.from('trip-attachments').remove(filesToDelete);
      } catch (e) { console.warn("Error limpieza archivos", e); }
    }

    let finalAttachments = [...existingAttachments];

    // 2. Subir nuevos
    if (files.length > 0) {
      try {
        for (const file of files) {
          const filePath = `${tripId}/${Date.now()}_${file.name}`;
          const { error: uploadError } = await supabase.storage.from('trip-attachments').upload(filePath, file);
          if (uploadError) throw uploadError;
          const { data: { publicUrl } } = supabase.storage.from('trip-attachments').getPublicUrl(filePath);
          finalAttachments.push({ name: file.name, url: publicUrl, path: filePath, type: file.type });
        }
      } catch (e) {
        alert("Error subida: " + e.message);
        setUploading(false);
        return;
      }
    }

    // 3. Calcular ubicación
    const locationName = await fetchLocationFromUrl(newItem.mapsLink);

    const itemData = {
      type: newItem.type,
      title: newItem.title,
      description: newItem.description,
      date: selectedDate,
      time: newItem.time,
      maps_link: newItem.mapsLink,
      location_name: locationName, // Guardar ubicación
      origin: newItem.origin,
      destination: newItem.destination,
      flight_number: newItem.flightNumber,
      terminal: newItem.terminal,
      gate: newItem.gate,
      attachments: finalAttachments,
      trip_id: tripId
    };

    if (isEditing) {
      await supabase.from('trip_items').update(itemData).eq('id', editingId);
    } else {
      await supabase.from('trip_items').insert([{ ...itemData, order_index: Date.now() }]);
    }

    setOpenItemModal(false);
    setUploading(false);
  };

  const handleDeleteItem = async (id) => {
    if (confirm("¿Eliminar evento?")) {
      await supabase.from('trip_items').delete().eq('id', id);
    }
  };

  // --- DRAG & DROP ITINERARIO (ROBUSTO) ---
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 15 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;
    const activeItem = items.find(i => i.id === active.id);
    const overItem = items.find(i => i.id === over.id);
    if (!activeItem) return;
    const overDate = overItem ? overItem.date : over.id;

    if (activeItem.date !== overDate) {
      setItems((prev) => {
        const activeIndex = prev.findIndex((i) => i.id === active.id);
        const overIndex = overItem ? prev.findIndex((i) => i.id === over.id) : prev.length + 1;
        const newItems = [...prev];
        newItems[activeIndex] = { ...newItems[activeIndex], date: overDate };
        return arrayMove(newItems, activeIndex, overIndex >= 0 ? overIndex : activeIndex);
      });
    }
  };

  const handleDragEnd = async (event) => {
    setActiveId(null);
    document.body.style.overflow = '';
    document.body.style.touchAction = '';

    const { active, over } = event;
    if (!over) return;

    const activeItem = items.find(i => i.id === active.id);
    const overItem = items.find(i => i.id === over.id);
    if (!activeItem) return;

    const targetDate = overItem ? overItem.date : over.id;

    // Optimistic Update & Cleanup Duplicates
    setItems((prevItems) => {
      const cleanList = prevItems.filter(item => item.id !== active.id);
      const updatedItem = { ...activeItem, date: targetDate };
      const targetDayItems = cleanList.filter(item => item.date === targetDate).sort((a, b) => (a.order || 0) - (b.order || 0));

      let insertIndex = targetDayItems.length;
      if (overItem) {
        const indexOver = targetDayItems.findIndex(i => i.id === over.id);
        if (indexOver >= 0) {
          insertIndex = indexOver;
          if (activeItem.date === targetDate && activeItem.order < overItem.order) insertIndex += 1;
        }
      }

      targetDayItems.splice(insertIndex, 0, updatedItem);
      const otherDaysItems = cleanList.filter(item => item.date !== targetDate);
      return [...otherDaysItems, ...targetDayItems];
    });

    // DB Update
    const itemsClone = items.filter(i => i.id !== active.id); // Usamos snapshot actual
    const targetList = itemsClone.filter(i => i.date === targetDate).sort((a, b) => (a.order || 0) - (b.order || 0));

    let dbInsertIndex = targetList.length;
    if (overItem) {
      const idx = targetList.findIndex(i => i.id === over.id);
      if (idx >= 0) {
        dbInsertIndex = idx;
        if (activeItem.date === targetDate && activeItem.order < overItem.order) dbInsertIndex += 1;
      }
    }

    targetList.splice(dbInsertIndex, 0, { ...activeItem, date: targetDate });

    const updates = targetList.map((item, index) => ({
      id: item.id,
      order_index: index,
      date: targetDate,
      trip_id: tripId
    }));

    await Promise.all(updates.map(u =>
      supabase.from('trip_items').update({ order_index: u.order_index, date: u.date }).eq('id', u.id)
    ));
  };

  // --- OFFLINE ---
 const handleCacheAll = async () => {
  console.log("Intentando descargar... Estado de Pro:", userProfile?.is_pro);
  // --- EL CANDADO PRO ---
  // Si no es pro, abrimos el modal y cortamos la ejecución (return)
  if (!userProfile?.is_pro) {
     console.log("No es pro. Intentando abrir modal...");
    console.log("Acceso denegado: Usuario no es Pro");
    setPaywallReason('offline'); // Para que el modal sepa qué texto mostrar
    setPaywallOpen(true);        // Abre tu modal de "Hazte Pro"
    return;                      // <--- MUY IMPORTANTE: Detiene la descarga
  }
  // ----------------------

  // Si pasa el filtro anterior, entonces sí descarga:
  if (!confirm(`¿Descargar todos los documentos disponibles para verlos sin internet?`)) return;

  setCaching(true);
  try {
    for (const item of items) {
      if (item.attachments && item.attachments.length > 0) {
        for (const att of item.attachments) {
          if (att.path) {
            const existing = await get(att.path);
            if (!existing) {
              const { data, error } = await supabase.storage
                .from('trip-attachments')
                .download(att.path);
              if (!error && data) await set(att.path, data);
            }
          }
        }
      }
    }
    setShowToast(true);
    setRefreshTrigger(p => p + 1);
  } catch (e) {
    console.error(e);
  } finally {
    setCaching(false);
  }
};

  const openAttachment = async (att) => {
    if (att.path) {
      try {
        const blob = await get(att.path);
        if (blob) return window.open(URL.createObjectURL(blob));
      } catch (e) { }
    }
    window.open(att.url, '_blank');
    if (att.path) {
      try {
        const { data, error } = await supabase.storage.from('trip-attachments').download(att.path);
        if (!error && data) {
          await set(att.path, data);
          setRefreshTrigger(p => p + 1);
        }
      } catch (e) { }
    }
  };

  // --- MANEJADORES DE SITIOS (PARA MODALES EN ESTE COMPONENTE) ---
  const handleOpenCreateSpot = () => {
    setEditingSpotId(null);
    setNewSpot({ name: "", category: "Comida", description: "", mapsLink: "", tags: "" });
    setOpenSpotModal(true);
  };
  const handleOpenEditSpot = (spot) => {
    setEditingSpotId(spot.id);
    setNewSpot({ name: spot.name, category: spot.category || "Comida", description: spot.description || "", mapsLink: spot.mapsLink || "", tags: spot.tags ? spot.tags.join(", ") : "" });
    setOpenSpotModal(true);
  };
  const handleSaveSpot = async () => {
    if (!newSpot.name) return;
    setIsSavingSpot(true);
    try {
      const locationName = await fetchLocationFromUrl(newSpot.mapsLink);
      const tagsArray = newSpot.tags.split(",").map((t) => t.trim()).filter((t) => t !== "");
      const spotData = {
        name: newSpot.name,
        category: newSpot.category,
        description: newSpot.description,
        maps_link: newSpot.mapsLink,
        location_name: locationName,
        tags: tagsArray,
        trip_id: tripId
      };
      if (editingSpotId) {
        await supabase.from('trip_spots').update(spotData).eq('id', editingSpotId);
      } else {
        await supabase.from('trip_spots').insert([{ ...spotData, order_index: Date.now() }]);
      }
      setOpenSpotModal(false);
    } catch (e) { alert("Error: " + e.message); }
    finally { setIsSavingSpot(false); }
  };

  // --- MANEJADORES NOTAS/CHECKLIST ---
  const handleSaveNotes = async () => {
    await supabase.from('trips').update({ notes: tripNotes }).eq('id', tripId);
    setEditNotesOpen(false);
  };
  const handleAddCheckItem = async () => {
    if (!newCheckItem.trim()) return;
    const currentList = trip.checklist || [];
    const updatedList = [...currentList, { text: newCheckItem, done: false }];
    await supabase.from('trips').update({ checklist: updatedList }).eq('id', tripId);
    setNewCheckItem('');
  };
  const handleToggleCheckItem = async (index) => {
    const updatedList = [...(trip.checklist || [])];
    updatedList[index].done = !updatedList[index].done;
    await supabase.from('trips').update({ checklist: updatedList }).eq('id', tripId);
  };
  const handleDeleteCheckItem = async (index) => {
    const updatedList = [...(trip.checklist || [])];
    updatedList.splice(index, 1);
    await supabase.from('trips').update({ checklist: updatedList }).eq('id', tripId);
  };

  // --- RENDER ---
  if (!trip) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;
  let days = [];
  try {
    const s = trip?.startDate ? dayjs(trip.startDate) : dayjs();
    const e = trip?.endDate ? dayjs(trip.endDate) : s;
    for (let i = 0; i <= Math.max(0, e.diff(s, "day")); i++) days.push(s.add(i, "day").format("YYYY-MM-DD"));
  } catch (e) { }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={(event) => {
        if (window.navigator.vibrate) window.navigator.vibrate(50);
        setActiveId(event.active.id);
        document.body.style.overflow = 'hidden';
        document.body.style.touchAction = 'none';
      }}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={() => { setActiveId(null); document.body.style.overflow = ''; document.body.style.touchAction = ''; }}
    >
      <Box sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        pb: 10,


      }}>
        {/* HEADER */}
        <AppBar position="sticky" elevation={0} sx={{
          bgcolor: theme.palette.mode === "light" ? "rgba(245, 247, 250, 0.45)" : "rgba(18, 18, 18, 0.45)", backdropFilter: "blur(24px)", borderBottom: `1px solid ${theme.palette.mode === "light" ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.05)"}`, color: "text.primary", top: 0, zIndex: 1100, // NUEVA ANIMACIÓN: Solo opacidad, sin movimiento brusco
          animation: 'fadeIn 0.6s ease-out',
          '@keyframes fadeIn': {
            '0%': { opacity: 0 },
            '100%': { opacity: 1 }
          }
        }}>
          <Toolbar sx={{ justifyContent: "space-between", py: 1 }}>
            <IconButton onClick={() => navigate("/")} sx={{ bgcolor: theme.palette.mode === "light" ? "#FFFFFF" : "rgba(255,255,255,0.1)", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", mr: 2 }}>
              <ArrowBackIcon fontSize="small" />
            </IconButton>
            <Box sx={{ flexGrow: 1, overflow: "hidden" }}>
              <Typography variant="h6" noWrap sx={{ fontWeight: 800, fontSize: "1.1rem", lineHeight: 1.2 }}>{trip.title}</Typography>
              <Stack direction="row" alignItems="center" spacing={0.5} mt={0.5}>
                <Box sx={{ bgcolor: theme.palette.custom.place.bg, borderRadius: "6px", px: 0.8, py: 0.2, display: "flex", alignItems: "center" }}>
                  <LocationOnIcon sx={{ fontSize: 12, color: theme.palette.custom.place.color, mr: 0.5 }} />
                  <Typography variant="caption" sx={{ fontWeight: 700, fontSize: "0.75rem", color: theme.palette.custom.place.color }}>{trip.place}</Typography>
                </Box>
              </Stack>
            </Box>
            <Stack direction="row" spacing={1}>
              {(currentView === 0 || currentView === 1) && (
                <IconButton onClick={() => currentView === 0 ? setIsReorderMode(!isReorderMode) : setIsEditModeSpots(!isEditModeSpots)} sx={{ color: (isReorderMode || isEditModeSpots) ? 'white' : 'primary.main', bgcolor: (isReorderMode || isEditModeSpots) ? 'primary.main' : (theme.palette.mode === 'light' ? '#FFFFFF' : 'rgba(255,255,255,0.1)'), boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  {(isReorderMode || isEditModeSpots) ? <CheckIcon fontSize="small" /> : <EditIcon fontSize="small" />}
                </IconButton>
              )}
              {items.some(i => i.type === 'flight' || i.type === 'transport') && (
                <IconButton onClick={() => setOpenWallet(true)} sx={{ color: openWallet ? 'white' : 'secondary.main', bgcolor: openWallet ? 'secondary.main' : (theme.palette.mode === 'light' ? '#FFFFFF' : 'rgba(255,255,255,0.1)'), boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  <ConfirmationNumberIcon fontSize="small" />
                </IconButton>
              )}
              <IconButton onClick={handleCacheAll} disabled={caching} sx={{ color: caching ? "text.disabled" : theme.palette.primary.main, bgcolor: theme.palette.mode === "light" ? "#FFFFFF" : "rgba(255,255,255,0.1)", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                {caching ? <CircularProgress size={20} /> : <CloudDownloadIcon fontSize="small" />}
              </IconButton>
            </Stack>
          </Toolbar>
        </AppBar>

{/* ⚠️ AÑADE ESTO JUSTO ANTES DEL CIERRE DEL BOX PRINCIPAL ⚠️ */}
        <TravioProModal 
          open={paywallOpen} 
          onClose={() => setPaywallOpen(false)} 
        />
        {/* --- CONTENEDOR VISTAS (PERSISTENCIA) --- */}
        <Box sx={{
          pb: 12,
          // NUEVA ANIMACIÓN: El contenido sube desde abajo
          animation: 'contentSlide 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
          '@keyframes contentSlide': {
            '0%': { opacity: 0, transform: 'translateY(40px)' },
            '100%': { opacity: 1, transform: 'translateY(0)' }
          }
        }}>

          {/* VISTA 0: ITINERARIO */}
          <Box sx={{ display: currentView === 0 ? 'block' : 'none' }}>
            <Container maxWidth="sm" sx={{ py: 2 }}>

              {/* Panel Control Notas/Checklist */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3, alignItems: 'start' }}>
                {/* Notas */}
                <Card sx={{ bgcolor: theme.palette.custom.note.bg, border: `1px solid ${theme.palette.custom.note.border}`, color: theme.palette.custom.note.titleColor, borderRadius: '24px' }}>
                  <CardActionArea onClick={() => setIsNotesExpanded(!isNotesExpanded)} sx={{ p: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" gap={1.5} alignItems="center">
                        <Box sx={{ bgcolor: 'rgba(255,255,255,0.5)', p: 0.8, borderRadius: '10px', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><StickyNote2Icon sx={{ fontSize: 20 }} /></Box>
                        <Typography variant="subtitle2" fontWeight="800">Notas</Typography>
                      </Stack>
                      <KeyboardArrowDownIcon sx={{ transform: isNotesExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                    </Stack>
                  </CardActionArea>
                  <Collapse in={isNotesExpanded}>
                    <Box sx={{ p: 2 }}>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-line', opacity: 0.9, mb: 2 }}>{trip.notes || "Sin notas."}</Typography>
                      <Button size="small" fullWidth onClick={() => setEditNotesOpen(true)} sx={{ bgcolor: 'rgba(255,255,255,0.6)', borderRadius: '12px', fontWeight: 700 }}>Editar</Button>
                    </Box>
                  </Collapse>
                </Card>
                {/* Checklist */}
                <Card sx={{ bgcolor: theme.palette.mode === 'light' ? '#E3F2FD' : '#0D1B2A', border: theme.palette.mode === 'light' ? '1px solid #BBDEFB' : '1px solid #1E3A8A', color: theme.palette.mode === 'light' ? '#1565C0' : '#90CAF9', borderRadius: '24px' }}>
                  <CardActionArea onClick={() => setIsChecklistExpanded(!isChecklistExpanded)} sx={{ p: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" gap={1.5} alignItems="center">
                        <Box sx={{ bgcolor: theme.palette.mode === 'light' ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.1)', p: 0.8, borderRadius: '10px', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChecklistRtlIcon sx={{ fontSize: 20 }} /></Box>
                        <Typography variant="subtitle2" fontWeight="800">Tareas</Typography>
                      </Stack>
                      <Stack direction="row" gap={1} alignItems="center">
                        {(trip.checklist || []).length > 0 && <Chip label={`${(trip.checklist || []).filter(i => i.done).length}/${(trip.checklist || []).length}`} size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800, bgcolor: 'rgba(0,0,0,0.05)', color: 'inherit', border: 'none' }} />}
                        <KeyboardArrowDownIcon sx={{ transform: isChecklistExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                      </Stack>
                    </Stack>
                  </CardActionArea>
                  <Collapse in={isChecklistExpanded}>
                    <Box sx={{ p: 2 }}>
                      <Stack spacing={1} mb={2}>
                        {(trip.checklist || []).map((item, idx) => (
                          <Box key={idx} display="flex" alignItems="center" gap={1} sx={{ opacity: item.done ? 0.5 : 1 }}>
                            <IconButton size="small" onClick={() => handleToggleCheckItem(idx)} sx={{ p: 0, color: item.done ? 'inherit' : 'primary.main' }}><CheckBoxOutlineBlankIcon fontSize="small" /></IconButton>
                            <Typography variant="caption" sx={{ textDecoration: item.done ? 'line-through' : 'none', flexGrow: 1, fontWeight: 600 }} onClick={() => handleToggleCheckItem(idx)}>{item.text}</Typography>
                            <IconButton size="small" onClick={() => handleDeleteCheckItem(idx)} sx={{ p: 0, opacity: 0.5 }}><CloseIcon sx={{ fontSize: 14 }} /></IconButton>
                          </Box>
                        ))}
                      </Stack>
                      <Stack direction="row" gap={1} mt={2} alignItems="center">
                        <TextField placeholder="Añadir..." variant="filled" hiddenLabel fullWidth value={newCheckItem} onChange={(e) => setNewCheckItem(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddCheckItem()} InputProps={{ disableUnderline: true }} sx={{ flexGrow: 1, '& .MuiFilledInput-root': { borderRadius: '12px', bgcolor: theme.palette.mode === 'light' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.2)', padding: 0 }, '& .MuiFilledInput-input': { padding: '10px 12px', fontSize: '0.85rem' } }} />
                        <IconButton onClick={handleAddCheckItem} disabled={!newCheckItem.trim()} sx={{ bgcolor: 'primary.main', color: 'white', borderRadius: '12px', width: 40, height: 40, '&:hover': { bgcolor: 'primary.dark' } }}><AddIcon fontSize="small" /></IconButton>
                      </Stack>
                    </Box>
                  </Collapse>
                </Card>
              </Box>

              {/* DÍAS */}
              {days.map((d, idx) => {
                const itemsOfDay = items.filter(i => i.date === d).sort((a, b) => (a.order || 0) - (b.order || 0));
                const isDayEmpty = itemsOfDay.length === 0;
                return (
                  <Box key={d} mb={3}>
                    <DroppableDay date={d}>
                      <Paper elevation={0} sx={{ bgcolor: theme.palette.mode === 'light' ? '#F3F4F6' : '#1C1C1E', borderRadius: '24px', p: 1, border: theme.palette.mode === 'light' ? '1px solid rgba(0,0,0,0.06)' : '1px solid rgba(255,255,255,0.08)', boxShadow: theme.palette.mode === 'light' ? 'inset 0 2px 4px rgba(0,0,0,0.03)' : 'inset 0 2px 4px rgba(0,0,0,0.4)', minHeight: '100px' }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5} pl={0.5} pr={0.5} pt={0.5}>
                          <Chip label={dayjs(d).format('dddd D [de] MMMM')} sx={{ bgcolor: theme.palette.custom.dateChip.bg, color: theme.palette.custom.dateChip.color, fontWeight: 800, fontSize: '0.9rem', height: 36, borderRadius: '12px', textTransform: 'capitalize', border: theme.palette.mode === 'light' ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(255,255,255,0.2)', px: 0.5, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }} />
                          <IconButton onClick={() => openCreate(d)} size="small" sx={{ bgcolor: theme.palette.mode === 'light' ? '#FFFFFF' : 'rgba(255,255,255,0.1)', color: 'primary.main', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', width: 32, height: 32, '&:hover': { bgcolor: 'primary.main', color: 'white' } }}><AddIcon sx={{ fontSize: 18 }} /></IconButton>
                        </Stack>
                        {isDayEmpty ? (
                          <Box onClick={() => openCreate(d)} sx={{ py: 3, textAlign: 'center', cursor: 'pointer', borderRadius: '16px', border: `2px dashed ${theme.palette.divider}`, bgcolor: theme.palette.mode === 'light' ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.03)', opacity: 0.6 }}><Typography variant="caption" fontWeight="700" color="text.secondary">Sin planes (Suelta aquí)</Typography></Box>
                        ) : (
                          <SortableContext items={itemsOfDay.map(i => i.id)} strategy={verticalListSortingStrategy}>
                            <Stack spacing={0.8}>
                              {itemsOfDay.map((item, index) => {
                                const themeColor = theme.palette.custom?.[item.type] || theme.palette.custom.place;
                                const config = getTypeConfig(item.type);
                                const isFlight = item.type === 'flight';
                                const atts = item.attachments || [];

                                const cardContent = (
                                  <Card sx={{ bgcolor: theme.palette.mode === 'light' ? '#FFFFFF' : '#2A2A2A', overflow: 'hidden', minHeight: isReorderMode ? '72px' : 'auto', transition: 'transform 0.2s, box-shadow 0.2s', transform: isReorderMode ? 'scale(0.98)' : 'none', border: isReorderMode ? `1px dashed ${theme.palette.primary.main}` : (theme.palette.mode === 'light' ? '1px solid rgba(0,0,0,0.05)' : 'none'), borderBottom: (!isReorderMode && theme.palette.mode === 'light') ? '3px solid rgba(0,0,0,0.08)' : 'none', boxShadow: theme.palette.mode === 'light' ? '0 2px 4px rgba(0,0,0,0.02)' : '0 4px 6px rgba(0,0,0,0.1)', borderRadius: '16px', touchAction: 'pan-y' }}>
                                    <Box sx={{ p: 1.2, display: 'flex', gap: 1.2, alignItems: 'flex-start', width: '100%' }}>
                                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 36, pt: 0.5 }}>
                                        <Box sx={{ width: 36, height: 36, bgcolor: themeColor.bg, color: themeColor.color, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.05)', flexShrink: 0 }}>{React.cloneElement(config.icon, { sx: { fontSize: 20 } })}</Box>
                                        <Typography variant="caption" fontWeight="700" sx={{ mt: 0.3, color: 'text.secondary', fontSize: '0.65rem', lineHeight: 1 }}>{item.time}</Typography>
                                      </Box>
                                      <Box flexGrow={1} minWidth={0} pt={0.3}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="start">
                                          <Box>
                                            <Typography variant="subtitle2" fontWeight="700" lineHeight={1.2} sx={{ mb: 0.2, fontSize: '0.85rem', color: 'text.primary' }}>{item.title}</Typography>
                                            {!isReorderMode && item.location_name && (<Stack direction="row" alignItems="center" gap={0.5} mb={0.5} sx={{ opacity: 0.7 }}><PlaceIcon sx={{ fontSize: 12, color: themeColor.color }} /><Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 600, color: 'text.secondary', textTransform: 'capitalize' }} noWrap>{item.location_name}</Typography></Stack>)}
                                          </Box>
                                          {!isReorderMode && item.mapsLink && (<IconButton size="small" onClick={(e) => { e.stopPropagation(); window.open(item.mapsLink, '_blank'); }} sx={{ color: themeColor.color, opacity: 0.8, mt: -0.5, p: 0.5, ml: 1 }}><MapIcon sx={{ fontSize: 18 }} /></IconButton>)}
                                        </Stack>
                                        {!isReorderMode && (<>{isFlight && (item.flightNumber || item.terminal || item.gate) && (<Stack direction="row" gap={0.5} mt={0} flexWrap="wrap">{item.flightNumber && <Chip label={item.flightNumber} size="small" sx={{ bgcolor: themeColor.bg, color: themeColor.color, height: 18, fontSize: '0.6rem', fontWeight: 600, border: 'none' }} />}{(item.terminal || item.gate) && <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>{item.terminal && `T${item.terminal}`} {item.gate && ` • P${item.gate}`}</Typography>}</Stack>)}{item.description && (<Typography variant="body2" sx={{ mt: 0.3, color: 'text.secondary', fontSize: '0.75rem', lineHeight: 1.3 }}>{item.description}</Typography>)}{atts.length > 0 && (<Stack direction="row" gap={0.5} mt={0.8} flexWrap="wrap">{atts.map((att, i) => (<SmartAttachmentChip key={i} attachment={att} onOpen={openAttachment} refreshTrigger={refreshTrigger} />))}</Stack>)}</>)}
                                      </Box>
                                    </Box>
                                  </Card>
                                );
                                return (<SortableItem key={item.id} id={item.id} disabled={!isReorderMode}><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><Box sx={{ flexGrow: 1, minWidth: 0 }}>{cardContent}</Box>{isReorderMode && (<Stack direction="column" spacing={0.5} justifyContent="center" alignItems="center"><IconButton onClick={(e) => { e.stopPropagation(); openEdit(item); }} sx={{ bgcolor: 'white', color: 'primary.main', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', width: 32, height: 32 }}><EditIcon sx={{ fontSize: 18 }} /></IconButton><IconButton onClick={(e) => { e.stopPropagation(); handleDeleteItem(item.id); }} sx={{ bgcolor: '#FFEBEE', color: '#D32F2F', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', width: 32, height: 32 }}><DeleteForeverIcon sx={{ fontSize: 18 }} /></IconButton></Stack>)}</Box></SortableItem>);
                              })}
                            </Stack>
                          </SortableContext>
                        )}
                      </Paper>
                    </DroppableDay>
                  </Box>
                )
              })}
            </Container>
          </Box>

          {/* VISTA 1: SITIOS */}
          <Box sx={{ display: currentView === 1 ? 'block' : 'none' }}>
            <SpotsView tripId={tripId} openCreateSpot={handleOpenCreateSpot} onEdit={handleOpenEditSpot} isEditMode={isEditModeSpots} />
          </Box>

          {/* VISTA 2: GASTOS */}
          <Box sx={{ display: currentView === 2 ? 'block' : 'none' }}>
            {trip && <ExpensesView trip={trip} tripId={tripId} userEmail={currentUser?.email} />}
          </Box>
        </Box>

        {/* BOTTOM NAV */}
        <Paper sx={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 20, borderRadius: '24px', bgcolor: theme.palette.mode === 'light' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(30, 30, 30, 0.6)', backdropFilter: 'blur(20px)', border: `1px solid ${theme.palette.mode === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.12)'}`, boxShadow: theme.palette.mode === 'light' ? '0 10px 40px -10px rgba(0,0,0,0.1)' : '0 10px 40px -10px rgba(0,0,0,0.5)', overflow: 'hidden', padding: '0 8px', maxWidth: '90%', width: 'auto',// NUEVA ANIMACIÓN: Entra desde abajo con un pequeño retraso (0.2s)
          animation: 'navSlideUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) 0.2s backwards',

          '@keyframes navSlideUp': {
            '0%': {
              opacity: 0,
              transform: 'translate(-50%, 100px)' // Empieza abajo fuera de pantalla
            },
            '100%': {
              opacity: 1,
              transform: 'translate(-50%, 0)' // Termina en su sitio
            }
          }
        }}>
          <BottomNavigation showLabels={false} value={currentView} onChange={(e, val) => setCurrentView(val)} sx={{ bgcolor: "transparent", height: 64, width: "auto", gap: 1 }}>
            <BottomNavigationAction label="Itinerario" icon={<ListIcon />} sx={{ color: "text.secondary", minWidth: 80, borderRadius: "20px", "&.Mui-selected": { paddingTop: 0, "& .MuiSvgIcon-root": { color: "primary.main" } }, "&.Mui-selected .MuiSvgIcon-root": { bgcolor: "secondary.light", width: 56, height: 32, borderRadius: "16px", py: 0.5, boxSizing: "content-box" } }} />
            <BottomNavigationAction label="Sitios" icon={<PlaceIcon />} sx={{ color: "text.secondary", minWidth: 80, borderRadius: "20px", "&.Mui-selected": { paddingTop: 0, "& .MuiSvgIcon-root": { color: "primary.main" } }, "&.Mui-selected .MuiSvgIcon-root": { bgcolor: "secondary.light", width: 56, height: 32, borderRadius: "16px", py: 0.5, boxSizing: "content-box" } }} />
            <BottomNavigationAction label="Gastos" icon={<EuroIcon />} sx={{ color: "text.secondary", minWidth: 80, borderRadius: "20px", "&.Mui-selected": { paddingTop: 0, "& .MuiSvgIcon-root": { color: "primary.main" } }, "&.Mui-selected .MuiSvgIcon-root": { bgcolor: "secondary.light", width: 56, height: 32, borderRadius: "16px", py: 0.5, boxSizing: "content-box" } }} />
          </BottomNavigation>
        </Paper>

        {/* MODAL CREAR ITEM */}
        <Dialog open={openItemModal} onClose={() => setOpenItemModal(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: '28px', padding: '8px' } }}>
          <DialogTitle sx={{ textAlign: "center", fontWeight: "bold", fontSize: "1.1rem" }}>{isEditing ? "Editar" : "Nuevo Evento"}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} mt={1}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 1 }}>
                {['place', 'food', 'transport', 'flight'].map(t => {
                  const cfg = getTypeConfig(t);
                  const isSel = newItem.type === t;
                  return (
                    <Paper key={t} elevation={0} onClick={() => setNewItem({ ...newItem, type: t })} sx={{ cursor: 'pointer', borderRadius: '12px', p: 1, border: `2px solid ${isSel ? cfg.color : 'transparent'}`, bgcolor: isSel ? cfg.bg : (theme.palette.mode === 'light' ? '#F3F4F6' : 'rgba(255,255,255,0.05)'), display: 'flex', alignItems: 'center', gap: 1, transition: 'all 0.2s', position: 'relative', overflow: 'hidden', '&:hover': { bgcolor: isSel ? cfg.bg : theme.palette.action.hover } }}>
                      <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: isSel ? 'white' : 'background.paper', color: cfg.color, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', flexShrink: 0 }}>{React.cloneElement(cfg.icon, { fontSize: 'small' })}</Box>
                      <Typography variant="body2" fontWeight={700} sx={{ fontSize: '0.8rem', lineHeight: 1.1 }} color={isSel ? 'text.primary' : 'text.secondary'}>{cfg.label}</Typography>
                      {isSel && <CheckCircleOutlineIcon sx={{ position: 'absolute', top: 4, right: 4, fontSize: 14, color: cfg.color, opacity: 0.8 }} />}
                    </Paper>
                  )
                })}
              </Box>
              {newItem.type === 'flight' ? (
                <>
                  <TextField label="Aerolínea / Vuelo" fullWidth variant="filled" InputProps={{ disableUnderline: true }} size="small" value={newItem.title} onChange={e => setNewItem({ ...newItem, title: e.target.value })} />
                  <Stack direction="row" gap={1}>
                    <TextField label="Origen (MAD)" fullWidth variant="filled" InputProps={{ disableUnderline: true }} size="small" value={newItem.origin || ''} onChange={e => setNewItem({ ...newItem, origin: e.target.value.toUpperCase() })} />
                    <TextField label="Destino (LHR)" fullWidth variant="filled" InputProps={{ disableUnderline: true }} size="small" value={newItem.destination || ''} onChange={e => setNewItem({ ...newItem, destination: e.target.value.toUpperCase() })} />
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
                  <TextField label={newItem.type === "transport" ? "Transporte" : "Nombre"} fullWidth variant="filled" InputProps={{ disableUnderline: true }} size="small" value={newItem.title} onChange={(e) => setNewItem({ ...newItem, title: e.target.value })} />
                  <TextField label="Dirección / Link" fullWidth variant="filled" size="small" value={newItem.mapsLink} onChange={(e) => setNewItem({ ...newItem, mapsLink: e.target.value })} InputProps={{ disableUnderline: true, endAdornment: <LocationOnIcon sx={{ color: 'text.secondary', fontSize: 20 }} /> }} />
                  <TextField label="Hora" type="time" fullWidth variant="filled" InputProps={{ disableUnderline: true }} size="small" value={newItem.time} onChange={(e) => setNewItem({ ...newItem, time: e.target.value })} />
                </>
              )}
              <TextField label="Notas" multiline rows={2} fullWidth variant="filled" InputProps={{ disableUnderline: true }} size="small" value={newItem.description || ""} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} />
              {existingAttachments.length > 0 && (
                <Stack gap={1} p={1} bgcolor="background.paper" borderRadius={2}>
                  {existingAttachments.map((a, i) => (
                    <Box key={i} display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="caption" noWrap sx={{ maxWidth: 180 }}>{a.name}</Typography>
                      <IconButton size="small" onClick={() => deleteAttachment(i)}><CloseIcon fontSize="small" /></IconButton>
                    </Box>
                  ))}
                </Stack>
              )}
              <Button variant="outlined" component="label" startIcon={<AttachFileIcon />} sx={{ borderStyle: "dashed", py: 1.5, borderColor: "action.disabled", color: "text.secondary", borderRadius: "12px" }}>
                {files.length > 0 ? `Subir ${files.length}` : "Adjuntar archivos"}
                <input type="file" multiple hidden onChange={(e) => setFiles(Array.from(e.target.files))} />
              </Button>
              {isEditing && (
                <Button color="error" startIcon={<DeleteForeverIcon />} onClick={() => { if (confirm("¿Borrar?")) handleDeleteItem(editingId); }}>Eliminar Evento</Button>
              )}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenItemModal(false)} sx={{ color: "text.secondary" }}>Cancelar</Button>
            <Button variant="contained" disabled={uploading} onClick={handleSaveItem} sx={{ bgcolor: "primary.main", color: "white" }}>{uploading ? "..." : "Guardar"}</Button>
          </DialogActions>
        </Dialog>

        {/* MODAL NOTAS */}
        <Dialog open={editNotesOpen} onClose={() => setEditNotesOpen(false)} fullWidth maxWidth="xs">
          <DialogTitle sx={{ fontWeight: 700 }}>Notas Rápidas</DialogTitle>
          <DialogContent>
            <TextField autoFocus multiline rows={6} fullWidth variant="filled" InputProps={{ disableUnderline: true }} value={tripNotes} onChange={(e) => setTripNotes(e.target.value)} placeholder="Ej: Wifi: 1234, Seguro..." sx={{ mt: 1 }} />
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setEditNotesOpen(false)} sx={{ color: 'text.secondary' }}>Cancelar</Button>
            <Button variant="contained" onClick={handleSaveNotes} sx={{ bgcolor: "primary.main", color: "white" }}>Guardar</Button>
          </DialogActions>
        </Dialog>

        {/* MODAL SITIO */}
        <Dialog open={openSpotModal} onClose={() => setOpenSpotModal(false)} fullWidth maxWidth="xs">
          <DialogTitle sx={{ fontWeight: 700 }}>Nuevo Sitio</DialogTitle>
          <DialogContent>
            <Stack spacing={2} mt={1}>
              <TextField label="Nombre del sitio" variant="filled" fullWidth size="small" InputProps={{ disableUnderline: true }} value={newSpot.name} onChange={(e) => setNewSpot({ ...newSpot, name: e.target.value })} />
              <FormControl fullWidth variant="filled" size="small">
                <InputLabel shrink sx={{ left: -12, top: -5 }}>Categoría</InputLabel>
                <Select value={newSpot.category} onChange={(e) => setNewSpot({ ...newSpot, category: e.target.value })} disableUnderline sx={{ borderRadius: 2, bgcolor: "action.hover" }}>
                  <MenuItem value="Comida">🍔 Comida</MenuItem>
                  <MenuItem value="Super">🛒 Supermercado</MenuItem>
                  <MenuItem value="Gasolina">⛽ Gasolinera</MenuItem>
                  <MenuItem value="Visita">📷 Turismo</MenuItem>
                  <MenuItem value="Salud">🏥 Salud</MenuItem>
                  <MenuItem value="Otro">⭐ Otro</MenuItem>
                </Select>
              </FormControl>
              <TextField label="Link Maps" variant="filled" fullWidth size="small" InputProps={{ disableUnderline: true }} value={newSpot.mapsLink} onChange={(e) => setNewSpot({ ...newSpot, mapsLink: e.target.value })} />
              <TextField label="Descripción" multiline rows={2} variant="filled" fullWidth size="small" InputProps={{ disableUnderline: true }} value={newSpot.description} onChange={(e) => setNewSpot({ ...newSpot, description: e.target.value })} />
              <TextField label="Etiquetas" variant="filled" fullWidth size="small" placeholder="barato, cena" InputProps={{ disableUnderline: true }} value={newSpot.tags} onChange={(e) => setNewSpot({ ...newSpot, tags: e.target.value })} />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenSpotModal(false)} sx={{ color: "text.secondary" }}>Cancelar</Button>
            <Button variant="contained" onClick={handleSaveSpot} disabled={isSavingSpot} sx={{ bgcolor: "primary.main", color: "white", minWidth: 100 }}>
              {isSavingSpot ? <CircularProgress size={24} color="inherit" /> : "Guardar"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* DRAWER WALLET */}
        <Drawer anchor="bottom" open={openWallet} onClose={() => setOpenWallet(false)} PaperProps={{ sx: { borderTopLeftRadius: "32px", borderTopRightRadius: "32px", maxHeight: "85vh", bgcolor: theme.palette.mode === "light" ? "#F3F4F6" : "#0F172A", pb: 4 } }}>
          <Box sx={{ width: 40, height: 4, bgcolor: "text.disabled", borderRadius: 2, mx: "auto", mt: 2, mb: 1, opacity: 0.3 }} />
          <Box p={3}>
            <Typography variant="h6" fontWeight="800" mb={3} textAlign="center">Mis Billetes</Typography>
            {items.filter((i) => i.type === "flight" || i.type === "transport").length === 0 ? (
              <Box textAlign="center" py={4} color="text.secondary"><Typography>No tienes billetes guardados.</Typography></Box>
            ) : (
              <Stack spacing={3}>
                {items.filter((i) => i.type === "flight" || i.type === "transport").map((item) => {
                  const isFlight = item.type === "flight";
                  const color = isFlight ? theme.palette.primary.main : theme.palette.secondary.main;
                  return (
                    <Card key={item.id} sx={{ borderRadius: "24px", overflow: "visible", boxShadow: "0 10px 30px rgba(0,0,0,0.15)", bgcolor: "background.paper" }}>
                      <Box sx={{ bgcolor: color, color: "white", p: 2.5 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Stack direction="row" gap={1} alignItems="center">
                            {isFlight ? <FlightTakeoffIcon /> : <DirectionsIcon />}
                            <Typography variant="h6" fontWeight="800">{item.title}</Typography>
                          </Stack>
                          <Typography variant="h6" fontWeight="800">{item.time}</Typography>
                        </Stack>
                        <Typography variant="caption" sx={{ opacity: 0.8, display: "block", mt: 0.5 }}>{dayjs(item.date).format("dddd, D MMMM YYYY")}</Typography>
                      </Box>
                      <CardContent sx={{ p: 3 }}>
                        <Stack direction="row" justifyContent="space-between" mb={3}>
                          <Box>
                            <Typography variant="caption" color="text.secondary" fontWeight="700">ORIGEN</Typography>
                            <Typography variant="h4" fontWeight="800" color="text.primary">{item.origin || '---'}</Typography>
                          </Box>
                          <Box display="flex" alignItems="center" justifyContent="center" px={2} sx={{ opacity: 0.3 }}><FlightIcon sx={{ transform: 'rotate(90deg)', fontSize: 32, color: 'text.primary' }} /></Box>
                          <Box textAlign="right">
                            <Typography variant="caption" color="text.secondary" fontWeight="700">DESTINO</Typography>
                            <Typography variant="h4" fontWeight="800" color="text.primary">{item.destination || '---'}</Typography>
                          </Box>
                        </Stack>
                        {isFlight && (
                          <Box sx={{ bgcolor: theme.palette.mode === "light" ? "#F9FAFB" : "#1e293b", p: 2, borderRadius: "16px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2 }}>
                            <Box><Typography variant="caption" color="text.secondary" fontWeight="700">VUELO</Typography><Typography variant="subtitle1" fontWeight="800">{item.flightNumber || "-"}</Typography></Box>
                            <Box textAlign="center"><Typography variant="caption" color="text.secondary" fontWeight="700">PUERTA</Typography><Typography variant="subtitle1" fontWeight="800">{item.gate || "-"}</Typography></Box>
                            <Box textAlign="right"><Typography variant="caption" color="text.secondary" fontWeight="700">ASIENTO</Typography><Typography variant="subtitle1" fontWeight="800">--</Typography></Box>
                          </Box>
                        )}
                      </CardContent>
                      <CardActionArea onClick={() => item.attachments?.[0] && openAttachment(item.attachments[0])} disabled={!item.attachments?.length} sx={{ borderTop: '2px dashed #E5E7EB', bgcolor: theme.palette.mode === 'light' ? '#FAFAFA' : '#111' }}>
                        <Box sx={{ position: 'relative', p: 2 }}>
                          <Box sx={{ position: "absolute", top: -10, left: -10, width: 20, height: 20, borderRadius: "50%", bgcolor: theme.palette.mode === "light" ? "#F3F4F6" : "#0F172A" }} />
                          <Box sx={{ position: "absolute", top: -10, right: -10, width: 20, height: 20, borderRadius: "50%", bgcolor: theme.palette.mode === "light" ? "#F3F4F6" : "#0F172A" }} />
                          <Stack direction="row" gap={2} alignItems="flex-start">
                            <Box sx={{ opacity: 0.3, pt: 0.5 }}><QrCode2Icon sx={{ fontSize: 48 }} /></Box>
                            <Box flexGrow={1}>
                              <Typography variant="caption" sx={{ letterSpacing: 2, fontWeight: 800, color: "text.secondary", mb: 1, display: "block" }}>BOARDING PASSES</Typography>
                              {!item.attachments?.length ? (
                                <Typography variant="caption" color="text.disabled" fontStyle="italic">Sin archivos adjuntos</Typography>
                              ) : (
                                <Stack spacing={1}>
                                  {item.attachments.map((att, index) => (
                                    <CardActionArea key={index} onClick={() => openAttachment(att)} sx={{ p: 1, borderRadius: "8px", border: "1px solid", borderColor: "divider", bgcolor: "background.paper", display: "flex", alignItems: "center", gap: 1.5, "&:hover": { bgcolor: theme.palette.action.hover } }}>
                                      <Box sx={{ bgcolor: "#FFEBEE", color: "#D32F2F", borderRadius: "4px", p: 0.5, display: "flex" }}><Typography variant="caption" fontWeight="bold" fontSize="0.6rem">PDF</Typography></Box>
                                      <Typography variant="body2" fontWeight="600" noWrap sx={{ maxWidth: "180px" }}>{att.name}</Typography>
                                    </CardActionArea>
                                  ))}
                                </Stack>
                              )}
                            </Box>
                          </Stack>
                        </Box>
                      </CardActionArea>
                    </Card>
                  );
                })}
              </Stack>
            )}
          </Box>
        </Drawer>

        {/* DRAG OVERLAY */}
        <DragOverlay>
          {activeId ? (
            (() => {
              const item = items.find(i => i.id === activeId);
              if (!item) return null;
              const themeColor = theme.palette.custom?.[item.type] || theme.palette.custom.place;
              const config = getTypeConfig(item.type);
              const isFlight = item.type === 'flight';
              return (
                <Card sx={{ bgcolor: 'background.paper', overflow: 'hidden', height: '72px', display: 'flex', alignItems: 'center', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', border: `1px solid ${theme.palette.primary.main}`, transform: 'scale(1.05)', cursor: 'grabbing', touchAction: 'none' }}>
                  <Box sx={{ p: 1.2, display: 'flex', gap: 1.2, alignItems: 'flex-start', width: '100%' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 36, pt: 0.5 }}>
                      <Box sx={{ width: 36, height: 36, bgcolor: themeColor.bg, color: themeColor.color, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{React.cloneElement(config.icon, { sx: { fontSize: 20 } })}</Box>
                      <Typography variant="caption" fontWeight="700" sx={{ mt: 0.3, color: 'text.secondary', fontSize: '0.65rem', lineHeight: 1 }}>{item.time}</Typography>
                    </Box>
                    <Box flexGrow={1} minWidth={0} pt={0.3}>
                      <Typography variant="subtitle2" fontWeight="700" lineHeight={1.2} sx={{ mb: 0.2, fontSize: '0.85rem', color: 'text.primary' }}>{item.title}</Typography>
                      {isFlight && item.flightNumber && <Chip label={item.flightNumber} size="small" sx={{ bgcolor: themeColor.bg, color: themeColor.color, height: 18, fontSize: '0.6rem', fontWeight: 600, border: 'none', mt: 0.5 }} />}
                      {item.description && !isFlight && <Typography variant="body2" noWrap sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{item.description}</Typography>}
                    </Box>
                  </Box>
                </Card>
              );
            })()
          ) : null}
        </DragOverlay>

        <Snackbar open={showToast} autoHideDuration={3000} onClose={() => setShowToast(false)} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
          <Alert onClose={() => setShowToast(false)} severity="success" sx={{ width: "100%", borderRadius: 3 }}>¡Descargado para Offline!</Alert>
        </Snackbar>

      </Box>
    </DndContext>
  );
}
// --- COMPONENTE MODAL PREMIUM UNIFICADO ---
// --- COMPONENTE MODAL PREMIUM UNIFICADO (ACTUALIZADO CON PAGO) ---
const TravioProModal = ({ open, onClose }) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      // 1. Obtenemos el usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        alert("Debes estar logueado para suscribirte");
        return;
      }

      // 2. Invocamos la Edge Function de Supabase que creamos antes
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          userId: user.id, 
          userEmail: user.email,
          // Asegúrate de tener VITE_STRIPE_PRICE_ID en tu archivo .env
          priceId: import.meta.env.VITE_STRIPE_PRICE_ID 
        }
      });

      if (error) throw error;

      // 3. Si la función nos devuelve una URL, redirigimos a Stripe
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Response("No se recibió la URL de pago");
      }

    } catch (err) {
      console.error("Error al iniciar el pago:", err);
      alert("Hubo un error al conectar con la pasarela de pago. Revisa la consola.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      PaperProps={{ sx: { borderRadius: '28px', p: 1, maxWidth: 350 } }}
    >
      <DialogContent sx={{ textAlign: 'center' }}>
        <Box sx={{ 
          width: 70, height: 70, bgcolor: theme.palette.primary.light, borderRadius: '20px', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 
        }}>
          <StarIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
        </Box>
        
        <Typography variant="h5" fontWeight="800" gutterBottom>Travio Pro</Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Lleva tu experiencia de viaje al siguiente nivel.
        </Typography>

        <Stack spacing={2} textAlign="left" mb={3}>
          {/* Beneficios */}
          <Stack direction="row" spacing={2} alignItems="center">
            <CloudDownloadIcon sx={{ color: 'primary.main' }} />
            <Box>
              <Typography variant="subtitle2" fontWeight="700">Modo Offline Total</Typography>
              <Typography variant="caption" color="text.secondary">Descarga todos los documentos de una vez.</Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={2} alignItems="center">
            <AttachFileIcon sx={{ color: 'primary.main' }} />
            <Box>
              <Typography variant="subtitle2" fontWeight="700">5 GB de Almacenamiento</Typography>
              <Typography variant="caption" color="text.secondary">Espacio de sobra para billetes y fotos.</Typography>
            </Box>
          </Stack>
        </Stack>

        {/* BOTÓN DE PAGO */}
        <Button 
          variant="contained" 
          fullWidth 
          disabled={loading}
          onClick={handleSubscribe}
          sx={{ py: 1.5, borderRadius: '15px', fontWeight: '800', fontSize: '1rem', bgcolor: 'primary.main', color: 'white' }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Suscribirme por 2,99€"}
        </Button>
        
        <Button onClick={onClose} fullWidth sx={{ mt: 1, color: 'text.secondary', textTransform: 'none' }}>
          Ahora no, gracias
        </Button>
      </DialogContent>
    </Dialog>
  );
};

const SuccessProModal = ({ open, onClose }) => {
  const theme = useTheme();
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      PaperProps={{ sx: { borderRadius: '32px', p: 2, textAlign: 'center', maxWidth: 350 } }}
    >
      <DialogContent>
        {/* Icono de celebración animado con un degradado */}
        <Box sx={{ 
          width: 80, height: 80, 
          bgcolor: '#4ADE80', 
          borderRadius: '50%', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          mx: 'auto', mb: 3,
          boxShadow: '0 10px 25px rgba(74, 222, 128, 0.4)',
          animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}>
          <CheckCircleOutlineIcon sx={{ fontSize: 50, color: 'white' }} />
        </Box>
        
        <Typography variant="h5" fontWeight="800" gutterBottom sx={{ color: 'text.primary' }}>
          ¡Ya eres Travio Pro! ⭐
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4, px: 1, lineHeight: 1.6 }}>
          Gracias por confiar en Travio. Hemos desbloqueado tus <strong>5GB de almacenamiento</strong> y el <strong>Modo Offline</strong> para todos tus viajes.
        </Typography>

        <Button 
          variant="contained" 
          fullWidth 
          onClick={onClose}
          sx={{ 
            py: 1.8, 
            borderRadius: '18px', 
            fontWeight: '800', 
            fontSize: '1rem',
            bgcolor: '#4ADE80',
            '&:hover': { bgcolor: '#22C55E' },
            boxShadow: '0 8px 20px rgba(74, 222, 128, 0.3)'
          }}
        >
          ¡A VIAJAR! 🚀
        </Button>
      </DialogContent>
    </Dialog>
  );
};


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
    // 1. Comprobamos si ya hay una sesión activa al abrir la app
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // 2. Nos suscribimos a cambios (Login, Logout, Auto-refresh del token)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // Limpieza al cerrar el componente
    return () => subscription.unsubscribe();
  }, []);

  // En App.jsx (función handleLogin)
  const handleLogin = async () => {
    try {
      await signInWithGoogle();
      // No hace falta hacer nada más, Supabase redirigirá o actualizará el estado
    } catch (e) {
      console.error(e)
    }
  };


  return (
    <TripProvider>
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
    </TripProvider>
  );
}

export default App;
