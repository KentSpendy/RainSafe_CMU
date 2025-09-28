import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

// React-Leaflet imports
import { MapContainer, TileLayer, Marker, Popup, LayersControl, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-velocity";

// Custom marker icon
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Weather icons mapping
const weatherIcons = {
  sunny: "☀️",
  cloudy: "☁️",
  rainy: "🌧️",
  stormy: "⛈️",
  snowy: "❄️",
  default: "🌤️",
};

// OpenWeatherMap key
const OPEN_WEATHER_KEY = "1b56ccacd6121ccb6234ef6f54ab267f";

export default function Dashboard() {
  const navigate = useNavigate();
  const [currentWeather, setCurrentWeather] = useState(null);
  const [history, setHistory] = useState([]);
  const [forecast, setForecast] = useState([]);
  const [stations, setStations] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch current weather
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await API.get("weather/fetch/");
        setCurrentWeather(res.data.data);
      } catch (err) {
        console.error("Failed to fetch current weather:", err);
      }
    };
    fetchWeather();
  }, []);

  // Fetch 7-day history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await API.get("weather/history/");
        setHistory(res.data.data);
      } catch (err) {
        console.error("Failed to fetch history:", err);
      }
    };
    fetchHistory();
  }, []);

  // Fetch 3-day forecast
  useEffect(() => {
    const fetchForecast = async () => {
      try {
        const res = await API.get("weather/forecast/");
        setForecast(res.data.data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch forecast:", err);
        setLoading(false);
      }
    };
    fetchForecast();
  }, []);

  // Logout handler
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Get weather icon
  const getWeatherIcon = (temp, humidity, rainChance) => {
    if (rainChance > 70) return weatherIcons.rainy;
    if (rainChance > 40) return weatherIcons.cloudy;
    if (temp > 30) return weatherIcons.sunny;
    return weatherIcons.default;
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { weekday: "short", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Analytics calculations
  const getAnalytics = () => {
    if (history.length === 0) return null;

    const totalDays = history.length;
    const avgTemp = history.reduce((sum, day) => sum + day.avg_temp, 0) / totalDays;
    const avgHumidity = history.reduce((sum, day) => sum + day.avg_humidity, 0) / totalDays;
    const maxTemp = Math.max(...history.map(day => day.max_temp));
    const minTemp = Math.min(...history.map(day => day.min_temp));
    
    // Temperature trend
    const firstHalf = history.slice(0, Math.ceil(totalDays / 2));
    const secondHalf = history.slice(Math.ceil(totalDays / 2));
    const firstHalfAvg = firstHalf.reduce((sum, day) => sum + day.avg_temp, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, day) => sum + day.avg_temp, 0) / secondHalf.length;
    const tempTrend = secondHalfAvg > firstHalfAvg ? 'rising' : secondHalfAvg < firstHalfAvg ? 'falling' : 'stable';
    
    // Forecast analytics
    const forecastAvgRain = forecast.length > 0 ? 
      forecast.reduce((sum, day) => sum + day.rain_chance, 0) / forecast.length : 0;
    
    return {
      avgTemp: avgTemp.toFixed(1),
      avgHumidity: avgHumidity.toFixed(1),
      maxTemp: maxTemp.toFixed(1),
      minTemp: minTemp.toFixed(1),
      tempTrend,
      forecastAvgRain: forecastAvgRain.toFixed(0),
      totalDays
    };
  };

  // Toggle fullscreen map
  const toggleMapFullscreen = () => {
    setIsMapFullscreen(!isMapFullscreen);
  };

  // Wind Layer Component
  function WindLayer() {
    const map = useMap();

    useEffect(() => {
      const fetchWindData = async () => {
        try {
          const res = await fetch("/wind.json");
          const data = await res.json();

          const velocityLayer = L.velocityLayer({
            displayValues: true,
            displayOptions: {
              velocityType: "Global Wind",
              displayPosition: "bottomleft",
              displayEmptyString: "No wind data",
            },
            data,
            maxVelocity: 15
          });

          velocityLayer.addTo(map);
        } catch (err) {
          console.error("Failed to load wind data:", err);
        }
      };

      fetchWindData();
    }, [map]);

    return null;
  }

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return renderDashboard();
      case "history":
        return renderHistory();
      case "forecast":
        return renderForecast();
      default:
        return renderDashboard();
    }
  };

  const renderDashboard = () => {
  const analytics = getAnalytics();
  return (
    <div className="space-y-6">
      {/* Current Weather Header */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -translate-x-24 translate-y-24"></div>

        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-1">Central Mindanao University</h2>
              <p className="text-blue-100 text-sm">
                Northern Mindanao • Observed –{" "}
                {currentWeather ? "Just now" : "Loading..."}
              </p>
            </div>
            <div className="text-5xl mt-4 lg:mt-0">
              {currentWeather
                ? getWeatherIcon(
                    currentWeather.temperature,
                    currentWeather.humidity,
                    0
                  )
                : "🌤️"}
            </div>
          </div>

          <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between">
            <div>
              <div className="text-6xl font-light mb-2">
                {currentWeather ? `${currentWeather.temperature}°C` : "--"}
              </div>
              <div className="text-blue-100">
                <span className="font-medium">Temperature Range: </span>
                <span>
                  {currentWeather
                    ? `${currentWeather.min_temp}° - ${currentWeather.max_temp}°`
                    : "--"}
                </span>
              </div>
            </div>
            <div className="mt-4 lg:mt-0 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="text-sm text-blue-100 mb-2">
                Feels like{" "}
                {currentWeather ? `${currentWeather.feels_like}°C` : "--"}
              </div>
              <div className="text-sm">
                {currentWeather ? (
                  <>
                    {currentWeather.description} • Humidity{" "}
                    {currentWeather.humidity}%
                  </>
                ) : (
                  "Loading..."
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Weather Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weather Conditions Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 lg:col-span-2">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">🌤️</span>
            Today's Weather Report
          </h3>
          <p className="text-gray-700 mb-6">
            {currentWeather ? (
              <>
                Today in Central Mindanao University:{" "}
                <span className="font-medium">{currentWeather.description}</span>.{" "}
                Winds at <span className="font-medium">{currentWeather.wind_speed} km/h</span>,{" "}
                humidity <span className="font-medium">{currentWeather.humidity}%</span>,{" "}
                precipitation chance{" "}
                <span className="font-medium">
                  {currentWeather.precipitation_probability ?? "--"}%
                </span>. Temperature feels like{" "}
                <span className="font-medium">
                  {currentWeather.feels_like ?? currentWeather.temperature}°C
                </span>
                .
              </>
            ) : (
              "Loading today's weather report..."
            )}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Wind */}
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <div className="text-2xl mb-2">💨</div>
              <div className="text-sm text-gray-600 mb-1">Wind</div>
              <div className="font-bold text-gray-900">
                {currentWeather ? `${currentWeather.wind_speed} km/h` : "--"}
              </div>
            </div>

            {/* Humidity */}
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <div className="text-2xl mb-2">💧</div>
              <div className="text-sm text-gray-600 mb-1">Humidity</div>
              <div className="font-bold text-gray-900">
                {currentWeather ? `${currentWeather.humidity}%` : "--"}
              </div>
            </div>

            {/* Precipitation */}
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <div className="text-2xl mb-2">🌧️</div>
              <div className="text-sm text-gray-600 mb-1">Precipitation</div>
              <div className="font-bold text-gray-900">
                {currentWeather && currentWeather.precipitation_probability != null
                  ? `${currentWeather.precipitation_probability}%`
                  : "--"}
              </div>
            </div>


            {/* Temperature */}
            <div className="text-center p-4 bg-orange-50 rounded-xl">
              <div className="text-2xl mb-2">🌡️</div>
              <div className="text-sm text-gray-600 mb-1">Temperature</div>
              <div className="font-bold text-gray-900">
                {currentWeather && currentWeather.temperature
                  ? `${currentWeather.temperature}°C`
                  : "--"}
              </div>
            </div>
          </div>
        </div>


        {/* Mini Report Card (from History Data) */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <span className="mr-2">📑</span>
            Weekly Weather Summary
          </h3>
          {history.length > 0 ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                <span>Avg Temperature (7 days)</span>
                <span className="font-bold">
                  {(
                    history.reduce((sum, day) => sum + day.avg_temp, 0) / history.length
                  ).toFixed(1)}°C
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                <span>Min Temperature (lowest)</span>
                <span className="font-bold">
                  {Math.min(...history.map((d) => d.min_temp)).toFixed(1)}°C
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                <span>Max Temperature (highest)</span>
                <span className="font-bold">
                  {Math.max(...history.map((d) => d.max_temp)).toFixed(1)}°C
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                <span>Avg Humidity (7 days)</span>
                <span className="font-bold">
                  {(
                    history.reduce((sum, day) => sum + day.avg_humidity, 0) /
                    history.length
                  ).toFixed(1)}%
                </span>
              </div>
            </div>
          ) : (
            <p className="text-white/70">Loading history summary...</p>
          )}
        </div>
      </div>

        {/* Enhanced Map Section with Full Layering */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Weather Monitoring Map</h3>
                <p className="text-gray-600">Real-time weather data visualization for CMU campus with multiple layers</p>
              </div>
              <button
                onClick={toggleMapFullscreen}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <span className="mr-2 text-lg">{isMapFullscreen ? '📉' : '📈'}</span>
                {isMapFullscreen ? 'Exit Fullscreen' : 'Expand Map'}
              </button>
            </div>
          </div>
          <div className={`w-full transition-all duration-300 ${isMapFullscreen ? 'h-screen' : 'h-96'}`}>
            <MapContainer
              center={[7.859, 125.0485]}
              zoom={isMapFullscreen ? 17 : 15}
              style={{ height: "100%", width: "100%" }}
            >
              <LayersControl position="topright">
                <LayersControl.BaseLayer checked name="🗺 OpenStreetMap">
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                  />
                </LayersControl.BaseLayer>

                <LayersControl.Overlay checked name="🌧 Rainfall">
                  <TileLayer url={`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${OPEN_WEATHER_KEY}`} />
                </LayersControl.Overlay>
                <LayersControl.Overlay name="💨 Wind Overlay">
                  <TileLayer url={`https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${OPEN_WEATHER_KEY}`} />
                </LayersControl.Overlay>
                <LayersControl.Overlay name="🌡 Temperature">
                  <TileLayer url={`https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${OPEN_WEATHER_KEY}`} />
                </LayersControl.Overlay>
                <LayersControl.Overlay name="☁️ Clouds">
                  <TileLayer url={`https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${OPEN_WEATHER_KEY}`} />
                </LayersControl.Overlay>
              </LayersControl>

              <WindLayer apiKey={OPEN_WEATHER_KEY} />

              <Marker position={[7.859, 125.0485]} icon={markerIcon}>
                <Popup>
                  <div className="font-semibold text-blue-700 text-lg mb-2">CMU Campus</div>
                  <div className="text-sm space-y-1">
                    {currentWeather ? (
                      <>
                        <div>🌡 Temperature: {currentWeather.temperature}°C</div>
                        <div>💧 Humidity: {currentWeather.humidity}%</div>
                        <div>🕐 Last Updated: {new Date().toLocaleTimeString()}</div>
                      </>
                    ) : (
                      <div className="text-gray-500">Loading weather data...</div>
                    )}
                  </div>
                </Popup>
              </Marker>

              {stations.map((station, idx) => (
                <Marker key={idx} position={[station.lat, station.lng]} icon={markerIcon}>
                  <Popup>
                    <div className="font-semibold text-blue-700 text-lg mb-2">{station.name}</div>
                    <div className="text-sm space-y-1">
                      <div>🌡 Temperature: {station.temperature}°C</div>
                      <div>💧 Humidity: {station.humidity}%</div>
                      <div>🌧 Rain Chance: {station.rain_chance}%</div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-wrap gap-2">
              <span className="text-xs font-medium text-gray-600 bg-white px-3 py-1 rounded-full">📍 CMU Campus</span>
              <span className="text-xs font-medium text-gray-600 bg-white px-3 py-1 rounded-full">🌧 Rainfall Layer</span>
              <span className="text-xs font-medium text-gray-600 bg-white px-3 py-1 rounded-full">💨 Wind Data</span>
              <span className="text-xs font-medium text-gray-600 bg-white px-3 py-1 rounded-full">🌡 Temperature</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderHistory = () => {
    const analytics = getAnalytics();
    return (
      <div className="space-y-6">
        {/* Analytics Section */}
        {analytics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "7-Day Avg Temp", value: `${analytics.avgTemp}°`, icon: "🌡️" },
              { label: "Avg Humidity", value: `${analytics.avgHumidity}%`, icon: "💧" },
              { label: "Temp Range", value: `${analytics.minTemp}°-${analytics.maxTemp}°`, icon: "📊" },
              { label: "Rain Forecast", value: `${analytics.forecastAvgRain}%`, icon: "🌧️" }
            ].map((item, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">{item.label}</div>
                    <div className="text-xl font-semibold text-gray-900">{item.value}</div>
                  </div>
                  <div className="text-2xl">{item.icon}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* History Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Weather History</h3>
          </div>
          {history.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Temp</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min Temp</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max Temp</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Humidity</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {history.map((day, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {day.timestamp__date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {day.avg_temp.toFixed(1)}°C
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                        {day.min_temp.toFixed(1)}°C
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                        {day.max_temp.toFixed(1)}°C
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {day.avg_humidity.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="text-gray-300 text-4xl mb-4">📊</div>
              <h4 className="text-lg font-semibold text-gray-600 mb-2">Loading Weather History</h4>
              <p className="text-gray-500">Please wait while we fetch historical weather data...</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderForecast = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">3-Day Weather Forecast</h3>
        
        {forecast.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {forecast.map((day, idx) => (
              <div key={idx} className="bg-gray-50 rounded-xl p-6">
                <div className="text-center mb-4">
                  <p className="font-semibold text-gray-900 mb-2">{formatDate(day.date)}</p>
                  <div className="text-5xl mb-4">
                    {getWeatherIcon(day.max_temp, 0, day.rain_chance)}
                  </div>
                  <div className="text-3xl font-light text-gray-900">
                    {day.min_temp}° - {day.max_temp}°C
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Rain Chance</span>
                    <span className="font-semibold text-gray-900">{day.rain_chance}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Wind Speed</span>
                    <span className="font-semibold text-gray-900">{day.wind_max} m/s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Max Temperature</span>
                    <span className="font-semibold text-gray-900">{day.max_temp} m/s</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-300 text-4xl mb-4">🔮</div>
            <h4 className="text-lg font-semibold text-gray-600 mb-2">Loading Forecast Data</h4>
            <p className="text-gray-500">Please wait while we fetch weather predictions...</p>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">🌦️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading RainSafe</h2>
          <p className="text-gray-600">Fetching weather data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="text-2xl mr-3">🌦</div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">RainSafe</h1>
                <p className="text-gray-600 text-xs">Weather Monitoring System</p>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              {[
                { id: "dashboard", label: "Dashboard", icon: "" },
                { id: "history", label: "History", icon: "" },
                { id: "forecast", label: "Forecast", icon: "" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center ${
                    activeTab === tab.id
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-3">
              <div className="hidden sm:block text-right">
                <div className="text-sm font-medium text-gray-900">{localStorage.getItem("email")}</div>
                <div className="text-xs text-blue-600 font-medium">{localStorage.getItem("role")}</div>
              </div>
              
              <button
                onClick={handleLogout}
                className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              >
                Logout
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
              >
                <span className="text-lg">☰</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 px-6 py-3">
            <div className="flex space-x-2">
              {[
                { id: "dashboard", label: "Dashboard", icon: "📊" },
                { id: "history", label: "History", icon: "📅" },
                { id: "forecast", label: "Forecast", icon: "🔮" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center ${
                    activeTab === tab.id
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMobileMenuOpen(false);
                  }}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="p-6">
        {renderContent()}
      </main>
    </div>
  );
}