// Utilidades para cálculos de viajes y estadísticas

/**
 * Calcula estadísticas generales de los viajes
 */
export const calculateTravelStats = (tripsList) => {
    if (!tripsList || tripsList.length === 0) {
        return {
            totalTrips: 0,
            totalDays: 0,
            totalCountries: 0,
            totalContinents: 0,
            totalCities: 0,
            averageTripDuration: 0,
            longestTrip: 0,
            mostVisitedCountry: null,
            tripsThisYear: 0,
            currentStreak: 0,
            maxStreak: 0
        };
    }

    // Total de viajes
    const totalTrips = tripsList.length;

    // Total de días viajados
    const totalDays = tripsList.reduce((sum, trip) => {
        if (trip.startDate && trip.endDate) {
            const start = new Date(trip.startDate);
            const end = new Date(trip.endDate);
            const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
            return sum + days;
        }
        return sum;
    }, 0);

    // Países únicos
    const countries = tripsList
        .map(t => t.country_code)
        .filter(c => c);
    const uniqueCountries = [...new Set(countries)];
    const totalCountries = uniqueCountries.length;

    // Continentes únicos (si tenemos esa info)
    const continents = tripsList
        .map(t => t.continent || getContinentFromCountry(t.country_code))
        .filter(c => c);
    const uniqueContinents = [...new Set(continents)];
    const totalContinents = uniqueContinents.length;

    // Ciudades únicas
    const cities = tripsList
        .map(t => t.place)
        .filter(p => p);
    const uniqueCities = [...new Set(cities)];
    const totalCities = uniqueCities.length;

    // Duración promedio
    const averageTripDuration = totalDays > 0 ? Math.round(totalDays / totalTrips) : 0;

    // Viaje más largo
    const longestTrip = tripsList.reduce((max, trip) => {
        if (trip.startDate && trip.endDate) {
            const start = new Date(trip.startDate);
            const end = new Date(trip.endDate);
            const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
            return Math.max(max, days);
        }
        return max;
    }, 0);

    // País más visitado
    const countryCount = {};
    countries.forEach(country => {
        countryCount[country] = (countryCount[country] || 0) + 1;
    });
    const mostVisitedCountry = Object.keys(countryCount).reduce((a, b) =>
        countryCount[a] > countryCount[b] ? a : b, null
    );

    // Viajes este año
    const currentYear = new Date().getFullYear();
    const tripsThisYear = tripsList.filter(trip => {
        if (trip.startDate) {
            const year = new Date(trip.startDate).getFullYear();
            return year === currentYear;
        }
        return false;
    }).length;

    // Calcular rachas (streak)
    const { currentStreak, maxStreak } = calculateStreak(tripsList);

    return {
        totalTrips,
        totalDays,
        totalCountries,
        totalContinents,
        totalCities,
        averageTripDuration,
        longestTrip,
        mostVisitedCountry,
        tripsThisYear,
        currentStreak,
        maxStreak
    };
};

/**
 * Calcula la racha de viajes (meses consecutivos con al menos 1 viaje)
 */
export const calculateStreak = (tripsList) => {
    if (!tripsList || tripsList.length === 0) {
        return { currentStreak: 0, maxStreak: 0 };
    }

    // Obtener meses únicos con viajes (formato YYYY-MM)
    const monthsWithTrips = tripsList
        .map(trip => {
            const startDate = trip.startDate || trip.start_date;
            if (startDate) {
                const date = new Date(startDate);
                return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            }
            return null;
        })
        .filter(m => m)
        .sort();

    const uniqueMonths = [...new Set(monthsWithTrips)];

    if (uniqueMonths.length === 0) {
        return { currentStreak: 0, maxStreak: 0 };
    }

    // Calcular racha actual desde el mes más reciente
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    let currentStreak = 0;
    let tempDate = new Date(now);

    // Retroceder mes a mes desde ahora
    for (let i = 0; i < 24; i++) { // Máximo 2 años hacia atrás
        const checkMonth = `${tempDate.getFullYear()}-${String(tempDate.getMonth() + 1).padStart(2, '0')}`;

        if (uniqueMonths.includes(checkMonth)) {
            currentStreak++;
        } else {
            break; // Se rompió la racha
        }

        // Retroceder un mes
        tempDate.setMonth(tempDate.getMonth() - 1);
    }

    // Calcular racha máxima histórica
    let maxStreak = 0;
    let tempStreak = 1;

    for (let i = 1; i < uniqueMonths.length; i++) {
        const prevDate = new Date(uniqueMonths[i - 1] + '-01');
        const currDate = new Date(uniqueMonths[i] + '-01');

        // Diferencia en meses
        const monthDiff = (currDate.getFullYear() - prevDate.getFullYear()) * 12
            + (currDate.getMonth() - prevDate.getMonth());

        if (monthDiff === 1) {
            tempStreak++;
            maxStreak = Math.max(maxStreak, tempStreak);
        } else {
            tempStreak = 1;
        }
    }

    maxStreak = Math.max(maxStreak, tempStreak);

    return { currentStreak, maxStreak };
};

/**
 * Calcula gastos totales de todos los viajes
 */
export const calculateTotalExpenses = (tripsList, expenses) => {
    // Si tenemos expenses global
    if (expenses && expenses.length > 0) {
        return expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
    }

    // Si cada trip tiene su array de expenses
    return tripsList.reduce((sum, trip) => {
        if (trip.expenses && Array.isArray(trip.expenses)) {
            return sum + trip.expenses.reduce((s, e) => s + (e.amount || 0), 0);
        }
        return sum;
    }, 0);
};

/**
 * Obtiene viajes agrupados por continente
 */
export const getTripsByContinents = (tripsList) => {
    const continentMap = {
        'Europe': [],
        'Asia': [],
        'North America': [],
        'South America': [],
        'Africa': [],
        'Oceania': []
    };

    tripsList.forEach(trip => {
        const continent = trip.continent || getContinentFromCountry(trip.country_code);
        if (continent && continentMap[continent]) {
            continentMap[continent].push(trip);
        }
    });

    return Object.entries(continentMap)
        .map(([name, trips]) => ({
            name,
            count: trips.length,
            countries: [...new Set(trips.map(t => t.country_code).filter(c => c))].length
        }))
        .filter(c => c.count > 0);
};

/**
 * Mapeo simple de país a continente (expandir según necesites)
 */
const getContinentFromCountry = (countryCode) => {
    const mapping = {
        'GB': 'Europe', 'ES': 'Europe', 'FR': 'Europe', 'IT': 'Europe', 'DE': 'Europe',
        'PT': 'Europe', 'GR': 'Europe', 'NL': 'Europe', 'BE': 'Europe', 'CH': 'Europe',
        'AT': 'Europe', 'IE': 'Europe', 'SE': 'Europe', 'NO': 'Europe', 'DK': 'Europe',
        'FI': 'Europe', 'PL': 'Europe', 'CZ': 'Europe', 'HU': 'Europe', 'RO': 'Europe',
        'TR': 'Europe',
        'US': 'North America', 'CA': 'North America', 'MX': 'North America',
        'AR': 'South America', 'BR': 'South America', 'CO': 'South America',
        'PE': 'South America', 'CL': 'South America',
        'CN': 'Asia', 'JP': 'Asia', 'KR': 'Asia', 'TH': 'Asia', 'VN': 'Asia', 'ID': 'Asia',
        'AU': 'Oceania', 'NZ': 'Oceania',
        'ZA': 'Africa', 'EG': 'Africa', 'MA': 'Africa'
    };
    return mapping[countryCode] || 'Other';
};
