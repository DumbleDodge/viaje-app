import React, { useEffect, useState, useMemo } from 'react';
import { 
  Box, Container, Typography, Paper, Table, 
  TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Chip, CircularProgress, Button, LinearProgress,
  ToggleButton, ToggleButtonGroup, Stack, IconButton, Tooltip, Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import GroupIcon from '@mui/icons-material/Group';
import CloudIcon from '@mui/icons-material/Cloud';
import StarIcon from '@mui/icons-material/Star';
import StorageIcon from '@mui/icons-material/Storage';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import 'dayjs/locale/es';

// Gráficos
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer 
} from 'recharts';

dayjs.extend(isSameOrBefore);
dayjs.locale('es');

// --- CONSTANTES ---
const PLAN_LIMIT_GB = 10; 
const PLAN_LIMIT_BYTES = PLAN_LIMIT_GB * 1024 * 1024 * 1024;

const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// --- COMPONENTES UI ---
const StatCard = ({ title, value, icon, color, subValue, progress }) => (
  <Paper elevation={0} sx={{ p: 2.5, borderRadius: '20px', border: '1px solid rgba(0,0,0,0.1)', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
    <Box display="flex" alignItems="center" gap={2} mb={progress !== undefined ? 2 : 0}>
      <Box sx={{ p: 1.5, borderRadius: '14px', bgcolor: `${color}20`, color: color }}>
        {icon}
      </Box>
      <Box>
        <Typography variant="caption" color="text.secondary" fontWeight="700" textTransform="uppercase">{title}</Typography>
        <Typography variant="h4" fontWeight="800">{value}</Typography>
        {subValue && <Typography variant="caption" color="text.secondary" lineHeight={1} display="block">{subValue}</Typography>}
      </Box>
    </Box>
    {progress !== undefined && (
      <Box sx={{ mt: 1 }}>
        <LinearProgress variant="determinate" value={Math.min(progress, 100)} sx={{ height: 6, borderRadius: 5, bgcolor: `${color}20`, '& .MuiLinearProgress-bar': { bgcolor: progress > 90 ? '#ef5350' : color }}} />
      </Box>
    )}
  </Paper>
);

const MetricRow = ({ title, value, icon, color, subValue, data, dataKey, gradientId }) => (
  <Box mb={4}>
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="stretch">
      <Box sx={{ width: { xs: '100%', md: '30%' }, minWidth: { md: '250px' } }}>
        <StatCard title={title} value={value} icon={icon} color={color} subValue={subValue} />
      </Box>
      <Box sx={{ flexGrow: 1, width: '100%', minWidth: 0 }}>
        <Paper elevation={0} sx={{ borderRadius: '20px', border: '1px solid rgba(0,0,0,0.1)', bgcolor: '#fff', height: 220, position: 'relative', overflow: 'hidden' }}>
          {(!data || data.length === 0) ? (
            <Box display="flex" alignItems="center" justifyContent="center" height="100%" color="text.secondary"><Typography variant="caption">Cargando...</Typography></Box>
          ) : (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, paddingRight: '10px', paddingTop: '10px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={color} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9e9e9e' }} minTickGap={30} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9e9e9e' }} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} itemStyle={{ color: color, fontWeight: 'bold' }} />
                  <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={3} fill={`url(#${gradientId})`} isAnimationActive={true} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </Paper>
      </Box>
    </Stack>
  </Box>
);

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dbSize, setDbSize] = useState(null);
  const [timeRange, setTimeRange] = useState('30d');
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    // IMPORTANTE: Asegúrate de que el SQL de la tabla 'profiles' tenga la columna 'is_approved'
    const { data: userData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }); // Ordenamos por más recientes primero
    if (userData) setUsers(userData);
    
    // Si tu función RPC falla o no existe, esto no rompe la app
    try {
        const { data: sizeData } = await supabase.rpc('get_database_size');
        if (sizeData) setDbSize(sizeData);
    } catch(e) { console.warn("RPC size not found"); }
    
    setLoading(false);
  };

  // --- ACCIONES DE APROBACIÓN ---
  const handleApprove = async (userId) => {
    if(!confirm("¿Aprobar acceso a este usuario?")) return;
    
    const { error } = await supabase.from('profiles').update({ is_approved: true }).eq('id', userId);
    if (!error) {
        // Actualizamos localmente para que sea instantáneo
        setUsers(users.map(u => u.id === userId ? { ...u, is_approved: true } : u));
    } else {
        alert("Error al aprobar: " + error.message);
    }
  };

  const handleReject = async (userId) => {
    if(!confirm("¿DENEGAR acceso y ELIMINAR usuario de la lista? (No borra de Auth, solo de profiles visualmente, o implementa lógica de borrado completo)")) return;
    
    // Opción A: Solo borrar el perfil (el usuario sigue en Auth pero sin perfil)
    // Opción B: Cambiar un estado a 'rejected'.
    // Aquí haremos Opción C: Borrar de la tabla profiles para que desaparezca de la lista
    const { error } = await supabase.from('profiles').delete().eq('id', userId);
    
    if (!error) {
        setUsers(users.filter(u => u.id !== userId));
    } else {
        alert("Error al eliminar: " + error.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // --- FILTROS Y DATOS ---
  const pendingUsers = users.filter(u => !u.is_approved);
  const activeUsers = users.filter(u => u.is_approved);

  const chartData = useMemo(() => {
    if (users.length === 0) return [];
    let startDate = dayjs();
    if (timeRange === '7d') startDate = dayjs().subtract(7, 'day');
    if (timeRange === '30d') startDate = dayjs().subtract(30, 'day');
    if (timeRange === '90d') startDate = dayjs().subtract(90, 'day');
    if (timeRange === 'all') startDate = dayjs(users[users.length - 1]?.created_at || new Date());

    const data = [];
    const now = dayjs();
    let current = startDate;

    while (current.isSameOrBefore(now, 'day')) {
      const usersUntilNow = activeUsers.filter(u => dayjs(u.created_at).isSameOrBefore(current, 'day'));
      const proUntilNow = usersUntilNow.filter(u => u.is_pro);

      data.push({
        name: current.format('DD MMM'),
        total: usersUntilNow.length,
        pro: proUntilNow.length,
        revenue: (proUntilNow.length * 2.99).toFixed(2)
      });
      current = current.add(1, 'day');
    }
    return data;
  }, [users, activeUsers, timeRange]);

  const proUsers = activeUsers.filter(u => u.is_pro).length;
  const estimatedMRR = (proUsers * 2.99).toFixed(2);
  const totalStorageBytes = activeUsers.reduce((acc, u) => acc + (u.storage_used || 0), 0);
  const storagePercentage = (totalStorageBytes / PLAN_LIMIT_BYTES) * 100;

  if (loading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 10 }}>
      {/* HEADER */}
      <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', position: 'sticky', top: 0, zIndex: 100 }}>
        <Container maxWidth="xl">
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/')} sx={{ color: 'text.secondary', fontWeight: 600 }}>Volver a la App</Button>
            <Button startIcon={<LogoutIcon />} onClick={handleLogout} color="error" sx={{ fontWeight: 600 }}>Cerrar Sesión</Button>
          </Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Typography variant="h4" fontWeight="800">Métricas & Control 🚀</Typography>
            <ToggleButtonGroup value={timeRange} exclusive onChange={(e, val) => val && setTimeRange(val)} size="small" sx={{ bgcolor: 'action.hover', borderRadius: 2 }}>
              <ToggleButton value="7d" sx={{ fontWeight: 600 }}>7D</ToggleButton>
              <ToggleButton value="30d" sx={{ fontWeight: 600 }}>30D</ToggleButton>
              <ToggleButton value="90d" sx={{ fontWeight: 600 }}>90D</ToggleButton>
              <ToggleButton value="all" sx={{ fontWeight: 600 }}>TODO</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ mt: 4 }}>
        
        {/* --- SECCIÓN 1: SOLICITUDES PENDIENTES --- */}
        {pendingUsers.length > 0 && (
          <Box mb={5} sx={{ animation: 'pulse 2s infinite', '@keyframes pulse': { '0%': { opacity: 1 }, '50%': { opacity: 0.9 }, '100%': { opacity: 1 } } }}>
            <Alert severity="warning" sx={{ mb: 2, borderRadius: '12px', fontWeight: 'bold' }}>
              ⚠️ Tienes {pendingUsers.length} usuarios esperando aprobación para entrar.
            </Alert>
            <Typography variant="h6" fontWeight="800" mb={2} color="warning.dark" display="flex" alignItems="center" gap={1}>
              <PersonAddIcon /> Solicitudes Pendientes
            </Typography>
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '20px', border: '2px solid #ed6c02', bgcolor: '#fff3e0' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Usuario</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Fecha Registro</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendingUsers.map((user) => (
                    <TableRow key={user.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="700">{user.full_name || 'Desconocido'}</Typography>
                        <Chip label="Pendiente" size="small" color="warning" sx={{ mt: 0.5, fontWeight: 'bold' }} />
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{dayjs(user.created_at).format('DD MMM HH:mm')}</TableCell>
                      <TableCell align="right">
                        <Stack direction="row" justifyContent="flex-end" spacing={1}>
                          <Tooltip title="Denegar / Borrar">
                            <IconButton onClick={() => handleReject(user.id)} sx={{ color: 'error.main', bgcolor: 'error.lighter' }}>
                              <CancelIcon />
                            </IconButton>
                          </Tooltip>
                          <Button 
                            variant="contained" 
                            color="success" 
                            startIcon={<CheckCircleIcon />}
                            onClick={() => handleApprove(user.id)}
                            sx={{ fontWeight: 'bold', borderRadius: '10px' }}
                          >
                            Aprobar
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* --- SECCIÓN 2: MÉTRICAS GENERALES --- */}
        <Typography variant="subtitle2" fontWeight="700" color="text.secondary" mb={1}>CRECIMIENTO (Solo Activos)</Typography>
        <MetricRow title="Usuarios Activos" value={activeUsers.length} icon={<GroupIcon />} color="#6750A4" data={chartData} dataKey="total" gradientId="gradTotal" />
        
        <Typography variant="subtitle2" fontWeight="700" color="text.secondary" mb={1}>CONVERSIÓN</Typography>
        <MetricRow title="Suscriptores Pro" value={proUsers} icon={<StarIcon />} color="#FFB74D" data={chartData} dataKey="pro" gradientId="gradPro" subValue="Usuarios activos de pago" />

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} mb={5}>
          <Box sx={{ width: '100%' }}>
            <StatCard title="Almacenamiento S3" value={formatBytes(totalStorageBytes)} subValue={`de ${PLAN_LIMIT_GB} GB`} icon={<CloudIcon />} color="#2196F3" progress={storagePercentage} />
          </Box>
          <Box sx={{ width: '100%' }}>
            <StatCard title="Tamaño Base de Datos" value={dbSize ? formatBytes(dbSize) : '...'} icon={<StorageIcon />} color="#F44336" subValue="Postgres Real Size" />
          </Box>
        </Stack>

        {/* --- SECCIÓN 3: LISTA USUARIOS ACTIVOS --- */}
        <Typography variant="h6" fontWeight="800" mb={2}>Usuarios Activos ({activeUsers.length})</Typography>
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '20px', border: '1px solid rgba(0,0,0,0.1)', mb: 10 }}>
          <Table>
            <TableHead sx={{ bgcolor: 'action.hover' }}>
              <TableRow>
                <TableCell>Usuario</TableCell>
                <TableCell>Plan</TableCell>
                <TableCell>Espacio</TableCell>
                <TableCell>Rol</TableCell>
                <TableCell align="right">Fecha Registro</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {activeUsers.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="700">{user.full_name || 'Anónimo'}</Typography>
                    <Typography variant="caption" color="text.secondary" fontFamily="monospace">{user.email || user.id.slice(0,6)}</Typography>
                  </TableCell>
                  <TableCell>{user.is_pro ? <Chip label="PRO" size="small" sx={{ bgcolor: '#FFF3E0', color: '#E65100', fontWeight: 800 }} /> : <Chip label="Free" size="small" />}</TableCell>
                  <TableCell>{formatBytes(user.storage_used)}</TableCell>
                  <TableCell>{user.is_admin ? <Chip label="ADMIN" size="small" color="primary" /> : 'User'}</TableCell>
                  <TableCell align="right"><Typography variant="body2">{dayjs(user.created_at).format('DD MMM YYYY')}</Typography></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

      </Container>
    </Box>
  );
}

export default AdminDashboard;