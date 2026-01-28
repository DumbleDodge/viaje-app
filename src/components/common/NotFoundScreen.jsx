import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import MapIcon from '@mui/icons-material/Map';
import { useNavigate } from 'react-router-dom';

const NotFoundScreen = () => {
    const navigate = useNavigate();

    return (
        <Container maxWidth="sm" sx={{
            textAlign: 'center',
            py: 15,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '80vh'
        }}>
            <Box sx={{
                animation: 'float 6s ease-in-out infinite',
                '@keyframes float': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-20px)' }
                }
            }}>
                <MapIcon sx={{ fontSize: 120, color: 'text.disabled', mb: 2, opacity: 0.5 }} />
            </Box>

            <Typography variant="h2" fontWeight="900" gutterBottom sx={{
                background: 'linear-gradient(45deg, #6750A4 30%, #FF7043 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
            }}>
                404
            </Typography>

            <Typography variant="h4" fontWeight="800" sx={{ mb: 2 }}>
                ¡Te has salido del mapa! 🗺️
            </Typography>

            <Typography variant="body1" color="text.secondary" paragraph sx={{ maxWidth: 400, mb: 4 }}>
                Parece que la ruta que buscas no existe o se ha movido a otro destino. No te preocupes, todos nos perdemos a veces.
            </Typography>

            <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/')}
                sx={{
                    borderRadius: 50,
                    px: 4,
                    fontWeight: 'bold',
                    boxShadow: '0 10px 20px rgba(103, 80, 164, 0.2)'
                }}
            >
                Volver al Campamento Base
            </Button>
        </Container>
    );
};

export default NotFoundScreen;
