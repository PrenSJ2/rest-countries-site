import axios from 'axios';

const REST_COUNTRIES_API = 'https://restcountries.com/v3.1';

export const fetchAllCountries = async () => {
    try {
        const { data } = await axios.get(`${REST_COUNTRIES_API}/all`);
        return data;
    }
    catch (error) {
        console.error('Error fetching all countries', error);
        throw error;
    }
};