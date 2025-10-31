import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/api";
import { motion, AnimatePresence } from "framer-motion";

import { Bell, Siren } from "lucide-react";
import axios from "axios";

import ForecastPage from "./ForecastPage";
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

  const [loading, setLoading] = useState(() => {
    const hasSeen = localStorage.getItem("hasSeenLoading");
    return !hasSeen; // if not seen before, show loading
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const OPEN_WEATHER_KEY = "1b56ccacd6121ccb6234ef6f54ab267f";

  // Marker icon setup
  const markerIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });


  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("access");
    let previousCount = 0;

    const fetchNotifications = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/api/notifications/all/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const unread = res.data.filter((n) => !n.is_read);
        setUnreadCount(unread.length);

        // ✅ Popup if new notification appears
        if (unread.length > previousCount) {
          const latest = unread[0];
          toast((t) => (
            <div
              onClick={() => {
                navigate("/notifications");
                toast.dismiss(t.id);
              }}
              className="cursor-pointer"
            >
              🔔 <strong>{latest?.title || "New Notification"}</strong>
              <div>{latest?.message || "You have a new update!"}</div>
            </div>
          ), {
            duration: 4000,
            style: {
              borderRadius: "12px",
              background: "#1f2937",
              color: "#fff",
              boxShadow: "0px 4px 12px rgba(0,0,0,0.2)",
            },
          });
        }

        previousCount = unread.length;
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // check every 10s
    return () => clearInterval(interval);
  }, [navigate]);


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
        // Para kaisa ra mo render ang loading screen
        localStorage.setItem("hasSeenLoading", "true");
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
    if (humidity > 80) return "🌥️";
    if (temp > 30) return "☀️";
    return "🌤️";
  };

  const formatDate = (dateString) => {
    const opts = { weekday: "short", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, opts);
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

  // Loading screen
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-grey-900 to-blue-900 relative overflow-hidden"
      >
        {/* Animated background elements */}
        <div className="fixed inset-0 z-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-r from-cyan-500/10 to-slate-500/10 rounded-full blur-3xl" />
        </div>

        {/* Floating particles */}
        <div className="fixed inset-0 z-0 opacity-30">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                duration: 3 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Loading content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 text-center bg-white/10 backdrop-blur-2xl rounded-3xl p-12 border border-white/20 shadow-2xl max-w-md mx-4"
        >
          <motion.div
            className="text-8xl mb-6"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            🌦️
          </motion.div>
          <h2 className="text-4xl font-bold text-white mb-4">RainSafe</h2>
          <p className="text-white/80 mb-6 text-lg">Initializing weather monitoring system...</p>
          <div className="flex justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-3 h-3 bg-white/60 rounded-full"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen from-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full blur-3xl" />
      </div>

      {/* Floating Particles */}
      <div className="fixed inset-0 z-0 opacity-20">
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              y: [0, -40, 0],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 4 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      {/* Content wrapper */}
      <div className="relative z-10">
        {/* Glassmorphism Navigation */}
        <motion.header
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="bg-white/5 backdrop-blur-3xl shadow-2xl border-b border-white/10 sticky top-0 z-50"
        >
          <div className="max-w-[2000px] mx-auto px-6">
            <div className="flex justify-between items-center h-20">
              {/* Logo & Brand */}
              <motion.div 
                className="flex items-center space-x-4"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center gap-3">
                  <div className="text-5xl text-yellow-300 drop-shadow-[0_0_6px_rgba(255,255,150,0.4)]">🌦️</div>
                  <div>
                    <h1 className="text-4xl font-extrabold text-white tracking-wide">
                      RainSafe
                    </h1>
                    <p className="text-xs text-sky-200/70 font-medium">
                      Friendly Weather Forecast
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Desktop Navigation Tabs */}
              <nav className="hidden lg:flex items-center gap-1 bg-white/10 backdrop-blur-2xl rounded-2xl p-1.5 border border-white/20 shadow-xl">
                {[
                  { id: "dashboard", label: "Dashboard", icon: "", color: "from-cyan-500 to-blue-500" },
                  { id: "forecast", label: "Forecast", icon: "", color: "from-purple-500 to-pink-500" },
                  { id: "stations", label: "Stations", icon: "", color: "from-green-500 to-cyan-500" }
                ].map((tab) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-8 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 flex items-center gap-3 relative overflow-hidden ${
                      activeTab === tab.id
                        ? `text-white shadow-2xl bg-gradient-to-r ${tab.color}`
                        : "text-white/70 hover:text-white hover:bg-white/10"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    <span>{tab.label}</span>
                    {activeTab === tab.id && (
                      <motion.div
                        className="absolute inset-0 bg-white/20"
                        layoutId="activeTab"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </motion.button>
                ))}
              </nav>

              {/* User Info & Actions */}
              <div className="flex items-center gap-4">
                {/* 🔔 Notification Bell */}
                <div
                  onClick={() => navigate("/notifications")}
                  className="relative cursor-pointer hover:scale-110 transition"
                >
                  <Bell className="text-white w-6 h-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </div>

                {/* 🔔 Report Siren */}
                <div
                  onClick={() => navigate("/admin/reports")}
                  className="relative cursor-pointer hover:scale-110 transition"
                >
                  <Siren className="text-white w-6 h-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </div>

                {/* 👤 User Badge */}
                <motion.div 
                  className="hidden xl:flex items-center gap-3 bg-white/10 backdrop-blur-2xl rounded-2xl px-4 py-2 border border-white/20 cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {localStorage.getItem("email")?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-white">
                      {localStorage.getItem("email")?.split('@')[0] || "User"}
                    </div>
                    <div className="text-xs text-white/60 capitalize font-medium">
                      {localStorage.getItem("role") || "Member"}
                    </div>
                  </div>
                </motion.div>

                {/* 🚪 Logout Button */}
                <motion.button
                  onClick={handleLogout}
                  className="px-5 py-3 text-sm font-semibold text-white bg-red-500/20 backdrop-blur-2xl rounded-2xl hover:bg-red-500/30 transition-all duration-300 border border-red-400/30 shadow-xl flex items-center gap-2 group"
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(239, 68, 68, 0.3)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-lg group-hover:scale-110 transition-transform">🚪</span>
                  <span className="hidden sm:inline">Sign Out</span>
                </motion.button>

                {/* 📱 Mobile Menu */}
                <motion.button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden p-3 text-white bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20 hover:bg-white/20 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {mobileMenuOpen ? "✖" : "☰"}
                </motion.button>
              </div>
            </div>

            {/* Mobile Navigation Menu */}
            <AnimatePresence>
              {mobileMenuOpen && (
                <motion.nav
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="lg:hidden overflow-hidden bg-white/5 backdrop-blur-2xl rounded-2xl mt-4 border border-white/20"
                >
                  <div className="py-4 space-y-2 px-4">
                    {[
                      { id: "dashboard", label: "Dashboard", icon: "📊", color: "from-cyan-500 to-blue-500" },
                      { id: "forecast", label: "Forecast", icon: "🔮", color: "from-purple-500 to-pink-500" },
                      { id: "stations", label: "Stations", icon: "🛰️", color: "from-green-500 to-cyan-500" }
                    ].map((tab) => (
                      <motion.button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full px-4 py-4 rounded-xl text-left font-semibold transition-all flex items-center gap-4 ${
                          activeTab === tab.id
                            ? `text-white bg-gradient-to-r ${tab.color} shadow-xl`
                            : "text-white/70 hover:bg-white/10 hover:text-white"
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span className="text-2xl">{tab.icon}</span>
                        <span className="text-lg">{tab.label}</span>
                      </motion.button>
                    ))}
                    
                    {/* Mobile User Info */}
                    <div className="mt-6 pt-4 border-t border-white/10">
                      <div className="flex items-center gap-4 p-3 bg-white/5 rounded-xl">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                          {localStorage.getItem("email")?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div className="flex-1">
                          <div className="text-base font-bold text-white">
                            {localStorage.getItem("email")?.split('@')[0] || "User"}
                          </div>
                          <div className="text-sm text-white/60 capitalize">
                            {localStorage.getItem("role") || "Member"}
                          </div>
                          <div className="text-xs text-white/40 mt-1">
                            {localStorage.getItem("email")}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Mobile Weather Status */}
                    {currentWeather && (
                      <div className="mt-4 p-4 bg-white/10 rounded-xl border border-white/20">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="text-3xl">
                              {getWeatherIcon(
                                currentWeather.temperature,
                                currentWeather.humidity,
                                currentWeather.precipitation_probability
                              )}
                            </div>
                            <div>
                              <div className="text-lg font-bold text-white">
                                {currentWeather.temperature}°C
                              </div>
                              <div className="text-sm text-white/60 capitalize">
                                {currentWeather.description}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.nav>
              )}
            </AnimatePresence>
          </div>
        </motion.header>

        {/* Page Body with Enhanced Transitions */}
        <main className="max-w-[2000px] mx-auto px-6 py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.98 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
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
              {activeTab === "forecast" && (
                <ForecastPage
                  forecast={forecast}
                  getWeatherIcon={getWeatherIcon}
                  formatDate={formatDate}
                />
              )}
              {activeTab === "stations" && <Stations />}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Enhanced Footer */}
        <motion.footer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16 py-8 border-t border-white/10 bg-white/5 backdrop-blur-2xl"
        >
          <div className="max-w-[2000px] mx-auto px-6">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
              {/* Brand Section */}
              <motion.div 
                className="flex items-center space-x-4"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center gap-3">
                  <div className="text-5xl text-yellow-300 drop-shadow-[0_0_6px_rgba(255,255,150,0.4)]">🌦️</div>
                  <div>
                    <h1 className="text-4xl font-extrabold text-white tracking-wide">
                      RainSafe
                    </h1>
                    <p className="text-xs text-sky-200/70 font-medium">
                      Friendly Weather Forecast
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Info Section */}
              <div className="flex flex-col sm:flex-row items-center gap-6 text-white/60 text-sm">
                <div className="flex items-center gap-2 bg-white/5 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/10">
                  <span className="text-cyan-300">📍</span>
                  <span>Central Mindanao University</span>
                </div>
                <div className="flex items-center gap-2 bg-white/5 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/10">
                  <span className="text-purple-300">🌎</span>
                  <span>Northern Mindanao</span>
                </div>
              </div>

              {/* Copyright */}
              <div className="text-white/40 text-sm text-center lg:text-right">
                <div>© 2025 RainSafe</div>
                <div className="text-xs mt-1">Friendly Weather Forecast</div>
              </div>
            </div>
          </div>
        </motion.footer>
      </div>
    </div>
  );
}