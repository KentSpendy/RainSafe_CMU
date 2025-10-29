// frontend/src/pages/HistoryPage.jsx
import dayjs from "dayjs";

export default function HistoryPage({ history = [], analytics }) {
  // Sort history by date descending (most recent first)
  const sortedHistory = [...history].sort(
    (a, b) => new Date(b.timestamp__date) - new Date(a.timestamp__date)
  );

  // Helper for safely formatting numbers
  const fmt = (value, suffix = "") =>
    value !== null && value !== undefined && !isNaN(value)
      ? `${parseFloat(value).toFixed(1)}${suffix}`
      : "--";

  return (
    <div className="space-y-6">
      {/* ====== Analytics Section ====== */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "7-Day Avg Temp", value: fmt(analytics.avgTemp, "°C"), icon: "🌡️" },
            { label: "Avg Humidity", value: fmt(analytics.avgHumidity, "%"), icon: "💧" },
            {
              label: "Temp Range",
              value: `${fmt(analytics.minTemp, "°")} - ${fmt(analytics.maxTemp, "°")}`,
              icon: "📊",
            },
            { label: "Rain Forecast", value: fmt(analytics.forecastAvgRain, "%"), icon: "🌧️" },
          ].map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition"
            >
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

      {/* ====== History Table ====== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">📆 Weather Histor</h3>
          <span className="text-sm text-gray-500">
            Showing last {sortedHistory.length} day{sortedHistory.length !== 1 ? "s" : ""}
          </span>
        </div>

        {sortedHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {["Date", "Avg Temp", "Min Temp", "Max Temp", "Avg Humidity"].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedHistory.map((day, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-3 font-medium text-gray-900">
                      {dayjs(day.timestamp__date).format("MMM D, YYYY")}
                    </td>
                    <td className="px-6 py-3">{fmt(day.avg_temp, "°C")}</td>
                    <td className="px-6 py-3 text-blue-600">{fmt(day.min_temp, "°C")}</td>
                    <td className="px-6 py-3 text-red-600">{fmt(day.max_temp, "°C")}</td>
                    <td className="px-6 py-3">{fmt(day.avg_humidity, "%")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          // ====== Loading / Empty State ======
          <div className="p-8 text-center">
            <div className="text-gray-300 text-4xl mb-4 animate-pulse">📊</div>
            <h4 className="text-lg font-semibold text-gray-600 mb-2">
              No Weather History Found
            </h4>
            <p className="text-gray-500">
              Try fetching new weather data from the dashboard to populate your records.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
