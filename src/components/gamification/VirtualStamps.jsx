import React, { useState, useMemo } from 'react';
import { Box, Paper, Typography, Grid, Dialog, DialogContent, Stack, Chip, IconButton, useTheme, TextField, InputAdornment, Divider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SearchIcon from '@mui/icons-material/Search';
import dayjs from 'dayjs';
import 'dayjs/locale/es';

// Emojis y landmarks personalizados para países específicos (Landmarks se mantienen como texto)
const SPECIAL_LANDMARKS = {
    'GB': 'Big Ben',
    'ES': 'Sagrada Familia',
    'FR': 'Torre Eiffel',
    'IT': 'Coliseo',
    'DE': 'Puerta de Brandenburgo',
    'US': 'Estatua de la Libertad',
    'JP': 'Monte Fuji',
    'PT': 'Torre de Belém',
    'GR': 'Partenón',
    'NL': 'Molinos de viento',
    'BE': 'Atomium',
    'CH': 'Matterhorn',
    'AT': 'Ópera de Viena',
    'CA': 'CN Tower',
    'MX': 'Pirámides de Teotihuacán',
    'AR': 'Obelisco',
    'BR': 'Cristo Redentor',
    'CO': 'Santuario de Las Lajas',
    'PE': 'Machu Picchu',
    'CL': 'Isla de Pascua',
    'CN': 'Gran Muralla',
    'KR': 'Gyeongbokgung',
    'TH': 'Templos de Bangkok',
    'VN': 'Bahía de Halong',
    'ID': 'Borobudur',
    'AU': 'Ópera de Sydney',
    'NZ': 'Milford Sound',
    'ZA': 'Table Mountain',
    'EG': 'Pirámides de Giza',
    'MA': 'Medina de Marrakech',
    'IE': 'Acantilados de Moher',
    'SE': 'Palacio Real',
    'NO': 'Fiordos',
    'DK': 'La Sirenita',
    'FI': 'Aurora Boreal',
    'PL': 'Castillo de Wawel',
    'CZ': 'Puente de Carlos',
    'HU': 'Parlamento de Budapest',
    'RO': 'Castillo de Bran',
    'TR': 'Hagia Sophia'
};

// Lista de códigos ISO 3166-1 alpha-2 (reducida para ejemplo, idealmente completa)
const ALL_ISO_CODES = [
    'AF', 'AL', 'DZ', 'AS', 'AD', 'AO', 'AI', 'AQ', 'AG', 'AR', 'AM', 'AW', 'AU', 'AT', 'AZ',
    'BS', 'BH', 'BD', 'BB', 'BY', 'BE', 'BZ', 'BJ', 'BM', 'BT', 'BO', 'BA', 'BW', 'BV', 'BR',
    'IO', 'BN', 'BG', 'BF', 'BI', 'KH', 'CM', 'CA', 'CV', 'KY', 'CF', 'TD', 'CL', 'CN', 'CX',
    'CC', 'CO', 'KM', 'CG', 'CD', 'CK', 'CR', 'CI', 'HR', 'CU', 'CY', 'CZ', 'DK', 'DJ', 'DM',
    'DO', 'EC', 'EG', 'SV', 'GQ', 'ER', 'EE', 'ET', 'FK', 'FO', 'FJ', 'FI', 'FR', 'GF', 'PF',
    'TF', 'GA', 'GM', 'GE', 'DE', 'GH', 'GI', 'GR', 'GL', 'GD', 'GP', 'GU', 'GT', 'GN', 'GW',
    'GY', 'HT', 'HM', 'VA', 'HN', 'HK', 'HU', 'IS', 'IN', 'ID', 'IR', 'IQ', 'IE', 'IL', 'IT',
    'JM', 'JP', 'JO', 'KZ', 'KE', 'KI', 'KP', 'KR', 'KW', 'KG', 'LA', 'LV', 'LB', 'LS', 'LR',
    'LY', 'LI', 'LT', 'LU', 'MO', 'MK', 'MG', 'MW', 'MY', 'MV', 'ML', 'MT', 'MH', 'MQ', 'MR',
    'MU', 'YT', 'MX', 'FM', 'MD', 'MC', 'MN', 'MS', 'MA', 'MZ', 'MM', 'NA', 'NR', 'NP', 'NL',
    'AN', 'NC', 'NZ', 'NI', 'NE', 'NG', 'NU', 'NF', 'MP', 'NO', 'OM', 'PK', 'PW', 'PS', 'PA',
    'PG', 'PY', 'PE', 'PH', 'PN', 'PL', 'PT', 'PR', 'QA', 'RE', 'RO', 'RU', 'RW', 'SH', 'KN',
    'LC', 'PM', 'VC', 'WS', 'SM', 'ST', 'SA', 'SN', 'CS', 'SC', 'SL', 'SG', 'SK', 'SI', 'SB',
    'SO', 'ZA', 'GS', 'ES', 'LK', 'SD', 'SR', 'SJ', 'SZ', 'SE', 'CH', 'SY', 'TW', 'TJ', 'TZ',
    'TH', 'TL', 'TG', 'TK', 'TO', 'TT', 'TN', 'TR', 'TM', 'TC', 'TV', 'UG', 'UA', 'AE', 'GB',
    'US', 'UM', 'UY', 'UZ', 'VU', 'VE', 'VN', 'VG', 'VI', 'WF', 'EH', 'YE', 'ZM', 'ZW'
];

/**
 * Obtiene la URL de la bandera
 */
const getFlagUrl = (countryCode) => {
    return `https://flagcdn.com/w160/${countryCode.toLowerCase()}.png`;
};

const getDisplayName = (countryCode) => {
    try {
        return new Intl.DisplayNames(['es'], { type: 'region' }).of(countryCode);
    } catch (error) {
        return countryCode;
    }
};

function VirtualStamps({ visitedCodes, tripsList }) {
    const theme = useTheme();
    const [selectedStamp, setSelectedStamp] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Generar datos de todos los países
    const allStamps = useMemo(() => {
        return ALL_ISO_CODES.map(code => {
            const landmark = SPECIAL_LANDMARKS[code] || 'Explorando el mundo';
            const name = getDisplayName(code);

            return {
                code,
                name: name,
                flagUrl: getFlagUrl(code),
                landmark: landmark,
                isSpecial: !!SPECIAL_LANDMARKS[code]
            };
        }).sort((a, b) => a.name.localeCompare(b.name));
    }, []);

    // Filtrar sellos
    const filteredStamps = useMemo(() => {
        return allStamps.filter(stamp =>
            stamp.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [allStamps, searchTerm]);

    const unlockedStamps = filteredStamps.filter(s => visitedCodes.includes(s.code));
    const lockedStamps = filteredStamps.filter(s => !visitedCodes.includes(s.code));

    // Obtener información de viajes por país
    const getCountryInfo = (code) => {
        // Encontrar todos los viajes a este país
        const trips = tripsList.filter(t => t.country_code === code);

        if (trips.length === 0) return { visits: 0, firstVisit: null, lastVisit: null };

        // Helper para obtener fecha segura
        const getDate = (trip) => {
            const dateVal = trip.start_date || trip.startDate;
            if (!dateVal) return null;
            // Si es Timestamp de Firebase (tiene toDate)
            if (dateVal && typeof dateVal.toDate === 'function') {
                return dateVal.toDate();
            }
            return new Date(dateVal);
        };

        // Ordenar por fecha para encontrar primera y última
        const sortedTrips = trips
            .map(t => ({ ...t, _parsedDate: getDate(t) }))
            .filter(t => t._parsedDate && !isNaN(t._parsedDate.getTime())) // Filtrar fechas inválidas
            .sort((a, b) => a._parsedDate - b._parsedDate);

        if (sortedTrips.length === 0) return { visits: trips.length, firstVisit: '-', lastVisit: '-' };

        const formatOptions = (date) => dayjs(date).isValid() ? dayjs(date).locale('es').format('D MMM YYYY') : '-';

        return {
            visits: trips.length,
            firstVisit: formatOptions(sortedTrips[0]._parsedDate),
            lastVisit: formatOptions(sortedTrips[sortedTrips.length - 1]._parsedDate)
        };
    };

    const unlockedCount = visitedCodes.length;
    const totalCount = ALL_ISO_CODES.length;

    const handleStampClick = (stamp) => {
        const isUnlocked = visitedCodes.includes(stamp.code);
        const info = isUnlocked ? getCountryInfo(stamp.code) : null;
        setSelectedStamp({ ...stamp, isUnlocked, info });
    };

    return (
        <Box sx={{ mb: 4 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="800">
                    🎫 Mi Colección ({unlockedCount})
                </Typography>
                <Chip
                    label={`${Math.round((unlockedCount / totalCount) * 100)}% Completado`}
                    size="small"
                    sx={{ fontWeight: 800 }}
                    color={unlockedCount > 0 ? 'primary' : 'default'}
                />
            </Stack>

            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    borderRadius: '24px',
                    bgcolor: theme.palette.mode === 'light' ? '#FAF8F3' : '#2A2520',
                    border: '2px dashed rgba(0,0,0,0.1)'
                }}
            >
                {/* Buscador */}
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Buscar país..."
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: 'background.paper' } }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon color="action" />
                            </InputAdornment>
                        ),
                    }}
                />

                {/* Contenedor Scrollable */}
                <Box
                    sx={{
                        maxHeight: '400px',
                        overflowY: 'auto',
                        pr: 1,
                        '&::-webkit-scrollbar': {
                            width: '6px',
                        },
                        '&::-webkit-scrollbar-track': {
                            background: 'transparent',
                        },
                        '&::-webkit-scrollbar-thumb': {
                            background: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
                            borderRadius: '3px',
                        },
                        '&::-webkit-scrollbar-thumb:hover': {
                            background: theme.palette.mode === 'light' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)',
                        }
                    }}
                >
                    {/* SECCIÓN DESBLOQUEADOS */}
                    {unlockedStamps.length > 0 && (
                        <Box mb={3}>
                            <Typography variant="caption" fontWeight="700" color="text.secondary" mb={1} display="block">
                                MIS SELLOS ({unlockedStamps.length})
                            </Typography>
                            <Box display="flex" flexWrap="wrap" gap={1}>
                                {unlockedStamps.map((stamp) => (
                                    <Paper
                                        key={stamp.code}
                                        elevation={0}
                                        onClick={() => handleStampClick(stamp)}
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: '50%',
                                            overflow: 'hidden',
                                            border: `2px solid ${theme.palette.primary.main}`,
                                            bgcolor: 'background.paper',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            position: 'relative',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                            '&:hover': {
                                                transform: 'scale(1.15)',
                                                boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                                                zIndex: 2
                                            }
                                        }}
                                    >
                                        <Box
                                            component="img"
                                            src={stamp.flagUrl}
                                            alt={stamp.name}
                                            loading="lazy"
                                            sx={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                            }}
                                        />
                                        {/* Indicador de especial si lo es */}
                                        {stamp.isSpecial && (
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    bottom: 0,
                                                    right: 0,
                                                    width: 12,
                                                    height: 12,
                                                    borderRadius: '50%',
                                                    bgcolor: 'gold',
                                                    border: '2px solid white',
                                                    zIndex: 1
                                                }}
                                            />
                                        )}
                                    </Paper>
                                ))}
                            </Box>
                        </Box>
                    )}

                    {/* SECCIÓN BLOQUEADOS */}
                    {lockedStamps.length > 0 && (
                        <Box>
                            <Typography variant="caption" fontWeight="700" color="text.secondary" mb={1} display="block">
                                POR CONSEGUIR ({lockedStamps.length})
                            </Typography>
                            <Box display="flex" flexWrap="wrap" gap={0.8}>
                                {lockedStamps.map((stamp) => (
                                    <Paper
                                        key={stamp.code}
                                        elevation={0}
                                        onClick={() => handleStampClick(stamp)}
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: '50%',
                                            overflow: 'hidden',
                                            border: '1px dashed rgba(0,0,0,0.2)',
                                            bgcolor: 'rgba(0,0,0,0.03)',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            filter: 'grayscale(100%) opacity(0.5)',
                                            '&:hover': {
                                                transform: 'scale(1.15)',
                                                filter: 'grayscale(0%) opacity(1)',
                                                zIndex: 2
                                            }
                                        }}
                                    >
                                        <Box
                                            component="img"
                                            src={stamp.flagUrl}
                                            alt={stamp.name}
                                            loading="lazy"
                                            sx={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                            }}
                                        />
                                    </Paper>
                                ))}
                            </Box>
                        </Box>
                    )}

                    {filteredStamps.length === 0 && (
                        <Box py={4} textAlign="center">
                            <Typography variant="body2" color="text.secondary">
                                No se encontraron países
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Paper>

            {/* Modal con detalles del sello */}
            <Dialog
                open={!!selectedStamp}
                onClose={() => setSelectedStamp(null)}
                PaperProps={{
                    sx: {
                        borderRadius: '24px',
                        maxWidth: 340,
                        m: 2,
                        width: '100%',
                        overflow: 'visible' // Permitir que la bandera sobresalga si quisiéramos
                    }
                }}
            >
                {selectedStamp && (
                    <DialogContent sx={{ p: 0, textAlign: 'center', pb: 3 }}>
                        <IconButton
                            onClick={() => setSelectedStamp(null)}
                            sx={{ position: 'absolute', top: 8, right: 8, zIndex: 5, bgcolor: 'rgba(255,255,255,0.8)' }}
                        >
                            <CloseIcon />
                        </IconButton>

                        {/* Cabecera Visual */}
                        <Box sx={{
                            height: 120,
                            bgcolor: selectedStamp.isUnlocked ? theme.palette.primary.main : '#e0e0e0',
                            display: 'flex',
                            alignItems: 'flex-end',
                            justifyContent: 'center',
                            mb: 6,
                            position: 'relative',
                            borderRadius: '24px 24px 0 0'
                        }}>
                            <Box
                                sx={{
                                    width: 100,
                                    height: 100,
                                    borderRadius: '50%',
                                    border: '4px solid white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    overflow: 'hidden',
                                    position: 'absolute',
                                    bottom: -50,
                                    bgcolor: 'background.paper',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                    filter: selectedStamp.isUnlocked ? 'none' : 'grayscale(100%)'
                                }}
                            >
                                <Box
                                    component="img"
                                    src={selectedStamp.flagUrl}
                                    alt={selectedStamp.name}
                                    sx={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                    }}
                                />
                            </Box>
                        </Box>

                        <Box px={3}>
                            <Typography variant="h5" fontWeight="900" gutterBottom>
                                {selectedStamp.name}
                            </Typography>

                            <Typography variant="body2" color="text.secondary" gutterBottom fontStyle="italic" sx={{ mb: 3 }}>
                                {selectedStamp.landmark}
                            </Typography>

                            {/* ESTADO */}
                            {!selectedStamp.isUnlocked && (
                                <Chip
                                    label="BLOQUEADO"
                                    size="small"
                                    sx={{ fontWeight: 800, bgcolor: 'action.disabledBackground', mb: 2 }}
                                />
                            )}

                            {selectedStamp.isUnlocked ? (
                                <Box sx={{
                                    mt: 2,
                                    p: 2,
                                    bgcolor: 'rgba(0,0,0,0.03)',
                                    borderRadius: '16px',
                                    border: '1px dashed rgba(0,0,0,0.1)'
                                }}>
                                    <Stack spacing={3}>
                                        <Box>
                                            <Typography variant="h3" fontWeight="900" color="primary" sx={{ lineHeight: 1, mb: 0.5 }}>
                                                {selectedStamp.info.visits}
                                            </Typography>
                                            <Typography variant="caption" fontWeight="800" letterSpacing={1} color="text.secondary">
                                                VISITAS
                                            </Typography>
                                        </Box>

                                        <Divider />

                                        <Stack direction="row" justifyContent="space-around" alignItems="center">
                                            <Box>
                                                <Typography variant="subtitle2" fontWeight="700" color="text.secondary" gutterBottom>
                                                    Primera Vez
                                                </Typography>
                                                <Typography variant="body1" fontWeight="600" color="text.primary">
                                                    {selectedStamp.info?.firstVisit || '-'}
                                                </Typography>
                                            </Box>

                                            <Box sx={{ width: '1px', height: 40, bgcolor: 'divider' }} />

                                            <Box>
                                                <Typography variant="subtitle2" fontWeight="700" color="text.secondary" gutterBottom>
                                                    Última Vez
                                                </Typography>
                                                <Typography variant="body1" fontWeight="600" color="text.primary">
                                                    {selectedStamp.info?.lastVisit || '-'}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </Stack>
                                </Box>
                            ) : (
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 2, px: 2 }}>
                                    ¡Visita <strong>{selectedStamp.name}</strong> para desbloquear este sello y sumarlo a tu pasaporte!
                                </Typography>
                            )}
                        </Box>
                    </DialogContent>
                )}
            </Dialog>
        </Box>
    );
}

export default VirtualStamps;
