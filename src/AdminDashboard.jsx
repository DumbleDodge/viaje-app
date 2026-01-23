import React, { useEffect, useState, useMemo } from 'react';
import {
  Box, Container, Typography, Paper, Table,
  TableBody, TableCell, TableContainer, TableHead,
  TableRow, Chip, CircularProgress, Button, LinearProgress,
  ToggleButton, ToggleButtonGroup, Stack, IconButton, Tooltip, Alert, Grid, Dialog, DialogTitle, DialogContent, DialogActions
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
import CloseIcon from '@mui/icons-material/Close';

import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import 'dayjs/locale/es';
import { useTripContext } from './TripContext';

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

// --- COMPONENTES UI NUEVOS ---

// 1. Mini Stat Card (Blanca, arriba)
const MiniStat = ({ label, value, icon, color }) => (
  <Paper elevation={0} sx={{ p: 2, borderRadius: '16px', border: '1px solid #E0E0E0', bgcolor: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 100 }}>
    <Typography variant="caption" fontWeight="700" color="text.secondary" textTransform="uppercase" letterSpacing={1} mb={0.5}>{label}</Typography>
    <Typography variant="h5" fontWeight="900" sx={{ color: '#2C3E50' }}>{value}</Typography>
    {/* {icon && <Box sx={{ mt: 1, color: color }}>{icon}</Box>} */}
  </Paper>
);

// 2. Big Colored Card (Medio)
const ColorCard = ({ label, value, subLabel, color, onClick, icon }) => (
  <Paper
    elevation={0}
    onClick={onClick}
    sx={{
      p: 2.5,
      borderRadius: '20px',
      bgcolor: color,
      color: 'white',
      height: '100%',
      minHeight: 140,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'transform 0.2s',
      '&:hover': onClick ? { transform: 'scale(1.02)' } : {}
    }}>
    {icon && <Box sx={{ position: 'absolute', top: 10, right: 10, opacity: 0.2 }}>{icon}</Box>}
    <Typography variant="h3" fontWeight="800" sx={{ mb: 0.5 }}>{value}</Typography>
    <Typography variant="body2" fontWeight="700" sx={{ opacity: 0.9, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</Typography>
    {subLabel && <Typography variant="caption" sx={{ mt: 1, opacity: 0.8 }}>{subLabel}</Typography>}
  </Paper>
);


function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dbSize, setDbSize] = useState(null);
  const [timeRange, setTimeRange] = useState('30d');
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

  // Chart Data
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
        value: (proUntilNow.length * 2.99), // Revenue
      });
      current = current.add(1, 'day');
    }
    return data;
  }, [users, activeUsers, timeRange]);


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

        {/* 1. TOP GRID (WHITE CARDS) */}
        <Grid container spacing={1.5} mb={3}>
          <Grid item xs={4}>
            <MiniStat label="ACTIVE REQUESTS" value={`# ${pendingUsers.length}`} />
          </Grid>
          <Grid item xs={4}>
            <MiniStat label="ACTIVE USERS" value={`# ${activeUsers.length}`} />
          </Grid>
          <Grid item xs={4}>
            <MiniStat label="STORAGE" value={formatBytes(totalStorageBytes)} />
          </Grid>
          <Grid item xs={4}>
            <MiniStat label="DB SIZE" value={dbSize ? formatBytes(dbSize) : '-'} />
          </Grid>
          <Grid item xs={4}>
            <MiniStat label="SUBSCRIPTIONS" value={`# ${proUsers}`} />
          </Grid>
          <Grid item xs={4}>
            <MiniStat label="MRR" value={`$${estimatedMRR}`} />
          </Grid>
        </Grid>

        {/* TABS (Fake tabs for visual match) */}
        <Stack direction="row" spacing={1} mb={3}>
          {['7d', '30d', '90d'].map(t => (
            <Chip
              key={t}
              label={t.toUpperCase()}
              onClick={() => setTimeRange(t)}
              sx={{
                bgcolor: timeRange === t ? '#E0E0E0' : 'transparent',
                fontWeight: 'bold',
                color: timeRange === t ? 'black' : 'text.secondary',
                border: '1px solid #E0E0E0'
              }}
            />
          ))}
        </Stack>

        {/* 2. MIDDLE GRID (COLOR CARDS) */}
        <Grid container spacing={2} mb={4}>
          {/* PENDING (Orange) -> Actionable */}
          <Grid item xs={12} sm={6} md={3}>
            <ColorCard
              label="PENDING REQUESTS"
              value={pendingUsers.length}
              color="#FF9F43"
              icon={<PersonAddIcon sx={{ fontSize: 40 }} />}
              onClick={pendingUsers.length > 0 ? () => setShowPendingModal(true) : null}
              subLabel={pendingUsers.length > 0 ? "Tap to review" : "All caught up"}
            />
          </Grid>

          {/* PRO USERS (Purple) */}
          <Grid item xs={12} sm={6} md={3}>
            <ColorCard
              label="PRO USERS"
              value={proUsers}
              color="#9B59B6"
              subLabel="Active subscribers"
            />
          </Grid>

          {/* TOTAL REVENUE (Teal/Green) -> Merged aesthetics */}
          <Grid item xs={12} sm={12} md={6}>
            <Paper sx={{ borderRadius: '20px', bgcolor: '#5E9FA5', color: 'white', p: 3, height: '100%', position: 'relative', overflow: 'hidden' }}>
              <Typography variant="subtitle2" sx={{ opacity: 0.8 }}>This month revenue (Est.)</Typography>
              <Typography variant="h2" fontWeight="800" sx={{ mt: 1, mb: 2 }}>${estimatedMRR}</Typography>

              {/* CHART INTEGRATED */}
              <Box sx={{ height: 120, width: '100%', position: 'absolute', bottom: 0, left: 0, right: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FFF" stopOpacity={0.5} />
                        <stop offset="95%" stopColor="#FFF" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="value" stroke="#fff" strokeWidth={3} fill="url(#colorRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          {/* STATS ROW 2 */}
          <Grid item xs={6} md={3}>
            <ColorCard
              label="CONVERSION"
              value={`${conversionRate}%`}
              color="#4CB5F5"
              subLabel="Free to Pro"
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <ColorCard
              label="AVG STORAGE"
              value={activeCount ? formatBytes(totalStorageBytes / activeCount) : '0 B'}
              color="#EBC85E"
              subLabel="Per User"
            />
          </Grid>
        </Grid>

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
      <Dialog open={showPendingModal} onClose={() => setShowPendingModal(false)} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: '20px' } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight="bold">Pending Requests ({pendingUsers.length})</Typography>
          <IconButton onClick={() => setShowPendingModal(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Table>
            <TableBody>
              {pendingUsers.map(u => (
                <TableRow key={u.id}>
                  <TableCell>
                    <Typography variant="subtitle1" fontWeight="bold">{u.full_name}</Typography>
                    <Typography variant="body2" color="text.secondary">{u.email}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button variant="outlined" color="error" size="small" onClick={() => handleReject(u.id)}>Reject</Button>
                      <Button variant="contained" color="success" size="small" onClick={() => handleApprove(u.id)}>Approve</Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {pendingUsers.length === 0 && <Typography p={2} textAlign="center">No pending requests</Typography>}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>

    </Box>
  );
}

export default AdminDashboard;