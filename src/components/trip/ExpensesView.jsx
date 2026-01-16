import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Container, Paper, Stack, Typography, Avatar, IconButton, Card, Button, Fab,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, InputAdornment,
  FormControl, InputLabel, Select, MenuItem, ToggleButtonGroup, ToggleButton,
  useTheme
} from '@mui/material';
import dayjs from 'dayjs';

// Iconos
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";
import HandshakeIcon from "@mui/icons-material/Handshake";
import EuroIcon from "@mui/icons-material/Euro";
import EditIcon from "@mui/icons-material/Edit";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import AddIcon from "@mui/icons-material/Add";
import GroupIcon from "@mui/icons-material/Group";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";

// Imports internos
import { supabase } from '../../supabaseClient';
import { useTripContext } from '../../TripContext';

function ExpensesView({ trip, tripId, userEmail }) {
  const theme = useTheme();
  const { getCachedTrip, updateTripCache } = useTripContext();
  const cachedData = getCachedTrip(tripId);
  const [expenses, setExpenses] = useState(cachedData.expenses || []);

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

  const manualInputProps = useMemo(() => ({
    disableUnderline: true,
    style: { borderRadius: 8, backgroundColor: theme.palette.background.paper },
    endAdornment: <InputAdornment position="end">€</InputAdornment>
  }), [theme]);

  // --- CARGA DE DATOS ---
  useEffect(() => {
    // 1. Cargar caché
    if (cachedData.expenses && cachedData.expenses.length > 0) {
        console.log("💾 Gastos cargados desde caché");
        setExpenses(cachedData.expenses);
    }

    // 2. Cargar red
    const fetchExpenses = async () => {
      if (!navigator.onLine) return; // Protección Offline

      const { data } = await supabase
        .from('trip_expenses')
        .select('*')
        .eq('trip_id', tripId)
        .order('created_at', { ascending: false });
        
      if (data) {
        setExpenses(data);
        updateTripCache(tripId, 'expenses', data);
      }
    };
    
    fetchExpenses();
    
    // ... suscripción realtime ...

    const sub = supabase.channel('expenses_view').on('postgres_changes', { event: '*', schema: 'public', table: 'trip_expenses', filter: `trip_id=eq.${tripId}` }, () => fetchExpenses()).subscribe();
    return () => { supabase.removeChannel(sub); };
  }, [tripId, updateTripCache]);

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
        trip.participants.forEach(p => { if (bals[p] !== undefined) bals[p] -= share; });
      }
    });
    return { total: totalSpent, balances: bals, spendingByPerson: spending };
  }, [expenses, trip.participants, trip.aliases]);

  // 3. HANDLERS
  const handleOpenAliasModal = () => { setEditingAliases(trip.aliases || {}); setOpenAliasModal(true); };
  const handleSaveAlias = async () => {
    const { error } = await supabase.from('trips').update({ aliases: editingAliases }).eq('id', tripId);
    if (error) alert("Error al guardar alias");
    else setOpenAliasModal(false);
  };

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
      if (editingId) {
        await supabase.from('trip_expenses').update(expenseData).eq('id', editingId);
      } else {
        await supabase.from('trip_expenses').insert([expenseData]);
      }
      setOpenExpenseModal(false); setNewExpense({ title: '', amount: '', payer: userEmail, date: dayjs().format('YYYY-MM-DD') }); setManualShares({}); setSplitType('equal'); setEditingId(null);
    } catch (error) { console.error(error); }
  };


  const handleOpenEdit = (exp) => { setEditingId(exp.id); setNewExpense({ title: exp.title, amount: exp.amount, payer: exp.payer, date: exp.date }); if (exp.split_details) { setSplitType('manual'); setManualShares(exp.split_details); } else { setSplitType('equal'); setManualShares({}); } setOpenExpenseModal(true); };

  // --- LÓGICA BORRADO DE GASTOS ---
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);

  const confirmDelete = (id) => {
    setExpenseToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const executeDelete = async () => {
    if (expenseToDelete) {
      const { error } = await supabase.from('trip_expenses').delete().eq('id', expenseToDelete);

      if (!error) {
        // 1. Actualizar estado local
        const newExpenses = expenses.filter(e => e.id !== expenseToDelete);
        setExpenses(newExpenses);

        // 2. Actualizar caché de disco
        updateTripCache(tripId, 'expenses', newExpenses);
      }
    }
    setDeleteConfirmOpen(false);
    setExpenseToDelete(null);
  };
  const openPayModal = (debtor, amount) => { setSettleData({ debtor, creditor: '', amount: Math.abs(amount).toFixed(2) }); setOpenSettleModal(true); };
  const handleSettleUp = async () => { const amount = parseFloat(settleData.amount); const reimbursementSplit = { [settleData.creditor]: amount }; await supabase.from('trip_expenses').insert([{ title: 'REEMBOLSO', amount: amount, payer: settleData.debtor, date: dayjs().format('YYYY-MM-DD'), is_reimbursement: true, trip_id: tripId, split_details: reimbursementSplit }]); setOpenSettleModal(false); };
  const handleManualShareChange = (email, value) => { setManualShares(prev => ({ ...prev, [email]: value })); }

  return (
    <Box pb={12} pt={2}>
      <Container maxWidth="sm">

        {/* 1. TARJETA TOTAL */}
        <Paper elevation={0} sx={{
          p: 1.5, mb: 3, borderRadius: '20px',
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white', position: 'relative', overflow: 'hidden'
        }}>
          <Box sx={{ position: 'absolute', top: -30, left: -30, width: 120, height: 120, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)' }} />
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box ml={1}>
              <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 700, fontSize: '0.55rem', display: 'block', mb: 0 }}>TOTAL</Typography>
              <Typography variant="h6" fontWeight="800" sx={{ fontSize: '1.1rem', lineHeight: 1.2 }}>{formatMoney(total)}</Typography>
            </Box>
            <Box sx={{ bgcolor: 'rgba(0,0,0,0.15)', borderRadius: '14px', py: 0.8, px: 1.2, minWidth: 120 }}>
              <Stack spacing={0.5}>
                {trip.participants && trip.participants.map(p => (
                  <Stack key={p} direction="row" justifyContent="space-between" alignItems="center" gap={1.5}>
                    <Stack direction="row" gap={0.8} alignItems="center">
                      <Avatar sx={{ width: 14, height: 14, fontSize: '0.45rem', bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 700 }}>{getName(p).charAt(0).toUpperCase()}</Avatar>
                      <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 600, maxWidth: 65, fontSize: '0.7rem' }} noWrap>{getName(p)}</Typography>
                    </Stack>
                    <Typography variant="caption" fontWeight="700" sx={{ fontSize: '0.7rem' }}>{formatMoney(spendingByPerson[p] || 0)}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>
          </Stack>
        </Paper>

        {/* 2. BALANCES */}
        <Box mb={3}>
          <Paper elevation={0} sx={{ bgcolor: theme.palette.mode === 'light' ? '#F3F4F6' : '#1C1C1E', borderRadius: '24px', p: 1 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1} px={1} pt={0.5}>
              <Typography variant="h6" fontWeight="800" sx={{ fontSize: '1rem' }}>Balances</Typography>
              <IconButton size="small" onClick={handleOpenAliasModal} sx={{ bgcolor: theme.palette.background.paper }}><SettingsSuggestIcon fontSize="small" /></IconButton>
            </Stack>
            <Stack spacing={0.8}>
              {trip.participants && trip.participants.map(p => {
                const bal = balances[p] || 0;
                const isPositive = bal >= 0;
                return (
                  <Card key={p} sx={{ borderRadius: '16px', borderLeft: `5px solid ${isPositive ? '#4CAF50' : '#EF5350'}` }}>
                    <Box p={1.5} display="flex" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" gap={1.5} alignItems="center">
                        <Avatar sx={{ width: 36, height: 36, bgcolor: 'action.selected', fontSize: '0.85rem' }}>{getName(p).charAt(0).toUpperCase()}</Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="700" lineHeight={1.2}>{getName(p)}</Typography>
                          <Typography variant="caption" sx={{ color: isPositive ? '#4CAF50' : '#EF5350', fontWeight: 700 }}>{isPositive ? 'Le deben' : 'Debe'} {formatMoney(Math.abs(bal))}</Typography>
                        </Box>
                      </Stack>
                      {!isPositive && Math.abs(bal) > 0.01 && (
                        <Button size="small" variant="contained" disableElevation onClick={() => openPayModal(p, bal)} sx={{ bgcolor: '#FFEBEE', color: '#D32F2F', fontSize: '0.7rem', borderRadius: '10px', fontWeight: 700 }}>Pagar</Button>
                      )}
                    </Box>
                  </Card>
                )
              })}
            </Stack>
          </Paper>
        </Box>

        {/* 3. MOVIMIENTOS */}
        <Box mb={3}>
          <Paper elevation={0} sx={{ bgcolor: theme.palette.mode === 'light' ? '#F3F4F6' : '#1C1C1E', borderRadius: '24px', p: 1, minHeight: 100 }}>
            <Typography variant="h6" fontWeight="800" mb={1} px={1} pt={0.5} sx={{ fontSize: '1rem' }}>Movimientos</Typography>
            <Stack spacing={0.8}>
              {expenses.length === 0 && <Box py={4} textAlign="center" opacity={0.5}><Typography variant="caption" fontWeight="600">No hay gastos aún</Typography></Box>}
              {expenses.map(exp => {
                const isReimbursement = exp.is_reimbursement;
                return (
                  <Card key={exp.id} sx={{ borderRadius: '16px' }}>
                    <Box p={1.5} display="flex" gap={1.5} alignItems="center">
                      <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: isReimbursement ? '#E8F5E9' : '#FFF3E0', color: isReimbursement ? '#2E7D32' : '#E65100', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {isReimbursement ? <HandshakeIcon sx={{ fontSize: 20 }} /> : <EuroIcon sx={{ fontSize: 20 }} />}
                      </Box>
                      <Box flexGrow={1}>
                        <Typography variant="body2" fontWeight="700">{exp.title}</Typography>
                        <Typography variant="caption" color="text.secondary">{isReimbursement ? 'De' : 'Pagó'} <strong>{getName(exp.payer)}</strong></Typography>
                      </Box>
                      <Box textAlign="right">
                        <Typography variant="body2" fontWeight="800" sx={{ color: isReimbursement ? '#2E7D32' : 'text.primary' }}>{formatMoney(exp.amount)}</Typography>
                        <Stack direction="row" justifyContent="flex-end">
                          <IconButton size="small" onClick={() => handleOpenEdit(exp)} sx={{ p: 0.5 }}><EditIcon sx={{ fontSize: 16 }} /></IconButton>
                          <IconButton
                            size="small"
                            onClick={() => confirmDelete(exp.id)} // <--- CAMBIO AQUÍ
                            sx={{ p: 0.5, color: 'text.disabled' }}
                          >
                            <DeleteForeverIcon sx={{ fontSize: 16 }} />
                          </IconButton></Stack>
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
      <Fab variant="extended" onClick={() => { setEditingId(null); setNewExpense({ title: '', amount: '', payer: userEmail, date: dayjs().format('YYYY-MM-DD') }); setSplitType('equal'); setManualShares({}); setOpenExpenseModal(true); }} sx={{ position: 'fixed', bottom: 100, right: 24, zIndex: 10, bgcolor: 'secondary.main', color: 'white', borderRadius: '20px' }}>
        <AddIcon sx={{ mr: 1, fontSize: 20 }} /> Gasto
      </Fab>

      {/* MODALES */}
      <Dialog open={openExpenseModal} onClose={() => setOpenExpenseModal(false)} fullWidth maxWidth="xs">
        <DialogTitle>{editingId ? "Editar Gasto" : "Añadir Gasto"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField label="Concepto" fullWidth variant="filled" value={newExpense.title} onChange={e => setNewExpense({ ...newExpense, title: e.target.value })} />
            <TextField label="Cantidad" type="number" fullWidth variant="filled" value={newExpense.amount} onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })} />
            <FormControl fullWidth variant="filled">
              <InputLabel>Pagado por</InputLabel>
              <Select value={trip.participants?.includes(newExpense.payer) ? newExpense.payer : ''} onChange={e => setNewExpense({ ...newExpense, payer: e.target.value })}>
                {trip.participants && trip.participants.map(p => (<MenuItem key={p} value={p}>{getName(p)}</MenuItem>))}
              </Select>
            </FormControl>
            <ToggleButtonGroup value={splitType} exclusive onChange={(e, val) => { if (val) setSplitType(val); }} fullWidth>
              <ToggleButton value="equal"><GroupIcon /> Iguales</ToggleButton>
              <ToggleButton value="manual"><PlaylistAddCheckIcon /> Manual</ToggleButton>
            </ToggleButtonGroup>
            {splitType === 'manual' && (
              <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 3 }}>
                {trip.participants && trip.participants.map(p => (
                  <Box key={p} display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">{getName(p)}</Typography>
                    <TextField type="number" variant="filled" size="small" InputProps={manualInputProps} value={manualShares[p] ?? ''} onChange={(e) => handleManualShareChange(p, e.target.value)} sx={{ width: '50%' }} />
                  </Box>
                ))}
              </Box>
            )}
            <TextField type="date" label="Fecha" fullWidth variant="filled" value={newExpense.date} onChange={e => setNewExpense({ ...newExpense, date: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenExpenseModal(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSaveExpense}>Guardar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openAliasModal} onClose={() => setOpenAliasModal(false)} fullWidth maxWidth="xs">
        <DialogTitle>Nombres / Alias</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            {trip.participants && trip.participants.map(email => (
              <TextField key={email} label={email} variant="filled" size="small" value={editingAliases[email] || ''} onChange={(e) => setEditingAliases({ ...editingAliases, [email]: e.target.value })} />
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAliasModal(false)}>Cancelar</Button>
          <Button onClick={handleSaveAlias} variant="contained">Guardar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openSettleModal} onClose={() => setOpenSettleModal(false)} fullWidth maxWidth="xs">
        <DialogTitle>Saldar Deuda</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField label="Quién paga" fullWidth variant="filled" disabled value={getName(settleData.debtor)} />
            <FormControl fullWidth variant="filled">
              <InputLabel>Para quién</InputLabel>
              <Select value={settleData.creditor} onChange={(e) => setSettleData({ ...settleData, creditor: e.target.value })}>
                {trip.participants && trip.participants.filter(p => balances[p] > 0).map(p => (<MenuItem key={p} value={p}>{getName(p)}</MenuItem>))}
              </Select>
            </FormControl>
            <TextField label="Cantidad" type="number" fullWidth variant="filled" value={settleData.amount} onChange={(e) => setSettleData({ ...settleData, amount: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSettleModal(false)}>Cancelar</Button>
          <Button onClick={handleSettleUp} variant="contained" color="success">Pagar</Button>
        </DialogActions>
      </Dialog>


{/* MODAL CONFIRMACIÓN BORRADO */}
      <Dialog 
        open={deleteConfirmOpen} 
        onClose={() => setDeleteConfirmOpen(false)}
        PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>¿Borrar gasto?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Esto afectará a los balances de todos.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} sx={{ color: 'text.secondary', fontWeight: 600 }}>
            Cancelar
          </Button>
          <Button onClick={executeDelete} variant="contained" color="error" sx={{ borderRadius: '12px', fontWeight: 700 }}>
            Borrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ExpensesView;