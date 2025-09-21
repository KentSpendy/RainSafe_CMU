// frontend/src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

// React-Leaflet imports
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

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
  default: "🌤️"
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [currentWeather, setCurrentWeather] = useState(null);
  const [history, setHistory] = useState([]);
  const [forecast, setForecast] = useState([]);
  const [stations, setStations] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");

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

  // Fetch weather stations (multi-location support)
  useEffect(() => {
    const fetchStations = async () => {
      try {
        const res = await API.get("weather/stations/");
        setStations(res.data.data);
      } catch (err) {
        console.error("Failed to fetch stations:", err);
      }
    };
    fetchStations();
  }, []);

  // Logout handler
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Get weather icon based on conditions
  const getWeatherIcon = (temp, humidity, rainChance) => {
    if (rainChance > 70) return weatherIcons.rainy;
    if (rainChance > 40) return weatherIcons.cloudy;
    if (temp > 30) return weatherIcons.sunny;
    return weatherIcons.default;
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-blue-700 to-blue-800 text-white flex flex-col p-6 shadow-xl">
        <div className="flex items-center mb-10">
          <div className="text-3xl mr-2">🌦</div>
          <h1 className="text-2xl font-bold">RainSafe</h1>
        </div>
        <nav className="space-y-2 flex-1">
          <button 
            className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === "dashboard" ? "bg-white/20 backdrop-blur-sm" : "hover:bg-blue-600/50"}`}
            onClick={() => setActiveTab("dashboard")}
          >
            📊 Dashboard
          </button>
          <button 
            className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === "history" ? "bg-white/20 backdrop-blur-sm" : "hover:bg-blue-600/50"}`}
            onClick={() => setActiveTab("history")}
          >
            📅 Weather History
          </button>
          <button 
            className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === "forecast" ? "bg-white/20 backdrop-blur-sm" : "hover:bg-blue-600/50"}`}
            onClick={() => setActiveTab("forecast")}
          >
            🔮 Forecast
          </button>
        </nav>
        <div className="mt-8 pt-6 border-t border-blue-500/30">
          <div className="text-sm text-blue-200 mb-2">{localStorage.getItem("email")}</div>
          <div className="text-xs text-blue-300 mb-4">({localStorage.getItem("role")})</div>
          <button 
            onClick={handleLogout} 
            className="w-full bg-red-500 hover:bg-red-600 px-4 py-3 rounded-xl transition-colors duration-200 flex items-center justify-center"
          >
            <span className="mr-2">↩</span> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        {/* Top Navbar */}
        <header className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 flex items-center">
            {activeTab === "dashboard" && "📊 Weather Dashboard"}
            {activeTab === "history" && "📅 Weather History"}
            {activeTab === "forecast" && "🔮 Weather Forecast"}
          </h2>
          <div className="text-gray-600 bg-white/80 px-4 py-2 rounded-full shadow-sm">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </header>

        {/* Current Weather */}
        <section className="mb-10">
          <h3 className="text-xl font-semibold mb-6 text-gray-700 flex items-center">
            <span className="mr-2">🌡️</span> Current Weather
          </h3>
          {currentWeather ? (
            <div className="bg-gradient-to-r from-blue-100 to-cyan-100 p-6 rounded-2xl shadow-md border border-white mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center mb-4">
                    <span className="text-4xl mr-3">
                      {getWeatherIcon(currentWeather.temperature, currentWeather.humidity, currentWeather.precipitation_probability)}
                    </span>
                    <div>
                      <h4 className="text-2xl font-bold text-gray-800">{currentWeather.location}</h4>
                      <p className="text-gray-600">{new Date(currentWeather.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/70 p-3 rounded-xl shadow-sm">
                      <p className="text-gray-500 text-sm">Temperature</p>
                      <p className="text-2xl font-bold text-gray-800">{currentWeather.temperature}°C</p>
                    </div>
                    <div className="bg-white/70 p-3 rounded-xl shadow-sm">
                      <p className="text-gray-500 text-sm">Humidity</p>
                      <p className="text-2xl font-bold text-gray-800">{currentWeather.humidity}%</p>
                    </div>
                    <div className="bg-white/70 p-3 rounded-xl shadow-sm">
                      <p className="text-gray-500 text-sm">Rain Chance</p>
                      <p className="text-2xl font-bold text-gray-800">{currentWeather.precipitation_probability}%</p>
                    </div>
                    <div className="bg-white/70 p-3 rounded-xl shadow-sm">
                      <p className="text-gray-500 text-sm">Wind Speed</p>
                      <p className="text-2xl font-bold text-gray-800">{currentWeather.wind_speed} m/s</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
              <p className="text-gray-600">Loading current weather...</p>
            </div>
          )}

          {/* Map with Multiple Stations */}
          <div className="h-96 w-full rounded-2xl shadow-md overflow-hidden border border-white">
            <MapContainer
              center={[7.8590, 125.0485]} // CMU default
              zoom={16}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
              />

              {/* Default CMU marker */}
              <Marker position={[7.8590, 125.0485]} icon={markerIcon}>
                <Popup className="rounded-xl">
                  <div className="font-semibold text-blue-700">CMU Campus</div>
                  <div className="text-sm">
                    {currentWeather
                      ? `🌡 ${currentWeather.temperature}°C | 💧 ${currentWeather.humidity}%`
                      : "Loading weather..."}
                  </div>
                </Popup>
              </Marker>

              {/* Dynamically load markers from backend */}
              {stations.map((station, idx) => (
                <Marker key={idx} position={[station.lat, station.lng]} icon={markerIcon}>
                  <Popup className="rounded-xl">
                    <div className="font-semibold text-blue-700">{station.name}</div>
                    <div className="text-sm">
                      🌡 {station.temperature}°C | 💧 {station.humidity}% | 🌧 {station.rain_chance}%
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </section>

        {/* Weather History */}
        <section className="mb-10">
          <h3 className="text-xl font-semibold mb-6 text-gray-700 flex items-center">
            <span className="mr-2">📊</span> Past 7-Day Weather
          </h3>
          {history.length > 0 ? (
            <div className="overflow-x-auto rounded-2xl shadow-md">
              <table className="w-full bg-white rounded-2xl overflow-hidden">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-500 to-blue-600 text-left text-white">
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Avg Temp</th>
                    <th className="px-6 py-4 font-medium">Min Temp</th>
                    <th className="px-6 py-4 font-medium">Max Temp</th>
                    <th className="px-6 py-4 font-medium">Avg Humidity</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((day, idx) => (
                    <tr key={idx} className={`border-t border-gray-100 ${idx % 2 === 0 ? 'bg-blue-50' : 'bg-white'}`}>
                      <td className="px-6 py-4 font-medium">{day.timestamp__date}</td>
                      <td className="px-6 py-4">{day.avg_temp.toFixed(1)}°C</td>
                      <td className="px-6 py-4">{day.min_temp.toFixed(1)}°C</td>
                      <td className="px-6 py-4">{day.max_temp.toFixed(1)}°C</td>
                      <td className="px-6 py-4">{day.avg_humidity.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
              <p className="text-gray-600">Loading weather history...</p>
            </div>
          )}
        </section>

        {/* Weather Forecast */}
        <section>
          <h3 className="text-xl font-semibold mb-6 text-gray-700 flex items-center">
            <span className="mr-2">🔮</span> 3-Day Forecast
          </h3>
          {forecast.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {forecast.map((day, idx) => (
                <div key={idx} className="bg-gradient-to-b from-blue-100 to-white p-6 rounded-2xl shadow-md border border-white text-center transition-transform duration-200 hover:translate-y-1">
                  <p className="font-bold text-lg text-blue-800 mb-3">{formatDate(day.date)}</p>
                  <div className="text-4xl mb-4">
                    {getWeatherIcon(day.max_temp, 0, day.rain_chance)}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center bg-white/80 p-2 rounded-lg">
                      <span className="text-gray-600">Temperature</span>
                      <span className="font-semibold text-gray-800">{day.min_temp}° - {day.max_temp}°</span>
                    </div>
                    <div className="flex justify-between items-center bg-white/80 p-2 rounded-lg">
                      <span className="text-gray-600">Rain Chance</span>
                      <span className="font-semibold text-gray-800">{day.rain_chance}%</span>
                    </div>
                    <div className="flex justify-between items-center bg-white/80 p-2 rounded-lg">
                      <span className="text-gray-600">Wind</span>
                      <span className="font-semibold text-gray-800">{day.wind_max} m/s</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
              <p className="text-gray-600">Loading forecast...</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}