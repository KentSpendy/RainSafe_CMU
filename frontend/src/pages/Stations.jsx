// frontend/src/pages/Stations.jsx
import { useEffect, useState } from "react";
import API from "../api/api";
import dayjs from "dayjs";
import { useWeather } from "../context/WeatherContext"; // ✅ import context hook
import sunnyImg from "../assets/sunny.jpg";
import weatherImg from "../assets/weather.jpg";

export default function Stations() {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newStation, setNewStation] = useState({
    name: "",
    latitude: "",
    longitude: "",
    elevation: "",
    description: "",
  });

  // Fetch stations on mount
  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await API.get("weather/stations/");
      setStations(res.data || []);
    } catch (err) {
      console.error("❌ Failed to fetch stations:", err);
      setError("Failed to load stations. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddStation = async (e) => {
    e.preventDefault();
    setError("");

    // ✅ Validation
    if (!newStation.name || !newStation.latitude || !newStation.longitude) {
      setError("Please fill in name, latitude, and longitude.");
      return;
    }

    try {
      const payload = {
        name: newStation.name.trim(),
        latitude: parseFloat(newStation.latitude),
        longitude: parseFloat(newStation.longitude),
        elevation: newStation.elevation
          ? parseFloat(newStation.elevation)
          : null,
        description: newStation.description || "",
      };

      const res = await API.post("weather/stations/", payload);
      setStations((prev) => [...prev, res.data]);
      setNewStation({
        name: "",
        latitude: "",
        longitude: "",
        elevation: "",
        description: "",
      });
    } catch (err) {
      console.error("❌ Failed to add station:", err.response?.data || err);
      setError("Error adding station. Check the fields or try again.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this station?")) return;
    try {
      await API.delete(`weather/stations/${id}/`);
      setStations((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error("❌ Failed to delete station:", err);
      setError("Error deleting station. Please try again.");
    }
  };

  const formatValue = (val, unit = "") =>
    val !== null && val !== undefined && val !== "" ? `${val}${unit}` : "—";


  const { currentWeather } = useWeather(); // ✅ get live weather from context
    console.log("🌦️ currentWeather from context:", currentWeather);
  
    // Helper to safely format numbers
    const fmt = (val, suffix = "") =>
      val !== null && val !== undefined && !isNaN(val)
        ? `${parseFloat(val).toFixed(1)}${suffix}`
        : "--";
  
    // If no custom formatDate is passed, use a fallback
    const displayDate = (dateStr) =>
      formatDate ? formatDate(dateStr) : dayjs(dateStr).format("dddd, MMM D");

  return (
    <div className="min-h-screen p-4 md:p-6 space-y-6">
      {/* 🌤️ CONDITIONAL WEATHER BACKGROUND */}
            <div className="fixed inset-0 z-0">
              {(() => {
                if (!currentWeather) {
                  console.log("🕒 No weather data yet → default background");
                  return <img src={weatherImg} alt="Default weather" className="w-full h-full object-cover" />;
                }
      
                const { precipitation_probability, humidity, temperature } = currentWeather;
      
                console.log("🌡️ Checking:", { precipitation_probability, humidity, temperature });
      
                let background = weatherImg;
                let mode = "🌧️ CLOUDY MODE";
      
                if (precipitation_probability <= 60 && temperature >= 23) {
                  console.log("☀️ SUNNY MODE selected");
                  background = sunnyImg;
                  mode = "☀️ SUNNY MODE";
                } else {
                  console.log("🌧️ CLOUDY MODE selected");
                }
      
                return (
                  <>
                    <img
                      src={background}
                      alt="Weather background"
                      className="w-full h-full object-cover transition-all duration-500"
                    />
                    {/* 🌈 Overlay + mode label */}
                    <div className="absolute top-4 left-4 z-50 bg-black/50 text-white px-3 py-1 rounded-lg">
                      {mode}
                    </div>
                  </>
                );
              })()}
      
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
            </div>


      
      <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-6 border border-white/20 shadow-2xl">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2 text-white">
          📍 Weather Stations
        </h1>
        <p className="text-white/80 mb-4">
          Manage your registered weather monitoring stations.
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-500/20 backdrop-blur-xl border border-red-400/30 text-white px-4 py-3 rounded-xl mb-4 shadow-lg">
          ⚠️ {error}
        </div>
      )}

      {/* Add Station Form */}
      <form
        onSubmit={handleAddStation}
        className="bg-white/10 backdrop-blur-2xl p-6 rounded-2xl shadow-2xl border border-white/20"
      >
        <h2 className="font-semibold mb-4 text-white text-lg">Add New Station</h2>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <input
            type="text"
            placeholder="Station Name"
            value={newStation.name}
            onChange={(e) =>
              setNewStation({ ...newStation, name: e.target.value })
            }
            className="bg-white/10 backdrop-blur-xl border border-white/30 text-white placeholder-white/50 rounded-lg p-2 focus:ring-2 focus:ring-white/50 focus:border-white/50 outline-none"
            required
          />
          <input
            type="number"
            step="0.0001"
            placeholder="Latitude"
            value={newStation.latitude}
            onChange={(e) =>
              setNewStation({ ...newStation, latitude: e.target.value })
            }
            className="bg-white/10 backdrop-blur-xl border border-white/30 text-white placeholder-white/50 rounded-lg p-2 focus:ring-2 focus:ring-white/50 focus:border-white/50 outline-none"
            required
          />
          <input
            type="number"
            step="0.0001"
            placeholder="Longitude"
            value={newStation.longitude}
            onChange={(e) =>
              setNewStation({ ...newStation, longitude: e.target.value })
            }
            className="bg-white/10 backdrop-blur-xl border border-white/30 text-white placeholder-white/50 rounded-lg p-2 focus:ring-2 focus:ring-white/50 focus:border-white/50 outline-none"
            required
          />
          <input
            type="number"
            step="0.1"
            placeholder="Elevation (m)"
            value={newStation.elevation}
            onChange={(e) =>
              setNewStation({ ...newStation, elevation: e.target.value })
            }
            className="bg-white/10 backdrop-blur-xl border border-white/30 text-white placeholder-white/50 rounded-lg p-2 focus:ring-2 focus:ring-white/50 focus:border-white/50 outline-none"
          />
          <input
            type="text"
            placeholder="Description"
            value={newStation.description}
            onChange={(e) =>
              setNewStation({ ...newStation, description: e.target.value })
            }
            className="bg-white/10 backdrop-blur-xl border border-white/30 text-white placeholder-white/50 rounded-lg p-2 md:col-span-2 focus:ring-2 focus:ring-white/50 focus:border-white/50 outline-none"
          />
          <button
            type="submit"
            className="bg-green-500/30 backdrop-blur-xl border border-green-400/30 text-white px-4 py-2 rounded-lg hover:bg-green-500/50 transition shadow-lg col-span-1 md:col-span-1 font-semibold"
          >
            ➕ Add
          </button>
        </div>
      </form>

      {/* Stations Table */}
      <div className="bg-white/10 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-white/70 animate-pulse">
            Loading stations...
          </div>
        ) : stations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/10 backdrop-blur-xl text-white">
                <tr>
                  {[
                    "Name",
                    "Lat",
                    "Lon",
                    "Elevation",
                    "Description",
                    "🌡 Temp",
                    "💧 Humidity",
                    "🌧 Rain",
                    "💨 Wind",
                    "🕒 Updated",
                    "Actions",
                  ].map((h) => (
                    <th key={h} className="px-4 py-3 text-left whitespace-nowrap font-semibold text-white/90">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white/5 backdrop-blur-xl divide-y divide-white/10">
                {stations.map((s) => (
                  <tr key={s.id} className="hover:bg-white/10 transition-all duration-200">
                    <td className="px-4 py-3 font-semibold text-white">{s.name}</td>
                    <td className="px-4 py-3 text-white/80">{formatValue(s.latitude)}</td>
                    <td className="px-4 py-3 text-white/80">{formatValue(s.longitude)}</td>
                    <td className="px-4 py-3 text-white/80">
                      {formatValue(s.elevation, " m")}
                    </td>
                    <td className="px-4 py-3 text-white/70">
                      {s.description || "—"}
                    </td>
                    <td className="px-4 py-3 text-white/90">{formatValue(s.temperature, "°C")}</td>
                    <td className="px-4 py-3 text-white/90">{formatValue(s.humidity, "%")}</td>
                    <td className="px-4 py-3 text-white/90">{formatValue(s.rain_chance, "%")}</td>
                    <td className="px-4 py-3 text-white/90">{formatValue(s.wind_speed, " km/h")}</td>
                    <td className="px-4 py-3 text-white/80 text-xs">
                      {s.last_updated
                        ? new Date(s.last_updated).toLocaleString()
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="text-red-300 hover:text-red-100 font-medium bg-red-500/20 backdrop-blur-xl px-3 py-1 rounded-lg border border-red-400/30 hover:bg-red-500/30 transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-white/70 bg-white/5 backdrop-blur-xl">
            No stations found.
          </div>
        )}
      </div>
    </div>
  );
}