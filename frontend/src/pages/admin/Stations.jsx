import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Plus, Trash2, Thermometer, Droplets, Cloud, Wind, Clock, AlertCircle, Loader2 } from "lucide-react";

// Mock imports for demo - replace with your actual imports
const dayjs = (date) => ({
  format: (fmt) => new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
});
const useWeather = () => ({ currentWeather: { precipitation_probability: 30, humidity: 65, temperature: 25 } });
const API = {
  get: async () => ({ data: [] }),
  post: async (url, data) => ({ data: { id: Date.now(), ...data } }),
  delete: async () => ({})
};
const sunnyImg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%2387CEEB' width='100' height='100'/%3E%3C/svg%3E";
const weatherImg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%232C3E50' width='100' height='100'/%3E%3C/svg%3E";

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

  const { currentWeather } = useWeather();

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

    if (!newStation.name || !newStation.latitude || !newStation.longitude) {
      setError("Please fill in name, latitude, and longitude.");
      return;
    }

    try {
      const payload = {
        name: newStation.name.trim(),
        latitude: parseFloat(newStation.latitude),
        longitude: parseFloat(newStation.longitude),
        elevation: newStation.elevation ? parseFloat(newStation.elevation) : null,
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

  const getBackground = () => {
    if (!currentWeather) return weatherImg;
    const { precipitation_probability, humidity } = currentWeather;
    if (precipitation_probability > 60 && humidity > 80) {
      return sunnyImg;
    }
    return weatherImg;
  };

  return (
    <div className="min-h-screen w-full bg-slate-900">
      {/* Dark gradient background - full coverage */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900"></div>

      {/* Background Image Layer */}
      <div className="fixed inset-0">
        <img
          src={getBackground()}
          alt="Weather background"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-blue-900/85 to-slate-900/90" />
      </div>

      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Content Wrapper */}
      <div className="relative z-10 min-h-screen p-4 md:p-6 space-y-6">
        {/* Header */}
        <motion.div
          className="bg-white/5 backdrop-blur-2xl rounded-3xl p-6 border border-white/10 shadow-2xl"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl border border-blue-400/30">
              <MapPin className="w-6 h-6 text-blue-300" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Weather Stations
            </h1>
          </div>
          <p className="text-slate-400 ml-14">
            Manage your registered weather monitoring stations
          </p>
        </motion.div>

        {/* Error message */}
        {error && (
          <motion.div
            className="bg-red-500/20 backdrop-blur-xl border border-red-400/30 text-white px-4 py-3 rounded-2xl shadow-lg flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Add Station Form */}
        <motion.form
          onSubmit={handleAddStation}
          className="bg-white/5 backdrop-blur-2xl p-6 rounded-3xl shadow-2xl border border-white/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h2 className="font-semibold mb-4 text-white text-lg flex items-center gap-2">
            <Plus className="w-5 h-5 text-green-400" />
            Add New Station
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            <input
              type="text"
              placeholder="Station Name"
              value={newStation.name}
              onChange={(e) =>
                setNewStation({ ...newStation, name: e.target.value })
              }
              className="bg-white/10 backdrop-blur-xl border border-white/20 text-white placeholder-slate-400 rounded-xl p-3 focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 outline-none transition-all"
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
              className="bg-white/10 backdrop-blur-xl border border-white/20 text-white placeholder-slate-400 rounded-xl p-3 focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 outline-none transition-all"
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
              className="bg-white/10 backdrop-blur-xl border border-white/20 text-white placeholder-slate-400 rounded-xl p-3 focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 outline-none transition-all"
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
              className="bg-white/10 backdrop-blur-xl border border-white/20 text-white placeholder-slate-400 rounded-xl p-3 focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 outline-none transition-all"
            />
            <input
              type="text"
              placeholder="Description"
              value={newStation.description}
              onChange={(e) =>
                setNewStation({ ...newStation, description: e.target.value })
              }
              className="bg-white/10 backdrop-blur-xl border border-white/20 text-white placeholder-slate-400 rounded-xl p-3 sm:col-span-2 lg:col-span-1 focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 outline-none transition-all"
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-green-500/30 to-emerald-500/30 backdrop-blur-xl border border-green-400/30 text-white px-4 py-3 rounded-xl hover:from-green-500/40 hover:to-emerald-500/40 transition-all shadow-lg font-semibold flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Add Station
            </button>
          </div>
        </motion.form>

        {/* Stations Table/Cards */}
        <motion.div
          className="bg-white/5 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-12 h-12 mx-auto mb-4 text-blue-400 animate-spin" />
              <p className="text-white/70">Loading stations...</p>
            </div>
          ) : stations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white/10 backdrop-blur-xl border-b border-white/10">
                  <tr>
                    {[
                      { label: "Name", icon: <MapPin className="w-4 h-4" /> },
                      { label: "Latitude" },
                      { label: "Longitude" },
                      { label: "Elevation" },
                      { label: "Description" },
                      { label: "Temp", icon: <Thermometer className="w-4 h-4" /> },
                      { label: "Humidity", icon: <Droplets className="w-4 h-4" /> },
                      { label: "Rain", icon: <Cloud className="w-4 h-4" /> },
                      { label: "Wind", icon: <Wind className="w-4 h-4" /> },
                      { label: "Updated", icon: <Clock className="w-4 h-4" /> },
                      { label: "Actions" },
                    ].map((h) => (
                      <th key={h.label} className="px-4 py-4 text-left whitespace-nowrap font-semibold text-white/90">
                        <div className="flex items-center gap-2">
                          {h.icon && <span className="text-blue-300">{h.icon}</span>}
                          {h.label}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {stations.map((s, index) => (
                    <motion.tr
                      key={s.id}
                      className="hover:bg-white/10 transition-all duration-200"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <td className="px-4 py-4 font-semibold text-white">{s.name}</td>
                      <td className="px-4 py-4 text-slate-300">{formatValue(s.latitude)}</td>
                      <td className="px-4 py-4 text-slate-300">{formatValue(s.longitude)}</td>
                      <td className="px-4 py-4 text-slate-300">
                        {formatValue(s.elevation, " m")}
                      </td>
                      <td className="px-4 py-4 text-slate-400 max-w-xs truncate">
                        {s.description || "—"}
                      </td>
                      <td className="px-4 py-4 text-white">{formatValue(s.temperature, "°C")}</td>
                      <td className="px-4 py-4 text-white">{formatValue(s.humidity, "%")}</td>
                      <td className="px-4 py-4 text-white">{formatValue(s.rain_chance, "%")}</td>
                      <td className="px-4 py-4 text-white">{formatValue(s.wind_speed, " km/h")}</td>
                      <td className="px-4 py-4 text-slate-400 text-xs whitespace-nowrap">
                        {s.last_updated
                          ? new Date(s.last_updated).toLocaleString()
                          : "—"}
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="text-red-300 hover:text-red-100 font-medium bg-red-500/20 backdrop-blur-xl px-3 py-2 rounded-xl border border-red-400/30 hover:bg-red-500/30 transition-all flex items-center gap-2 hover:scale-105 active:scale-95"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <MapPin className="w-16 h-16 mx-auto mb-4 text-slate-500" />
              <h3 className="text-lg font-semibold text-white mb-2">No Stations Found</h3>
              <p className="text-slate-400">Add your first weather monitoring station to get started.</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}