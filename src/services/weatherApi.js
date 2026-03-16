// weatherApi.js
// Centralized service for interacting with the Open-Meteo API

const GEOCODING_API_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_API_URL = 'https://api.open-meteo.com/v1/forecast';

/**
 * Searches for cities based on a query string.
 * @param {string} query 
 * @returns {Promise<Array>} List of city objects
 */
export async function searchCities(query) {
    if (!query || query.length < 2) return [];
    try {
        const url = `${GEOCODING_API_URL}?name=${encodeURIComponent(query)}&count=5&language=es&format=json`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Geocoding API failed');
        const data = await response.json();
        return data.results || [];
    } catch (err) {
        console.error('Error fetching cities:', err);
        return [];
    }
}

/**
 * Fetches current and hourly weather data for a given latitude and longitude.
 * @param {number} lat 
 * @param {number} lon 
 * @returns {Promise<Object>} Weather data object
 */
export async function fetchWeather(lat, lon) {
    try {
        const url = `${FORECAST_API_URL}?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,surface_pressure&hourly=temperature_2m,weather_code,visibility,uv_index,precipitation_probability&timezone=auto`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Weather data failed');
        return await response.json();
    } catch (err) {
        console.error('Error fetching weather:', err);
        throw err;
    }
}

/**
 * Interprets WMO Weather codes into human-readable Spanish descriptions and Material Icons.
 * @param {number} code WMO Weather code
 * @param {number|boolean} isDay 1 for day, 0 for night
 * @returns {Object} { desc: string, icon: string }
 */
export function getWeatherDetails(code, isDay) {
    let desc = 'Desconocido';
    let icon = 'question_mark';

    if (code === 0) {
        desc = 'Despejado';
        icon = isDay ? 'sunny' : 'clear_night';
    } else if (code === 1 || code === 2) {
        desc = 'Parcialmente Nublado';
        icon = isDay ? 'partly_cloudy_day' : 'partly_cloudy_night';
    } else if (code === 3) {
        desc = 'Nublado';
        icon = 'cloud';
    } else if (code === 45 || code === 48) {
        desc = 'Niebla';
        icon = 'foggy';
    } else if (code >= 51 && code <= 55 || code >= 61 && code <= 65) {
        desc = 'Lluvia';
        icon = 'rainy';
    } else if (code >= 71 && code <= 75) {
        desc = 'Nieve';
        icon = 'cloudy_snowing';
    } else if (code >= 80 && code <= 82) {
        desc = 'Chubascos';
        icon = 'rainy';
    } else if (code >= 95 && code <= 99) {
        desc = 'Tormenta';
        icon = 'thunderstorm';
    }
    return { desc, icon };
}
