import { useState, useCallback } from 'react';
import { fetchWeather } from '../services/weatherApi';

export function useWeather() {
    const [weatherData, setWeatherData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadWeather = useCallback(async (lat, lon) => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchWeather(lat, lon);
            setWeatherData(data);
        } catch (err) {
            setError(err.message || 'Error al cargar datos del clima.');
        } finally {
            setLoading(false);
        }
    }, []);

    return { weatherData, loading, error, loadWeather };
}
