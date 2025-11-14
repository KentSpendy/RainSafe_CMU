import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowUp, FaArrowRight } from "react-icons/fa";
import api from "../../api/api";
import UserNavbar from "../../components/UserNavbar";
import weatherImg from "../../assets/weather.jpg";
import sunnyImg from "../../assets/sunny.jpg";

function UserDashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    reportCount: 0,
    unreadCount: 0,
    weather: null,
  });
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentWeather, setCurrentWeather] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
    loadWeatherData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all dashboard data in parallel
      const [userRes, reportsRes, notificationsRes] = await Promise.all([
        api.get("/users/me/"),
        api.get("/reports/my-reports/"),
        api.get("/notifications/"),
      ]);

      setUser(userRes.data);
      setRecentReports(reportsRes.data.slice(0, 5));

      const unreadCount = notificationsRes.data.filter(
        (n) => !n.is_read
      ).length;

      setStats({
        reportCount: reportsRes.data.length,
        unreadCount: unreadCount,
        weather: null,
      });
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadWeatherData = async () => {
    try {
      // CMU coordinates
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
      {/* Navbar */}
      <UserNavbar unreadNotifications={stats.unreadCount} />

      {/* Dynamic Background with Weather */}
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

      {/* Main Content */}
      <div className="relative z-10 min-h-screen p-8 max-w-[2000px] mx-auto">
        {/* Welcome Section */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}>
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

        {/* Stats Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}>
          {/* Weather Card */}
          <GlassStatCard
            icon={
              currentWeather
                ? getWeatherIcon(
                    currentWeather.temperature,
                    currentWeather.humidity,
                    currentWeather.precipitation_probability
                  )
                : "🌤️"
            }
            label="Current Weather"
            value={
              currentWeather ? `${currentWeather.temperature}°C` : "Loading..."
            }
            subtitle={
              currentWeather
                ? `Humidity: ${currentWeather.humidity}%`
                : "Fetching data..."
            }
            trend="normal"
            onClick={() => navigate("/forecast")}
          />

          {/* Reports Card */}
          <GlassStatCard
            icon="📝"
            label="My Reports"
            value={stats.reportCount}
            subtitle="Total Submitted"
            trend="up"
            onClick={() => navigate("/user/my-reports")}
          />

          {/* Notifications Card */}
          <GlassStatCard
            icon="🔔"
            label="Notifications"
            value={stats.unreadCount}
            subtitle="Unread Messages"
            trend={stats.unreadCount > 0 ? "up" : "normal"}
            onClick={() => navigate("/notifications")}
            highlight={stats.unreadCount > 0}
          />

          {/* Quick Report Card */}
          <GlassStatCard
            icon="⚡"
            label="Quick Report"
            value="Submit"
            subtitle="Report an incident"
            trend="up"
            onClick={() => navigate("/report")}
            highlight={true}
          />
        </motion.div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          {/* Left Column - Weather Details */}
          <div className="xl:col-span-1 space-y-6">
            {/* Weather Details Card */}
            {currentWeather && (
              <motion.div
                className="bg-white/10 backdrop-blur-2xl rounded-3xl p-6 border border-white/20 shadow-2xl relative overflow-hidden"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}>
                <div className="absolute right-0 top-10 text-8xl opacity-10">
                  {getWeatherIcon(
                    currentWeather.temperature,
                    currentWeather.humidity,
                    currentWeather.precipitation_probability
                  )}
                </div>

                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                  Weather Conditions
                </h3>

                <div className="space-y-4 relative z-10">
                  <WeatherDetailItem
                    icon="🌡️"
                    label="Temperature"
                    value={`${currentWeather.temperature}°C`}
                  />
                  <WeatherDetailItem
                    icon="💧"
                    label="Humidity"
                    value={`${currentWeather.humidity}%`}
                  />
                  <WeatherDetailItem
                    icon="💨"
                    label="Wind Speed"
                    value={`${currentWeather.wind_speed} km/h`}
                  />
                  <WeatherDetailItem
                    icon="🌧️"
                    label="Rain Chance"
                    value={`${currentWeather.precipitation_probability || 0}%`}
                  />
                </div>

                <div className="mt-4 p-3 bg-white/5 rounded-xl border border-white/10">
                  <p className="text-white/80 text-sm leading-relaxed">
                    {currentWeather.temperature > 30
                      ? "It's quite hot today. Stay hydrated! ☀️"
                      : currentWeather.precipitation_probability > 60
                      ? "Rain is likely today. Don't forget your umbrella! ☔"
                      : "Weather looks pleasant today! 🌤️"}
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column - Recent Reports */}
          <motion.div
            className="xl:col-span-2 bg-white/10 backdrop-blur-2xl rounded-3xl p-6 border border-white/20 shadow-2xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                Recent Reports
              </h3>
              <Link
                to="/user/my-reports"
                className="px-4 py-2 bg-white/20 backdrop-blur-xl text-white rounded-xl hover:bg-white/30 transition-all duration-300 border border-white/30 font-medium text-sm flex items-center gap-2">
                View All <FaArrowRight className="text-xs" />
              </Link>
            </div>

            {recentReports.length === 0 ? (
              <motion.div
                className="text-center py-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}>
                <div className="text-6xl mb-4">📝</div>
                <p className="text-white/70 text-lg mb-6">
                  No reports submitted yet
                </p>
                <Link
                  to="/report"
                  className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 font-medium shadow-lg">
                  Submit Your First Report
                </Link>
              </motion.div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence>
                  {recentReports.map((report, index) => (
                    <motion.div
                      key={report.id}
                      className="bg-white/10 backdrop-blur-xl rounded-2xl p-5 border border-white/20 hover:bg-white/15 transition-all duration-300 cursor-pointer group"
                      onClick={() => navigate(`/user/reports/${report.id}`)}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, x: 5 }}>
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
                          }`}>
                          {report.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-white/60">
                        <span className="flex items-center gap-1">
                          📅{" "}
                          {new Date(report.date_created).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </span>
                        <span className="flex items-center gap-1 text-cyan-300 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                          View Details <FaArrowRight />
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function GlassStatCard({
  icon,
  label,
  value,
  subtitle,
  trend,
  onClick,
  highlight,
}) {
  const trendIcons = {
    up: <FaArrowUp className="text-green-400" />,
    down: "↘️",
    normal: <FaArrowRight className="text-white/60" />,
  };

  return (
    <motion.div
      className={`bg-white/10 backdrop-blur-2xl rounded-2xl p-6 border shadow-xl cursor-pointer transition-all duration-300 group ${
        highlight
          ? "border-cyan-400/50 hover:border-cyan-400"
          : "border-white/20 hover:border-white/30"
      }`}
      onClick={onClick}
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-4xl group-hover:scale-110 transition-transform">
          {icon}
        </span>
        <span className="text-sm">{trendIcons[trend]}</span>
      </div>
      <div className="text-sm text-white/70 mb-1">{label}</div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-xs text-white/60">{subtitle}</div>
    </motion.div>
  );
}

function WeatherDetailItem({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between bg-white/5 rounded-xl p-3 border border-white/10">
      <span className="flex items-center gap-3 text-white/80">
        <span className="text-2xl">{icon}</span>
        <span className="font-medium">{label}</span>
      </span>
      <span className="text-white font-bold text-lg">{value}</span>
    </div>
  );
}

export default UserDashboard;
