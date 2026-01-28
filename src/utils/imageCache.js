import { get, set } from 'idb-keyval';

// Prefijo para evitar colisiones en IndexedDB
// Prefijo para evitar colisiones en IndexedDB
const CACHE_PREFIX = 'img_cache_';
const BLACKLIST_PREFIX = 'img_fail_';

/**
 * Descarga una imagen y la guarda como Blob en IndexedDB
 * @param {string} url - URL de la imagen
 * @param {string} cacheKey - Clave única (ej: trip_123)
 * @returns {Promise<string>} - ObjectURL del blob (listo para usar en src)
 */
export const cacheImage = async (url, cacheKey) => {
    // FILTRO CORS: Solo intentamos cachear dominios que sabemos que permiten CORS.
    // Intentar cachear imágenes de blogs externos (surfingtheplanet, travel-assets...) provoca error rojo en consola.
    const safeDomains = ['supabase.co', 'unsplash.com', 'picsum.photos', 'localhost'];
    const isSafe = safeDomains.some(d => url.includes(d));

    if (!isSafe) {
        return url; // Devolvemos la URL original sin intentar cachear
    }

    try {
        // 0. Si ya sabemos que esta URL falla (CORS), no lo intentamos más
        const isBlacklisted = await get(BLACKLIST_PREFIX + cacheKey);
        if (isBlacklisted) {
            return url;
        }

        // 1. Ver si ya existe
        const cachedBlob = await get(CACHE_PREFIX + cacheKey);
        if (cachedBlob) {
            return URL.createObjectURL(cachedBlob);
        }

        // 2. Intentamos fetch con 'cors'.
        // Si la imagen externa NO tiene headers CORS (Access-Control-Allow-Origin), fallará.
        // NO usamos 'no-cors' porque devuelve un blob vacío (opaque) que no sirve.
        const response = await fetch(url, { mode: 'cors' });

        if (!response.ok) throw new Error('Network error or CORS block');

        const blob = await response.blob();

        // 3. Guardar
        await set(CACHE_PREFIX + cacheKey, blob);

        // 4. Retornar URL
        return URL.createObjectURL(blob);
    } catch (error) {
        // Si falla (ej: CORS), marcamos para no volver a intentarlo
        // Así evitamos el error rojo en futuras recargas.
        await set(BLACKLIST_PREFIX + cacheKey, true);
        return url;
    }
};

/**
 * Solo recupera si existe, sin hacer fetch
 */
export const getCachedImage = async (cacheKey) => {
    try {
        const cachedBlob = await get(CACHE_PREFIX + cacheKey);
        if (cachedBlob) {
            return URL.createObjectURL(cachedBlob);
        }
        return null;
    } catch (e) {
        return null;
    }
};
