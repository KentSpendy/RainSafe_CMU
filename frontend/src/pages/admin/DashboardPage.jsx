import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  LayersControl,
  useMapEvents,
} from "react-leaflet";
import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import dayjs from "dayjs";

export default function DashboardPage({
  currentWeather,
  history,
  stations,
  isMapFullscreen,
  getWeatherIcon,
  OPEN_WEATHER_KEY,
  markerIcon,
  WindLayer,
}) {
  const mapRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);
  const [clickedWeather, setClickedWeather] = useState(null);
  const [loadingClick, setLoadingClick] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("history");

  const goToStation = (lat, lng, zoom = 17) => {
    // ensure numbers
    const latitude = Number(lat);
    const longitude = Number(lng);

    console.log("goToStation called with:", { latitude, longitude, zoom, mapRef: mapRef.current });

    if (!isFinite(latitude) || !isFinite(longitude)) {
      console.warn("Invalid coordinates, cannot move map:", lat, lng);
      return;
    }

    if (mapRef && mapRef.current) {
      // prefer flyTo for smooth animation, but fallback to setView
      try {
        if (typeof mapRef.current.flyTo === "function") {
          mapRef.current.flyTo([latitude, longitude], zoom, { animate: true, duration: 1.2 });
        } else if (typeof mapRef.current.setView === "function") {
          mapRef.current.setView([latitude, longitude], zoom);
        } else {
          console.warn("mapRef.current doesn't expose flyTo/setView:", mapRef.current);
        }
      } catch (err) {
        console.error("Error while moving map:", err);
      }
    } else {
      console.warn("Map not ready yet (mapRef.current is null).");
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
      } else {
        console.error("Error fetching live weather:", data);
      }
    } catch (error) {
      console.error("Failed to fetch live weather data:", error);
    } finally {
      setLoadingClick(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* CONDITIONAL WEATHER BACKGROUND */}
      <div className="fixed inset-0 z-0">
        <img
          src={
            currentWeather
              ? (currentWeather.precipitation_probability > 60 ||
                currentWeather.humidity > 80
                ? "./src/assets/weather.jpg"   // Rainy background
                : "./src/assets/sunny.jpg")    // Sunny background
              : "./src/assets/weather.jpg"       // Default background
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

      {/* Main Layout */}
      <div className="relative z-10 min-h-screen p-8 max-w-[2000px] mx-auto">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Left Column - Weather Cards */}
          <div className="xl:col-span-1 space-y-6">
            {/* Current Weather Hero */}
            <motion.div
              className="bg-white/10 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 shadow-2xl relative overflow-hidden"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              {/* Background Weather Icon */}
              <div className="absolute right-0 top-20 text-8xl opacity-20">
                {currentWeather
                  ? getWeatherIcon(
                    currentWeather.temperature,
                    currentWeather.humidity,
                    currentWeather.precipitation_probability
                  )
                  : "🌤️"}
              </div>

              {/* Location Name */}
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-white/80 mb-1">
                      Central Mindanao University
                    </h2>
                    <p className="text-white/60 text-sm">
                      {currentWeather ? "Live Weather Station" : "Connecting..."}
                    </p>
                  </div>
                  <div className="text-2xl opacity-70">
                    <button
                      onClick={() => setSidebarOpen(!sidebarOpen)}
                      className=" text-sm top-20 left-5 z-[2200] bg-white/20 backdrop-blur-xl hover:bg-white/30 text-white px-4 py-2 rounded-full shadow-lg border border-white/30 transition"
                    >
                      History
                    </button>
                  </div>
                </div>

                {/* Main Temperature Display */}
                <div className="flex items-end justify-between mb-8">
                  <div>
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

                    {/* Weather condition message ubos sa main temperature card*/}
                    {currentWeather && (
                      <div className="text-sm text-white/60 mt-2">
                        {(() => {
                          const temp = Number(currentWeather.temperature ?? 0);
                          const rainProb = Number(currentWeather.precipitation_probability ?? 0);
                          const humidity = Number(currentWeather.humidity ?? 0);

                          //  RAINY CONDITIONS FIRST
                          if (rainProb >= 70 && humidity >= 70) {
                            return <>It's humid and likely to rain, better bring an umbrella ☔</>;
                          } else if (rainProb >= 70) {
                            return <>Rain is very likely today, don't forget your raincoat ☔</>;
                          } else if (rainProb >= 40 && humidity >= 60) {
                            return <>There's a chance of light rain with some humidity, an umbrella might come in handy 🌦️</>;
                          }

                          //  HOT CONDITIONS
                          if (temp >= 30) {
                            return <>It's extremely hot today, stay hydrated and avoid too much sun ☀️</>;
                          } else if (temp >= 28) {
                            return <>Today's weather is quite warm, wear light clothes and stay cool 😎</>;
                          } else if (temp >= 25) {
                            return <>It's mildly hot today, perfect for outdoor activities ☀️</>;
                          }

                          //  COLD CONDITIONS
                          if (temp <= 15) {
                            return <>It's really cold today, make sure to layer up ❄️</>;
                          } else if (temp <= 20) {
                            return <>Today's weather is chilly, a jacket should keep you comfortable 🧥</>;
                          } else if (temp <= 23) {
                            return <>It's slightly cool outside, you might want a light sweater 🌤️</>;
                          }

                          //  HUMID / WINDY CONDITIONS
                          if (humidity >= 80 && rainProb >= 60) {
                            return <>It's a bit humid and windy today, take care of your hair 💨</>;
                          }

                          // DEFAULT (PLEASANT) WEATHER
                          return <>Weather seems nice and pleasant today! 🌤️</>;
                        })()}
                      </div>
                    )}
                  </div>
                </div>

                {/* Weather summary ubos sa temperature data sa main card */}
                {currentWeather && (
                  <div className="text-white/80 text-sm capitalize bg-white/5 rounded-xl p-3 border border-white/10">
                    <p className="text-white/90 mb-6 leading-relaxed">
                      {currentWeather ? (
                        <>
                          Today in{" "}
                          <span className="font-semibold">
                            Central Mindanao University
                          </span>
                          , we're experiencing{" "}
                          <span className="font-medium text-sky-200">
                            {currentWeather
                              ? currentWeather.temperature >= 30
                                ? currentWeather.precipitation_probability > 60
                                  ? "rainy"
                                  : "sunny"
                                : "warm"
                              : "pleasant"}
                          </span>{" "}
                          with a temperature of{" "}
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
                          </span>
                          . The chance of rain stands at{" "}
                          <span className="font-medium text-sky-200">
                            {currentWeather.precipitation_probability ?? "--"}%.
                          </span>
                        </>
                      ) : (
                        "Loading current weather information..."
                      )}
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
                icon="🌧"
                label="Rain Chance"
                value={currentWeather?.precipitation_probability != null ? `${currentWeather.precipitation_probability}%` : "--"}
                trend="down"
              />
              <GlassStatCard
                icon="🛰️"
                label="Stations"
                value={stations?.length ?? 0}
                trend="normal"
              />
            </motion.div>

            {/* Quick Forecast */}
            <motion.div
              className="bg-white/10 backdrop-blur-2xl rounded-3xl p-6 border border-white/20 shadow-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-3">
                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                7-Day Summary
              </h3>
              {history.length > 0 ? (
                <div className="space-y-3">
                  <ForecastItem
                    period="Average"
                    temp={(history.reduce((s, d) => s + d.avg_temp, 0) / history.length).toFixed(1)}
                    high={Math.max(...history.map((d) => d.max_temp)).toFixed(1)}
                    low={Math.min(...history.map((d) => d.min_temp)).toFixed(1)}
                  />
                </div>
              ) : (
                <div className="text-white/60 text-sm text-center py-4">
                  Loading historical data...
                </div>
              )}
            </motion.div>
          </div>

          {/* Center Column - Map */}
          <div className="xl:col-span-2 space-y-6">
            {/* Map Container */}
            <motion.div
              className="bg-white/10 backdrop-blur-2xl rounded-3xl overflow-hidden border border-white/20 shadow-2xl relative"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              {/* Enhanced Map Header */}
              <div className="p-6 border-b border-white/20 bg-gradient-to-r from-white/5 to-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex-1">
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

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="flex-1 sm:flex-none min-w-[200px]">
                    <StationSelector
                      stations={stations}
                      onJumpTo={(lat, lng, zoom = 17) => {
                        if (mapReady && mapRef.current) {
                          console.log("📍 Jumping to:", lat, lng);
                          mapRef.current.setView([lat, lng], zoom, { animate: true });
                        } else {
                          console.warn("⚠️ Map not ready yet. Retrying in 500ms...");
                          setTimeout(() => {
                            if (mapRef.current) {
                              mapRef.current.setView([lat, lng], zoom, { animate: true });
                            }
                          }, 500);
                        }
                      }}
                    />
                  </div>
                  {/* Uncomment if needed
                    <button
                      onClick={toggleMapFullscreen}
                      className="px-4 py-2.5 bg-white/20 backdrop-blur-xl text-white rounded-xl shadow-lg hover:bg-white/30 transition-all duration-300 border border-white/30 font-medium hover:scale-105 flex items-center gap-2"
                    >
                      <span>🔍</span> Expand
                    </button>
                    */}
                </div>
              </div>

              {/* Loading Indicator */}
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

              {/* Map Section */}
              <div className="h-[600px] relative">
                <MapContainer
                  center={[7.859, 125.0485]} // your default center
                  zoom={13}
                  whenCreated={(mapInstance) => {
                    mapRef.current = mapInstance;
                    setMapReady(true);
                    console.log("✅ Map is ready", mapInstance);
                  }}
                  className="w-full h-[80vh] rounded-3xl z-[0]"
                >
                  {/* Enhanced Layers Control */}
                  <LayersControl position="topright" className="custom-layers-control">
                    <LayersControl.BaseLayer checked name="Standard Map">
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
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

                  <WindLayer />
                  <MapClickHandler onMapClick={handleMapClick} />

                  {/* Main Campus Marker */}
                  <Marker position={[7.859, 125.0485]} icon={markerIcon}>
                    <Popup className="custom-popup">
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
                            <div className="text-xs text-gray-500 mt-2">
                              Last updated: {new Date().toLocaleTimeString()}
                            </div>
                          </div>
                        ) : (
                          <div className="text-gray-500 text-center py-2">Loading weather data...</div>
                        )}
                      </div>
                    </Popup>
                  </Marker>

                  {/* Weather Stations */}
                  {stations.map((s) => (
                    <Marker
                      key={s.id}
                      position={[s.latitude, s.longitude]}
                      icon={markerIcon}
                    >
                      <Popup className="custom-popup">
                        <div className="min-w-[230px] p-3">
                          {/* Header with gradient background */}
                          <div className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-t-lg -mx-4 -mt-3 mb-3 p-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-white text-lg truncate">
                                📍 {s.name}
                              </h3>
                            </div>
                            <div className="text-blue-100 text-xs mt-1">
                              Weather Station • Live Data
                            </div>
                          </div>

                          {/* Weather Metrics */}
                          <div className="space-y-3">
                            {s.temperature !== undefined && (
                              <div className="flex items-center justify-between p-2 rounded-lg bg-red-50 hover:bg-red-100 transition-colors duration-200">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                                    <span className="text-red-600">🌡</span>
                                  </div>
                                  <span className="text-gray-600 font-medium">Temperature</span>
                                </div>
                                <span className="font-bold text-lg text-gray-800">
                                  {s.temperature}°C
                                </span>
                              </div>
                            )}

                            {s.humidity !== undefined && (
                              <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors duration-200">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                    <span className="text-blue-600">💧</span>
                                  </div>
                                  <span className="text-gray-600 font-medium">Humidity</span>
                                </div>
                                <span className="font-bold text-lg text-gray-800">
                                  {s.humidity}%
                                </span>
                              </div>
                            )}

                            {s.rain_chance !== undefined && (
                              <div className="flex items-center justify-between p-2 rounded-lg bg-cyan-50 hover:bg-cyan-100 transition-colors duration-200">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center">
                                    <span className="text-cyan-600">🌧</span>
                                  </div>
                                  <span className="text-gray-600 font-medium">Rain Chance</span>
                                </div>
                                <span className="font-bold text-lg text-gray-800">
                                  {s.rain_chance}%
                                </span>
                              </div>
                            )}

                            {s.wind_speed !== undefined && (
                              <div className="flex items-center justify-between p-2 rounded-lg bg-green-50 hover:bg-green-100 transition-colors duration-200">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                    <span className="text-green-600">💨</span>
                                  </div>
                                  <span className="text-gray-600 font-medium">Wind Speed</span>
                                </div>
                                <span className="font-bold text-lg text-gray-800">
                                  {s.wind_speed} km/h
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Footer */}
                          <div className="mt-4 pt-3 border-t border-gray-200">
                            <div className="flex justify-between items-center text-xs text-gray-500">
                              <span>Updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              <span className="flex items-center gap-1">
                                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                                Live
                              </span>
                            </div>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>

                {/* Enhanced Clicked Weather Panel */}
                <AnimatePresence>
                  {clickedWeather && !isMapFullscreen && (
                    <motion.div
                      initial={{ x: "100%", opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: "100%", opacity: 0 }}
                      transition={{ type: "spring", stiffness: 100, damping: 20 }}
                      className="absolute top-6 right-6 w-80 bg-white/10 backdrop-blur-3xl rounded-2xl border border-white/20 shadow-2xl z-[10000] overflow-hidden"
                    >
                      {/* Panel Header */}
                      <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-4 border-b border-white/20">
                        <div className="flex justify-between items-center">
                          <h3 className="font-bold text-white text-lg">Location Details</h3>
                          <button
                            onClick={() => setClickedWeather(null)}
                            className="text-white/70 hover:text-white transition-all duration-200 hover:scale-110 w-6 h-6 flex items-center justify-center rounded-full bg-white/10"
                          >
                            ✖
                          </button>
                        </div>
                        <p className="text-white/60 text-xs mt-1">
                          Selected location weather information
                        </p>
                      </div>

                      {/* Weather Summary */}
                      <div className="p-6 text-center border-b border-white/10">
                        <div className="text-6xl mb-3">
                          {clickedWeather.temperature > 30
                            ? "☀️"
                            : clickedWeather.precipitation_probability > 50
                              ? "🌧️"
                              : "⛅"}
                        </div>
                        <h4 className="text-3xl font-bold text-white mb-1">
                          {clickedWeather.temperature.toFixed(1)}°C
                        </h4>
                        <p className="text-white/60 text-sm">
                          {new Date(clickedWeather.time).toLocaleString()}
                        </p>
                      </div>

                      {/* Weather Details */}
                      <div className="p-4 space-y-3">
                        <DetailItem
                          icon="💧"
                          label="Humidity"
                          value={`${clickedWeather.humidity}%`}
                          color="text-blue-300"
                        />
                        <DetailItem
                          icon="💨"
                          label="Wind Speed"
                          value={`${clickedWeather.wind_speed} m/s`}
                          color="text-green-300"
                        />
                        <DetailItem
                          icon="🌧️"
                          label="Precipitation"
                          value={`${clickedWeather.precipitation_probability}%`}
                          color="text-cyan-300"
                        />
                        <DetailItem
                          icon="📍"
                          label="Coordinates"
                          value={`${clickedWeather.latitude.toFixed(4)}, ${clickedWeather.longitude.toFixed(4)}`}
                          color="text-yellow-300"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Enhanced Weather Insights */}
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {/* Current Conditions Card */}
              <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-6 border border-white/20 shadow-xl hover:border-white/30 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                  <h3 className="text-lg font-bold text-white">Current Conditions</h3>
                </div>
                {currentWeather ? (
                  <div className="space-y-3">
                    <p className="text-white/80 text-sm leading-relaxed">
                      Currently experiencing <span className="text-white font-semibold">{currentWeather.description}</span> with
                      temperatures around <span className="text-white font-semibold">{currentWeather.temperature}°C</span>.
                    </p>
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10">
                      <div className="text-center p-3 bg-white/5 rounded-lg">
                        <div className="text-white/60 text-xs">Wind Speed</div>
                        <div className="text-white font-semibold text-lg">{currentWeather.wind_speed} km/h</div>
                      </div>
                      <div className="text-center p-3 bg-white/5 rounded-lg">
                        <div className="text-white/60 text-xs">Feels Like</div>
                        <div className="text-white font-semibold text-lg">{currentWeather.feels_like || currentWeather.temperature}°C</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-white/60 text-sm">Loading current conditions...</div>
                )}
              </div>

              {/* Enhanced Air Quality Card */}
              <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-6 border border-white/20 shadow-xl hover:border-white/30 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <h3 className="text-lg font-bold text-white">Air Quality & Conditions</h3>
                </div>
                {currentWeather ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-white/5 rounded-lg">
                        <div className="text-white/60 text-xs mb-1">Humidity</div>
                        <div className="text-white font-semibold text-xl">{currentWeather.humidity}%</div>
                      </div>
                      <div className="text-center p-3 bg-white/5 rounded-lg">
                        <div className="text-white/60 text-xs mb-1">Pressure</div>
                        <div className="text-white font-semibold text-xl">{currentWeather.pressure || '1013'} hPa</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                      <span className="text-white/60 text-sm">Visibility</span>
                      <span className="px-3 py-1 bg-green-500/20 text-green-300 text-sm rounded-full border border-green-400/30">
                        Good
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-white/60 text-sm">Loading air quality data...</div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Analytics Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[2000]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 100, damping: 18 }}
              className="fixed top-0 left-0 h-full w-80 md:w-96 bg-slate-900/95 backdrop-blur-3xl border-r border-white/20 shadow-2xl z-[2100] p-6 overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                  <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                  Weather Analytics
                </h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="text-white/70 hover:text-white transition text-2xl"
                >
                  ✖
                </button>
              </div>

              {/* Analytics Tabs */}
              <div className="flex gap-2 mb-6 bg-white/10 rounded-2xl p-1">
                {["history"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                      activeTab === tab
                        ? "bg-white/20 text-white shadow-lg"
                        : "text-white/60 hover:text-white"
                      }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {activeTab === "history" && history.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white mb-4">7-Day History</h3>

                  {/* Helper function for safe date formatting */}
                  {history.slice(0, 7).map((day, idx) => {
                    const formatDate = (dateStr) => {
                      if (!dateStr) return "Invalid Date";

                      // Case 1: YYYY-MM-DD
                      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
                        return dayjs(`${dateStr}T00:00:00`).format("ddd, MMM D");
                      }

                      // Case 2: timestamp (e.g., 1698700800000)
                      if (!isNaN(dateStr)) {
                        return dayjs(Number(dateStr)).format("ddd, MMM D");
                      }

                      // Case 3: DD-MM-YYYY
                      if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
                        const [dd, mm, yyyy] = dateStr.split("-");
                        return dayjs(`${yyyy}-${mm}-${dd}T00:00:00`).format("ddd, MMM D");
                      }

                      // Fallback
                      const parsed = dayjs(dateStr);
                      return parsed.isValid() ? parsed.format("ddd, MMM D") : "Invalid Date";
                    };

                    return (
                      <motion.div
                        key={idx}
                        className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 text-white shadow-lg border border-white/20"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-bold">
                            {formatDate(day.day)}
                          </span>
                          <span className="text-xl font-bold text-cyan-300">
                            {day.avg_temp.toFixed(2)}°C
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div className="text-center">
                            <div className="text-white/60 text-xs">High</div>
                            <div className="font-semibold text-red-300">
                              {day.max_temp.toFixed(1)}°C
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-white/60 text-xs">Low</div>
                            <div className="font-semibold text-blue-300">
                              {day.min_temp.toFixed(1)}°C
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-white/60 text-xs">Humidity</div>
                            <div className="font-semibold">
                              {day.avg_humidity.toFixed(2)}%
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Fullscreen Map Modal - Keep your existing implementation */}
      {/* ... (your existing fullscreen map code remains the same) ... */}
    </div>
  );
}

/* New Helper Components */
function GlassStatCard({ icon, label, value, trend }) {
  const trendIcons = {
    up: "↗️",
    down: "↘️",
    normal: "→"
  };

  return (
    <motion.div
      className="bg-white/10 backdrop-blur-2xl rounded-2xl p-4 border border-white/20 shadow-xl hover:bg-white/15 transition-all duration-300 group"
      whileHover={{ scale: 1.05, y: -2 }}
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

function ForecastItem({ period, temp, high, low }) {
  return (
    <div className="flex items-center justify-between bg-white/5 rounded-xl p-3 border border-white/10">
      <span className="text-white/80 font-medium">{period}</span>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="text-white text-sm">Avg: {temp}°C</div>
          <div className="text-xs text-white/60">
            H: {high}°C • L: {low}°C
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between bg-white/10 backdrop-blur-xl rounded-xl px-3 py-2 border border-white/20">
      <span className="flex items-center gap-2 text-sm">
        <span className="text-base">{icon}</span> {label}
      </span>
      <span className="font-bold text-sm">{value}</span>
    </div>
  );
}

/* Keep your existing helper components (MapClickHandler, StationSelector) the same */
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => onMapClick(e),
  });
  return null;
}

function StationSelector({ stations = [], onJumpTo }) {
  const [selected, setSelected] = useState("");

  const handleChange = (e) => {
    const id = e.target.value;
    setSelected(id);

    const station = stations.find((s) => s.id.toString() === id);
    if (!station) {
      console.warn("Station not found for ID:", id);
      return;
    }

    // Coordinates might sometimes be strings — parse them
    const latitude = station.latitude;
    const longitude = station.longitude;

    console.log("StationSelector: selected station:", station.name, { latitude, longitude });

    // Call the parent function to move the map
    if (typeof onJumpTo === "function") {
      onJumpTo(latitude, longitude, 17);
    } else {
      console.warn("onJumpTo prop not provided to StationSelector");
    }
  };

  return (
    <div className="relative z-[10000]">
      <select
        value={selected}
        onChange={handleChange}
        className="px-4 py-2 bg-white/20 backdrop-blur-xl border border-white/30 rounded-xl text-sm text-white focus:ring-2 focus:ring-white/50 focus:outline-none cursor-pointer w-full"
      >
        <option value="" disabled className="bg-gray-800">
          📍 Jump to Station
        </option>
        {stations.map((s) => (
          <option key={s.id} value={s.id} className="bg-gray-800">
            {s.name}
          </option>
        ))}
      </select>
    </div>
  );
}