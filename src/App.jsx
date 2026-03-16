import React, { useEffect, useState, useCallback } from 'react';
import AnimatedBackground from './components/AnimatedBackground';
import SearchBar from './components/SearchBar';
import WeatherCard from './components/WeatherCard';
import WeatherWidgets from './components/WeatherWidgets';
import ForecastCard from './components/ForecastCard';
import TemperatureChart from './components/TemperatureChart';
import SavedLocations from './components/SavedLocations';
import { useWeather } from './hooks/useWeather';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useGeolocation } from './hooks/useGeolocation';

function App() {
  const { weatherData, loading, error, loadWeather } = useWeather();
  const [savedCities, setSavedCities] = useLocalStorage('weatherDashCities', []);
  const [searchHistory, setSearchHistory] = useLocalStorage('weatherDashSearchHistory', []);
  const { location: geoLoc, loading: geoLoading, error: geoError } = useGeolocation();
  
  const [currentCity, setCurrentCity] = useState(null);
  const [nowTimeIndex, setNowTimeIndex] = useState(0);

  // Find closest time index for widgets
  useEffect(() => {
    if (weatherData?.hourly) {
      const now = new Date();
      let closestIdx = 0;
      let minDiff = Infinity;
      weatherData.hourly.time.forEach((tStr, idx) => {
        const diff = Math.abs(now - new Date(tStr));
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = idx;
        }
      });
      setNowTimeIndex(closestIdx);
    }
  }, [weatherData]);

  const loadCity = useCallback((city) => {
    setCurrentCity(city);
    loadWeather(city.latitude, city.longitude);
  }, [loadWeather]);

  // Initial load logic
  useEffect(() => {
    if (geoLoading) return; // Wait for geo decision
    if (currentCity) return; // Already loaded

    if (geoLoc && !geoError) {
      loadCity({
        id: `geo-${Date.now()}`,
        name: 'Tu Ubicación',
        country: '',
        latitude: geoLoc.lat,
        longitude: geoLoc.lon
      });
    } else if (savedCities.length > 0) {
      loadCity(savedCities[0]);
    } else {
      // Default fallback
      loadCity({
        id: 2516927,
        name: 'Madrid',
        country: 'España',
        latitude: 40.4165,
        longitude: -3.7026
      });
    }
  }, [geoLoading, geoLoc, geoError, savedCities, loadCity, currentCity]);

  const handleCitySelect = (city) => {
    // Add to history
    setSearchHistory(prev => {
      const filtered = prev.filter(c => c.name !== city.name || c.country !== city.country);
      return [city, ...filtered].slice(0, 5);
    });
    loadCity(city);
  };

  const clearHistory = () => setSearchHistory([]);

  const addSavedCity = (city) => {
    if (!savedCities.some(c => c.id === city.id)) {
      setSavedCities([...savedCities, city]);
    }
  };

  const removeSavedCity = (id) => {
    setSavedCities(savedCities.filter(c => c.id !== id));
  };

  return (
    <AnimatedBackground 
      weatherCode={weatherData?.current?.weather_code} 
      isDay={weatherData?.current?.is_day}
    >
      {loading && (
        <div className="loading-overlay">
          <span className="material-symbols-outlined spinner">sync</span>
          <p>Cargando clima...</p>
        </div>
      )}

      {error && (
        <div className="error-overlay">
           <div className="error-content">
               <span className="material-symbols-outlined error-icon">error</span>
               <p>{error}</p>
           </div>
        </div>
      )}

      <div className={`app-container ${loading ? 'fade-out' : 'fade-in'}`}>
        <header className="top-header">
            <div className="header-left">
                <span className="material-symbols-outlined header-logo-icon">cloud</span>
                <h1 className="header-title">Weather Dash</h1>
            </div>
            <div className="header-right">
                <SearchBar 
                  onCitySelect={handleCitySelect} 
                  searchHistory={searchHistory} 
                  clearHistory={clearHistory} 
                />
            </div>
        </header>

        <main className="main-layout">
            <section className="left-col">
              <WeatherCard 
                city={currentCity} 
                currentData={weatherData?.current} 
                isSaved={savedCities.some(c => c.id === currentCity?.id)}
                onAddCity={() => addSavedCity(currentCity)}
                onRemoveCity={() => removeSavedCity(currentCity?.id)}
              />
              
              <WeatherWidgets 
                currentData={weatherData?.current} 
                hourlyData={weatherData?.hourly} 
                nowTimeIndex={nowTimeIndex} 
              />
              
              <ForecastCard 
                hourlyData={weatherData?.hourly} 
                nowTimeIndex={nowTimeIndex} 
              />
              
              <TemperatureChart 
                hourlyData={weatherData?.hourly} 
                nowTimeIndex={nowTimeIndex} 
              />
            </section>

            <SavedLocations 
              savedCities={savedCities}
              currentCity={currentCity}
              onSelectCity={loadCity}
              onAddCity={addSavedCity}
              onRemoveCity={removeSavedCity}
            />
        </main>
      </div>
    </AnimatedBackground>
  );
}

export default App;
