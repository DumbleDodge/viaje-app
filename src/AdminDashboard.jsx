import React, { useEffect, useState, useMemo } from 'react';
import {
  Box, Container, Typography, Paper, Table,
  TableBody, TableCell, TableHead,
  TableRow, Chip, CircularProgress, Button, Stack, IconButton, Grid, Dialog, DialogTitle, DialogContent
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CloseIcon from '@mui/icons-material/Close';

import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import 'dayjs/locale/es';
import { useTripContext } from './TripContext';

// Gráficos
import {
  AreaChart, Area, ResponsiveContainer, Tooltip as RechartsTooltip
} from 'recharts';

dayjs.extend(isSameOrBefore);
dayjs.locale('es');

// --- CONSTANTES ---
const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// --- COMPONENTES UI ---

// 1. Mini Stat Card (Compacta)
const MiniStat = ({ label, value, icon, color }) => (
  <Paper elevation={0} sx={{ p: 1.5, borderRadius: '12px', border: '1px solid #E0E0E0', bgcolor: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 70 }}>
    <Typography variant="caption" fontWeight="700" color="text.secondary" textTransform="uppercase" letterSpacing={0.5} mb={0} sx={{ fontSize: '0.65rem' }}>{label}</Typography>
    <Typography variant="h6" fontWeight="800" sx={{ color: '#2C3E50', fontSize: '1.1rem', lineHeight: 1.2 }}>{value}</Typography>
  </Paper>
);

// 2. Compact Color Card (Medio)
const CompactColorCard = ({ label, value, color, onClick, subLabel }) => (
  <Paper
    elevation={0}
    onClick={onClick}
    sx={{
      p: 1,
      borderRadius: '16px',
      bgcolor: color,
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      height: '100%',
      minHeight: 75,
      cursor: onClick ? 'pointer' : 'default',
      transition: 'transform 0.2s',
      '&:hover': onClick ? { transform: 'scale(1.02)' } : {}
    }}>
    <Typography variant="h5" fontWeight="900" sx={{ fontSize: '1.4rem', mb: 0 }}>{value}</Typography>
    <Typography variant="caption" fontWeight="700" sx={{ opacity: 0.9, textTransform: 'uppercase', fontSize: '0.6rem', letterSpacing: 0.5 }}>{label}</Typography>
    {subLabel && <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.55rem', mt: 0.5 }}>{subLabel}</Typography>}
  </Paper>
);


function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dbSize, setDbSize] = useState(null);
  const [timeRange, setTimeRange] = useState('thisMonth'); // Default to month
  const [showPendingModal, setShowPendingModal] = useState(false);

  const navigate = useNavigate();
  const { logout } = useTripContext();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: userData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (userData) setUsers(userData);

    try {
      const { data: sizeData } = await supabase.rpc('get_database_size');
      if (sizeData) setDbSize(sizeData);
    } catch (e) { console.warn("RPC size not found"); }

    setLoading(false);
  };

  const handleApprove = async (userId) => {
    if (!confirm("¿Aprobar acceso?")) return;
    const { error } = await supabase.from('profiles').update({ is_approved: true }).eq('id', userId);
    if (!error) {
      setUsers(users.map(u => u.id === userId ? { ...u, is_approved: true } : u));
    }
  };

  const handleReject = async (userId) => {
    if (!confirm("¿DENEGAR acceso y ELIMINAR?")) return;
    const { error } = await supabase.from('profiles').delete().eq('id', userId);
    if (!error) {
      setUsers(users.filter(u => u.id !== userId));
    }
  };

  // --- DATOS ---
  const pendingUsers = users.filter(u => !u.is_approved);
  const activeUsers = users.filter(u => u.is_approved);
  const proUsers = activeUsers.filter(u => u.is_pro).length;
  const estimatedMRR = (proUsers * 2.99).toFixed(2);
  const activeCount = activeUsers.length;
  const conversionRate = activeCount > 0 ? ((proUsers / activeCount) * 100).toFixed(1) : 0;

  // Total Storage
  const totalStorageBytes = activeUsers.reduce((acc, u) => acc + (u.storage_used || 0), 0);

  // Revenue Comparison Logic
  const { currentRevenue, previousRevenue, comparisonData } = useMemo(() => {
    if (users.length === 0) return { currentRevenue: 0, previousRevenue: 0, comparisonData: [] };

    const startCurrent = dayjs().startOf('month');
    const startPrevious = dayjs().subtract(1, 'month').startOf('month');
    const todayDay = dayjs().date(); // Día del mes actual (1..31)

    // Ingresos acumulados "mes actual" vs "mes anterior (misma altura)"
    const currentTotal = activeUsers.filter(u => u.is_pro && dayjs(u.created_at).isAfter(startCurrent)).length * 2.99;

    // Mes anterior hasta el MISMO DÍA que hoy
    const limitPrevious = startPrevious.add(todayDay, 'day');
    const prevTotal = activeUsers.filter(u =>
      u.is_pro &&
      dayjs(u.created_at).isAfter(startPrevious) &&
      dayjs(u.created_at).isBefore(limitPrevious)
    ).length * 2.99;

    // Generar datos día a día para el gráfico (Eje X: Día 1, 2, 3...)
    const daysInMonth = dayjs().daysInMonth();
    const data = [];

    let accCurrent = 0;
    let accPrev = 0;

    for (let i = 1; i <= daysInMonth; i++) {
      // Fecha exacta en mes actual y anterior
      const dateCurrent = startCurrent.date(i);
      const datePrev = startPrevious.date(i);

      // Si nos pasamos de "hoy", current se queda plano o null (según prefieras visualizar)
      // Para visualización bonita "cumulative", sumamos lo que hubo ese día
      const newSubsCurrent = activeUsers.filter(u => u.is_pro && dayjs(u.created_at).isSame(dateCurrent, 'day')).length;
      const newSubsPrev = activeUsers.filter(u => u.is_pro && dayjs(u.created_at).isSame(datePrev, 'day')).length;

      if (dateCurrent.isSameOrBefore(dayjs())) {
        accCurrent += (newSubsCurrent * 2.99);
      }
      accPrev += (newSubsPrev * 2.99);

      data.push({
        day: i,
        current: dateCurrent.isSameOrBefore(dayjs()) ? accCurrent : null, // Cortamos la línea verde hoy
        previous: accPrev // La línea gris sigue hasta fin de mes
      });
    }

    return {
      currentRevenue: currentTotal.toFixed(2),
      previousRevenue: prevTotal.toFixed(2),
      comparisonData: data
    };

  }, [users, activeUsers]);


  // Chart Data (Old logic kept if needed for other charts, otherwise unused)
  const chartData = useMemo(() => {
    // ... existing logic ...
    return [];
  }, []); // Placeholder to avoid errors if referenced, but we use comparisonData now


  if (loading) return <Box display="flex" justifyContent="center" height="100vh" alignItems="center"><CircularProgress /></Box>;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F5F5F7', pb: 10, fontFamily: 'Inter, sans-serif' }}>

      {/* HEADER COMPACTO */}
      <Box sx={{ pt: 4, px: 3, pb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Stack direction="row" alignItems="center" gap={2}>
          <IconButton onClick={() => navigate('/')} size="small"><ArrowBackIcon /></IconButton>
          <Typography variant="h4" fontWeight="900" sx={{ color: '#1A1A1A' }}>Stats</Typography>
        </Stack>
        <Box display="flex" gap={2}>
          <Button color="error" size="small" onClick={logout} startIcon={<LogoutIcon />}>Logout</Button>
        </Box>
      </Box>

      <Container maxWidth="lg">

        {/* 1. TOP STATS (CSS GRID FORZADO 3 COLUMNAS) */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 1.5,
          mb: 3
        }}>
          {/* PRIMERA FILA */}
          <MiniStat label="REQUESTS" value={pendingUsers.length} />
          <MiniStat label="USERS" value={activeUsers.length} />
          <MiniStat label="SUBS" value={proUsers} />

          {/* SEGUNDA FILA */}
          <MiniStat label="MRR" value={`$${estimatedMRR}`} />
          <MiniStat label="DB SIZE" value={dbSize ? formatBytes(dbSize) : '-'} />
          <MiniStat label="STORAGE" value={formatBytes(totalStorageBytes)} />
        </Box>

        {/* FILTROS DE TIEMPO (NUEVOS) */}
        <Stack direction="row" spacing={1} mb={3} sx={{ overflowX: 'auto', pb: 1 }}>
          {[
            { id: 'thisWeek', label: 'Esta Semana' },
            { id: 'lastWeek', label: 'Semana Pasada' },
            { id: 'thisMonth', label: 'Este Mes' },
            { id: 'lastMonth', label: 'Mes Pasado' },
            { id: 'all', label: 'Histórico' }
          ].map(opt => (
            <Chip
              key={opt.id}
              label={opt.label}
              onClick={() => setTimeRange(opt.id)}
              sx={{
                bgcolor: timeRange === opt.id ? '#1A1A1A' : 'white',
                fontWeight: 'bold',
                color: timeRange === opt.id ? 'white' : 'text.secondary',
                border: timeRange === opt.id ? 'none' : '1px solid #E0E0E0',
                '&:hover': { bgcolor: timeRange === opt.id ? '#333' : '#F5F5F5' }
              }}
            />
          ))}
        </Stack>

        {/* 2. MIDDLE STATS (GRID MOSAICO FORZADO) */}
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gridTemplateRows: 'repeat(2, 1fr)',
          gap: 1.5,
          mb: 4
        }}>

          {/* PENDING (Naranja) */}
          <CompactColorCard
            label="PENDING"
            value={pendingUsers.length}
            color="#FF9F43"
            onClick={pendingUsers.length > 0 ? () => setShowPendingModal(true) : null}
            subLabel={pendingUsers.length > 0 ? "Review" : null}
          />

          {/* ACTIVE (Verde Teal) -> Moved up */}
          <CompactColorCard
            label="ACTIVE"
            value={activeUsers.length}
            color="#1DD1A1"
          />

          {/* REVENUE (Grande Derecha - Spans 2 rows) */}
          <Box sx={{
            gridColumn: '3 / 4',
            gridRow: '1 / 3',
            bgcolor: '#2E86DE',
            borderRadius: '16px',
            p: 1.5,
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <Typography variant="caption" sx={{ opacity: 0.9, mb: 0.5, textTransform: 'uppercase', fontSize: '0.6rem', fontWeight: 700 }}>Total Revenue</Typography>
            {/* Font size increased slightly as requested */}
            <Typography variant="h5" fontWeight="900" sx={{ fontSize: '1.6rem', zIndex: 1 }}>${estimatedMRR}</Typography>
          </Box>

          {/* PRO USERS (Morado) -> Moved down */}
          <CompactColorCard
            label="PRO USERS"
            value={proUsers}
            color="#9B59B6"
          />

          {/* CONVERSION (Azul Claro) */}
          <CompactColorCard
            label="CONVERSION"
            value={`${conversionRate}%`}
            color="#48DBFB"
          />

        </Box>

        {/* 3. REVENUE COMPARISON (This Month vs Last Month) */}
        <Paper elevation={0} sx={{ borderRadius: '20px', bgcolor: '#DAE9E4', p: 1.5, mb: 4, position: 'relative', overflow: 'hidden' }}>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ color: '#2C3E50', opacity: 0.8, mb: 0.5 }}>
            This month so far vs. last month same period
          </Typography>

          <Stack direction="row" alignItems="baseline" spacing={1} mb={1}>
            <Typography variant="h4" fontWeight="900" sx={{ color: '#1B4332' }}>
              ${currentRevenue}
            </Typography>
            <Typography variant="h6" fontWeight="600" sx={{ color: '#5D7C6F' }}>
              vs ${previousRevenue}
            </Typography>
          </Stack>

          <Box sx={{ height: 120, mt: 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={comparisonData}>
                <defs>
                  <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2D6A4F" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#2D6A4F" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                {/* Línea Mes Anterior (Gris/Punteado) */}
                <Area type="monotone" dataKey="previous" stroke="#95A5A6" strokeDasharray="5 5" strokeWidth={2} fill="transparent" />
                {/* Línea Mes Actual (Verde Fuerte) */}
                <Area type="monotone" dataKey="current" stroke="#2D6A4F" strokeWidth={3} fillOpacity={1} fill="url(#colorCurrent)" />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        </Paper>

        {/* 3. USER LIST PREVIEW (Bottom) */}
        <Typography variant="h6" fontWeight="bold" mb={2}>Recent Users</Typography>
        <Paper elevation={0} sx={{ borderRadius: '20px', overflow: 'hidden', border: '1px solid #E0E0E0' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#FAFAFA' }}>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Joined</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {activeUsers.slice(0, 5).map(u => (
                <TableRow key={u.id}>
                  <TableCell sx={{ fontWeight: 'bold' }}>{u.full_name}</TableCell>
                  <TableCell>{u.is_pro ? <Chip label="PRO" size="small" color="secondary" /> : <Chip label="FREE" size="small" />}</TableCell>
                  <TableCell align="right" sx={{ color: 'text.secondary' }}>{dayjs(u.created_at).fromNow()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Box p={2} textAlign="center">
            <Button sx={{ color: 'text.secondary' }}>View All Users</Button>
          </Box>
        </Paper>

      </Container>


      {/* MODAL PARA SOLICITUDES PENDIENTES */}
      <Dialog open={showPendingModal} onClose={() => setShowPendingModal(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Typography variant="h6" fontWeight="900" component="div">Requests ({pendingUsers.length})</Typography>
          <IconButton onClick={() => setShowPendingModal(false)} size="small" sx={{ bgcolor: '#F5F5F5' }}><CloseIcon fontSize="small" /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ px: 2, pb: 2 }}>
          <Stack spacing={2}>
            {pendingUsers.map(u => (
              <Paper key={u.id} elevation={0} sx={{ p: 2, border: '1px solid #eee', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold" lineHeight={1.2}>{u.full_name}</Typography>
                  <Typography variant="caption" color="text.secondary">{u.email}</Typography>
                </Box>
                <Stack direction="row" spacing={1} width="100%">
                  <Button
                    variant="outlined"
                    color="error"
                    fullWidth
                    size="small"
                    onClick={() => handleReject(u.id)}
                    sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 'bold' }}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="contained"
                    color="success"
                    fullWidth
                    size="small"
                    onClick={() => handleApprove(u.id)}
                    sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 'bold', boxShadow: 'none' }}
                  >
                    Approve
                  </Button>
                </Stack>
              </Paper>
            ))}
            {pendingUsers.length === 0 && (
              <Box textAlign="center" py={4} color="text.secondary">
                <Typography variant="body2">No pending requests</Typography>
              </Box>
            )}
          </Stack>
        </DialogContent>
      </Dialog>

    </Box>
  );
}

export default AdminDashboard;