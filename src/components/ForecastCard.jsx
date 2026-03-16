import React, { useRef } from 'react';
import { getWeatherDetails } from '../services/weatherApi';

export default function ForecastCard({ hourlyData, nowTimeIndex }) {
    const scrollRef = useRef(null);

    const scrollLeft = () => {
        if (scrollRef.current) scrollRef.current.scrollBy({ left: -250, behavior: 'smooth' });
    };

    const scrollRight = () => {
        if (scrollRef.current) scrollRef.current.scrollBy({ left: 250, behavior: 'smooth' });
    };

    if (!hourlyData || nowTimeIndex === undefined) return null;

    const forecastItems = [];
    for (let i = 0; i < 24; i++) {
        const idx = nowTimeIndex + i;
        if (idx >= hourlyData.time.length) break;

        const t = new Date(hourlyData.time[idx]);
        const hourStr = t.getHours().toString().padStart(2, '0') + ':00';
        const temp = Math.round(hourlyData.temperature_2m[idx]);
        const isD = t.getHours() >= 6 && t.getHours() <= 18 ? 1 : 0;
        const info = getWeatherDetails(hourlyData.weather_code[idx], isD);

        forecastItems.push(
            <div key={idx} className={`forecast-item ${i === 0 ? 'now' : ''}`}>
                <span className="f-time">{i === 0 ? 'Ahora' : hourStr}</span>
                <span className="material-symbols-outlined f-icon">{info.icon}</span>
                <span className="f-temp">{temp}°</span>
            </div>
        );
    }

    return (
        <div className="forecast-section">
            <h3 className="section-title">Pronóstico 24 horas</h3>
            <div className="forecast-carousel">
                <button onClick={scrollLeft} className="scroll-btn left">
                    <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <div ref={scrollRef} className="forecast-row no-scrollbar">
                    {forecastItems}
                </div>
                <button onClick={scrollRight} className="scroll-btn right">
                    <span className="material-symbols-outlined">chevron_right</span>
                </button>
            </div>
        </div>
    );
}
