import React, { useState } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { Box, Typography, Paper, useTheme, Fade, Stack, Chip } from '@mui/material';

// URL Local (Archivo en carpeta public)
const GEO_URL = "/world-map.json";

// Diccionario ISO2 -> ISO Numeric (String)
const ISO_CONVERT = {
  'GB': '826', 'ES': '724', 'FR': '250', 'IT': '380', 'DE': '276',
  'US': '840', 'JP': '392', 'PT': '620', 'GR': '300', 'NL': '528',
  'BE': '056', 'CH': '756', 'AT': '040', 'CA': '124', 'MX': '484',
  'AR': '032', 'BR': '076', 'CO': '170', 'PE': '604', 'CL': '152',
  'CN': '156', 'KR': '410', 'TH': '764', 'VN': '704', 'ID': '360',
  'AU': '036', 'NZ': '554', 'ZA': '710', 'EG': '818', 'MA': '504',
  'IE': '372', 'SE': '752', 'NO': '578', 'DK': '208', 'FI': '246',
  'PL': '616', 'CZ': '203', 'HU': '348', 'RO': '642', 'TR': '792'
};

const WorldMap = ({ visitedCodes = [], tripsList = [] }) => {
  const theme = useTheme();
  const [selectedCountry, setSelectedCountry] = useState(null);

  // Contar visitas por país para degradado
  const countVisitsPerCountry = () => {
    const counts = {};
    tripsList.forEach(trip => {
      const code = trip.country_code;
      if (code && ISO_CONVERT[code]) {
        const iso3 = ISO_CONVERT[code];
        counts[iso3] = (counts[iso3] || 0) + 1;
      }
    });
    return counts;
  };

  const visitCounts = countVisitsPerCountry();
  const maxVisits = Math.max(...Object.values(visitCounts), 1);

  // Obtener información del país seleccionado
  const getCountryInfo = (countryCode) => {
    const reverseLookup = Object.entries(ISO_CONVERT).find(([_, val]) => val === countryCode);
    if (!reverseLookup) return null;

    const iso2 = reverseLookup[0];
    const trips = tripsList.filter(t => t.country_code === iso2);

    return {
      visits: trips.length,
      lastVisit: trips.length > 0 ? new Date(trips[trips.length - 1].start_date).getFullYear() : null
    };
  };

  // Convertir códigos a ISO3
  const visitedISO3 = visitedCodes.map(c => ISO_CONVERT[c] || c);

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
            bgcolor: 'rgba(0,0,0,0.92)',
            color: 'white',
            px: 3,
            py: 1.5,
            borderRadius: '16px',
            zIndex: 20,
            pointerEvents: 'none',
            border: '1px solid rgba(255,255,255,0.1)',
            minWidth: 200,
            textAlign: 'center'
          }}
        >
          {selectedCountry && (() => {
            const info = getCountryInfo(selectedCountry.code);
            return (
              <>
                <Typography variant="body1" fontWeight="800" gutterBottom>
                  {selectedCountry.name}
                </Typography>
                {info && info.visits > 0 ? (
                  <>
                    <Stack direction="row" justifyContent="center" spacing={2} mt={1}>
                      <Box>
                        <Typography variant="caption" color="rgba(255,255,255,0.6)">
                          VISITAS
                        </Typography>
                        <Typography variant="h6" fontWeight="900">
                          {info.visits}
                        </Typography>
                      </Box>
                      {info.lastVisit && (
                        <Box>
                          <Typography variant="caption" color="rgba(255,255,255,0.6)">
                            ÚLTIMA
                          </Typography>
                          <Typography variant="h6" fontWeight="900">
                            {info.lastVisit}
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </>
                ) : (
                  <Typography variant="caption" color="rgba(255,255,255,0.6)">
                    Aún no visitado
                  </Typography>
                )}
              </>
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
                const mapCode = geo.id;
                const isVisited = visitedISO3.includes(mapCode);
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