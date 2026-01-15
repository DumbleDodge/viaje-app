import React, { useEffect, useState, useMemo } from 'react';
import { 
  Box, Container, Typography, Grid, Paper, Table, 
  TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Chip, CircularProgress, Button, LinearProgress,
  ToggleButton, ToggleButtonGroup,Stack 
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import GroupIcon from '@mui/icons-material/Group';
import CloudIcon from '@mui/icons-material/Cloud';
import StarIcon from '@mui/icons-material/Star';
import StorageIcon from '@mui/icons-material/Storage';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import 'dayjs/locale/es';
import LogoutIcon from '@mui/icons-material/Logout';

// Gráficos
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
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

// --- COMPONENTE TARJETA SIMPLE (STATCARD) ---
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

// --- COMPONENTE FILA MÉTRICA (TARJETA + GRÁFICA) ---
// Este componente crea la estructura: [ Tarjeta ] [ Gráfica ]

// --- COMPONENTE FILA MÉTRICA (FIX FINAL RECHARTS) ---
// --- COMPONENTE FILA MÉTRICA (LAYOUT FLEXBOX) ---
// --- COMPONENTE FILA MÉTRICA CON EJES ---
const MetricRow = ({ title, value, icon, color, subValue, data, dataKey, gradientId }) => (
  <Box mb={4}>
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="stretch">
      
      {/* 1. TARJETA (Izquierda) */}
      <Box sx={{ width: { xs: '100%', md: '30%' }, minWidth: { md: '250px' } }}>
        <StatCard title={title} value={value} icon={icon} color={color} subValue={subValue} />
      </Box>

      {/* 2. GRÁFICA (Derecha) */}
      <Box sx={{ flexGrow: 1, width: '100%', minWidth: 0 }}>
        <Paper 
          elevation={0} 
          sx={{ 
            borderRadius: '20px', 
            border: '1px solid rgba(0,0,0,0.1)',
            bgcolor: '#fff',
            height: 220, // He subido un poco la altura para que quepan los ejes
            position: 'relative', 
            overflow: 'hidden'
          }}
        >
          {(!data || data.length === 0) ? (
            <Box display="flex" alignItems="center" justifyContent="center" height="100%" color="text.secondary">
              <Typography variant="caption">Cargando...</Typography>
            </Box>
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
                  
                  {/* REJILLA DE FONDO (Solo horizontal) */}
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  
                  {/* EJE X (FECHAS) */}
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#9e9e9e' }}
                    minTickGap={30} // Evita que se solapen las fechas
                    dy={10} // Baja un poco el texto
                  />
                  
                  {/* EJE Y (CANTIDAD) */}
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#9e9e9e' }}
                  />

                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    itemStyle={{ color: color, fontWeight: 'bold' }}
                  />
                  
                  <Area 
                    type="monotone" 
                    dataKey={dataKey} 
                    stroke={color} 
                    strokeWidth={3} 
                    fill={`url(#${gradientId})`} 
                    isAnimationActive={true} 
                  />
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
    const { data: userData } = await supabase.from('profiles').select('*').order('created_at', { ascending: true });
    if (userData) setUsers(userData);
    const { data: sizeData } = await supabase.rpc('get_database_size');
    if (sizeData) setDbSize(sizeData);
    setLoading(false);
  };

  // --- LÓGICA DE GRÁFICAS ---
  const chartData = useMemo(() => {
    if (users.length === 0) return [];
    let startDate = dayjs();
    if (timeRange === '7d') startDate = dayjs().subtract(7, 'day');
    if (timeRange === '30d') startDate = dayjs().subtract(30, 'day');
    if (timeRange === '90d') startDate = dayjs().subtract(90, 'day');
    if (timeRange === 'all') startDate = dayjs(users[0].created_at);

    const data = [];
    const now = dayjs();
    let current = startDate;

    while (current.isSameOrBefore(now, 'day')) {
      const usersUntilNow = users.filter(u => dayjs(u.created_at).isSameOrBefore(current, 'day'));
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
  }, [users, timeRange]);

  // Cálculos totales
  const totalUsers = users.length;
  const proUsers = users.filter(u => u.is_pro).length;
  const estimatedMRR = (proUsers * 2.99).toFixed(2);
  const totalStorageBytes = users.reduce((acc, u) => acc + (u.storage_used || 0), 0);
  const storagePercentage = (totalStorageBytes / PLAN_LIMIT_BYTES) * 100;

  if (loading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;

const handleLogout = async () => {
    await supabase.auth.signOut();
    // No hace falta navegar, el App.jsx detectará el cambio de usuario y te mandará al Login solo.
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 10 }}>
      {/* HEADER + FILTRO */}
      {/* HEADER + FILTRO */}
      <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', position: 'sticky', top: 0, zIndex: 100 }}>
        <Container maxWidth="xl">
          
          {/* Fila superior: Botones Volver y Logout */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Button 
              startIcon={<ArrowBackIcon />} 
              onClick={() => navigate('/')} 
              sx={{ color: 'text.secondary', fontWeight: 600 }}
            >
              Volver a la App
            </Button>
            
            <Button 
              startIcon={<LogoutIcon />} 
              onClick={handleLogout} 
              color="error"
              sx={{ fontWeight: 600 }}
            >
              Cerrar Sesión
            </Button>
          </Box>

          {/* Fila inferior: Título y Filtros */}
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Typography variant="h4" fontWeight="800">Métricas 🚀</Typography>
            
            <ToggleButtonGroup
              value={timeRange}
              exclusive
              onChange={(e, val) => val && setTimeRange(val)}
              size="small"
              sx={{ bgcolor: 'action.hover', borderRadius: 2 }}
            >
              <ToggleButton value="7d" sx={{ fontWeight: 600 }}>7D</ToggleButton>
              <ToggleButton value="30d" sx={{ fontWeight: 600 }}>30D</ToggleButton>
              <ToggleButton value="90d" sx={{ fontWeight: 600 }}>90D</ToggleButton>
              <ToggleButton value="all" sx={{ fontWeight: 600 }}>TODO</ToggleButton>
            </ToggleButtonGroup>
          </Box>
          
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ mt: 4 }}>
        
        {/* 1. FILA: USUARIOS TOTALES */}
        <Typography variant="subtitle2" fontWeight="700" color="text.secondary" mb={1}>CRECIMIENTO</Typography>
        <MetricRow 
          title="Usuarios Totales" 
          value={totalUsers} 
          icon={<GroupIcon />} 
          color="#6750A4" 
          data={chartData} 
          dataKey="total" 
          gradientId="gradTotal"
        />

        {/* 2. FILA: USUARIOS PRO */}
        <Typography variant="subtitle2" fontWeight="700" color="text.secondary" mb={1}>CONVERSIÓN</Typography>
        <MetricRow 
          title="Suscriptores Pro" 
          value={proUsers} 
          icon={<StarIcon />} 
          color="#FFB74D" 
          data={chartData} 
          dataKey="pro" 
          gradientId="gradPro"
          subValue="Usuarios activos de pago"
        />

        {/* 3. FILA: INGRESOS */}
        <Typography variant="subtitle2" fontWeight="700" color="text.secondary" mb={1}>FINANZAS</Typography>
        <MetricRow 
          title="Ingresos (MRR)" 
          value={`${estimatedMRR} €`} 
          icon={<AttachMoneyIcon />} 
          color="#4CAF50" 
          data={chartData} 
          dataKey="revenue" 
          gradientId="gradRev"
          subValue="Ingreso Mensual Recurrente"
        />

        {/* 4. FILA: INFRAESTRUCTURA (ALMACENAMIENTO Y DB) */}
        <Typography variant="subtitle2" fontWeight="700" color="text.secondary" mb={1}>INFRAESTRUCTURA</Typography>
        
        {/* Usamos STACK en lugar de GRID para evitar errores de versión de MUI */}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} mb={5}>
          
          {/* Tarjeta Almacenamiento */}
          <Box sx={{ width: '100%' }}>
            <StatCard 
              title="Almacenamiento S3" 
              value={formatBytes(totalStorageBytes)} 
              subValue={`de ${PLAN_LIMIT_GB} GB`}
              icon={<CloudIcon />} 
              color="#2196F3"
              progress={storagePercentage} 
            />
          </Box>

          {/* Tarjeta Base de Datos */}
          <Box sx={{ width: '100%' }}>
            <StatCard 
              title="Tamaño Base de Datos" 
              value={dbSize ? formatBytes(dbSize) : '...'} 
              icon={<StorageIcon />} 
              color="#F44336" 
              subValue="Postgres Real Size"
            />
          </Box>
        </Stack>

        {/* 5. TABLA DE USUARIOS */}
        <Typography variant="h6" fontWeight="800" mb={2}>Listado Detallado</Typography>
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '20px', border: '1px solid rgba(0,0,0,0.1)', mb: 10 }}>
          <Table>
            <TableHead sx={{ bgcolor: 'action.hover' }}>
              <TableRow>
                <TableCell>Usuario</TableCell>
                <TableCell>Plan</TableCell>
                <TableCell>Espacio</TableCell>
                <TableCell>Rol</TableCell>
                <TableCell align="right">Fecha</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
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