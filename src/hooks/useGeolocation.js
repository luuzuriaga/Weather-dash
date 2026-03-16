import { useState, useEffect } from 'react';

export function useGeolocation() {
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!navigator.geolocation) {
            setError(new Error('Gelocation is not supported by your browser'));
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lon: position.coords.longitude
                });
                setLoading(false);
            },
            (err) => {
                setError(err);
                setLoading(false);
            }
        );
    }, []);

    return { location, loading, error };
}
