import React from 'react';
import { getWeatherDetails } from '../services/weatherApi';

export default function WeatherCard({ city, currentData, isSaved, onAddCity, onRemoveCity }) {
    if (!city || !currentData) return null;

    const { temperature_2m, weather_code, is_day } = currentData;
    const { desc, icon } = getWeatherDetails(weather_code, is_day);

    const now = new Date();
    const options = { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' };
    let dateStr = now.toLocaleDateString('es-ES', options);
    dateStr = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

    const locationName = `${city.name}${city.country ? ', ' + city.country : ''}`;

    return (
        <div className="main-weather-card glass-card">
            <div className="weather-card-header">
                <div className="weather-card-title">
                    <span className="small-text">Actual</span>
                    <h2 id="current-city-name" className="city-name">{locationName}</h2>
                    <p id="current-date-time" className="date-text">{dateStr}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className="weather-card-badge">
                        <span className="badge-dot"></span> ACTUALIZADO AHORA
                    </div>
                    <button 
                        onClick={isSaved ? onRemoveCity : onAddCity}
                        className="icon-btn"
                        style={{ background: 'rgba(255,255,255,0.1)', padding: '0.8rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s, transform 0.2s', transform: 'scale(1)' }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        title={isSaved ? "Quitar ubicación" : "Guardar ubicación"}
                    >
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: isSaved ? "'FILL' 1" : "'FILL' 0", color: isSaved ? '#facc15' : 'white' }}>
                            bookmark
                        </span>
                    </button>
                </div>
            </div>

            <div className="weather-card-center">
                <div className="weather-icon-large-wrapper">
                    <span id="current-icon" className="material-symbols-outlined weather-icon-large">{icon}</span>
                </div>
                <div className="weather-temp-wrapper">
                    <h1 className="temp-huge"><span id="current-temp">{Math.round(temperature_2m)}</span>°</h1>
                    <p id="current-description" className="weather-condition-text">{desc}</p>
                </div>
            </div>

            <div className="weather-card-bottom">
                <div className="glass-widget">
                    <span className="material-symbols-outlined widget-icon">thermostat</span>
                    <div className="widget-info">
                        <span className="widget-label">Sensación térmica</span>
                        <span id="current-feels-like" className="widget-value">{Math.round(currentData.apparent_temperature)}°</span>
                    </div>
                </div>
                <div className="glass-widget">
                    <span className="material-symbols-outlined widget-icon">water_drop</span>
                    <div className="widget-info">
                        <span className="widget-label">Humedad</span>
                        <span id="current-humidity" className="widget-value">{Math.round(currentData.relative_humidity_2m)}%</span>
                    </div>
                </div>
                <div className="glass-widget">
                    <span className="material-symbols-outlined widget-icon">air</span>
                    <div className="widget-info">
                        <span className="widget-label">Viento</span>
                        <span id="current-wind-speed" className="widget-value">{Math.round(currentData.wind_speed_10m)} km/h</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
