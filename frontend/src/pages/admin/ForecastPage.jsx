// frontend/src/pages/ForecastPage.jsx
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { useWeather } from "../../context/WeatherContext"; // ✅ import context hook
import UserNavbar from "../../components/UserNavbar";
import sunnyImg from "../../assets/sunny.jpg";
import weatherImg from "../../assets/weather.jpg";
import API from "../../api/api";

console.log("🌅 sunnyImg:", sunnyImg);
console.log("🌧️ weatherImg:", weatherImg);

export default function ForecastPage({ forecast: forecastProp, getWeatherIcon: getWeatherIconProp, formatDate: formatDateProp }) {
  const { currentWeather } = useWeather(); // ✅ get live weather from context
  const [forecast, setForecast] = useState(forecastProp || []);
  const [loading, setLoading] = useState(!forecastProp);

  console.log("🌦️ currentWeather from context:", currentWeather);

  // Fetch forecast data if not provided via props
  useEffect(() => {
    if (!forecastProp) {
      const fetchForecast = async () => {
        try {
          setLoading(true);
          const response = await API.get("weather/forecast/");
          console.log("📊 Forecast data fetched:", response.data);
          setForecast(response.data.data || []);
        } catch (error) {
          console.error("❌ Failed to fetch forecast:", error);
          setForecast([]);
        } finally {
          setLoading(false);
        }
      };
      fetchForecast();
    }
  }, [forecastProp]);

  // Helper to safely format numbers
  const fmt = (val, suffix = "") =>
    val !== null && val !== undefined && !isNaN(val)
      ? `${parseFloat(val).toFixed(1)}${suffix}`
      : "--";

  // Default weather icon function if not provided
  const getWeatherIcon = getWeatherIconProp || ((maxTemp, minTemp, rainChance) => {
    if (rainChance > 70) return "🌧️";
    if (rainChance > 40) return "☁️";
    if (maxTemp > 30) return "☀️";
    return "🌤️";
  });

  // Default date formatter if not provided
  const formatDate = formatDateProp || ((dateString) => {
    return dayjs(dateString).format("dddd, MMM D");
  });

  // If no custom formatDate is passed, use a fallback
  const displayDate = (dateStr) => formatDate(dateStr);

  return (
    <div className="min-h-screen relative">
      {/* Navbar */}
      <UserNavbar unreadNotifications={0} />

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

          if (precipitation_probability > 60 && humidity > 80) {
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

      {/* 🌦️ Forecast Content */}
      <div className="relative z-10 p-4 md:p-8 max-w-[1800px] mx-auto">
        <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            📅 3-Day Weather Forecast
          </h3>
          <span className="text-sm text-white/70 bg-white/10 backdrop-blur-xl px-3 py-1.5 rounded-full border border-white/20">
            {forecast.length > 0 ? `${forecast.length} days ahead` : "Fetching..."}
          </span>
        </div>

        {loading ? (
          <div className="text-center py-10 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
            <div className="text-white/50 text-5xl mb-4 animate-pulse">🌥️</div>
            <h4 className="text-lg font-semibold text-white mb-2">
              Loading Forecast Data
            </h4>
            <p className="text-white/70">
              Please wait while we fetch weather predictions from Open-Meteo...
            </p>
          </div>
        ) : forecast.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {forecast.map((day, idx) => (
              <div
                key={idx}
                className="bg-white/15 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20 hover:bg-white/20 hover:shadow-2xl transition-all duration-300"
              >
                <div className="text-center mb-4">
                  <p className="font-semibold text-white mb-2 text-lg">
                    {displayDate(day.date)}
                  </p>

                  <div className="text-5xl mb-4 drop-shadow-lg">
                    {getWeatherIcon(day.max_temp, day.min_temp, day.rain_chance)}
                  </div>

                  <div className="text-3xl font-light text-white drop-shadow-md">
                    {fmt(day.min_temp, "°")} - {fmt(day.max_temp, "°C")}
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <ForecastRow label="Rain Chance" value={fmt(day.rain_chance, "%")} />
                  <ForecastRow label="Wind Speed" value={fmt(day.wind_max, " m/s")} />
                  <ForecastRow label="Max Temperature" value={fmt(day.max_temp, "°C")} />
                  <ForecastRow label="Min Temperature" value={fmt(day.min_temp, "°C")} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
            <div className="text-white/50 text-5xl mb-4">🌥️</div>
            <h4 className="text-lg font-semibold text-white mb-2">
              No Forecast Data Available
            </h4>
            <p className="text-white/70">
              Unable to load weather forecast. Please try again later.
            </p>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

// Small reusable row component for forecast metrics
function ForecastRow({ label, value }) {
  return (
    <div className="flex justify-between items-center bg-white/20 backdrop-blur-xl rounded-lg px-3 py-2 border border-white/10 shadow-md">
      <span className="text-white/80">{label}</span>
      <span className="font-semibold text-white">{value}</span>
    </div>
  );
}
