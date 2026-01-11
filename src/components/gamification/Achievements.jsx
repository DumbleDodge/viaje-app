import React from 'react';
import { Box, Typography, Paper, Stack, LinearProgress } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';

const BADGES = [
  { id: 1, countries: 1, title: "Turista", icon: "🎒", color: "#4CAF50" },
  { id: 2, countries: 3, title: "Viajero", icon: "✈️", color: "#2196F3" },
  { id: 3, countries: 5, title: "Explorador", icon: "🌍", color: "#9C27B0" },
  { id: 4, countries: 10, title: "Nómada", icon: "🔥", color: "#FF9800" },
  { id: 5, countries: 20, title: "Leyenda", icon: "👑", color: "#FFD700" },
];

function Achievements({ count }) {
  const nextBadge = BADGES.find(b => b.countries > count) || BADGES[BADGES.length - 1];
  const prevBadge = [...BADGES].reverse().find(b => b.countries <= count) || { countries: 0 };
  const progress = Math.min(100, Math.max(0, ((count - prevBadge.countries) / (nextBadge.countries - prevBadge.countries)) * 100));

  return (
    <Box mt={3}>
      <Typography variant="h6" fontWeight="800" mb={2}>Mis Logros</Typography>
      
      {/* BARRA DE PROGRESO */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: '20px', bgcolor: 'action.hover' }}>
        <Stack direction="row" justifyContent="space-between" mb={1}>
          <Typography variant="caption" fontWeight="700" color="text.secondary">
            PRÓXIMO: {nextBadge.title.toUpperCase()}
          </Typography>
          <Typography variant="caption" fontWeight="800">
            {count} / {nextBadge.countries} Países
          </Typography>
        </Stack>
        <LinearProgress 
          variant="determinate" 
          value={count >= 20 ? 100 : progress} 
          sx={{ height: 10, borderRadius: 5, '& .MuiLinearProgress-bar': { bgcolor: nextBadge.color } }}
        />
      </Paper>

      {/* LISTA DE MEDALLAS (FLEXBOX EN VEZ DE GRID) */}
      <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', pb: 1, scrollbarWidth: 'none' }}>
        {BADGES.map((badge) => {
          const unlocked = count >= badge.countries;
          return (
            <Paper 
              key={badge.id}
              elevation={0} 
              sx={{ 
                p: 1.5, 
                minWidth: 100, // Ancho fijo
                flex: 1,
                borderRadius: '16px', 
                textAlign: 'center',
                bgcolor: unlocked ? 'background.paper' : 'transparent',
                border: unlocked ? '2px solid transparent' : '2px dashed rgba(0,0,0,0.1)',
                opacity: unlocked ? 1 : 0.5,
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Box sx={{ fontSize: '2rem', mb: 0.5, filter: unlocked ? 'none' : 'grayscale(100%)' }}>
                {badge.icon}
              </Box>
              <Typography variant="caption" fontWeight="700" display="block" lineHeight={1.2}>
                {badge.title}
              </Typography>
              <Typography variant="caption" color="text.secondary" fontSize="0.65rem">
                {badge.countries} Países
              </Typography>
              
              {unlocked ? (
                <CheckCircleIcon sx={{ position: 'absolute', top: 4, right: 4, fontSize: 14, color: badge.color }} />
              ) : (
                <LockIcon sx={{ position: 'absolute', top: 4, right: 4, fontSize: 14, color: 'text.disabled' }} />
              )}
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
}

export default Achievements;