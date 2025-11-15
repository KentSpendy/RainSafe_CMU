import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowRight } from "react-icons/fa";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  LayersControl,
  useMapEvents,
} from "react-leaflet";
import api from "../../api/api";
import UserNavbar from "../../components/UserNavbar";
import weatherImg from "../../assets/weather.jpg";
import sunnyImg from "../../assets/sunny.jpg";
import L from "leaflet";

function UserDashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    reportCount: 0,
    unreadCount: 0,
  });
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentWeather, setCurrentWeather] = useState(null);
  const [clickedWeather, setClickedWeather] = useState(null);
  const [loadingClick, setLoadingClick] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const navigate = useNavigate();
  const mapRef = useRef(null);

  const OPEN_WEATHER_KEY = "1b56ccacd6121ccb6234ef6f54ab267f";

  // Marker icon setup
  const markerIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  useEffect(() => {
    loadDashboardData();
    loadWeatherData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const [userRes, reportsRes, notificationsRes] = await Promise.all([
        api.get("/users/me/"),
        api.get("/reports/my-reports/"),
        api.get("/notifications/"),
      ]);

      setUser(userRes.data);
      setRecentReports(reportsRes.data.slice(0, 5));

      const unreadCount = notificationsRes.data.filter((n) => !n.is_read).length;

      setStats({
        reportCount: reportsRes.data.length,
        unreadCount: unreadCount,
      });
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadWeatherData = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/weather/live/?lat=7.859&lon=125.0485`
      );
      const data = await response.json();
      if (response.ok) {
        setCurrentWeather(data);
      }
    } catch (error) {
      console.error("Error loading weather:", error);
    }
  };

  const handleMapClick = async (e) => {
    const { lat, lng } = e.latlng;
    setLoadingClick(true);
    setClickedWeather(null);

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/weather/live/?lat=${lat}&lon=${lng}`
      );
      const data = await res.json();
      if (res.ok) {
        setClickedWeather({ ...data, latitude: lat, longitude: lng });
      }
    } catch (error) {
      console.error("Failed to fetch live weather data:", error);
    } finally {
      setLoadingClick(false);
    }
  };

  const getWeatherIcon = (temp, humidity, rainChance) => {
    if (rainChance > 60) return "🌧️";
    if (temp > 30) return "☀️";
    if (humidity > 80) return "💧";
    return "⛅";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-blue-950 to-blue-800">
        <motion.div
          className="animate-spin rounded-full h-16 w-16 border-b-4 border-white"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <UserNavbar unreadNotifications={stats.unreadCount} />

      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0">
        <img
          src={
            currentWeather
              ? currentWeather.precipitation_probability > 60 ||
                currentWeather.humidity > 80
                ? weatherImg
                : sunnyImg
              : weatherImg
          }
          alt="Weather background"
          className="w-full h-full object-cover transition-all duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
      </div>

      {/* Floating Particles */}
      <div className="fixed inset-0 z-0 opacity-30">
        {[...Array(20)].map((_, i) => (
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

      {/* Main Content */}
      <div className="relative z-10 min-h-screen p-8 max-w-[2000px] mx-auto">
        {/* Welcome Section */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, {user?.first_name || "User"}! 👋
          </h1>
          <p className="text-white/70 text-lg">
            Last login:{" "}
            {user?.last_login
              ? new Date(user.last_login).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "N/A"}
          </p>
        </motion.div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - Weather Details */}
          <div className="xl:col-span-1 space-y-6">
            {/* Current Weather Hero */}
            <motion.div
              className="bg-white/10 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 shadow-2xl relative overflow-hidden"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="absolute right-0 top-20 text-8xl opacity-20">
                {currentWeather
                  ? getWeatherIcon(
                      currentWeather.temperature,
                      currentWeather.humidity,
                      currentWeather.precipitation_probability
                    )
                  : "🌤️"}
              </div>

              <div className="relative z-10">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-white/80 mb-1">
                    Central Mindanao University
                  </h2>
                  <p className="text-white/60 text-sm">
                    {currentWeather ? "Live Weather Station" : "Connecting..."}
                  </p>
                </div>

                <div className="mb-8">
                  <div className="text-7xl font-light text-white mb-2">
                    {currentWeather ? `${currentWeather.temperature}` : "--"}
                    <span className="text-4xl text-white/70">°C</span>
                  </div>
                  <div className="text-white/70">
                    Feels like{" "}
                    {currentWeather
                      ? `${currentWeather.feels_like ?? currentWeather.temperature}°C`
                      : "--"}
                  </div>

                  {currentWeather && (
                    <div className="text-sm text-white/60 mt-2">
                      {(() => {
                        const temp = Number(currentWeather.temperature ?? 0);
                        const rainProb = Number(currentWeather.precipitation_probability ?? 0);
                        const humidity = Number(currentWeather.humidity ?? 0);

                        if (rainProb >= 70 && humidity >= 70) {
                          return <>It's humid and likely to rain, better bring an umbrella ☔</>;
                        } else if (rainProb >= 70) {
                          return <>Rain is very likely today, don't forget your raincoat ☔</>;
                        } else if (rainProb >= 40 && humidity >= 60) {
                          return <>There's a chance of light rain 🌦️</>;
                        }

                        if (temp >= 30) {
                          return <>It's extremely hot today, stay hydrated ☀️</>;
                        } else if (temp >= 28) {
                          return <>Today's weather is quite warm 😎</>;
                        } else if (temp >= 25) {
                          return <>It's mildly hot today, perfect for activities ☀️</>;
                        }

                        if (temp <= 15) {
                          return <>It's really cold today, layer up ❄️</>;
                        } else if (temp <= 20) {
                          return <>Today's weather is chilly 🧥</>;
                        } else if (temp <= 23) {
                          return <>It's slightly cool outside 🌤️</>;
                        }

                        return <>Weather seems nice and pleasant today! 🌤️</>;
                      })()}
                    </div>
                  )}
                </div>

                {currentWeather && (
                  <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                    <p className="text-white/90 text-sm leading-relaxed">
                      Today in <span className="font-semibold">Central Mindanao University</span>, 
                      we're experiencing{" "}
                      <span className="font-medium text-sky-200">
                        {currentWeather.temperature >= 30
                          ? currentWeather.precipitation_probability > 60
                            ? "rainy"
                            : "sunny"
                          : "warm"}
                      </span>{" "}
                      weather with a temperature of{" "}
                      <span className="font-medium text-sky-200">
                        {currentWeather.temperature}°C
                      </span>
                      , humidity at{" "}
                      <span className="font-medium text-sky-200">
                        {currentWeather.humidity}%
                      </span>
                      , and wind speeds around{" "}
                      <span className="font-medium text-sky-200">
                        {currentWeather.wind_speed} km/h
                      </span>.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
              className="grid grid-cols-2 gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <GlassStatCard
                icon="💧"
                label="Humidity"
                value={currentWeather ? `${currentWeather.humidity}%` : "--"}
                trend="normal"
              />
              <GlassStatCard
                icon="💨"
                label="Wind"
                value={currentWeather ? `${currentWeather.wind_speed} km/h` : "--"}
                trend="up"
              />
              <GlassStatCard
                icon="📝"
                label="My Reports"
                value={stats.reportCount}
                trend="normal"
                onClick={() => navigate("/user/my-reports")}
              />
              <GlassStatCard
                icon="🔔"
                label="Notifications"
                value={stats.unreadCount}
                trend={stats.unreadCount > 0 ? "up" : "normal"}
                onClick={() => navigate("/notifications")}
                highlight={stats.unreadCount > 0}
              />
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              className="bg-white/10 backdrop-blur-2xl rounded-3xl p-6 border border-white/20 shadow-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-3">
                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate("/report")}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 font-medium shadow-lg flex items-center justify-center gap-2"
                >
                  <span>⚡</span>
                  Submit New Report
                </button>
                <button
                  onClick={() => navigate("/forecast")}
                  className="w-full bg-white/20 text-white px-6 py-3 rounded-xl hover:bg-white/30 transition-all duration-300 font-medium flex items-center justify-center gap-2 border border-white/30"
                >
                  <span>🔮</span>
                  View 7-Day Forecast
                </button>
              </div>
            </motion.div>
          </div>

          {/* Center & Right Columns - Map and Reports */}
          <div className="xl:col-span-2 space-y-6">
            {/* Map Container */}
            <motion.div
              className="bg-white/10 backdrop-blur-2xl rounded-3xl overflow-hidden border border-white/20 shadow-2xl relative"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="p-6 border-b border-white/20 bg-gradient-to-r from-white/5 to-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <h3 className="text-xl font-bold text-white">Live Weather Map</h3>
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-400/30">
                    Real-time
                  </span>
                </div>
                <p className="text-white/60 text-sm">
                  Click anywhere on the map to get detailed weather information
                </p>
              </div>

              {loadingClick && (
                <div className="absolute z-[999] top-24 right-6 bg-white/20 backdrop-blur-xl shadow-lg rounded-xl px-4 py-3 text-sm text-white border border-white/30 animate-pulse flex items-center gap-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  Loading weather data...
                </div>
              )}

              <div className="h-[500px] relative">
                <MapContainer
                  center={[7.859, 125.0485]}
                  zoom={13}
                  whenCreated={(mapInstance) => {
                    mapRef.current = mapInstance;
                    setMapReady(true);
                  }}
                  className="w-full h-full z-[0]"
                >
                  <LayersControl position="topright">
                    <LayersControl.BaseLayer checked name="Standard Map">
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; OpenStreetMap'
                      />
                    </LayersControl.BaseLayer>
                    <LayersControl.BaseLayer name="🌊 Satellite">
                      <TileLayer
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        attribution="Tiles &copy; Esri"
                      />
                    </LayersControl.BaseLayer>

                    <LayersControl.Overlay checked name="🌧️ Rainfall">
                      <TileLayer
                        url={`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${OPEN_WEATHER_KEY}`}
                      />
                    </LayersControl.Overlay>
                    <LayersControl.Overlay name="💨 Wind">
                      <TileLayer
                        url={`https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${OPEN_WEATHER_KEY}`}
                      />
                    </LayersControl.Overlay>
                    <LayersControl.Overlay name="🌡️ Temperature">
                      <TileLayer
                        url={`https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${OPEN_WEATHER_KEY}`}
                      />
                    </LayersControl.Overlay>
                  </LayersControl>

                  <MapClickHandler onMapClick={handleMapClick} />

                  <Marker position={[7.859, 125.0485]} icon={markerIcon}>
                    <Popup>
                      <div className="min-w-[200px]">
                        <div className="font-bold text-blue-700 text-lg mb-2 border-b pb-2">
                          🏫 CMU Campus
                        </div>
                        {currentWeather ? (
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>🌡 Temperature:</span>
                              <span className="font-semibold">{currentWeather.temperature}°C</span>
                            </div>
                            <div className="flex justify-between">
                              <span>💧 Humidity:</span>
                              <span className="font-semibold">{currentWeather.humidity}%</span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-gray-500 text-center py-2">Loading...</div>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>

                <AnimatePresence>
                  {clickedWeather && (
                    <motion.div
                      initial={{ x: "100%", opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: "100%", opacity: 0 }}
                      transition={{ type: "spring", stiffness: 100, damping: 20 }}
                      className="absolute top-6 right-6 w-80 bg-white/10 backdrop-blur-3xl rounded-2xl border border-white/20 shadow-2xl z-[10000] overflow-hidden"
                    >
                      <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-4 border-b border-white/20">
                        <div className="flex justify-between items-center">
                          <h3 className="font-bold text-white text-lg">Location Details</h3>
                          <button
                            onClick={() => setClickedWeather(null)}
                            className="text-white/70 hover:text-white transition-all hover:scale-110 w-6 h-6 flex items-center justify-center rounded-full bg-white/10"
                          >
                            ✖
                          </button>
                        </div>
                      </div>

                      <div className="p-6 text-center border-b border-white/10">
                        <div className="text-6xl mb-3">
                          {clickedWeather.temperature > 30 ? "☀️" : clickedWeather.precipitation_probability > 50 ? "🌧️" : "⛅"}
                        </div>
                        <h4 className="text-3xl font-bold text-white mb-1">
                          {clickedWeather.temperature.toFixed(1)}°C
                        </h4>
                        <p className="text-white/60 text-sm">
                          {new Date(clickedWeather.time).toLocaleString()}
                        </p>
                      </div>

                      <div className="p-4 space-y-3">
                        <DetailItem icon="💧" label="Humidity" value={`${clickedWeather.humidity}%`} />
                        <DetailItem icon="💨" label="Wind Speed" value={`${clickedWeather.wind_speed} m/s`} />
                        <DetailItem icon="🌧️" label="Precipitation" value={`${clickedWeather.precipitation_probability}%`} />
                        <DetailItem icon="📍" label="Coordinates" value={`${clickedWeather.latitude.toFixed(4)}, ${clickedWeather.longitude.toFixed(4)}`} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Recent Reports */}
            <motion.div
              className="bg-white/10 backdrop-blur-2xl rounded-3xl p-6 border border-white/20 shadow-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  Recent Reports
                </h3>
                <Link
                  to="/user/my-reports"
                  className="px-4 py-2 bg-white/20 backdrop-blur-xl text-white rounded-xl hover:bg-white/30 transition-all duration-300 border border-white/30 font-medium text-sm flex items-center gap-2"
                >
                  View All <FaArrowRight className="text-xs" />
                </Link>
              </div>

              {recentReports.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">📝</div>
                  <p className="text-white/70 text-lg mb-6">No reports submitted yet</p>
                  <Link
                    to="/report"
                    className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 font-medium shadow-lg"
                  >
                    Submit Your First Report
                  </Link>
                </div>
              ) : (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {recentReports.map((report, index) => (
                    <motion.div
                      key={report.id}
                      className="bg-white/10 backdrop-blur-xl rounded-2xl p-5 border border-white/20 hover:bg-white/15 transition-all duration-300 cursor-pointer group"
                      onClick={() => navigate(`/user/reports/${report.id}`)}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, x: 5 }}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="text-white font-bold text-lg mb-1 group-hover:text-cyan-300 transition-colors">
                            {report.name}
                          </h4>
                          <p className="text-white/70 text-sm line-clamp-2">
                            {report.description}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ml-4 ${
                            report.status === "Pending"
                              ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                              : report.status === "In Progress"
                              ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                              : "bg-green-500/20 text-green-300 border-green-500/30"
                          }`}
                        >
                          {report.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-white/60">
                        <span className="flex items-center gap-1">
                          📅{" "}
                          {new Date(report.date_created).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <span className="flex items-center gap-1 text-cyan-300 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                          View Details <FaArrowRight />
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function GlassStatCard({ icon, label, value, trend, onClick, highlight }) {
  const trendIcons = {
    up: "↗️",
    down: "↘️",
    normal: "→"
  };

  return (
    <motion.div
      className={`bg-white/10 backdrop-blur-2xl rounded-2xl p-4 border shadow-xl transition-all duration-300 group ${
        onClick ? "cursor-pointer" : ""
      } ${
        highlight
          ? "border-cyan-400/50 hover:border-cyan-400"
          : "border-white/20 hover:border-white/30"
      }`}
      onClick={onClick}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={onClick ? { scale: 0.95 } : {}}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl opacity-80 group-hover:scale-110 transition-transform">{icon}</span>
        <span className="text-sm text-white/60">{trendIcons[trend]}</span>
      </div>
      <div className="text-xs text-white/70 mb-1">{label}</div>
      <div className="text-xl font-bold text-white">{value}</div>
    </motion.div>
  );
}

function DetailItem({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between bg-white/10 backdrop-blur-xl rounded-xl px-3 py-2 border border-white/20">
      <span className="flex items-center gap-2 text-sm text-white/80">
        <span className="text-base">{icon}</span> {label}
      </span>
      <span className="font-bold text-sm text-white">{value}</span>
    </div>
  );
}

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => onMapClick(e),
  });
  return null;
}

export default UserDashboard;