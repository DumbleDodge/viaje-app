import React, { useState, useMemo } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { Box, Typography, Paper, useTheme, Fade, Stack, Chip, Divider } from '@mui/material';
import { ISO_MAPPING } from './utils/isoMapping';

// URL Local (Archivo en carpeta public)
const GEO_URL = "/world-map.json";

const WorldMap = ({ visitedCodes = [], tripsList = [] }) => {
  const theme = useTheme();
  const [selectedCountry, setSelectedCountry] = useState(null);

  // Traductor de nombres de países
  const regionNames = useMemo(() => new Intl.DisplayNames(['es'], { type: 'region' }), []);

  // Contar visitas por país para degradado
  const countVisitsPerCountry = () => {
    const counts = {};
    tripsList.forEach(trip => {
      const code = trip.country_code;
      // Reverse lookup: encontrar la key (ISO Numeric) que tiene value=code (ISO2)
      const isoNumeric = Object.keys(ISO_MAPPING).find(key => ISO_MAPPING[key] === code);

      if (isoNumeric) {
        counts[isoNumeric] = (counts[isoNumeric] || 0) + 1;
      }
    });
    return counts;
  };

  const visitCounts = countVisitsPerCountry();
  const maxVisits = Math.max(...Object.values(visitCounts), 1);

  // Helper para obtener fecha segura
  const getDate = (trip) => {
    const dateVal = trip.start_date || trip.startDate;
    if (!dateVal) return null;
    if (dateVal && typeof dateVal.toDate === 'function') {
      return dateVal.toDate();
    }
    return new Date(dateVal);
  };

  // Obtener información del país seleccionado
  const getCountryInfo = (mapCode) => {
    // mapCode es el ISO Numeric del mapa
    const iso2 = ISO_MAPPING[mapCode];
    if (!iso2) return null;

    const trips = tripsList.filter(t => t.country_code === iso2);

    // Obtener última fecha válida
    const validDates = trips
      .map(t => getDate(t))
      .filter(d => d && !isNaN(d.getTime()))
      .sort((a, b) => a - b);

    const lastVisitDate = validDates.length > 0 ? validDates[validDates.length - 1] : null;

    // Traducir nombre
    let translatedName = iso2;
    try {
      translatedName = regionNames.of(iso2);
    } catch (e) {
      // Fallback or ignore
    }

    return {
      iso2,
      name: translatedName,
      visits: trips.length,
      lastVisitYear: lastVisitDate ? lastVisitDate.getFullYear() : null
    };
  };

  // Convertir códigos de visitados (ISO2) a ISO Numeric del mapa
  const visitedNumeric = visitedCodes.map(code => {
    return Object.keys(ISO_MAPPING).find(key => ISO_MAPPING[key] === code);
  }).filter(Boolean);

  // Función para obtener el color según número de visitas
  const getColorByVisits = (visits) => {
    if (!visits) return null;

    const intensity = Math.min(visits / maxVisits, 1);
    const baseColor = theme.palette.primary.main;

    // Interpolación de color (más oscuro = más visitas)
    if (theme.palette.mode === 'light') {
      // Modo claro: de claro a oscuro
      const r = parseInt(baseColor.slice(1, 3), 16);
      const g = parseInt(baseColor.slice(3, 5), 16);
      const b = parseInt(baseColor.slice(5, 7), 16);

      const newR = Math.round(255 - (255 - r) * intensity);
      const newG = Math.round(255 - (255 - g) * intensity);
      const newB = Math.round(255 - (255 - b) * intensity);

      return `rgb(${newR}, ${newG}, ${newB})`;
    } else {
      // Modo oscuro: usar intensidad directa
      return `rgba(${theme.palette.primary.main}, ${0.3 + intensity * 0.7})`;
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        width: "100%",
        height: 'auto',
        aspectRatio: 1.6,
        bgcolor: theme.palette.mode === 'light' ? '#E3F2FD' : '#1A237E',
        borderRadius: '24px',
        overflow: 'hidden',
        border: '1px solid rgba(0,0,0,0.05)',
        position: 'relative'
      }}
    >
      {/* Header con stats */}
      <Stack
        direction="row"
        spacing={1}
        sx={{ position: 'absolute', top: 12, left: 20, zIndex: 10 }}
      >
        <Chip
          label="MUNDO VIAJADO"
          size="small"
          sx={{
            bgcolor: 'background.paper',
            fontWeight: 800,
            fontSize: '0.7rem',
            letterSpacing: 0.5
          }}
        />
        {visitedCodes.length > 0 && (
          <Chip
            label={`${visitedCodes.length} países`}
            size="small"
            color="primary"
            sx={{ fontWeight: 700 }}
          />
        )}
      </Stack>

      {/* TOOLTIP MEJORADO CON INFO */}
      <Fade in={!!selectedCountry} timeout={200}>
        <Paper
          elevation={6}
          sx={{
            position: 'absolute',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            bgcolor: 'rgba(20, 20, 20, 0.95)',
            backdropFilter: 'blur(10px)',
            color: 'white',
            px: 3,
            py: 2,
            borderRadius: '20px',
            zIndex: 20,
            pointerEvents: 'none',
            border: '1px solid rgba(255,255,255,0.1)',
            minWidth: 220,
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
          }}
        >
          {selectedCountry && (() => {
            const info = getCountryInfo(selectedCountry.code);
            return (
              <Stack alignItems="center" spacing={1.5}>
                {info && (
                  <Box
                    component="img"
                    src={`https://flagcdn.com/w80/${info.iso2.toLowerCase()}.png`}
                    alt={selectedCountry.name}
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid rgba(255,255,255,0.8)'
                    }}
                  />
                )}

                <Typography variant="body1" fontWeight="800" sx={{ lineHeight: 1.2 }}>
                  {selectedCountry.name}
                </Typography>

                {info && info.visits > 0 ? (
                  <Stack direction="row" divider={<Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />} spacing={2} alignItems="center">
                    <Box>
                      <Typography variant="caption" color="rgba(255,255,255,0.5)" fontWeight="700" letterSpacing={0.5}>
                        VISITAS
                      </Typography>
                      <Typography variant="h6" fontWeight="900" sx={{ lineHeight: 1 }}>
                        {info.visits}
                      </Typography>
                    </Box>
                    {info.lastVisitYear && (
                      <Box>
                        <Typography variant="caption" color="rgba(255,255,255,0.5)" fontWeight="700" letterSpacing={0.5}>
                          AÑO
                        </Typography>
                        <Typography variant="h6" fontWeight="900" sx={{ lineHeight: 1 }}>
                          {info.lastVisitYear}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                ) : (
                  <Chip label="Por explorar" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)', fontWeight: 600 }} />
                )}
              </Stack>
            );
          })()}
        </Paper>
      </Fade>

      {/* Leyenda de intensidad */}
      {visitedCodes.length > 0 && maxVisits > 1 && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 12,
            right: 12,
            zIndex: 10,
            bgcolor: 'background.paper',
            borderRadius: '12px',
            p: 1,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          <Typography variant="caption" fontWeight="700" color="text.secondary" display="block" mb={0.5}>
            FRECUENCIA
          </Typography>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Box sx={{ width: 16, height: 16, borderRadius: '4px', bgcolor: getColorByVisits(1) }} />
            <Typography variant="caption" fontSize="0.65rem">→</Typography>
            <Box sx={{ width: 16, height: 16, borderRadius: '4px', bgcolor: getColorByVisits(maxVisits) }} />
          </Stack>
        </Box>
      )}

      {/* Mapa Interactivo */}
      <ComposableMap projection="geoMercator" projectionConfig={{ scale: 100 }}>
        <ZoomableGroup center={[0, 20]} zoom={1}>
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const mapCode = geo.id; // ISO Numeric
                const isVisited = visitedNumeric.includes(mapCode);
                const visits = visitCounts[mapCode] || 0;
                const fillColor = isVisited
                  ? getColorByVisits(visits)
                  : (theme.palette.mode === 'light' ? "#FFF" : "#444");

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fillColor}
                    stroke={theme.palette.mode === 'light' ? "#DDD" : "#666"}
                    strokeWidth={0.5}
                    onMouseEnter={() => setSelectedCountry({ name: geo.properties.name, code: mapCode })}
                    onMouseLeave={() => setSelectedCountry(null)}
                    onClick={() => setSelectedCountry({ name: geo.properties.name, code: mapCode })}
                    style={{
                      default: { outline: "none" },
                      hover: {
                        fill: isVisited ? theme.palette.primary.dark : "#999",
                        outline: "none",
                        cursor: 'pointer',
                        filter: 'brightness(1.1)'
                      },
                      pressed: { outline: "none" },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
    </Paper>
  );
};

export default WorldMap;