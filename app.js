document.addEventListener('DOMContentLoaded', () => {
    // ---- Elements ----
    
    // Overlays
    const appContainer = document.getElementById('app-container');
    const loadingOverlay = document.getElementById('loading-overlay');
    const errorOverlay = document.getElementById('error-overlay');
    const errorMessage = document.getElementById('error-message');
    const closeErrorBtn = document.getElementById('close-error-btn');

    // Header Search
    const searchForm = document.getElementById('search-form');
    const citySearchInput = document.getElementById('city-search-input');
    const searchSuggestions = document.getElementById('search-suggestions');

    // Main Card
    const currentCityName = document.getElementById('current-city-name');
    const currentDateTime = document.getElementById('current-date-time');
    const currentIcon = document.getElementById('current-icon');
    const currentTemp = document.getElementById('current-temp');
    const currentDescription = document.getElementById('current-description');
    
    // Bottom Widgets
    const currentFeelsLike = document.getElementById('current-feels-like');
    const currentHumidity = document.getElementById('current-humidity');
    const currentWindSpeed = document.getElementById('current-wind-speed');

    // Extra Stats
    const currentUv = document.getElementById('current-uv');
    const currentVisibility = document.getElementById('current-visibility');
    const currentPressure = document.getElementById('current-pressure');
    const currentPrecipProb = document.getElementById('current-precip-prob');

    // Forecast
    const hourlyForecastList = document.getElementById('hourly-forecast-list');
    const scrollLeftBtn = document.getElementById('scroll-left-btn');
    const scrollRightBtn = document.getElementById('scroll-right-btn');

    if (scrollLeftBtn && hourlyForecastList) {
        scrollLeftBtn.addEventListener('click', () => {
            hourlyForecastList.scrollBy({ left: -250, behavior: 'smooth' });
        });
    }

    if (scrollRightBtn && hourlyForecastList) {
        scrollRightBtn.addEventListener('click', () => {
            hourlyForecastList.scrollBy({ left: 250, behavior: 'smooth' });
        });
    }

    // Right Col
    const savedCitiesList = document.getElementById('saved-cities-list');
    const noCitiesMsg = document.getElementById('no-cities-msg');
    const manageLocationsBtn = document.getElementById('manage-locations-btn');
    const addLocationBtn = document.getElementById('add-location-btn');
    
    // Map
    const googleMapIframe = document.getElementById('google-map-iframe');
    const viewInteractiveMapBtn = document.getElementById('view-interactive-map-btn');

    // Modal
    const locationsModal = document.getElementById('locations-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const modalSavedCitiesList = document.getElementById('modal-saved-cities-list');
    const modalAddForm = document.getElementById('modal-add-form');
    const modalCityInput = document.getElementById('modal-city-input');
    const modalSuggestions = document.getElementById('modal-suggestions');

    // Chart
    const ctx = document.getElementById('tempChart').getContext('2d');
    let tempChartInstance = null;

    // State
    let savedCities = JSON.parse(localStorage.getItem('weatherDashCities')) || [];
    let searchHistory = JSON.parse(localStorage.getItem('weatherDashSearchHistory')) || [];
    let currentLoadedLocation = null;
    let geocodeDebounceTimer;

    // ---- Init ----
    async function init() {
        renderSavedCities();

        // Events
        citySearchInput.addEventListener('focus', () => {
            if (citySearchInput.value.trim() === '') {
                renderHistoryInSuggestions();
            }
        });

        searchForm.addEventListener('submit', handleSearchSubmit);
        citySearchInput.addEventListener('input', handleSearchInput);
        
        closeErrorBtn.addEventListener('click', () => {
            errorOverlay.classList.add('hidden');
        });

        manageLocationsBtn.addEventListener('click', openModal);
        addLocationBtn.addEventListener('click', openModal);
        closeModalBtn.addEventListener('click', closeModal);

        modalAddForm.addEventListener('submit', handleModalSearchSubmit);
        modalCityInput.addEventListener('input', handleModalSearchInput);
        
        // Hide search on click outside
        document.addEventListener('click', (e) => {
            if (!searchForm.contains(e.target)) {
                searchSuggestions.classList.add('hidden');
            }
            if (!modalAddForm.contains(e.target)) {
                modalSuggestions.classList.add('hidden');
            }
        });

        // Try load location or fallback
        loadInitialLocation();
    }

    async function loadInitialLocation() {
        try {
            const res = await fetch('https://get.geojs.io/v1/ip/geo.json');
            if (!res.ok) throw new Error('IP geo failed');
            const data = await res.json();
            if (data && data.city) {
                loadCityWeather({
                    id: `geo-${Date.now()}`,
                    name: data.city,
                    country: data.country,
                    latitude: parseFloat(data.latitude),
                    longitude: parseFloat(data.longitude)
                });
            } else {
                throw new Error("No data");
            }
        } catch (err) {
            console.warn('Geo API failed. Loading fallback.', err);
            if (savedCities.length > 0) {
                loadCityWeather(savedCities[0]);
            } else {
                // Madrid default
                loadCityWeather({
                    id: 2516927,
                    name: 'Madrid',
                    country: 'España',
                    latitude: 40.4165,
                    longitude: -3.7026
                });
            }
        }
    }

    // ---- API ----
    async function searchCities(query) {
        if (!query || query.length < 2) return [];
        try {
            const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=es&format=json`;
            const response = await fetch(url);
            const data = await response.json();
            return data.results || [];
        } catch (err) {
            console.error(err);
            return [];
        }
    }

    async function fetchWeather(lat, lon) {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,surface_pressure&hourly=temperature_2m,weather_code,visibility,uv_index,precipitation_probability&timezone=auto`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Weather data failed');
        return await response.json();
    }

    // ---- Event Handlers ----
    async function handleSearchSubmit(e) {
        e.preventDefault();
        const query = citySearchInput.value.trim();
        if (!query) return;
        searchSuggestions.classList.add('hidden');
        processSearch(query, citySearchInput);
    }

    async function handleModalSearchSubmit(e) {
        e.preventDefault();
        const query = modalCityInput.value.trim();
        if (!query) return;
        modalSuggestions.classList.add('hidden');
        
        const cities = await searchCities(query);
        if (cities.length > 0) {
            addCity(cities[0]);
            modalCityInput.value = '';
        }
    }

    async function processSearch(query, inputEl) {
        showLoading();
        const cities = await searchCities(query);
        if (cities.length === 0) {
            showError(`No se encontró la ciudad "${query}"`);
            return;
        }
        const city = cities[0];
        addToSearchHistory(city);
        loadCityWeather(city);
        inputEl.value = '';
    }

    function handleSearchInput(e) { 
        const query = e.target.value;
        if (query.trim() === '') {
            renderHistoryInSuggestions();
        } else {
            handleInput(query, searchSuggestions, citySearchInput, false); 
        }
    }
    function handleModalSearchInput(e) { handleInput(e.target.value, modalSuggestions, modalCityInput, true); }

    function handleInput(query, container, inputEl, isAddMode) {
        clearTimeout(geocodeDebounceTimer);
        query = query.trim();
        if (query.length < 2) {
            container.classList.add('hidden');
            return;
        }
        geocodeDebounceTimer = setTimeout(async () => {
            const cities = await searchCities(query);
            const displayCities = isAddMode ? cities.slice(0, 1) : cities;
            renderSuggestions(displayCities, container, inputEl, isAddMode);
        }, 300);
    }

    function renderSuggestions(cities, container, inputElement, isAddMode) {
        container.innerHTML = '';
        if (!cities || cities.length === 0) {
            container.classList.add('hidden');
            return;
        }
        cities.forEach(city => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${city.name}</strong> <span style="color:var(--text-muted); font-size:1.2rem;">${city.admin1 ? ', ' + city.admin1 : ''}, ${city.country}</span>`;
            li.addEventListener('click', () => {
                container.classList.add('hidden');
                inputElement.value = '';
                if (isAddMode) addCity(city);
                else {
                    addToSearchHistory(city);
                    loadCityWeather(city);
                }
            });
            container.appendChild(li);
        });
        container.classList.remove('hidden');
    }

    // ---- Renders ----
    async function loadCityWeather(city) {
        showLoading();
        
        // FADE OUT
        appContainer.classList.remove('fade-in');
        appContainer.classList.add('fade-out');

        try {
            const weather = await fetchWeather(city.latitude, city.longitude);
            currentLoadedLocation = city;
            
            setTimeout(() => {
                renderWeatherUI(city, weather);
                loadingOverlay.classList.add('hidden');
                // FADE IN
                appContainer.classList.remove('fade-out');
                appContainer.classList.add('fade-in');
            }, 300);

        } catch (error) {
            showError('Error al cargar datos del clima.');
        }
    }

    function renderWeatherUI(city, data) {
        // Dynamic Backgrounds
        const code = data.current.weather_code;
        const isDay = data.current.is_day;
        updateDynamicBackground(code, isDay);

        // Header
        currentCityName.textContent = `${city.name}${city.country ? ', ' + city.country : ''}`;
        
        const now = new Date();
        const options = { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' };
        // Capitalize first letter of date
        let dateStr = now.toLocaleDateString('es-ES', options);
        dateStr = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
        currentDateTime.textContent = dateStr;

        // Current Main
        const curr = data.current;
        currentTemp.textContent = Math.round(curr.temperature_2m);
        
        const info = getWeatherDetails(curr.weather_code, curr.is_day);
        currentDescription.textContent = info.desc;
        currentIcon.textContent = info.icon;

        // Widgets Bottom
        currentFeelsLike.textContent = `${Math.round(curr.apparent_temperature)}°`;
        currentHumidity.textContent = `${Math.round(curr.relative_humidity_2m)}%`;
        currentWindSpeed.textContent = `${Math.round(curr.wind_speed_10m)} km/h`;

        // Extra Stats
        // Get hourly info for the closest hour for UV and Visibility
        const nowTimeIndex = findClosestTimeIndex(data.hourly.time);
        
        // UV
        const uvVal = data.hourly.uv_index[nowTimeIndex];
        let uvText = "Bajo";
        if(uvVal >= 3) uvText = "Moderado";
        if(uvVal >= 6) uvText = "Alto";
        if(uvVal >= 8) uvText = "Muy Alto";
        if(uvVal >= 11) uvText = "Extremo";
        currentUv.textContent = `${Math.round(uvVal)} (${uvText})`;

        // Visibility (in meters from API -> km)
        const visMeters = data.hourly.visibility[nowTimeIndex] || 10000;
        currentVisibility.textContent = `${Math.round(visMeters / 1000)} km`;

        // Pressure
        currentPressure.textContent = `${Math.round(curr.surface_pressure)} hPa`;

        // Precip
        const precipProb = data.hourly.precipitation_probability[nowTimeIndex] || 0;
        currentPrecipProb.textContent = `${precipProb}%`;

        // Hourly
        renderHourlyForecast(data.hourly, nowTimeIndex);

        // Chart
        renderChart(data.hourly, nowTimeIndex);

        // Map
        updateGoogleMap(city.name);
    }

    function updateDynamicBackground(code, isDay) {
        document.body.className = '';
        if (!isDay) {
            document.body.classList.add('weather-night');
        } else {
            if (code === 0 || code === 1) document.body.classList.add('weather-sunny');
            else if (code >= 2 && code <= 48) document.body.classList.add('weather-cloudy');
            else if (code >= 51 && code <= 67 || code >= 80 && code <= 82) document.body.classList.add('weather-rain');
            else if (code >= 71 && code <= 77 || code >= 85 && code <= 86) document.body.classList.add('weather-snow');
            else document.body.classList.add('weather-cloudy');
        }
    }

    function renderHourlyForecast(hourly, startIndex) {
        hourlyForecastList.innerHTML = '';
        for (let i = 0; i < 24; i++) {
            const idx = startIndex + i;
            if (idx >= hourly.time.length) break;

            const t = new Date(hourly.time[idx]);
            const hourStr = t.getHours().toString().padStart(2, '0') + ':00';
            const temp = Math.round(hourly.temperature_2m[idx]);
            const isD = t.getHours() >= 6 && t.getHours() <= 18 ? 1 : 0;
            const info = getWeatherDetails(hourly.weather_code[idx], isD);

            const div = document.createElement('div');
            div.className = `forecast-item ${i === 0 ? 'now' : ''}`;
            
            div.innerHTML = `
                <span class="f-time">${i === 0 ? 'Ahora' : hourStr}</span>
                <span class="material-symbols-outlined f-icon">${info.icon}</span>
                <span class="f-temp">${temp}°</span>
            `;
            hourlyForecastList.appendChild(div);
        }
    }

    function renderChart(hourly, startIndex) {
        const labels = [];
        const temps = [];

        for (let i = 0; i <= 24; i+=3) { // Plot every 3 hours for 24h
            const idx = startIndex + i;
            if (idx >= hourly.time.length) break;
            
            const t = new Date(hourly.time[idx]);
            labels.push(t.getHours() + ':00');
            temps.push(hourly.temperature_2m[idx]);
        }

        if (tempChartInstance) tempChartInstance.destroy();

        tempChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Temperatura (°C)',
                    data: temps,
                    borderColor: '#38bdf8',
                    backgroundColor: 'rgba(56, 189, 248, 0.2)',
                    borderWidth: 3,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#38bdf8',
                    pointRadius: 4,
                    fill: true,
                    tension: 0.4 // Smooth curves
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                return context.parsed.y + '°C';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        grid: { color: 'rgba(255,255,255,0.1)' },
                        ticks: { color: 'rgba(255,255,255,0.7)', callback: val => val + '°' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: 'rgba(255,255,255,0.7)' }
                    }
                }
            }
        });
    }

    function updateGoogleMap(cityName) {
        if (!cityName) return;
        const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(cityName)}&t=&z=10&ie=UTF8&iwloc=&output=embed`;
        googleMapIframe.src = mapUrl;
        
        viewInteractiveMapBtn.onclick = () => {
            window.open(`https://maps.google.com/maps?q=${encodeURIComponent(cityName)}`, '_blank');
        };
    }

    // ---- Utils / State ----
    function showLoading() {
        loadingOverlay.classList.remove('hidden');
        errorOverlay.classList.add('hidden');
    }

    function showError(msg) {
        loadingOverlay.classList.add('hidden');
        errorMessage.textContent = msg;
        errorOverlay.classList.remove('hidden');
    }

    function findClosestTimeIndex(timeArray) {
        const now = new Date();
        let closestIndex = 0;
        let smallestDiff = Infinity;
        timeArray.forEach((timeStr, idx) => {
            const t = new Date(timeStr);
            const diff = Math.abs(now - t);
            if (diff < smallestDiff) {
                smallestDiff = diff;
                closestIndex = idx;
            }
        });
        return closestIndex;
    }

    // --- Saved Cities ---
    function addToSearchHistory(city) {
        // Remove if exists
        searchHistory = searchHistory.filter(c => c.name !== city.name || c.country !== city.country);
        searchHistory.unshift(city);
        if (searchHistory.length > 5) searchHistory.pop(); // Keep last 5
        localStorage.setItem('weatherDashSearchHistory', JSON.stringify(searchHistory));
    }

    function renderHistoryInSuggestions() {
        searchSuggestions.innerHTML = '';
        if (searchHistory.length === 0) {
            searchSuggestions.classList.add('hidden');
            return;
        }

        const header = document.createElement('li');
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.color = 'var(--text-muted)';
        header.style.fontSize = '1.2rem';
        header.style.cursor = 'default';
        header.style.borderBottom = '1px solid var(--border-soft)';
        header.innerHTML = `<span>Búsquedas recientes</span><span id="clear-search-history" style="cursor: pointer; color: #ef4444;">Borrar</span>`;
        searchSuggestions.appendChild(header);

        searchHistory.forEach(city => {
            const li = document.createElement('li');
            li.innerHTML = `<span class="material-symbols-outlined" style="font-size: 1.6rem; vertical-align: middle; margin-right: 0.5rem; opacity: 0.7;">history</span><strong>${city.name}</strong> <span style="color:var(--text-muted); font-size:1.2rem;">${city.admin1 ? ', ' + city.admin1 : ''}, ${city.country}</span>`;
            li.addEventListener('click', () => {
                searchSuggestions.classList.add('hidden');
                citySearchInput.value = '';
                loadCityWeather(city);
            });
            searchSuggestions.appendChild(li);
        });

        const clearBtn = document.getElementById('clear-search-history');
        if(clearBtn) {
            clearBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                searchHistory = [];
                localStorage.setItem('weatherDashSearchHistory', JSON.stringify([]));
                searchSuggestions.classList.add('hidden');
            });
        }

        searchSuggestions.classList.remove('hidden');
    }

    function addCity(city) {
        if (!savedCities.some(c => c.id === city.id)) {
            savedCities.push(city);
            saveToStorage();
            renderSavedCities();
        }
    }

    function removeCity(id) {
        savedCities = savedCities.filter(c => c.id !== id);
        saveToStorage();
        renderSavedCities();
    }

    function saveToStorage() { localStorage.setItem('weatherDashCities', JSON.stringify(savedCities)); }

    function renderSavedCities() {
        savedCitiesList.innerHTML = '';
        modalSavedCitiesList.innerHTML = '';

        if (savedCities.length === 0) {
            noCitiesMsg.classList.remove('hidden');
            return;
        }
        noCitiesMsg.classList.add('hidden');

        savedCities.forEach(c => {
            // Right Col item
            const item = createSavedCityEl(c, false);
            savedCitiesList.appendChild(item);
            
            // Modal item
            const mItem = createSavedCityEl(c, true);
            modalSavedCitiesList.appendChild(mItem);
        });
    }

    function createSavedCityEl(city, isModal) {
        const div = document.createElement('div');
        div.className = 'saved-location-item';
        
        div.innerHTML = `
            <div class="loc-info">
                <span class="loc-name">${city.name}</span>
                <span class="loc-desc">${city.country}</span>
            </div>
            <div class="loc-temp-wrap">
                <span class="material-symbols-outlined loc-icon" id="icon-${isModal ? 'm-' : ''}${city.id}" style="font-size: 2.2rem; opacity: 0.8;"></span>
                <span class="loc-temp" id="temp-${isModal ? 'm-' : ''}${city.id}">--°</span>
                <button class="remove-loc-btn" title="Eliminar"><span class="material-symbols-outlined">delete</span></button>
            </div>
        `;

        div.addEventListener('click', (e) => {
            if(e.target.closest('.remove-loc-btn')) {
                removeCity(city.id);
            } else {
                loadCityWeather(city);
                if(isModal) closeModal();
            }
        });

        // Async fetch temp for icon
        fetchWeather(city.latitude, city.longitude)
            .then(data => {
                const el = div.querySelector('.loc-temp');
                const iconEl = div.querySelector('.loc-icon');
                if(el) el.textContent = `${Math.round(data.current.temperature_2m)}°`;
                if(iconEl) {
                     const info = getWeatherDetails(data.current.weather_code, data.current.is_day);
                     iconEl.textContent = info.icon;
                }
            }).catch(()=>{});

        return div;
    }

    function openModal() {
        locationsModal.classList.remove('hidden');
    }
    function closeModal() {
        locationsModal.classList.add('hidden');
        modalCityInput.value = '';
        modalSuggestions.classList.add('hidden');
    }

    // Interpretation WMO
    function getWeatherDetails(code, isDay) {
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

    init();
});
