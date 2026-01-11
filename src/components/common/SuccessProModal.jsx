import React from 'react';
import { Dialog, DialogContent, Box, Typography, Button, useTheme } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const SuccessProModal = ({ open, onClose }) => {
    const theme = useTheme();

    return (
        <Dialog
            open={open}
            onClose={onClose}
            PaperProps={{ sx: { borderRadius: '32px', p: 2, textAlign: 'center', maxWidth: 350 } }}
        >
            <DialogContent>
                {/* Icono de celebración animado con un degradado */}
                <Box sx={{
                    width: 80, height: 80,
                    bgcolor: '#4ADE80',
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    mx: 'auto', mb: 3,
                    boxShadow: '0 10px 25px rgba(74, 222, 128, 0.4)',
                    animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}>
                    <CheckCircleOutlineIcon sx={{ fontSize: 50, color: 'white' }} />
                </Box>

                <Typography variant="h5" fontWeight="800" gutterBottom sx={{ color: 'text.primary' }}>
                    ¡Ya eres Travio Pro! ⭐
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 4, px: 1, lineHeight: 1.6 }}>
                    Gracias por confiar en Travio. Hemos desbloqueado tus <strong>5GB de almacenamiento</strong> y el <strong>Modo Offline</strong> para todos tus viajes.
                </Typography>

                <Button
                    variant="contained"
                    fullWidth
                    onClick={onClose}
                    sx={{
                        py: 1.8,
                        borderRadius: '18px',
                        fontWeight: '800',
                        fontSize: '1rem',
                        bgcolor: '#4ADE80',
                        '&:hover': { bgcolor: '#22C55E' },
                        boxShadow: '0 8px 20px rgba(74, 222, 128, 0.3)'
                    }}
                >
                    ¡A VIAJAR! 🚀
                </Button>
            </DialogContent>
        </Dialog>
    );
};
export default SuccessProModal;