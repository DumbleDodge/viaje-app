import React, { useState } from 'react';
import { Box, Typography, Paper, Stack, LinearProgress, Chip, Collapse, IconButton, useTheme } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { getUserAchievements, getNextAchievement } from './utils/achievementLogic';

function Achievements({ userData }) {
  const theme = useTheme();
  const [expandedCategory, setExpandedCategory] = useState('countries');

  const achievements = getUserAchievements(userData);
  const nextAchievement = getNextAchievement(userData);

  // Agrupar por categoría
  const categories = {
    'countries': { label: '🌍 Por Países', achievements: [] },
    'continents': { label: '🗺️ Por Continentes', achievements: [] },
    'frequency': { label: '⚡ Por Frecuencia', achievements: [] },
    'planning': { label: '📝 Por Planificación', achievements: [] },
    'special': { label: '⭐ Especiales', achievements: [] }
  };

  achievements.forEach(ach => {
    if (categories[ach.category]) {
      categories[ach.category].achievements.push(ach);
    }
  });

  // Estadísticas generales
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const completionPercentage = Math.round((unlockedCount / totalCount) * 100);

  return (
    <Box mt={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight="800">🏆 Mis Logros</Typography>
        <Chip
          label={`${unlockedCount}/${totalCount} (${completionPercentage}%)`}
          color={completionPercentage >= 50 ? 'success' : 'default'}
          sx={{ fontWeight: 800 }}
        />
      </Stack>

      {/* PRÓXIMO LOGRO A DESBLOQUEAR */}
      {nextAchievement && (
        <Paper elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: '20px', bgcolor: 'action.hover', border: `2px solid ${nextAchievement.color}30` }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                fontSize: '3rem',
                filter: 'grayscale(80%)',
                opacity: 0.6,
                animation: 'pulse 2s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%, 100%': { transform: 'scale(1)' },
                  '50%': { transform: 'scale(1.1)' }
                }
              }}
            >
              {nextAchievement.icon}
            </Box>
            <Box flex={1}>
              <Typography variant="caption" fontWeight="700" color="text.secondary" sx={{ textTransform: 'uppercase' }}>
                PRÓXIMO LOGRO
              </Typography>
              <Typography variant="body1" fontWeight="800" gutterBottom>
                {nextAchievement.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {nextAchievement.description}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={nextAchievement.progress}
                sx={{
                  mt: 1.5,
                  height: 8,
                  borderRadius: 4,
                  '& .MuiLinearProgress-bar': { bgcolor: nextAchievement.color }
                }}
              />
              <Typography variant="caption" fontWeight="800" mt={0.5} display="block" textAlign="right">
                {nextAchievement.progress}% completado
              </Typography>
            </Box>
          </Stack>
        </Paper>
      )}

      {/* CATEGORÍAS DE LOGROS */}
      <Stack spacing={2}>
        {Object.entries(categories).map(([key, category]) => {
          if (category.achievements.length === 0) return null;

          const categoryUnlocked = category.achievements.filter(a => a.unlocked).length;
          const isExpanded = expandedCategory === key;

          return (
            <Paper
              key={key}
              elevation={0}
              sx={{ borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.05)' }}
            >
              {/* Header de categoría */}
              <Box
                onClick={() => setExpandedCategory(isExpanded ? null : key)}
                sx={{
                  p: 2,
                  cursor: 'pointer',
                  bgcolor: 'action.hover',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  '&:hover': { bgcolor: 'action.selected' }
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="body1" fontWeight="800">
                    {category.label}
                  </Typography>
                  <Chip
                    label={`${categoryUnlocked}/${category.achievements.length}`}
                    size="small"
                    sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }}
                  />
                </Stack>
                <IconButton size="small" sx={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: '0.3s' }}>
                  <ExpandMoreIcon />
                </IconButton>
              </Box>

              {/* Lista de achievements */}
              <Collapse in={isExpanded}>
                <Box sx={{ p: 2, pt: 1 }}>
                  <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', pb: 1, scrollbarWidth: 'none' }}>
                    {category.achievements.map((achievement) => {
                      const { unlocked, icon, title, description, color, progress } = achievement;

                      return (
                        <Paper
                          key={achievement.id}
                          elevation={0}
                          sx={{
                            p: 2,
                            minWidth: 140,
                            flex: '0 0 auto',
                            borderRadius: '16px',
                            textAlign: 'center',
                            bgcolor: unlocked ? 'background.paper' : 'transparent',
                            border: unlocked ? `2px solid ${color}` : '2px dashed rgba(0,0,0,0.1)',
                            opacity: unlocked ? 1 : 0.5,
                            position: 'relative',
                            overflow: 'hidden',
                            transition: 'all 0.3s',
                            '&:hover': unlocked ? {
                              transform: 'translateY(-4px)',
                              boxShadow: `0 8px 16px ${color}40`
                            } : {}
                          }}
                        >
                          {/* Efecto de brillo si está desbloqueado */}
                          {unlocked && (
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 0,
                                left: '-100%',
                                width: '100%',
                                height: '100%',
                                background: `linear-gradient(90deg, transparent, ${color}30, transparent)`,
                                animation: 'shine 3s infinite',
                                '@keyframes shine': {
                                  '0%': { left: '-100%' },
                                  '50%, 100%': { left: '100%' }
                                }
                              }}
                            />
                          )}

                          <Box sx={{ fontSize: '2.5rem', mb: 1, filter: unlocked ? 'none' : 'grayscale(100%)' }}>
                            {icon}
                          </Box>

                          <Typography variant="caption" fontWeight="700" display="block" lineHeight={1.2} mb={0.5}>
                            {title}
                          </Typography>

                          <Typography variant="caption" color="text.secondary" fontSize="0.65rem" display="block" mb={1}>
                            {description}
                          </Typography>

                          {/* Progreso si no está desbloqueado */}
                          {!unlocked && progress > 0 && (
                            <LinearProgress
                              variant="determinate"
                              value={progress}
                              sx={{
                                height: 4,
                                borderRadius: 2,
                                mt: 1,
                                '& .MuiLinearProgress-bar': { bgcolor: color }
                              }}
                            />
                          )}

                          {/* Icono de estado */}
                          {unlocked ? (
                            <CheckCircleIcon sx={{ position: 'absolute', top: 6, right: 6, fontSize: 18, color }} />
                          ) : (
                            <LockIcon sx={{ position: 'absolute', top: 6, right: 6, fontSize: 16, color: 'text.disabled' }} />
                          )}
                        </Paper>
                      );
                    })}
                  </Box>
                </Box>
              </Collapse>
            </Paper>
          );
        })}
      </Stack>

      {/* Mensaje de completitud */}
      {completionPercentage === 100 && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mt: 3,
            borderRadius: '20px',
            textAlign: 'center',
            background: 'linear-gradient(135deg, #FFD700 0%, #FFA000 100%)',
            color: 'white'
          }}
        >
          <Typography variant="h5" fontWeight="900" gutterBottom>
            🎉 ¡MAESTRO VIAJERO! 🎉
          </Typography>
          <Typography variant="body2" fontWeight="600">
            Has desbloqueado todos los logros disponibles. ¡Eres una leyenda!
          </Typography>
        </Paper>
      )}
    </Box>
  );
}

export default Achievements;