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
import rain from "../assets/rain.mp4"

export default function DashboardPage({
  currentWeather,
  history,
  stations,
  isMapFullscreen,
  toggleMapFullscreen,
  getWeatherIcon,
  OPEN_WEATHER_KEY,
  markerIcon,
  WindLayer,
}) {
  const mapRef = useRef(null);
  const [clickedWeather, setClickedWeather] = useState(null);
  const [loadingClick, setLoadingClick] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
              ? currentWeather.precipitation_probability > 60 ||
                currentWeather.description?.toLowerCase().includes("rain")
                ? "./src/assets/weather.jpg" 
                : "./src/assets/sunny.jpg" 
              : "./src/assets/weather.jpg" 
          }
          alt="Weather background"
          className="w-full h-full object-cover transition-all duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
      </div>


      {/* Main Content */}
      <div className="relative z-10 space-y-6 p-4 md:p-6">
        {/* === COLLAPSIBLE GLASS SIDEBAR === */}
          <AnimatePresence>
            {sidebarOpen && (
              <>
                {/* Overlay nga mo close sa sidebar on click */}
                <motion.div
                  className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[2000]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSidebarOpen(false)}
                />
                {/* Sidebar content */}
                <motion.aside
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ type: "spring", stiffness: 100, damping: 18 }}
                  className="fixed top-10 left-0 h-full w-80 md:w-96 bg-white/10 backdrop-blur-3xl border-r border-white/20 shadow-2xl z-[2100] p-6 overflow-y-auto"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                      📅 Weather History
                    </h2>
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="text-white/70 hover:text-white transition"
                    >
                      ✖
                    </button>
                  </div>

                  {history.length > 0 ? (
                    <div className="space-y-4">
                      {history.slice(0, 7).map((day, idx) => (
                        <motion.div
                          key={idx}
                          className="bg-white/15 backdrop-blur-xl rounded-2xl p-4 text-white shadow-lg border border-white/10"
                          whileHover={{ scale: 1.03 }}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">
                              {new Date(day.day).toLocaleDateString("en-US", {
                                weekday: "short",
                              })}
                            </span>
                            <span className="text-sm opacity-80">
                              {day.avg_temp.toFixed(1)}°C
                            </span>
                          </div>
                          <div className="text-sm opacity-80 mt-2">
                            <p>🌡 Max: {day.max_temp.toFixed(1)}°C</p>
                            <p>🌡 Min: {day.min_temp.toFixed(1)}°C</p>
                            <p>💧 Humidity: {day.avg_humidity.toFixed(1)}%</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-white/70 text-sm mt-6">
                      No weather history data yet...
                    </p>
                  )}
                </motion.aside>
              </>
            )}
          </AnimatePresence>

          {/* Toggle Sidebar Button (TOP LEFT) */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="top-20 left-5 z-[2200] bg-white/20 backdrop-blur-xl hover:bg-white/30 text-white px-4 py-2 rounded-full shadow-lg border border-white/30 transition"
          >
            📅
          </button>


        {/* HEADER SECTION - Glassmorphism */}
        <motion.div
          className="relative rounded-3xl p-8 text-white bg-white/10 backdrop-blur-2xl shadow-2xl overflow-hidden border border-white/20"
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold mb-1 tracking-tight">
                Central Mindanao University
              </h1>
              <p className="text-white/80">
                Northern Mindanao •{" "}
                {currentWeather ? "Live Observation" : "Loading..."}
              </p>
            </div>
            <motion.div
              className="text-6xl mt-6 md:mt-0"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {currentWeather
                ? getWeatherIcon(
                    currentWeather.temperature,
                    currentWeather.humidity,
                    currentWeather.precipitation_probability
                  )
                : "🌤️"}
            </motion.div>
          </div>

          <div className="mt-6 flex flex-col md:flex-row justify-between items-start md:items-end">
            <div>
              <div className="text-7xl font-light mb-2 drop-shadow-lg">
                {currentWeather ? `${currentWeather.temperature}°C` : "--"}
              </div>
              <p className="text-white/80">
                <span className="font-medium">Feels like:</span>{" "}
                {currentWeather
                  ? `${currentWeather.feels_like ?? currentWeather.temperature}°C`
                  : "--"}
              </p>
            </div>

            <div className="mt-6 md:mt-0 bg-white/15 backdrop-blur-xl p-5 rounded-2xl border border-white/20 w-full md:w-auto shadow-lg">
              {currentWeather ? (
                <div className="space-y-1 text-sm">
                  <p className="text-white/90">
                    💧 Humidity: {currentWeather.humidity}%
                  </p>
                  <p className="text-white/90">
                    💨 Wind Speed: {currentWeather.wind_speed} km/h
                  </p>
                  <p className="text-white/90">
                    🌧 Rain Probability:{" "}
                    {currentWeather.precipitation_probability ?? "--"}%
                  </p>
                </div>
              ) : (
                <p className="text-white/70 text-sm">Loading weather details...</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* WEATHER OVERVIEW + MAP (Side by side) */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {/* Today's Weather Overview - Takes 2 columns */}
          <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 p-10 lg:col-span-2">
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
              <span className="mr-2">🌤️</span> Today's Weather Overview
            </h3>
            <p className="text-white/90 mb-6 leading-relaxed">
              {currentWeather ? (
                <>
                  Today in{" "}
                  <span className="font-semibold">
                    Central Mindanao University
                  </span>
                  , we're experiencing{" "}
                  <span className="font-medium">
                    {currentWeather.description}
                  </span>{" "}
                  with a temperature of{" "}
                  <span className="font-medium">
                    {currentWeather.temperature}°C
                  </span>
                  , humidity at{" "}
                  <span className="font-medium">
                    {currentWeather.humidity}%
                  </span>
                  , and wind speeds around{" "}
                  <span className="font-medium">
                    {currentWeather.wind_speed} km/h
                  </span>
                  . The chance of rain stands at{" "}
                  <span className="font-medium">
                    {currentWeather.precipitation_probability ?? "--"}%.
                  </span>
                </>
              ) : (
                "Loading current weather information..."
              )}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <WeatherStat
                icon="🌡️"
                label="Temperature"
                value={
                  currentWeather
                    ? `${currentWeather.temperature.toFixed(1)}°C`
                    : "--"
                }
              />
              <WeatherStat
                icon="💧"
                label="Humidity"
                value={
                  currentWeather
                    ? `${currentWeather.humidity.toFixed(0)}%`
                    : "--"
                }
              />
              <WeatherStat
                icon="💨"
                label="Wind"
                value={
                  currentWeather
                    ? `${currentWeather.wind_speed.toFixed(1)} km/h`
                    : "--"
                }
              />
              <WeatherStat
                icon="🌧"
                label="Precipitation"
                value={
                  currentWeather?.precipitation_probability != null
                    ? `${currentWeather.precipitation_probability}%`
                    : "--"
                }
              />
            </div>
          </div>

          {/* Map on the Right - Takes 1 column */}
          <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden relative">
            <div className="p-4 border-b border-white/20 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                🗺️ Location
              </h3>
              <button
                onClick={toggleMapFullscreen}
                className="px-3 py-1.5 bg-white/20 backdrop-blur-xl text-white text-sm rounded-lg shadow-lg hover:bg-white/30 transition border border-white/30"
              >
                🔍
              </button>
            </div>
            
            {loadingClick && (
              <div className="absolute z-[999] top-16 right-4 bg-white/20 backdrop-blur-xl shadow-lg rounded-lg px-3 py-1.5 text-xs text-white border border-white/30">
                ⏳ Loading...
              </div>
            )}

            <div className="h-[380px] relative">
              <MapContainer
                center={[7.859, 125.0485]}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
                whenCreated={(mapInstance) => (mapRef.current = mapInstance)}
              >
                <LayersControl position="topright">
                  <LayersControl.BaseLayer checked name="🗺 OpenStreetMap">
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  </LayersControl.BaseLayer>
                  <LayersControl.Overlay checked name="🌧 Rainfall">
                    <TileLayer
                      url={`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${OPEN_WEATHER_KEY}`}
                    />
                  </LayersControl.Overlay>
                  <LayersControl.Overlay name="💨 Wind Overlay">
                    <TileLayer
                      url={`https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${OPEN_WEATHER_KEY}`}
                    />
                  </LayersControl.Overlay>
                  <LayersControl.Overlay name="🌡 Temperature">
                    <TileLayer
                      url={`https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${OPEN_WEATHER_KEY}`}
                    />
                  </LayersControl.Overlay>
                </LayersControl>

                <WindLayer />
                <MapClickHandler onMapClick={handleMapClick} />

                <Marker position={[7.859, 125.0485]} icon={markerIcon}>
                  <Popup>
                    <div className="font-semibold text-blue-700 text-lg mb-2">
                      CMU Campus
                    </div>
                    {currentWeather ? (
                      <>
                        <div>🌡 Temperature: {currentWeather.temperature}°C</div>
                        <div>💧 Humidity: {currentWeather.humidity}%</div>
                        <div>
                          🕐 Last Updated: {new Date().toLocaleTimeString()}
                        </div>
                      </>
                    ) : (
                      <div className="text-gray-500">Loading weather data...</div>
                    )}
                  </Popup>
                </Marker>

                {stations.map((s) => (
                  <Marker
                    key={s.id}
                    position={[s.latitude, s.longitude]}
                    icon={markerIcon}
                  >
                    <Popup>
                      <div className="font-semibold text-blue-700 text-lg mb-1">
                        {s.name}
                      </div>
                      {s.temperature !== undefined && (
                        <p>🌡 Temp: {s.temperature}°C</p>
                      )}
                      {s.humidity !== undefined && (
                        <p>💧 Humidity: {s.humidity}%</p>
                      )}
                      {s.rain_chance !== undefined && (
                        <p>🌧 Rain: {s.rain_chance}%</p>
                      )}
                      {s.wind_speed !== undefined && (
                        <p>💨 Wind: {s.wind_speed} km/h</p>
                      )}
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>

              {/* Sliding Sidebar for clicked weather - Inside small map */}
              <AnimatePresence>
                {clickedWeather && !isMapFullscreen && (
                  <motion.div
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                    className="absolute top-0 right-0 h-full w-full bg-white/15 backdrop-blur-3xl border-l border-white/30 shadow-2xl z-[10000] p-4 overflow-y-auto text-white"
                  >
                    <div className="flex justify-between items-center mb-3">
                      {/* 🌧️ RAIN VIDEO BACKGROUND - Full Page */}
                      <div className="fixed inset-0 z-0">
                        <video
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-full object-cover"
                          poster="./src/assets/weather.jpg"
                        >
                          {/* <source src="./src/assets/rain.mp4" type="video/mp4" /> */}
                          {/* Fallback to GIF if video doesn't load */}
                          <img
                            src="./src/assets/weather.jpg"
                            alt="Rain animation"
                            className="w-full h-full object-cover"
                          />
                        </video>
                        {/* Dark overlay for better text readability */}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
                      </div>
                      <h3 className="text-sm font-semibold flex items-center gap-2">
                        📍 Location Details
                      </h3>
                      <button
                        onClick={() => setClickedWeather(null)}
                        className="text-white/80 hover:text-white transition"
                      >
                        ✖
                      </button>
                    </div>

                    <div className="text-center mb-4">
                      <div className="text-4xl mb-2">
                        {clickedWeather.temperature > 30
                          ? "☀️"
                          : clickedWeather.precipitation_probability > 50
                          ? "🌧️"
                          : "⛅"}
                      </div>
                      <h4 className="text-2xl font-bold mb-1">
                        {clickedWeather.temperature.toFixed(1)}°C
                      </h4>
                      <p className="text-xs mb-2 opacity-80">
                        {new Date(clickedWeather.time).toLocaleString()}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <WeatherDetail
                        label="Humidity"
                        icon="💧"
                        value={`${clickedWeather.humidity}%`}
                        compact
                      />
                      <WeatherDetail
                        label="Wind Speed"
                        icon="💨"
                        value={`${clickedWeather.wind_speed} m/s`}
                        compact
                      />
                      <WeatherDetail
                        label="Precipitation"
                        icon="🌧"
                        value={`${clickedWeather.precipitation_probability}%`}
                        compact
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* WEEKLY SUMMARY - Now full width below */}
        <motion.div
          className="bg-white/10 backdrop-blur-2xl rounded-3xl p-6 text-white shadow-2xl border border-white/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-2xl font-semibold mb-4 flex items-center">
            <span className="mr-2">📈</span> Weekly Summary
          </h3>
          {history.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <SummaryRow
                label="7-Day Avg Temp"
                value={`${(
                  history.reduce((s, d) => s + d.avg_temp, 0) /
                  history.length
                ).toFixed(1)}°C`}
              />
              <SummaryRow
                label="Min Temp"
                value={`${Math.min(...history.map((d) => d.min_temp)).toFixed(
                  1
                )}°C`}
              />
              <SummaryRow
                label="Max Temp"
                value={`${Math.max(...history.map((d) => d.max_temp)).toFixed(
                  1
                )}°C`}
              />
              <SummaryRow
                label="Avg Humidity"
                value={`${(
                  history.reduce((s, d) => s + d.avg_humidity, 0) /
                  history.length
                ).toFixed(1)}%`}
              />
            </div>
          ) : (
            <p className="text-white/80 text-sm">
              Loading weekly weather insights...
            </p>
          )}
        </motion.div>
      </div>

      {/* 🔍 FULLSCREEN MAP MODAL - Gallery Style Popup */}
      <AnimatePresence>
        {isMapFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={toggleMapFullscreen}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="relative w-full h-full max-w-7xl max-h-[90vh] bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with controls */}
              <div className="absolute top-0 left-0 right-0 z-[10001] p-4 bg-gradient-to-b from-black/60 to-transparent">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      🌍 Live Weather Monitoring
                    </h3>
                    <StationSelector stations={stations} mapRef={mapRef} />
                  </div>
                  <button
                    onClick={toggleMapFullscreen}
                    className="px-4 py-2 bg-white/20 backdrop-blur-xl text-white rounded-lg shadow-lg hover:bg-white/30 transition border border-white/30"
                  >
                    ✖ Close
                  </button>
                </div>
                <p className="text-white/80 text-sm mt-2 text-bold  ">
                  Click anywhere on the map to view live weather data
                </p>
              </div>

              {loadingClick && (
                <div className="absolute z-[10002] top-20 right-6 bg-white/20 backdrop-blur-xl shadow-lg rounded-lg px-4 py-2 text-sm text-white border border-white/30">
                  ⏳ Fetching live weather data...
                </div>
              )}

              {/* Full Map */}
              <div className="w-full h-full">
                <MapContainer
                  center={[7.859, 125.0485]}
                  zoom={15}
                  style={{ height: "100%", width: "100%" }}
                  whenCreated={(mapInstance) => {
                    if (mapRef.current) {
                      mapRef.current.setZoom(15);
                    }
                  }}
                >
                  <LayersControl position="bottomright">
                    <LayersControl.BaseLayer checked name="🗺 OpenStreetMap">
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    </LayersControl.BaseLayer>
                    <LayersControl.Overlay checked name="🌧 Rainfall">
                      <TileLayer
                        url={`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${OPEN_WEATHER_KEY}`}
                      />
                    </LayersControl.Overlay>
                    <LayersControl.Overlay name="💨 Wind Overlay">
                      <TileLayer
                        url={`https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${OPEN_WEATHER_KEY}`}
                      />
                    </LayersControl.Overlay>
                    <LayersControl.Overlay name="🌡 Temperature">
                      <TileLayer
                        url={`https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${OPEN_WEATHER_KEY}`}
                      />
                    </LayersControl.Overlay>
                  </LayersControl>

                  <WindLayer />
                  <MapClickHandler onMapClick={handleMapClick} />

                  <Marker position={[7.859, 125.0485]} icon={markerIcon}>
                    <Popup>
                      <div className="font-semibold text-blue-700 text-lg mb-2">
                        CMU Campus
                      </div>
                      {currentWeather ? (
                        <>
                          <div>🌡 Temperature: {currentWeather.temperature}°C</div>
                          <div>💧 Humidity: {currentWeather.humidity}%</div>
                          <div>
                            🕐 Last Updated: {new Date().toLocaleTimeString()}
                          </div>
                        </>
                      ) : (
                        <div className="text-gray-500">Loading weather data...</div>
                      )}
                    </Popup>
                  </Marker>

                  {stations.map((s) => (
                    <Marker
                      key={s.id}
                      position={[s.latitude, s.longitude]}
                      icon={markerIcon}
                    >
                      <Popup>
                        <div className="font-semibold text-blue-700 text-lg mb-1">
                          {s.name}
                        </div>
                        {s.temperature !== undefined && (
                          <p>🌡 Temp: {s.temperature}°C</p>
                        )}
                        {s.humidity !== undefined && (
                          <p>💧 Humidity: {s.humidity}%</p>
                        )}
                        {s.rain_chance !== undefined && (
                          <p>🌧 Rain: {s.rain_chance}%</p>
                        )}
                        {s.wind_speed !== undefined && (
                          <p>💨 Wind: {s.wind_speed} km/h</p>
                        )}
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>

              {/* Sliding Sidebar for clicked weather in fullscreen */}
              <AnimatePresence>
                {clickedWeather && (
                  <motion.div
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                    className="absolute top-0 right-0 h-full w-full md:w-[400px] bg-violet-500 backdrop-blur-3xl border-l border-white/30 shadow-2xl z-[10003] p-6 overflow-y-auto text-white"
                    style={{
                      // replace the path below with your image later
                      backgroundImage: "url('./src/assets/weather.jpg')",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                    }}
                  >

                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        📍 Location Details
                      </h3>
                      <button
                        onClick={() => setClickedWeather(null)}
                        className="text-white/80 hover:text-white transition"
                      >
                        ✖
                      </button>
                    </div>

                    <div className="text-center mb-6">
                      <div className="text-5xl mb-2">
                        {clickedWeather.temperature > 30
                          ? "☀️"
                          : clickedWeather.precipitation_probability > 50
                          ? "🌧️"
                          : "⛅"}
                      </div>
                      <h4 className="text-3xl font-bold mb-1">
                        {clickedWeather.temperature.toFixed(1)}°C
                      </h4>
                      <p className="text-sm mb-2 opacity-80">
                        {new Date(clickedWeather.time).toLocaleString()}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <WeatherDetail
                        label="Humidity"
                        icon="💧"
                        value={`${clickedWeather.humidity}%`}
                      />
                      <WeatherDetail
                        label="Wind Speed"
                        icon="💨"
                        value={`${clickedWeather.wind_speed} m/s`}
                      />
                      <WeatherDetail
                        label="Precipitation"
                        icon="🌧"
                        value={`${clickedWeather.precipitation_probability}%`}
                      />
                      <WeatherDetail
                        label="Latitude"
                        icon="🧭"
                        value={clickedWeather.latitude.toFixed(4)}
                      />
                      <WeatherDetail
                        label="Longitude"
                        icon="🌐"
                        value={clickedWeather.longitude.toFixed(4)}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* --- Helper Components --- */
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => onMapClick(e),
  });
  return null;
}

function WeatherDetail({ label, icon, value, compact }) {
  return (
    <div className={`flex items-center justify-between bg-white/15 backdrop-blur-xl rounded-lg ${compact ? 'px-3 py-1.5' : 'px-4 py-2'} shadow-lg border border-white/10`}>
      <span className={`flex items-center gap-2 font-medium ${compact ? 'text-xs' : ''}`}>
        {icon} {label}
      </span>
      <span className={`font-semibold ${compact ? 'text-xs' : ''}`}>{value}</span>
    </div>
  );
}

function WeatherStat({ icon, label, value }) {
  return (
    <motion.div
      className="text-center p-5 bg-white/15 backdrop-blur-xl hover:bg-white/20 transition rounded-xl shadow-lg border border-white/10"
      whileHover={{ scale: 1.05 }}
    >
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-sm text-white/80 mb-1">{label}</div>
      <div className="font-bold text-white text-lg">{value}</div>
    </motion.div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex flex-col items-center p-4 bg-white/15 backdrop-blur-xl rounded-xl border border-white/10 shadow-lg">
      <span className="text-sm text-white/80 mb-1">{label}</span>
      <span className="font-semibold text-lg text-white">{value}</span>
    </div>
  );
}

function StationSelector({ stations, mapRef }) {
  const [selected, setSelected] = useState("");

  const handleChange = (e) => {
    const id = e.target.value;
    setSelected(id);
    const station = stations.find((s) => s.id.toString() === id);
    if (station && mapRef.current) {
      mapRef.current.setView([station.latitude, station.longitude], 17);
    }
  };

  return (
    <select
      value={selected}
      onChange={handleChange}
      className="px-3 py-2 bg-white/20 backdrop-blur-xl border border-white/30 rounded-lg text-sm text-white focus:ring-2 focus:ring-white/50 focus:outline-none"
    >
      <option value="" className="bg-gray-800">📍 Jump to Station</option>
      {stations.map((s) => (
        <option key={s.id} value={s.id} className="bg-gray-800">
          {s.name}
        </option>
      ))}
    </select>
  );
}