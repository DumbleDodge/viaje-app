import React from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { Box, Typography, Paper, useTheme } from '@mui/material';

// URL Local (Archivo en carpeta public)
const GEO_URL = "/world-map.json";

// Diccionario ISO-2 (Tu BD) -> ISO-3 (El Mapa)
// Amplía esta lista con los países que quieras soportar
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

const WorldMap = ({ visitedCodes = [] }) => {
  const theme = useTheme();

  // 1. Convertimos tus códigos (GB) a formato del mapa (GBR)
  const visitedISO3 = visitedCodes.map(c => ISO_CONVERT[c] || c);

  return (
    <Paper 
      elevation={0}
      sx={{ 
        width: "100%", 
        height: 300, 
        bgcolor: theme.palette.mode === 'light' ? '#E3F2FD' : '#1A237E', // Mar
        borderRadius: '24px',
        overflow: 'hidden',
        border: '1px solid rgba(0,0,0,0.05)',
        position: 'relative'
      }}
    >
      {/* Etiqueta Flotante */}
      <Box sx={{ position: 'absolute', top: 10, left: 20, zIndex: 10 }}>
        <Typography variant="caption" fontWeight="800" sx={{ color: 'primary.main', bgcolor: 'background.paper', px: 1, py: 0.5, borderRadius: 1 }}>
          MUNDO VIAJADO
        </Typography>
      </Box>

      {/* Mapa Interactivo */}
      <ComposableMap projection="geoMercator" projectionConfig={{ scale: 100 }}>
        <ZoomableGroup center={[0, 20]} zoom={1}>
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                if (geo.properties.name === "United Kingdom" || geo.id === "GBR") {
                   console.log("🇬🇧 UK FOUND:", geo);
                }
                // El mapa world-atlas tiene el código ISO3 dentro de 'properties.iso_a3'
                // O a veces en 'id' si es numérico. Probamos ambos.
                const mapCode = geo.id; 
                const isVisited = visitedISO3.includes(mapCode);

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={isVisited ? theme.palette.primary.main : (theme.palette.mode === 'light' ? "#FFF" : "#444")}
                    stroke={theme.palette.mode === 'light' ? "#DDD" : "#666"}
                    strokeWidth={0.5}
                    style={{
                      default: { outline: "none" },
                      hover: { fill: isVisited ? theme.palette.primary.dark : "#999", outline: "none" },
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