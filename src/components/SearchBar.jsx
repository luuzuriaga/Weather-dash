import React, { useState, useEffect, useRef } from 'react';
import { searchCities } from '../services/weatherApi';

export default function SearchBar({ onCitySelect, searchHistory, clearHistory }) {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const formRef = useRef(null);
    const debounceRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (formRef.current && !formRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setShowDropdown(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('click', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const handleInput = (e) => {
        const val = e.target.value;
        setQuery(val);
        setShowDropdown(true);

        if (val.trim() === '') {
            setSuggestions([]); // the render effect will fallback to history
            return;
        }

        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            if (val.trim().length >= 2) {
                const results = await searchCities(val);
                setSuggestions(results);
            }
        }, 300);
    };

    const handleSelect = (city) => {
        setQuery('');
        setShowDropdown(false);
        onCitySelect(city);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;
        
        setShowDropdown(false);
        const results = await searchCities(query);
        if (results.length > 0) {
            handleSelect(results[0]);
        } else {
            alert(`No se encontró la ciudad "${query}"`);
        }
    };

    // Derived view
    const isShowingHistory = query.trim() === '' && searchHistory && searchHistory.length > 0;

    return (
        <form ref={formRef} className="search-form" onSubmit={handleSubmit}>
            <span className="material-symbols-outlined search-icon">search</span>
            <input
                type="text"
                className="search-input"
                placeholder="Buscar ciudad..."
                autoComplete="off"
                value={query}
                onChange={handleInput}
                onFocus={() => setShowDropdown(true)}
            />
            
            {showDropdown && (isShowingHistory || suggestions.length > 0) && (
                <ul className="search-suggestions">
                    {isShowingHistory ? (
                        <>
                            <li style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'default', borderBottom: '1px solid var(--border-soft)' }}>
                                <span>Búsquedas recientes</span>
                                <span onClick={(e) => { e.stopPropagation(); clearHistory(); setShowDropdown(false); }} style={{ cursor: 'pointer', color: '#ef4444' }}>Borrar</span>
                            </li>
                            {searchHistory.map((city, idx) => (
                                <li key={idx} onClick={() => handleSelect(city)}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '1.6rem', verticalAlign: 'middle', marginRight: '0.5rem', opacity: 0.7 }}>history</span>
                                    <strong>{city.name}</strong> <span style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>{city.admin1 ? ', ' + city.admin1 : ''}, {city.country}</span>
                                </li>
                            ))}
                        </>
                    ) : (
                        suggestions.map((city, idx) => (
                            <li key={idx} onClick={() => handleSelect(city)}>
                                <strong>{city.name}</strong> <span style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>{city.admin1 ? ', ' + city.admin1 : ''}, {city.country}</span>
                            </li>
                        ))
                    )}
                </ul>
            )}
        </form>
    );
}
