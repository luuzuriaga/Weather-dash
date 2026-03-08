# 🌤️ Clima Mundial - Global Weather Dashboard

A beautiful, modern, and highly responsive weather dashboard application built with vanilla web technologies. It provides real-time weather information and forecasts with a stunning premium "glassmorphism" design, exactly matching a professional layout mockup.

## ✨ Key Features

- **Real-time Weather Data**: Get current temperature, "feels like" temperature, humidity, and wind speed. Data is reliably sourced from [Open-Meteo](https://open-meteo.com/).
- **Detailed 24-Hour Forecasts**: View the upcoming 24-hour weather forecast for any searched city with a smooth horizontal scrolling carousel.
- **City Search & Autosuggest**: Quickly search for weather conditions across cities worldwide with real-time autosuggestions.
- **Save Favorite Locations**: Bookmark your favorite cities for quick and easy access later. Your saved cities persist in your browser's local storage.
- **Smart Saved City Indicators**: View the real-time temperature right next to your saved cities, complete with dynamic hot/cold/temperate emoji indicators (🔥, 🥶, 🌡️) that change automatically!
- **Interactive City Map**: A fully integrated Google Maps iframe to easily see the geographical location of the chosen city.
- **Live Temperature Map**: An integrated Windy.com interactive map overlay showing live temperature patterns circulating entirely around your selected region.
- **Automatic Geolocation**: Automatically predicts your city on the first visit so you don't have to search manually. 
- **Premium UI & Glassmorphism**: Features a sleek, single-page, fluid dark interface with frosted glass effects and smooth hover animations. No more split or cluttered screens!

## 🛠️ Technologies Used

- **HTML5**: Semantic structure and modern CSS Grid / Flexbox layout integration.
- **CSS3**: Vanilla CSS for styling, custom properties (variables), media queries, smooth animations, and backdrop-filter for premium glassmorphism.
- **JavaScript (Vanilla JS)**: For robust async DOM manipulation, local storage handling, API integration, and interactive UI logic.

### External APIs & Integrations
- [Open-Meteo Weather API](https://open-meteo.com/en/docs) for current weather and hourly forecasts.
- [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api) for city search.
- [GeoJS](https://www.geojs.io/) for IP-based default location tracking.
- [Google Maps Embed API](https://developers.google.com/maps/documentation/embed/get-started) for static interactive maps.
- [Windy.com Embed](https://www.windy.com/) for the real-time temperature map.

## 🚀 Getting Started

### Prerequisites

You don't need any complex build tools to run this application. A modern web browser is all that is required.

### Installation & Execution

1. **Clone the repository**:
   ```bash
   git clone https://github.com/luuzuriaga/Weather-dash
   ```
2. **Navigate to the project directory**:
   ```bash
   cd Weather-dash
   ```
3. **Run the application local server**:
   You can use any local server, for example, Python's built-in `http.server`:
   ```bash
   python3 -m http.server 8080
   ```
   Or using Node.js:
   ```bash
   npx serve .
   ```
4. **Open in Browser**:
   Navigate to `http://localhost:8080` (or `http://localhost:3000` with serve) in your preferred web browser.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page if you want to contribute.

## 📝 License

This project is open-source and available under the standard MIT License.
