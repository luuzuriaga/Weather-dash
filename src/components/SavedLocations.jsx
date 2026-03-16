import React, { useState, useEffect } from 'react';
import { fetchWeather, getWeatherDetails, searchCities } from '../services/weatherApi';

export default function SavedLocations({ savedCities, currentCity, onSelectCity, onRemoveCity, onAddCity }) {
    const [showModal, setShowModal] = useState(false);

    const mapQuery = currentCity ? encodeURIComponent(`${currentCity.name}${currentCity.country ? ', ' + currentCity.country : ''}`) : '';
    const mapSrc = currentCity ? `https://maps.google.com/maps?q=${mapQuery}&t=&z=10&ie=UTF8&iwloc=&output=embed` : 'about:blank';
    const mapHref = currentCity ? `https://maps.google.com/maps?q=${mapQuery}` : '#';

    return (
        <aside className="right-col">
            <div className="saved-locations-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.6rem' }}>
                    <h3 className="section-title" style={{ marginBottom: 0 }}>Ubicaciones Guardadas</h3>
                    <button onClick={() => setShowModal(true)} className="text-btn">Gestionar</button>
                </div>

                <div className="saved-locations-list">
                    {savedCities.length === 0 ? (
                        <p className="empty-msg">No hay ubicaciones guardadas.</p>
                    ) : (
                        savedCities.map(city => (
                            <SavedCityItem 
                                key={city.id} 
                                city={city} 
                                onSelect={() => onSelectCity(city)} 
                                onRemove={() => onRemoveCity(city.id)} 
                            />
                        ))
                    )}
                </div>

                <button onClick={() => setShowModal(true)} className="dashed-btn">
                    <span className="material-symbols-outlined">add</span> Añadir Ubicación
                </button>
            </div>

            <div className="map-section">
                <h3 className="section-title">Mapa</h3>
                <div className="map-card glass-card">
                    <iframe className="google-map-iframe" width="100%" height="100%" frameBorder="0" allowFullScreen src={mapSrc}></iframe>
                    <div className="map-overlay">
                        <a 
                            href={mapHref} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="overlay-btn" 
                            style={{ textDecoration: 'none', display: 'inline-block' }}
                        >
                            Ver mapa interactivo
                        </a>
                    </div>
                </div>
            </div>

            {showModal && (
                <ManageLocationsModal 
                    savedCities={savedCities}
                    onClose={() => setShowModal(false)}
                    onAddCity={onAddCity}
                    onRemoveCity={onRemoveCity}
                    onSelectCity={(city) => { onSelectCity(city); setShowModal(false); }}
                />
            )}
        </aside>
    );
}

function SavedCityItem({ city, onSelect, onRemove }) {
    const [temp, setTemp] = useState('--');
    const [icon, setIcon] = useState('question_mark');

    useEffect(() => {
        let mounted = true;
        fetchWeather(city.latitude, city.longitude).then(data => {
            if (!mounted) return;
            setTemp(`${Math.round(data.current.temperature_2m)}°`);
            const info = getWeatherDetails(data.current.weather_code, data.current.is_day);
            setIcon(info.icon);
        }).catch(() => {});
        return () => { mounted = false; };
    }, [city]);

    return (
        <div className="saved-location-item" onClick={onSelect}>
            <div className="loc-info">
                <span className="loc-name">{city.name}</span>
                <span className="loc-desc">{city.country}</span>
            </div>
            <div className="loc-temp-wrap">
                <span className="material-symbols-outlined loc-icon" style={{ fontSize: '2.2rem', opacity: 0.8 }}>{icon}</span>
                <span className="loc-temp">{temp}</span>
                <button className="remove-loc-btn" title="Eliminar" onClick={(e) => { e.stopPropagation(); onRemove(); }}>
                    <span className="material-symbols-outlined">delete</span>
                </button>
            </div>
        </div>
    );
}

function ManageLocationsModal({ savedCities, onClose, onAddCity, onRemoveCity, onSelectCity }) {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);

    const handleInput = async (e) => {
        const val = e.target.value;
        setQuery(val);
        if (val.trim().length >= 2) {
            const results = await searchCities(val);
            setSuggestions(results.slice(0, 1)); // only top 1 as per rules
        } else {
            setSuggestions([]);
        }
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const handleAdd = (e) => {
        e.preventDefault();
        if (suggestions.length > 0) {
            onAddCity(suggestions[0]);
            setQuery('');
            setSuggestions([]);
        }
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-window glass-card">
                <div className="modal-header">
                    <h2 className="modal-title">Gestionar Ubicaciones</h2>
                    <button onClick={onClose} className="icon-btn">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div className="modal-body">
                    <form className="modal-search-form" onSubmit={handleAdd}>
                        <input type="text" className="search-input" placeholder="Añadir nueva ciudad..." autoComplete="off" value={query} onChange={handleInput} />
                        <button type="submit" className="search-btn">Añadir</button>
                        {suggestions.length > 0 && (
                            <ul className="search-suggestions" style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '5px' }}>
                                {suggestions.map(city => (
                                    <li key={city.id} onClick={() => { onAddCity(city); setQuery(''); setSuggestions([]); }}>
                                        <strong>{city.name}</strong> <span style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>{city.admin1 ? ', ' + city.admin1 : ''}, {city.country}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </form>
                    <div className="modal-cities-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {savedCities.map(city => (
                            <SavedCityItem key={city.id} city={city} onSelect={() => onSelectCity(city)} onRemove={() => onRemoveCity(city.id)} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
