import React, { useEffect, useState } from 'react';

const AnimatedBackground = ({ weatherCode, isDay, children }) => {
    const [bgClass, setBgClass] = useState('weather-cloudy');

    useEffect(() => {
        if (!isDay && isDay !== undefined) {
            setBgClass('weather-night');
        } else {
            if (weatherCode === 0 || weatherCode === 1) setBgClass('weather-sunny');
            else if (weatherCode >= 2 && weatherCode <= 48) setBgClass('weather-cloudy');
            else if ((weatherCode >= 51 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 82)) setBgClass('weather-rain');
            else if ((weatherCode >= 71 && weatherCode <= 77) || (weatherCode >= 85 && weatherCode <= 86)) setBgClass('weather-snow');
            else if ([95, 96, 99].includes(weatherCode)) setBgClass('weather-storm');
            else setBgClass('weather-cloudy'); // default
        }
    }, [weatherCode, isDay]);

    useEffect(() => {
        document.body.className = bgClass;
    }, [bgClass]);

    // Helper to render particles
    const renderAtmosphere = () => {
        if (bgClass === 'weather-rain') {
            return (
                <div className="rain-container">
                    {[...Array(30)].map((_, i) => (
                        <div 
                            key={i} 
                            className="raindrop" 
                            style={{ 
                                left: `${Math.random() * 100}%`, 
                                animationDelay: `${Math.random() * 2}s`,
                                animationDuration: `${0.5 + Math.random() * 0.5}s`
                            }} 
                        />
                    ))}
                </div>
            );
        }
        if (bgClass === 'weather-snow') {
            return (
                <div className="snow-container">
                    {[...Array(40)].map((_, i) => (
                        <div 
                            key={i} 
                            className="snowflake" 
                            style={{ 
                                left: `${Math.random() * 100}%`, 
                                width: `${2 + Math.random() * 4}px`,
                                height: `${2 + Math.random() * 4}px`,
                                animationDelay: `${Math.random() * 5}s`,
                                animationDuration: `${3 + Math.random() * 4}s`
                            }} 
                        />
                    ))}
                </div>
            );
        }
        if (bgClass === 'weather-night') {
            return (
                <div className="stars-container">
                    {[...Array(50)].map((_, i) => (
                        <div 
                            key={i} 
                            className="star" 
                            style={{ 
                                top: `${Math.random() * 100}%`,
                                left: `${Math.random() * 100}%`,
                                width: `${Math.random() * 3}px`,
                                height: `${Math.random() * 3}px`,
                                animationDelay: `${Math.random() * 3}s`
                            }} 
                        />
                    ))}
                </div>
            );
        }
        if (bgClass === 'weather-storm') {
            return (
                <>
                    <div className="lightning lightning-flash"></div>
                    <div className="rain-container">
                        {[...Array(40)].map((_, i) => (
                            <div 
                                key={i} 
                                className="raindrop" 
                                style={{ 
                                    left: `${Math.random() * 100}%`, 
                                    animationDelay: `${Math.random() * 1}s`,
                                    animationDuration: `${0.3 + Math.random() * 0.3}s`
                                }} 
                            />
                        ))}
                    </div>
                </>
            );
        }
        if (bgClass === 'weather-sunny') {
            return <div className="sun-glow"></div>;
        }
        if (bgClass === 'weather-cloudy') {
            return (
                <div className="clouds-container">
                    {[...Array(5)].map((_, i) => (
                        <div 
                            key={i} 
                            className="cloud" 
                            style={{ 
                                top: `${Math.random() * 50}%`,
                                width: `${200 + Math.random() * 300}px`,
                                height: `${100 + Math.random() * 200}px`,
                                animationDuration: `${20 + Math.random() * 40}s`,
                                animationDelay: `${-Math.random() * 40}s`,
                                opacity: 0.3 + Math.random() * 0.3
                            }} 
                        />
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <>
            <div className="dynamic-bg" style={{ pointerEvents: 'none' }}>
                {renderAtmosphere()}
            </div>
            <div className={`app-content-wrapper ${bgClass}`} style={{ position: 'relative', minHeight: '100vh' }}>
                {children}
            </div>
        </>
    );
};

export default AnimatedBackground;
