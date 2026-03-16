import React from 'react';

export default function WeatherWidgets({ currentData, hourlyData, nowTimeIndex }) {
    if (!currentData || !hourlyData || nowTimeIndex === undefined) return null;

    // UV
    const uvVal = hourlyData.uv_index[nowTimeIndex] || 0;
    let uvText = "Bajo";
    if(uvVal >= 3) uvText = "Moderado";
    if(uvVal >= 6) uvText = "Alto";
    if(uvVal >= 8) uvText = "Muy Alto";
    if(uvVal >= 11) uvText = "Extremo";
    
    // Visibility
    const visMeters = hourlyData.visibility[nowTimeIndex] || 10000;
    const visKm = Math.round(visMeters / 1000);

    // Pressure
    const pressure = Math.round(currentData.surface_pressure);

    // Precip
    const precipProb = hourlyData.precipitation_probability[nowTimeIndex] || 0;

    return (
        <div className="extra-stats-grid">
            <div className="extra-stat-card glass-card">
                <span className="material-symbols-outlined stat-icon text-yellow">light_mode</span>
                <span className="stat-label">Índice UV</span>
                <span id="current-uv" className="stat-value">{Math.round(uvVal)} ({uvText})</span>
            </div>
            <div className="extra-stat-card glass-card">
                <span className="material-symbols-outlined stat-icon text-blue-light">visibility</span>
                <span className="stat-label">Visibilidad</span>
                <span id="current-visibility" className="stat-value">{visKm} km</span>
            </div>
            <div className="extra-stat-card glass-card">
                <span className="material-symbols-outlined stat-icon text-purple">speed</span>
                <span className="stat-label">Presión</span>
                <span id="current-pressure" className="stat-value">{pressure} hPa</span>
            </div>
            <div className="extra-stat-card glass-card">
                <span className="material-symbols-outlined stat-icon text-blue">rainy</span>
                <span className="stat-label">Probab. lluvia</span>
                <span id="current-precip-prob" className="stat-value">{precipProb}%</span>
            </div>
        </div>
    );
}
