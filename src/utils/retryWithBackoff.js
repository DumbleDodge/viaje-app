/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {number} retries - Maximum number of retries (default: 3)
 * @param {number} delay - Initial delay in ms (default: 1000)
 * @returns {Promise} Result of the function
 */
export const retryWithBackoff = async (fn, retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (error) {
            // If it's the last retry, throw the error
            if (i === retries - 1) {
                console.error(`❌ Failed after ${retries} retries:`, error);
                throw error;
            }

            // Calculate exponential backoff delay
            const backoffDelay = delay * Math.pow(2, i);
            console.warn(`⚠️ Retry ${i + 1}/${retries} failed. Retrying in ${backoffDelay}ms...`, error.message);

            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, backoffDelay));
        }
    }
};
