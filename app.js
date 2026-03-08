document.addEventListener('DOMContentLoaded', () => {
    // ---- Elements ----

    // Sidebar
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const savedCitiesList = document.getElementById('saved-cities-list');
    const manageLocationsBtn = document.getElementById('manage-locations-btn');

    // Main UI
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const searchForm = document.getElementById('search-form');
    const citySearchInput = document.getElementById('city-search-input');
    const searchSuggestions = document.getElementById('search-suggestions');

    const dashboardContent = document.getElementById('dashboard-content');
    const errorContainer = document.getElementById('error-container');
    const errorMessage = document.getElementById('error-message');
    const loadingContainer = document.getElementById('loading-container');

    // Weather Stats
    const heroSection = document.getElementById('hero-section');
    const currentCityName = document.getElementById('current-city-name');
    const cityImageContainer = document.getElementById('city-image-container');
    const currentDateTime = document.getElementById('current-date-time');
    const saveCityBtn = document.getElementById('save-city-btn');
    const currentTemp = document.getElementById('current-temp');
    const currentDescription = document.getElementById('current-description');
    const currentHigh = document.getElementById('current-high');
    const currentLow = document.getElementById('current-low');
    const currentIcon = document.getElementById('current-icon');
    const currentFeelsLike = document.getElementById('current-feels-like');
    const currentHumidity = document.getElementById('current-humidity');
    const currentWindSpeed = document.getElementById('current-wind-speed');

    // Forecast
    const hourlyForecastSection = document.getElementById('hourly-forecast-section');
    const hourlyForecastList = document.getElementById('hourly-forecast-list');

    // Gallery
    const cityGallerySection = document.getElementById('city-gallery-section');
    const cityGalleryGrid = document.getElementById('city-gallery-grid');

    // Radar Map
    const radarMapSection = document.getElementById('radar-map-section');
    const radarMapIframe = document.getElementById('radar-map-iframe');

    // Modal
    const locationsModal = document.getElementById('locations-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const modalSavedCitiesList = document.getElementById('modal-saved-cities-list');
    const modalAddForm = document.getElementById('modal-add-form');
    const modalCityInput = document.getElementById('modal-city-input');
    const modalSuggestions = document.getElementById('modal-suggestions');

    // ---- State ----
    let savedCities = JSON.parse(localStorage.getItem('weatherDashCities')) || [];
    let currentLoadedLocation = null;
    let geocodeDebounceTimer;

    // ---- Core Functions ----

    async function init() {
        renderSavedCities();

        // Setup Event Listeners
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
        sidebarOverlay.addEventListener('click', closeMobileMenu);

        searchForm.addEventListener('submit', handleSearchSubmit);
        citySearchInput.addEventListener('input', handleSearchInput);

        saveCityBtn.addEventListener('click', toggleSaveCurrentCity);

        manageLocationsBtn.addEventListener('click', openModal);
        closeModalBtn.addEventListener('click', closeModal);

        modalAddForm.addEventListener('submit', handleModalSearchSubmit);
        modalCityInput.addEventListener('input', handleModalSearchInput);

        // Fetch user location as default
        try {
            const res = await fetch('https://get.geojs.io/v1/ip/geo.json');
            if (!res.ok) throw new Error('Network response was not ok');
            const data = await res.json();

            if (data && data.city && data.latitude && data.longitude) {
                loadCityWeather({
                    id: `geo-${Date.now()}`,
                    name: data.city,
                    country: data.country,
                    country_code: data.country_code || data.country,
                    latitude: parseFloat(data.latitude),
                    longitude: parseFloat(data.longitude),
                    timezone: data.timezone || 'UTC'
                });
            } else {
                throw new Error("Incomplete geo data");
            }
        } catch (err) {
            console.warn('Geolocation failed, falling back to saved or default', err);
            // Load default city if we have any saved
            if (savedCities.length > 0) {
                loadCityWeather(savedCities[0]);
            } else {
                // Absolute fallback if no saved cities and IP fetch fails
                loadCityWeather({
                    id: 2516927,
                    name: 'Madrid',
                    country_code: 'ES',
                    country: 'Spain',
                    latitude: 40.4165,
                    longitude: -3.7026,
                    timezone: 'Europe/Madrid'
                });
            }
        }
    }

    // --- Geocoding API ---
    async function searchCities(query) {
        if (!query || query.length < 2) return [];
        try {
            const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`;
            const response = await fetch(url);
            const data = await response.json();
            return data.results || [];
        } catch (err) {
            console.error('Error fetching geocoding:', err);
            return [];
        }
    }

    // --- Weather API ---
    async function fetchWeather(lat, lon) {
        try {
            // Using current weather and hourly forecast from open-meteo
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,wind_speed_10m&hourly=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('Weather data failed');
            return await response.json();
        } catch (err) {
            console.error('Error fetching weather:', err);
            throw err;
        }
    }

    // --- Event Handlers ---

    function toggleMobileMenu() {
        sidebar.classList.toggle('mobile-open');
        sidebarOverlay.classList.toggle('active');
    }

    function closeMobileMenu() {
        sidebar.classList.remove('mobile-open');
        sidebarOverlay.classList.remove('active');
    }

    async function handleSearchSubmit(e) {
        e.preventDefault();
        const query = citySearchInput.value.trim();
        if (!query) return;

        searchSuggestions.classList.add('hidden');
        clearNode(searchSuggestions);

        showLoading();
        const cities = await searchCities(query);
        if (cities.length === 0) {
            showError(`No locations found for "${query}"`);
            return;
        }

        // Just take the first one
        loadCityWeather(cities[0]);
        citySearchInput.value = '';
    }

    async function handleSearchInput(e) {
        clearTimeout(geocodeDebounceTimer);
        const query = e.target.value.trim();

        if (query.length < 2) {
            searchSuggestions.classList.add('hidden');
            return;
        }

        geocodeDebounceTimer = setTimeout(async () => {
            const cities = await searchCities(query);
            renderSuggestions(cities, searchSuggestions, citySearchInput, false);
        }, 300);
    }

    // Handle submitting the input in the modal
    async function handleModalSearchSubmit(e) {
        e.preventDefault();
        const query = modalCityInput.value.trim();
        if (!query) return;

        modalSuggestions.classList.add('hidden');
        clearNode(modalSuggestions);

        const cities = await searchCities(query);
        if (cities.length > 0) {
            addCity(cities[0]);
            modalCityInput.value = '';
        }
    }

    async function handleModalSearchInput(e) {
        clearTimeout(geocodeDebounceTimer);
        const query = e.target.value.trim();

        if (query.length < 2) {
            modalSuggestions.classList.add('hidden');
            return;
        }

        geocodeDebounceTimer = setTimeout(async () => {
            const cities = await searchCities(query);
            renderSuggestions(cities, modalSuggestions, modalCityInput, true); // true = add mode
        }, 300);
    }

    function renderSuggestions(cities, container, inputElement, isAddMode = false) {
        clearNode(container);
        if (!cities || cities.length === 0) {
            container.classList.add('hidden');
            return;
        }

        cities.forEach(city => {
            const li = document.createElement('li');
            li.className = 'suggestion-item';

            const icon = document.createElement('span');
            icon.className = 'material-symbols-outlined text-muted';
            icon.textContent = 'location_city';
            icon.style.marginRight = '8px';
            icon.style.color = 'var(--text-muted)';

            const textSpan = document.createElement('span');
            textSpan.style.fontSize = '1.4rem';

            const cityNameSpan = document.createElement('span');
            cityNameSpan.textContent = `${city.name}`;

            const countrySpan = document.createElement('span');
            countrySpan.textContent = city.admin1 ? `, ${city.admin1}, ${city.country}` : `, ${city.country}`;
            countrySpan.style.color = 'var(--text-secondary)';

            textSpan.appendChild(cityNameSpan);
            textSpan.appendChild(countrySpan);

            li.appendChild(icon);
            li.appendChild(textSpan);

            li.addEventListener('click', () => {
                container.classList.add('hidden');
                inputElement.value = '';
                if (isAddMode) {
                    addCity(city);
                } else {
                    loadCityWeather(city);
                }
            });

            container.appendChild(li);
        });

        container.classList.remove('hidden');
    }

    // --- Loading & Rendering Logic ---

    async function loadCityWeather(cityData) {
        showLoading();
        currentLoadedLocation = cityData;

        try {
            const weather = await fetchWeather(cityData.latitude, cityData.longitude);
            renderWeather(cityData, weather);
            updateSaveButtonState();
        } catch (error) {
            showError('Failed to load weather data.');
        }
    }

    function renderWeather(city, weatherData) {
        hideStateContainers();

        // Basic Info
        currentCityName.textContent = city.name + (city.country_code ? `, ${city.country_code}` : '');

        // Fetch City Image Backgrop
        updateCityImage(city.name);

        const now = new Date();
        const options = { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' };
        currentDateTime.textContent = now.toLocaleDateString('en-US', options);

        // Current Weather
        const current = weatherData.current;
        const daily = weatherData.daily;

        currentTemp.textContent = Math.round(current.temperature_2m);
        currentFeelsLike.textContent = Math.round(current.apparent_temperature);
        currentHumidity.textContent = current.relative_humidity_2m;
        currentWindSpeed.textContent = current.wind_speed_10m;

        currentHigh.textContent = Math.round(daily.temperature_2m_max[0]);
        currentLow.textContent = Math.round(daily.temperature_2m_min[0]);

        const { desc, icon } = getWeatherInfo(current.weather_code, current.is_day);
        currentDescription.textContent = desc;
        currentIcon.textContent = icon;

        // Hourly Forecast
        renderHourlyForecast(weatherData.hourly);

        // Update Radar Map
        updateRadarMap(city.latitude, city.longitude);

        heroSection.classList.remove('hidden');
        hourlyForecastSection.classList.remove('hidden');
        radarMapSection.classList.remove('hidden');
    }

    function updateRadarMap(lat, lon) {
        const url = `https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=mm&metricTemp=%C2%B0C&metricWind=km%2Fh&zoom=5&overlay=radar&product=radar&message=true&marker=true&lat=${lat}&lon=${lon}`;
        radarMapIframe.src = url;
    }

    async function updateCityImage(cityName) {
        cityImageContainer.style.backgroundImage = 'none';
        clearNode(cityGalleryGrid);
        cityGallerySection.classList.add('hidden');

        try {
            // 1. Fetch main thumbnail for the card background
            const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(cityName)}&prop=pageimages&format=json&pithumbsize=1000&origin=*`;
            const response = await fetch(url);
            const data = await response.json();
            const pages = data.query.pages;
            const pageId = Object.keys(pages)[0];

            if (pageId !== '-1' && pages[pageId].thumbnail) {
                const imgUrl = pages[pageId].thumbnail.source;
                if (!imgUrl.includes('.svg')) {
                    cityImageContainer.style.backgroundImage = `url('${imgUrl}')`;
                }
            }

            // 2. Fetch extensive image list for the gallery
            const galleryUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(cityName)}&generator=images&gimlimit=20&prop=imageinfo&iiprop=url&format=json&origin=*`;
            const galleryRes = await fetch(galleryUrl);
            const galleryData = await galleryRes.json();

            if (galleryData.query && galleryData.query.pages) {
                const imgPages = Object.values(galleryData.query.pages);

                // Filter specifically for photograph extensions and ignore common metadata images
                const photos = imgPages
                    .filter(page => {
                        if (!page.imageinfo || page.imageinfo.length === 0) return false;
                        const u = page.imageinfo[0].url.toLowerCase();
                        if (u.includes('map') || u.includes('flag') || u.includes('logo') || u.includes('symbol') || u.includes('coat_of_arms')) return false;
                        return u.endsWith('.jpg') || u.endsWith('.jpeg');
                    })
                    .map(page => page.imageinfo[0].url);

                if (photos.length > 0) {
                    // Limiting to an aestethic grid of up to 4 photos
                    const displayPhotos = photos.slice(0, 4);

                    displayPhotos.forEach(photoUrl => {
                        const card = document.createElement('div');
                        card.className = 'gallery-card';

                        const img = document.createElement('img');
                        img.src = photoUrl;
                        img.className = 'gallery-img';
                        img.alt = `Photo of ${cityName}`;
                        img.loading = 'lazy'; // Optimization

                        card.appendChild(img);
                        cityGalleryGrid.appendChild(card);
                    });

                    cityGallerySection.classList.remove('hidden');
                }
            }
        } catch (err) {
            console.error('Error fetching city media:', err);
        }
    }

    function renderHourlyForecast(hourlyData) {
        clearNode(hourlyForecastList);

        // The open-meteo response has time arrays ['2023-10-14T00:00', ...]
        const nowTimeIndex = findClosestTimeIndex(hourlyData.time);

        for (let i = 0; i < 24; i++) {
            const idx = nowTimeIndex + i;
            if (idx >= hourlyData.time.length) break;

            const timeStr = hourlyData.time[idx]; // "2023-10-14T10:00"
            const dateObj = new Date(timeStr);
            const hourStr = dateObj.getHours().toString().padStart(2, '0') + ':00';

            const temp = Math.round(hourlyData.temperature_2m[idx]);
            const code = hourlyData.weather_code[idx];
            // assumes daytime after 6 AM, before 6 PM
            const isDayHourly = dateObj.getHours() >= 6 && dateObj.getHours() <= 18 ? 1 : 0;
            const { icon, colorClass } = getWeatherInfo(code, isDayHourly);

            const card = document.createElement('div');
            card.className = 'forecast-card';
            if (i === 0) card.classList.add('now');

            const timeSpan = document.createElement('span');
            timeSpan.className = 'forecast-time';
            timeSpan.textContent = i === 0 ? 'Now' : hourStr;

            const iconSpan = document.createElement('span');
            iconSpan.className = `material-symbols-outlined forecast-icon ${i !== 0 ? colorClass : ''}`;
            iconSpan.textContent = icon;

            const tempSpan = document.createElement('span');
            tempSpan.className = 'forecast-temp';
            tempSpan.textContent = temp + '°';

            card.appendChild(timeSpan);
            card.appendChild(iconSpan);
            card.appendChild(tempSpan);

            hourlyForecastList.appendChild(card);
        }
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

    // --- Saved Cities Logic ---

    function toggleSaveCurrentCity() {
        if (!currentLoadedLocation) return;

        const isSaved = isCitySaved(currentLoadedLocation.id);

        if (isSaved) {
            removeCity(currentLoadedLocation.id);
        } else {
            addCity(currentLoadedLocation);
        }
    }

    function isCitySaved(cityId) {
        return savedCities.some(c => c.id === cityId);
    }

    function addCity(city) {
        if (!isCitySaved(city.id)) {
            savedCities.push(city);
            saveToStorage();
            renderSavedCities();
            updateSaveButtonState();
        }
    }

    function removeCity(cityId) {
        savedCities = savedCities.filter(c => c.id !== cityId);
        saveToStorage();
        renderSavedCities();
        updateSaveButtonState();
    }

    function saveToStorage() {
        localStorage.setItem('weatherDashCities', JSON.stringify(savedCities));
    }

    function updateSaveButtonState() {
        if (!currentLoadedLocation) return;

        if (isCitySaved(currentLoadedLocation.id)) {
            saveCityBtn.classList.add('saved');
        } else {
            saveCityBtn.classList.remove('saved');
        }
    }

    function renderSavedCities() {
        // Render in sidebar
        clearNode(savedCitiesList);
        // Render in modal
        clearNode(modalSavedCitiesList);

        if (savedCities.length === 0) {
            const msgSidebar = document.createElement('p');
            msgSidebar.textContent = "No saved cities yet.";
            msgSidebar.style.color = "var(--text-muted)";
            msgSidebar.style.fontSize = "1.2rem";
            savedCitiesList.appendChild(msgSidebar);

            const msgModal = document.createElement('p');
            msgModal.textContent = "No saved cities yet.";
            msgModal.style.color = "var(--text-muted)";
            msgModal.style.fontSize = "1.4rem";
            modalSavedCitiesList.appendChild(msgModal);
            return;
        }

        savedCities.forEach(city => {
            // Sidebar Item
            const sidebarItem = createCityDOMItem(city, false);
            savedCitiesList.appendChild(sidebarItem);

            // Modal Item
            const modalItem = createCityDOMItem(city, true);
            modalSavedCitiesList.appendChild(modalItem);
        });
    }

    function createCityDOMItem(city, forModal = false) {
        const item = document.createElement('div');
        item.className = 'saved-city-item';

        const infoGroup = document.createElement('div');
        infoGroup.className = 'city-info-group';
        infoGroup.addEventListener('click', () => {
            loadCityWeather(city);
            closeMobileMenu();
            if (forModal) closeModal();
        });

        const iconWrapper = document.createElement('div');
        iconWrapper.className = 'city-icon-wrapper';
        const mapIcon = document.createElement('span');
        mapIcon.className = 'material-symbols-outlined';
        mapIcon.textContent = 'location_on';

        iconWrapper.appendChild(mapIcon);

        const textWrapper = document.createElement('div');

        const nameP = document.createElement('p');
        nameP.className = 'city-item-name';
        nameP.textContent = city.name;

        const countryP = document.createElement('p');
        countryP.className = 'city-item-country';
        countryP.textContent = city.country;

        textWrapper.appendChild(nameP);
        textWrapper.appendChild(countryP);

        infoGroup.appendChild(iconWrapper);
        infoGroup.appendChild(textWrapper);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'remove-city-btn';
        deleteBtn.title = 'Remove city';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            removeCity(city.id);
        });

        const deleteIcon = document.createElement('span');
        deleteIcon.className = 'material-symbols-outlined';
        deleteIcon.textContent = 'delete';

        deleteBtn.appendChild(deleteIcon);

        item.appendChild(infoGroup);
        item.appendChild(deleteBtn);

        return item;
    }

    // --- Modal ---
    function openModal() {
        locationsModal.classList.remove('hidden');
    }

    function closeModal() {
        locationsModal.classList.add('hidden');
        modalCityInput.value = '';
        modalSuggestions.classList.add('hidden');
    }

    // --- Helpers ---

    function showLoading() {
        hideStateContainers();
        loadingContainer.classList.remove('hidden');
    }

    function showError(msg) {
        hideStateContainers();
        errorMessage.textContent = msg;
        errorContainer.classList.remove('hidden');
    }

    function hideStateContainers() {
        errorContainer.classList.add('hidden');
        loadingContainer.classList.add('hidden');
        heroSection.classList.add('hidden');
        hourlyForecastSection.classList.add('hidden');
        cityGallerySection.classList.add('hidden');
        radarMapSection.classList.add('hidden');
    }

    function clearNode(node) {
        while (node.firstChild) {
            node.removeChild(node.firstChild);
        }
    }

    // WMO Weather interpretation codes
    // 0: Clear sky
    // 1, 2, 3: Mainly clear, partly cloudy, and overcast
    // 45, 48: Fog and depositing rime fog
    // 51, 53, 55: Drizzle: Light, moderate, and dense intensity
    // 61, 63, 65: Rain: Slight, moderate and heavy intensity
    // 71, 73, 75: Snow fall: Slight, moderate, and heavy intensity
    // 95: Thunderstorm: Slight or moderate
    function getWeatherInfo(code, isDay) {
        let desc = 'Unknown';
        let icon = 'question_mark';
        let colorClass = 'icon-cloudy';

        if (code === 0) {
            desc = 'Clear sky';
            icon = isDay ? 'sunny' : 'clear_night';
            colorClass = isDay ? 'icon-sunny' : 'icon-night';
        } else if (code === 1) {
            desc = 'Mainly clear';
            icon = isDay ? 'sunny' : 'clear_night';
            colorClass = isDay ? 'icon-sunny' : 'icon-night';
        } else if (code === 2) {
            desc = 'Partly cloudy';
            icon = isDay ? 'partly_cloudy_day' : 'partly_cloudy_night';
            colorClass = 'icon-cloudy';
        } else if (code === 3) {
            desc = 'Overcast';
            icon = 'cloud';
            colorClass = 'icon-cloudy';
        } else if (code === 45 || code === 48) {
            desc = 'Fog';
            icon = 'foggy';
            colorClass = 'icon-cloudy';
        } else if (code >= 51 && code <= 55) {
            desc = 'Drizzle';
            icon = 'rainy';
            colorClass = 'icon-rain';
        } else if (code >= 61 && code <= 65) {
            desc = 'Rain';
            icon = 'rainy';
            colorClass = 'icon-rain';
        } else if (code >= 71 && code <= 75) {
            desc = 'Snow';
            icon = 'cloudy_snowing';
            colorClass = 'icon-snow';
        } else if (code >= 80 && code <= 82) {
            desc = 'Rain showers';
            icon = 'rainy';
            colorClass = 'icon-rain';
        } else if (code >= 85 && code <= 86) {
            desc = 'Snow showers';
            icon = 'cloudy_snowing';
            colorClass = 'icon-snow';
        } else if (code >= 95 && code <= 99) {
            desc = 'Thunderstorm';
            icon = 'thunderstorm';
            colorClass = 'icon-storm';
        }

        return { desc, icon, colorClass };
    }

    // Initialize!
    init();
});
