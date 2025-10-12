// frontend/src/pages/ForecastPage.jsx
import dayjs from "dayjs";

export default function ForecastPage({ forecast = [], getWeatherIcon, formatDate }) {
  // Helper to safely format numbers
  const fmt = (val, suffix = "") =>
    val !== null && val !== undefined && !isNaN(val)
      ? `${parseFloat(val).toFixed(1)}${suffix}`
      : "--";

  // If no custom formatDate is passed, use a fallback
  const displayDate = (dateStr) =>
    formatDate ? formatDate(dateStr) : dayjs(dateStr).format("dddd, MMM D");

  return (
    <div className="space-y-6 p-4 md:p-6">
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
      <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            📅 3-Day Weather Forecast
          </h3>
          <span className="text-sm text-white/70 bg-white/10 backdrop-blur-xl px-3 py-1.5 rounded-full border border-white/20">
            {forecast.length > 0 ? `${forecast.length} days ahead` : "Fetching..."}
          </span>
        </div>

        {forecast.length > 0 ? (
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
                    {getWeatherIcon
                      ? getWeatherIcon(day.max_temp, day.min_temp, day.rain_chance)
                      : "🌤️"}
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
            <div className="text-white/50 text-5xl mb-4 animate-pulse">🌥️</div>
            <h4 className="text-lg font-semibold text-white mb-2">
              Loading Forecast Data
            </h4>
            <p className="text-white/70">
              Please wait while we fetch weather predictions from Open-Meteo...
            </p>
          </div>
        )}
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