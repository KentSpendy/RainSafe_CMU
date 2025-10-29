import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/api";

import ForecastPage from "./ForecastPage";
import HistoryPage from "./HistoryPage";
import DashboardPage from "./DashboardPage";
import Stations from "./Stations";

// React-Leaflet
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-velocity";

export default function Dashboard() {
  const navigate = useNavigate();
  const [currentWeather, setCurrentWeather] = useState(null);
  const [history, setHistory] = useState([]);
  const [forecast, setForecast] = useState([]);
  const [stations, setStations] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);

  const OPEN_WEATHER_KEY = "1b56ccacd6121ccb6234ef6f54ab267f";

  // Marker icon setup
  const markerIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  // Fetch all initial data once
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [weatherRes, historyRes, forecastRes, stationsRes] = await Promise.all([
          API.get("weather/fetch/"),
          API.get("weather/history/"),
          API.get("weather/forecast/"),
          API.get("weather/stations/"),
        ]);

        setCurrentWeather(weatherRes.data.data);
        setHistory(historyRes.data.data);
        setForecast(forecastRes.data.data);
        setStations(stationsRes.data);
      } catch (err) {
        console.error("Failed to load initial dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Logout
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Helper: weather icon
  const getWeatherIcon = (temp, humidity, rainChance) => {
    if (rainChance > 70) return "🌧️";
    if (rainChance > 40) return "☁️";
    if (temp > 30) return "☀️";
    return "🌤️";
  };

  const formatDate = (dateString) => {
    const opts = { weekday: "short", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, opts);
  };

  // Analytics for history page
  const getAnalytics = () => {
    if (!history.length) return null;

    const totalDays = history.length;
    const avgTemp = history.reduce((s, d) => s + d.avg_temp, 0) / totalDays;
    const avgHumidity = history.reduce((s, d) => s + d.avg_humidity, 0) / totalDays;
    const maxTemp = Math.max(...history.map((d) => d.max_temp));
    const minTemp = Math.min(...history.map((d) => d.min_temp));
    const forecastAvgRain =
      forecast.length > 0
        ? forecast.reduce((s, d) => s + d.rain_chance, 0) / forecast.length
        : 0;

    return {
      avgTemp: avgTemp.toFixed(1),
      avgHumidity: avgHumidity.toFixed(1),
      maxTemp: maxTemp.toFixed(1),
      minTemp: minTemp.toFixed(1),
      forecastAvgRain: forecastAvgRain.toFixed(0),
    };
  };

  // Toggle map fullscreen mode
  const toggleMapFullscreen = () => setIsMapFullscreen((prev) => !prev);

  // Wind animation layer
  function WindLayer() {
    const map = useMap();
    useEffect(() => {
      fetch("/wind.json")
        .then((res) => res.json())
        .then((data) => {
          L.velocityLayer({
            displayValues: true,
            data,
            maxVelocity: 15,
          }).addTo(map);
        })
        .catch(console.error);
    }, [map]);
    return null;
  }

  // Loading screen with glassmorphism
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen relative overflow-hidden">
        {/* Rain background */}
        <div className="fixed inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/rain-background.mp4" type="video/mp4" />
            <img
              src="/rain.gif"
              alt="Rain animation"
              className="w-full h-full object-cover"
            />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
        </div>

        {/* Loading content */}
        <div className="relative z-10 text-center animate-fadeIn bg-white/10 backdrop-blur-2xl rounded-3xl p-12 border border-white/20 shadow-2xl">
          <div className="text-6xl mb-4 animate-pulse">🌦️</div>
          <h2 className="text-2xl font-semibold text-white mb-2">
            Initializing RainSafe Dashboard
          </h2>
          <p className="text-white/80">Fetching real-time weather data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 🌧️ RAIN VIDEO BACKGROUND - Full Page */}
      <div className="fixed inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          poster="/rain-poster.jpg"
        >
          <source src="/rain-background.mp4" type="video/mp4" />
          {/* Fallback to GIF if video doesn't load */}
          <img
            src="/rain.gif"
            alt="Rain animation"
            className="w-full h-full object-cover"
          />
        </video>
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/40" />
      </div>

      

      {/* Content wrapper */}
      <div className="relative z-10">
        {/* Top Navigation - Glassmorphism */}
        <header className="bg-white/10 backdrop-blur-2xl shadow-lg border-b border-white/20 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">🌦️</div>
              <div>
                <h1 className="text-lg font-semibold text-white">RainSafe</h1>
                <p className="text-xs text-white/70">
                  Real-Time Weather Monitoring
                </p>
              </div>
            </div>

            {/* Tabs - Glassmorphism */}
            <nav className="hidden md:flex bg-white/10 backdrop-blur-xl rounded-xl p-1 border border-white/20">
              {["dashboard", "forecast", "stations"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    activeTab === tab
                      ? "bg-white/25 backdrop-blur-xl shadow-lg text-white border border-white/30"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>

            {/* User Info & Logout */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block text-right">
                <div className="text-sm font-medium text-white">
                  {localStorage.getItem("email")}
                </div>
                <div className="text-xs text-white/70">
                  {localStorage.getItem("role")}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="px-3 py-2 text-sm font-medium text-white bg-red-500/30 backdrop-blur-xl rounded-lg hover:bg-red-500/50 transition border border-red-400/30 shadow-lg"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Mobile Tab Menu */}
          <nav className="md:hidden flex justify-around bg-white/5 backdrop-blur-xl border-t border-white/10 px-4 py-2">
            {["dashboard", "forecast", "stations"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  activeTab === tab
                    ? "bg-white/20 backdrop-blur-xl text-white border border-white/30"
                    : "text-white/70 hover:text-white"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </header>

        {/* Page Body */}
        <main className="max-w-7xl mx-auto">
          {activeTab === "dashboard" && (
            <DashboardPage
              currentWeather={currentWeather}
              history={history}
              stations={stations}
              isMapFullscreen={isMapFullscreen}
              toggleMapFullscreen={toggleMapFullscreen}
              getWeatherIcon={getWeatherIcon}
              OPEN_WEATHER_KEY={OPEN_WEATHER_KEY}
              markerIcon={markerIcon}
              WindLayer={WindLayer}
            />
          )}
          {/* {activeTab === "history" && (
            <HistoryPage history={history} analytics={getAnalytics()} />
          )} */}
          {activeTab === "forecast" && (
            <ForecastPage
              forecast={forecast}
              getWeatherIcon={getWeatherIcon}
              formatDate={formatDate}
            />
          )}
          {activeTab === "stations" && <Stations />}
        </main>
      </div>
    </div>
  );
}