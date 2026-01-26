// Lógica centralizada de achievements y badges

/**
 * Definición de todos los achievements disponibles
 */
export const ALL_ACHIEVEMENTS = [
    // ACHIEVEMENTS POR PAÍSES
    {
        id: 'countries_1',
        category: 'countries',
        title: 'Turista',
        description: 'Visita tu primer país',
        icon: '🎒',
        color: '#4CAF50',
        requirement: { type: 'countries', value: 1 }
    },
    {
        id: 'countries_3',
        category: 'countries',
        title: 'Viajero',
        description: 'Visita 3 países diferentes',
        icon: '✈️',
        color: '#2196F3',
        requirement: { type: 'countries', value: 3 }
    },
    {
        id: 'countries_5',
        category: 'countries',
        title: 'Explorador',
        description: 'Visita 5 países diferentes',
        icon: '🌍',
        color: '#9C27B0',
        requirement: { type: 'countries', value: 5 }
    },
    {
        id: 'countries_10',
        category: 'countries',
        title: 'Nómada',
        description: 'Visita 10 países diferentes',
        icon: '🔥',
        color: '#FF9800',
        requirement: { type: 'countries', value: 10 }
    },
    {
        id: 'countries_20',
        category: 'countries',
        title: 'Leyenda',
        description: 'Visita 20 países diferentes',
        icon: '👑',
        color: '#FFD700',
        requirement: { type: 'countries', value: 20 }
    },

    // ACHIEVEMENTS POR CONTINENTES
    {
        id: 'europe_tour',
        category: 'continents',
        title: 'Tour Europeo',
        description: 'Visita 5 países en Europa',
        icon: '🗼',
        color: '#1976D2',
        requirement: { type: 'continent_countries', continent: 'Europe', value: 5 }
    },
    {
        id: 'american_dream',
        category: 'continents',
        title: 'American Dream',
        description: 'Visita USA, Canadá y México',
        icon: '🗽',
        color: '#D32F2F',
        requirement: { type: 'specific_countries', countries: ['US', 'CA', 'MX'] }
    },
    {
        id: 'asian_explorer',
        category: 'continents',
        title: 'Explorador Asiático',
        description: 'Visita 3 países en Asia',
        icon: '🏯',
        color: '#F57C00',
        requirement: { type: 'continent_countries', continent: 'Asia', value: 3 }
    },
    {
        id: 'all_continents',
        category: 'continents',
        title: 'Ciudadano del Mundo',
        description: 'Visita los 6 continentes habitados',
        icon: '🌏',
        color: '#4CAF50',
        requirement: { type: 'continents', value: 6 }
    },

    // ACHIEVEMENTS POR FRECUENCIA
    {
        id: 'globetrotter',
        category: 'frequency',
        title: 'Globetrotter',
        description: 'Realiza 3 o más viajes en un año',
        icon: '🌐',
        color: '#00BCD4',
        requirement: { type: 'trips_per_year', value: 3 }
    },
    {
        id: 'frequent_flyer',
        category: 'frequency',
        title: 'Frequent Flyer',
        description: 'Realiza 10 viajes en total',
        icon: '🛫',
        color: '#3F51B5',
        requirement: { type: 'total_trips', value: 10 }
    },
    {
        id: 'streak_3',
        category: 'frequency',
        title: 'En Racha',
        description: '3 meses consecutivos viajando',
        icon: '🔥',
        color: '#FF5722',
        requirement: { type: 'streak', value: 3 }
    },
    {
        id: 'streak_6',
        category: 'frequency',
        title: 'Imparable',
        description: '6 meses consecutivos viajando',
        icon: '⚡',
        color: '#FF6F00',
        requirement: { type: 'streak', value: 6 }
    },
    {
        id: 'streak_12',
        category: 'frequency',
        title: 'Año Viajero',
        description: '12 meses consecutivos viajando',
        icon: '🌟',
        color: '#FFC107',
        requirement: { type: 'streak', value: 12 }
    },

    // ACHIEVEMENTS POR PLANIFICACIÓN
    {
        id: 'planner_pro',
        category: 'planning',
        title: 'Planificador Pro',
        description: 'Crea un itinerario con 10+ actividades',
        icon: '📝',
        color: '#9C27B0',
        requirement: { type: 'max_items_in_trip', value: 10 }
    },
    {
        id: 'detail_oriented',
        category: 'planning',
        title: 'Detallista',
        description: 'Añade 20+ sitios a favoritos (spots)',
        icon: '💡',
        color: '#E91E63',
        requirement: { type: 'total_spots', value: 20 }
    },
    {
        id: 'budget_master',
        category: 'planning',
        title: 'Controlador de Gastos',
        description: 'Registra gastos en 5 viajes diferentes',
        icon: '💸',
        color: '#4CAF50',
        requirement: { type: 'trips_with_expenses', value: 5 }
    },

    // ACHIEVEMENTS ESPECIALES
    {
        id: 'early_adopter',
        category: 'special',
        title: 'Early Adopter',
        description: 'Registra tu primer viaje en Travio',
        icon: '🎉',
        color: '#673AB7',
        requirement: { type: 'total_trips', value: 1 }
    },
    {
        id: 'organized',
        category: 'special',
        title: 'Organizado',
        description: 'Completa checklist en 3 viajes',
        icon: '✅',
        color: '#009688',
        requirement: { type: 'trips_with_checklist', value: 3 }
    },
    {
        id: 'long_journey',
        category: 'special',
        title: 'Maratón Viajero',
        description: 'Realiza un viaje de 30+ días',
        icon: '🏃',
        color: '#FF9800',
        requirement: { type: 'max_trip_duration', value: 30 }
    },
    {
        id: 'total_days_100',
        category: 'special',
        title: 'Centenario',
        description: 'Acumula 100+ días viajando',
        icon: '📅',
        color: '#795548',
        requirement: { type: 'total_days', value: 100 }
    }
];

/**
 * Verifica si un achievement está desbloqueado según los datos del usuario
 */
export const checkAchievement = (achievement, userData) => {
    const { requirement } = achievement;
    const { type, value } = requirement;

    switch (type) {
        case 'countries':
            return userData.totalCountries >= value;

        case 'continent_countries':
            const continentData = userData.continents?.find(c => c.name === requirement.continent);
            return (continentData?.countries || 0) >= value;

        case 'specific_countries':
            return requirement.countries.every(code => userData.visitedCountries.includes(code));

        case 'continents':
            return userData.totalContinents >= value;

        case 'trips_per_year':
            return userData.tripsThisYear >= value;

        case 'total_trips':
            return userData.totalTrips >= value;

        case 'streak':
            return userData.currentStreak >= value;

        case 'max_items_in_trip':
            return userData.maxItemsInTrip >= value;

        case 'total_spots':
            return userData.totalSpots >= value;

        case 'trips_with_expenses':
            return userData.tripsWithExpenses >= value;

        case 'trips_with_checklist':
            return userData.tripsWithChecklist >= value;

        case 'max_trip_duration':
            return userData.longestTrip >= value;

        case 'total_days':
            return userData.totalDays >= value;

        default:
            return false;
    }
};

/**
 * Obtiene todos los achievements del usuario con su estado
 */
export const getUserAchievements = (userData) => {
    return ALL_ACHIEVEMENTS.map(achievement => ({
        ...achievement,
        unlocked: checkAchievement(achievement, userData),
        progress: calculateProgress(achievement, userData)
    }));
};

/**
 * Calcula el progreso hacia un achievement (0-100)
 */
const calculateProgress = (achievement, userData) => {
    const { requirement } = achievement;
    const { type, value } = requirement;

    let current = 0;

    switch (type) {
        case 'countries':
            current = userData.totalCountries;
            break;
        case 'continent_countries':
            const continentData = userData.continents?.find(c => c.name === requirement.continent);
            current = continentData?.countries || 0;
            break;
        case 'specific_countries':
            current = requirement.countries.filter(code => userData.visitedCountries.includes(code)).length;
            return Math.round((current / requirement.countries.length) * 100);
        case 'continents':
            current = userData.totalContinents;
            break;
        case 'trips_per_year':
            current = userData.tripsThisYear;
            break;
        case 'total_trips':
            current = userData.totalTrips;
            break;
        case 'streak':
            current = userData.currentStreak;
            break;
        case 'max_items_in_trip':
            current = userData.maxItemsInTrip;
            break;
        case 'total_spots':
            current = userData.totalSpots;
            break;
        case 'trips_with_expenses':
            current = userData.tripsWithExpenses;
            break;
        case 'trips_with_checklist':
            current = userData.tripsWithChecklist;
            break;
        case 'max_trip_duration':
            current = userData.longestTrip;
            break;
        case 'total_days':
            current = userData.totalDays;
            break;
        default:
            return 0;
    }

    return Math.min(100, Math.round((current / value) * 100));
};

/**
 * Obtiene el próximo achievement a desbloquear
 */
export const getNextAchievement = (userData) => {
    const achievements = getUserAchievements(userData);
    const locked = achievements.filter(a => !a.unlocked);

    if (locked.length === 0) return null;

    // Ordenar por progreso descendente
    locked.sort((a, b) => b.progress - a.progress);

    return locked[0];
};
