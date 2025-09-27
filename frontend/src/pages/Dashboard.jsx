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

// 🔑 Use env variable for OpenWeatherMap key
const OPEN_WEATHER_KEY = "1b56ccacd6121ccb6234ef6f54ab267f";

export default function Dashboard() {
  const navigate = useNavigate();
  const [currentWeather, setCurrentWeather] = useState(null);
  const [history, setHistory] = useState([]);
  const [forecast, setForecast] = useState([]);
  const [stations, setStations] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);

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
      } catch (err) {
        console.error("Failed to fetch forecast:", err);
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
    
    // Temperature trend (comparing first 3 days vs last 3 days)
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





  const renderDashboard = () => {
    const analytics = getAnalytics();
    return (
      <div className="space-y-6">
        {/* Current Weather Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Temperature</p>
                <p className="text-2xl font-bold text-gray-900">
                  {currentWeather ? `${currentWeather.temperature}°C` : "--"}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🌡️</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Humidity</p>
                <p className="text-2xl font-bold text-gray-900">
                  {currentWeather ? `${currentWeather.humidity}%` : "--"}
                </p>
              </div>
              <div className="h-12 w-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💧</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Stations Active</p>
                <p className="text-2xl font-bold text-gray-900">{stations.length}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📍</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Data Points</p>
                <p className="text-2xl font-bold text-gray-900">{history.length}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm mb-1">7-Day Avg Temp</p>
                  <p className="text-2xl font-bold">{analytics.avgTemp}°C</p>
                  <div className="flex items-center mt-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      analytics.tempTrend === 'rising' ? 'bg-orange-200 text-orange-800' :
                      analytics.tempTrend === 'falling' ? 'bg-blue-200 text-blue-800' :
                      'bg-gray-200 text-gray-800'
                    }`}>
                      {analytics.tempTrend === 'rising' ? '📈 Rising' :
                       analytics.tempTrend === 'falling' ? '📉 Falling' : '➡️ Stable'}
                    </span>
                  </div>
                </div>
                <div className="text-3xl opacity-80">🌡️</div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cyan-100 text-sm mb-1">Avg Humidity</p>
                  <p className="text-2xl font-bold">{analytics.avgHumidity}%</p>
                  <p className="text-cyan-200 text-xs mt-2">Past {analytics.totalDays} days</p>
                </div>
                <div className="text-3xl opacity-80">💧</div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm mb-1">Temperature Range</p>
                  <p className="text-lg font-bold">{analytics.minTemp}° - {analytics.maxTemp}°C</p>
                  <p className="text-orange-200 text-xs mt-2">Min/Max recorded</p>
                </div>
                <div className="text-3xl opacity-80">🌡️</div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-100 text-sm mb-1">Forecast Rain</p>
                  <p className="text-2xl font-bold">{analytics.forecastAvgRain}%</p>
                  <p className="text-indigo-200 text-xs mt-2">Avg next 3 days</p>
                </div>
                <div className="text-3xl opacity-80">🌧️</div>
              </div>
            </div>
          </div>
        )}

        {/* Map Section */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">CMU Weather Map</h3>
              <p className="text-sm text-gray-600">Central Mindanao University campus weather monitoring</p>
            </div>
            <button
              onClick={toggleMapFullscreen}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center text-sm"
            >
              <span className="mr-2">{isMapFullscreen ? '📉' : '📈'}</span>
              {isMapFullscreen ? 'Exit Fullscreen' : 'Expand Map'}
            </button>
          </div>
          <div className={`w-full transition-all duration-300 ${isMapFullscreen ? 'h-screen' : 'h-80'}`}>
            <MapContainer
              center={[7.859, 125.0485]}
              zoom={isMapFullscreen ? 17 : 16}
              style={{ height: "100%", width: "100%" }}
            >
              <LayersControl position="topright">
                {/* Base OSM Layer */}
                <LayersControl.BaseLayer checked name="🗺 OpenStreetMap">
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                  />
                </LayersControl.BaseLayer>

                {/* OWM Layers */}
                <LayersControl.Overlay name="🌧 Rainfall">
                  <TileLayer url={`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${OPEN_WEATHER_KEY}`} />
                </LayersControl.Overlay>
                <LayersControl.Overlay name="💨 Wind Overlay">
                  <TileLayer url={`https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${OPEN_WEATHER_KEY}`} />
                </LayersControl.Overlay>
                <LayersControl.Overlay name="🌡 Temperature">
                  <TileLayer url={`https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${OPEN_WEATHER_KEY}`} />
                </LayersControl.Overlay>
              </LayersControl>

              {/* Velocity Animation Layer */}
              <WindLayer apiKey={OPEN_WEATHER_KEY} />

              {/* Default CMU Marker */}
              <Marker position={[7.859, 125.0485]} icon={markerIcon}>
                <Popup>
                  <div className="font-semibold text-blue-700">CMU Campus</div>
                  <div className="text-sm">
                    {currentWeather
                      ? `🌡 ${currentWeather.temperature}°C | 💧 ${currentWeather.humidity}%`
                      : "Loading weather..."}
                  </div>
                </Popup>
              </Marker>

              {/* Other stations */}
              {stations.map((station, idx) => (
                <Marker key={idx} position={[station.lat, station.lng]} icon={markerIcon}>
                  <Popup>
                    <div className="font-semibold text-blue-700">{station.name}</div>
                    <div className="text-sm">
                      🌡 {station.temperature}°C | 💧 {station.humidity}% | 🌧 {station.rain_chance}%
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Quick Stats */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Weather Trends</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Temperature Trend</span>
                  <span className={`font-semibold ${
                    analytics.tempTrend === 'rising' ? 'text-orange-600' :
                    analytics.tempTrend === 'falling' ? 'text-blue-600' : 'text-gray-600'
                  }`}>
                    {analytics.tempTrend.charAt(0).toUpperCase() + analytics.tempTrend.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Data Collection Days</span>
                  <span className="font-semibold text-gray-900">{analytics.totalDays} days</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Active Monitoring Stations</span>
                  <span className="font-semibold text-green-600">{stations.length} stations</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Forecast Summary</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Average Rain Chance</span>
                  <span className="font-semibold text-blue-600">{analytics.forecastAvgRain}%</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Forecast Days</span>
                  <span className="font-semibold text-gray-900">{forecast.length} days</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Weather Status</span>
                  <span className={`font-semibold ${
                    analytics.forecastAvgRain > 60 ? 'text-blue-600' :
                    analytics.forecastAvgRain > 30 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {analytics.forecastAvgRain > 60 ? 'Rainy' :
                     analytics.forecastAvgRain > 30 ? 'Moderate' : 'Clear'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderHistory = () => (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Weather History</h3>
        <p className="text-sm text-gray-600">Past 7 days weather data summary</p>
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {day.min_temp.toFixed(1)}°C
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
        <div className="p-6 text-center">
          <div className="text-gray-400 text-4xl mb-4">📊</div>
          <p className="text-gray-600">Loading weather history...</p>
        </div>
      )}
    </div>
  );

  const renderForecast = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">3-Day Weather Forecast</h3>
        <p className="text-sm text-gray-600 mb-6">Upcoming weather predictions for your area</p>
        
        {forecast.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {forecast.map((day, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="text-center">
                  <p className="font-semibold text-lg text-gray-900 mb-3">
                    {formatDate(day.date)}
                  </p>
                  <div className="text-4xl mb-4">
                    {getWeatherIcon(day.max_temp, 0, day.rain_chance)}
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                      <span className="text-sm text-gray-600">Temperature</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {day.min_temp}° - {day.max_temp}°C
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                      <span className="text-sm text-gray-600">Rain Chance</span>
                      <span className="text-sm font-semibold text-gray-900">{day.rain_chance}%</span>
                    </div>
                    <div className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                      <span className="text-sm text-gray-600">Wind Speed</span>
                      <span className="text-sm font-semibold text-gray-900">{day.wind_max} m/s</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-4">🔮</div>
            <p className="text-gray-600">Loading forecast data...</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="text-3xl mr-3">🌦</div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">RainSafe</h1>
              <p className="text-xs text-gray-500">Weather Monitoring</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 flex items-center ${
              activeTab === "dashboard"
                ? "bg-blue-50 text-blue-700 border border-blue-200"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
            onClick={() => setActiveTab("dashboard")}
          >
            <span className="mr-3">📊</span>
            <span className="font-medium">Dashboard</span>
          </button>
          
          <button
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 flex items-center ${
              activeTab === "history"
                ? "bg-blue-50 text-blue-700 border border-blue-200"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
            onClick={() => setActiveTab("history")}
          >
            <span className="mr-3">📅</span>
            <span className="font-medium">Weather History</span>
          </button>
          
          <button
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 flex items-center ${
              activeTab === "forecast"
                ? "bg-blue-50 text-blue-700 border border-blue-200"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
            onClick={() => setActiveTab("forecast")}
          >
            <span className="mr-3">🔮</span>
            <span className="font-medium">Forecast</span>
          </button>
        </nav>
        
        <div className="p-4 border-t border-gray-200">
          <div className="mb-4">
            <div className="text-sm font-medium text-gray-900 mb-1">
              {localStorage.getItem("email")}
            </div>
            <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded inline-block">
              {localStorage.getItem("role")}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            <span className="mr-2">↩</span>
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                {activeTab === "dashboard" && (
                  <>
                    <span className="mr-3">📊</span>
                    Weather Dashboard
                  </>
                )}
                {activeTab === "history" && (
                  <>
                    <span className="mr-3">📅</span>
                    Weather History
                  </>
                )}
                {activeTab === "forecast" && (
                  <>
                    <span className="mr-3">🔮</span>
                    Weather Forecast
                  </>
                )}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Monitor real-time weather conditions and forecasts
              </p>
            </div>
            <div className="bg-gray-50 px-4 py-2 rounded-lg border">
              <div className="text-sm font-medium text-gray-900">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })}
              </div>
              <div className="text-xs text-gray-500">
                {new Date().toLocaleDateString("en-US", { year: "numeric" })}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}