import axios from 'axios';

const REST_COUNTRIES_API = 'https://restcountries.com/v3.1';


/**
 * Fetches all countries from the REST Countries API, with retries
 * @returns {Promise<*>}
 */
export const fetchAllCountries = async (retryCount = 3, delay = 1000) => {
    try {
        const { data } = await axios.get(`${REST_COUNTRIES_API}/all`);
        return data;
    }
    catch (error) {
        console.error('Error fetching all countries', error);
        if (retryCount > 0) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    fetchAllCountries(retryCount - 1, delay)
                        .then(resolve)
                        .catch(reject);
                }, delay);
            });
        }
        throw error;
    }
};