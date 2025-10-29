import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { motion, AnimatePresence } from "framer-motion";
import L from "leaflet";
import API from "../../api/api";
import "leaflet/dist/leaflet.css";

// Fix marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export default function ReportDashboard() {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch reports from backend
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await API.get("reports/all/");
        setReports(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load reports.");
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gradient-to-b from-blue-900 to-blue-950">
        <div className="text-center animate-pulse">
          <h2 className="text-2xl font-bold mb-2">Loading Reports...</h2>
          <p className="text-white/70">Fetching reports from the database</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-400 mt-10">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 via-blue-900 to-blue-800 text-white flex flex-col">
      <header className="py-5 text-center bg-white/10 backdrop-blur-xl border-b border-white/20">
        <h1 className="text-2xl font-bold">🗺️ Reports Dashboard</h1>
        <p className="text-white/70 text-sm">View and manage all user reports</p>
      </header>

      {/* Map Section */}
      <div className="relative flex-grow">
        <MapContainer
          center={[7.859, 125.0485]}
          zoom={13}
          className="h-[70vh] w-full"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />

          {reports.map((report) => (
            <Marker
              key={report.id}
              position={[report.latitude, report.longitude]}
              eventHandlers={{
                click: () => setSelectedReport(report),
              }}
            >
              <Popup>
                <div className="font-semibold text-blue-700 text-lg mb-1">
                  {report.full_name}
                </div>
                <p className="text-sm text-gray-700">{report.description}</p>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Report Details Modal */}
        <AnimatePresence>
          {selectedReport && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 100, damping: 18 }}
              className="fixed bottom-0 left-0 right-0 bg-white/10 backdrop-blur-2xl border-t border-white/30 shadow-2xl p-6 z-50 rounded-t-3xl"
            >
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  📍 Report Details
                </h2>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-white/80 hover:text-white"
                >
                  ✖
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white/90">
                <div>
                  <p>
                    <strong>Name:</strong> {selectedReport.full_name}
                  </p>
                  <p>
                    <strong>Contact:</strong> {selectedReport.contact_number}
                  </p>
                  <p>
                    <strong>Date:</strong>{" "}
                    {new Date(selectedReport.created_at).toLocaleString()}
                  </p>
                  <p className="mt-2">
                    <strong>Description:</strong> {selectedReport.description}
                  </p>
                </div>
                <div>
                  {selectedReport.image ? (
                    <img
                      src={selectedReport.image}
                      alt="Report"
                      className="w-full h-48 object-cover rounded-lg border border-white/20"
                    />
                  ) : (
                    <div className="w-full h-48 bg-white/10 border border-white/20 rounded-lg flex items-center justify-center text-white/60">
                      No Image Provided
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Table Section */}
      <div className="p-6 bg-white/10 backdrop-blur-2xl rounded-t-3xl shadow-inner border-t border-white/20">
        <h3 className="text-lg font-bold mb-3">📋 Reports List</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="bg-white/10">
                <th className="border border-white/20 px-4 py-2 text-left">
                  Name
                </th>
                <th className="border border-white/20 px-4 py-2 text-left">
                  Description
                </th>
                <th className="border border-white/20 px-4 py-2 text-left">
                  Location
                </th>
                <th className="border border-white/20 px-4 py-2 text-left">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr
                  key={r.id}
                  className="hover:bg-white/10 cursor-pointer"
                  onClick={() => setSelectedReport(r)}
                >
                  <td className="border border-white/10 px-4 py-2">
                    {r.full_name}
                  </td>
                  <td className="border border-white/10 px-4 py-2">
                    {r.description.slice(0, 50)}...
                  </td>
                  <td className="border border-white/10 px-4 py-2">
                    {r.latitude.toFixed(4)}, {r.longitude.toFixed(4)}
                  </td>
                  <td className="border border-white/10 px-4 py-2">
                    {new Date(r.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
