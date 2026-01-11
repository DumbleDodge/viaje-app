import React from 'react';
import { Drawer, Box, Typography, Stack, Card, CardContent, CardActionArea, useTheme } from '@mui/material';
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import DirectionsIcon from "@mui/icons-material/Directions";
import FlightIcon from "@mui/icons-material/Flight";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import dayjs from 'dayjs';

function TripWallet({ open, onClose, items, onOpenAttachment }) {
  const theme = useTheme();
  
  // Filtramos solo vuelos y transporte
  const tickets = items.filter(i => i.type === 'flight' || i.type === 'transport');

  return (
    <Drawer 
      anchor="bottom" 
      open={open} 
      onClose={onClose} 
      PaperProps={{ 
        sx: { 
          borderTopLeftRadius: "32px", 
          borderTopRightRadius: "32px", 
          maxHeight: "85vh", 
          bgcolor: theme.palette.mode === "light" ? "#F3F4F6" : "#0F172A", 
          pb: 4 
        } 
      }}
    >
      <Box sx={{ width: 40, height: 4, bgcolor: "text.disabled", borderRadius: 2, mx: "auto", mt: 2, mb: 1, opacity: 0.3 }} />
      
      <Box p={3}>
        <Typography variant="h6" fontWeight="800" mb={3} textAlign="center">Mis Billetes</Typography>
        
        {tickets.length === 0 ? (
          <Box textAlign="center" py={4} color="text.secondary">
            <Typography>No tienes billetes guardados.</Typography>
          </Box>
        ) : (
          <Stack spacing={3}>
            {tickets.map((item) => {
              const isFlight = item.type === "flight";
              const color = isFlight ? theme.palette.primary.main : theme.palette.secondary.main;
              
              return (
                <Card key={item.id} sx={{ borderRadius: "24px", overflow: "visible", boxShadow: "0 10px 30px rgba(0,0,0,0.15)", bgcolor: "background.paper" }}>
                  {/* CABECERA TICKET */}
                  <Box sx={{ bgcolor: color, color: "white", p: 2.5 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack direction="row" gap={1} alignItems="center">
                        {isFlight ? <FlightTakeoffIcon /> : <DirectionsIcon />}
                        <Typography variant="h6" fontWeight="800">{item.title}</Typography>
                      </Stack>
                      <Typography variant="h6" fontWeight="800">{item.time}</Typography>
                    </Stack>
                    <Typography variant="caption" sx={{ opacity: 0.8, display: "block", mt: 0.5 }}>
                      {dayjs(item.date).format("dddd, D MMMM YYYY")}
                    </Typography>
                  </Box>

                  {/* CUERPO TICKET */}
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" justifyContent="space-between" mb={3}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight="700">ORIGEN</Typography>
                        <Typography variant="h4" fontWeight="800" color="text.primary">{item.origin || '---'}</Typography>
                      </Box>
                      <Box display="flex" alignItems="center" justifyContent="center" px={2} sx={{ opacity: 0.3 }}>
                        <FlightIcon sx={{ transform: 'rotate(90deg)', fontSize: 32, color: 'text.primary' }} />
                      </Box>
                      <Box textAlign="right">
                        <Typography variant="caption" color="text.secondary" fontWeight="700">DESTINO</Typography>
                        <Typography variant="h4" fontWeight="800" color="text.primary">{item.destination || '---'}</Typography>
                      </Box>
                    </Stack>
                    
                    {isFlight && (
                      <Box sx={{ bgcolor: theme.palette.mode === "light" ? "#F9FAFB" : "#1e293b", p: 2, borderRadius: "16px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2 }}>
                        <Box><Typography variant="caption" color="text.secondary" fontWeight="700">VUELO</Typography><Typography variant="subtitle1" fontWeight="800">{item.flightNumber || "-"}</Typography></Box>
                        <Box textAlign="center"><Typography variant="caption" color="text.secondary" fontWeight="700">PUERTA</Typography><Typography variant="subtitle1" fontWeight="800">{item.gate || "-"}</Typography></Box>
                        <Box textAlign="right"><Typography variant="caption" color="text.secondary" fontWeight="700">ASIENTO</Typography><Typography variant="subtitle1" fontWeight="800">--</Typography></Box>
                      </Box>
                    )}
                  </CardContent>

                  {/* ZONA DE ARCHIVOS (PDFs) */}
                  {/* ZONA DE ARCHIVOS (PDFs) - DISEÑO RECUPERADO */}
                  <Box sx={{ borderTop: '2px dashed #E5E7EB', bgcolor: theme.palette.mode === 'light' ? '#FAFAFA' : '#111', position: 'relative', p: 2 }}>
                      
                      {/* Muescas decorativas del ticket */}
                      <Box sx={{ position: "absolute", top: -10, left: -10, width: 20, height: 20, borderRadius: "50%", bgcolor: theme.palette.mode === "light" ? "#F3F4F6" : "#0F172A" }} />
                      <Box sx={{ position: "absolute", top: -10, right: -10, width: 20, height: 20, borderRadius: "50%", bgcolor: theme.palette.mode === "light" ? "#F3F4F6" : "#0F172A" }} />
                      
                      <Stack direction="row" gap={2} alignItems="flex-start">
                        <Box sx={{ opacity: 0.3, pt: 0.5 }}><QrCode2Icon sx={{ fontSize: 48 }} /></Box>
                        
                        <Box flexGrow={1}>
                          <Typography variant="caption" sx={{ letterSpacing: 2, fontWeight: 800, color: "text.secondary", mb: 1, display: "block" }}>BOARDING PASSES</Typography>
                          
                          {!item.attachments?.length ? (
                            <Typography variant="caption" color="text.disabled" fontStyle="italic">Sin archivos adjuntos</Typography>
                          ) : (
                            <Stack spacing={1}>
                              {item.attachments.map((att, index) => (
                                <CardActionArea 
                                  key={index} 
                                  onClick={() => onOpenAttachment(att)} 
                                  sx={{ 
                                    p: 1, 
                                    borderRadius: "8px", 
                                    border: "1px solid", 
                                    borderColor: "divider", 
                                    bgcolor: "background.paper", 
                                    display: "flex", 
                                    alignItems: "center", 
                                    gap: 1.5, 
                                    "&:hover": { bgcolor: theme.palette.action.hover } 
                                  }}
                                >
                                  <Box sx={{ bgcolor: "#FFEBEE", color: "#D32F2F", borderRadius: "4px", p: 0.5, display: "flex", fontWeight: 'bold', fontSize: '0.7rem' }}>
                                    PDF
                                  </Box>
                                  <Typography variant="body2" fontWeight="600" noWrap sx={{ maxWidth: "180px" }}>
                                    {att.name}
                                  </Typography>
                                </CardActionArea>
                              ))}
                            </Stack>
                          )}
                        </Box>
                      </Stack>
                  </Box>
                </Card>
              );
            })}
          </Stack>
        )}
      </Box>
    </Drawer>
  );
}

export default TripWallet;