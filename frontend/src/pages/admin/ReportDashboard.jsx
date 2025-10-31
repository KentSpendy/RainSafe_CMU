import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, X, MapPin, Phone, Calendar, FileText, CheckCircle, AlertCircle } from "lucide-react";
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
  const [isTableExpanded, setIsTableExpanded] = useState(false);
  const [toast, setToast] = useState(null);

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-blue-600 text-5xl mb-4 animate-pulse">🗺️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Reports...</h2>
          <p className="text-gray-500">Fetching reports from the database</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  const handleStatusUpdate = async (id, status) => {
    try {
      await API.patch(`reports/${id}/update_status/`, { status });
      setReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );
      showToast(`Status updated to ${status}`, "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to update status", "error");
    }
  };

  // Toast notification function
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Calculate analytics
  const pendingCount = reports.filter(r => r.status === "Pending").length;
  const inProgressCount = reports.filter(r => r.status === "In Progress").length;
  const resolvedCount = reports.filter(r => r.status === "Resolved").length;

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 z-[9999] flex items-center gap-3 bg-white rounded-xl shadow-lg border border-gray-200 px-4 py-3 min-w-[300px]"
          >
            {toast.type === "success" ? (
              <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
            ) : (
              <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
            )}
            <span className="text-gray-900 font-medium">{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-auto text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clean Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm px-6 py-4 z-20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reports Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">
              View and manage all user reports on the map
            </p>
          </div>
          
          {/* Quick Stats */}
          <div className="hidden md:flex items-center gap-4">
            <div className="text-center px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-xs text-gray-500 mb-1">Pending</div>
              <div className="text-lg font-semibold text-orange-600">{pendingCount}</div>
            </div>
            <div className="text-center px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-xs text-gray-500 mb-1">In Progress</div>
              <div className="text-lg font-semibold text-blue-600">{inProgressCount}</div>
            </div>
            <div className="text-center px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-xs text-gray-500 mb-1">Resolved</div>
              <div className="text-lg font-semibold text-green-600">{resolvedCount}</div>
            </div>
          </div>
        </div>
      </header>

      {/* Map Section - Full Height */}
      <div className="relative flex-1 overflow-hidden">
        <MapContainer
          center={[7.859, 125.0485]}
          zoom={13}
          className="h-full w-full"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
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
              className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl p-6 z-50 rounded-t-2xl max-h-[85vh] overflow-y-auto"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <MapPin className="text-blue-600" size={24} />
                    Report Details
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Review and update report status
                  </p>
                </div>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Report Information */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FileText className="text-blue-600" size={20} />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Reporter Name</div>
                          <div className="font-semibold text-gray-900">{selectedReport.name}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Phone className="text-green-600" size={20} />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Contact Number</div>
                          <div className="font-semibold text-gray-900">{selectedReport.number}</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Calendar className="text-purple-600" size={20} />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Date Reported</div>
                          <div className="font-semibold text-gray-900">
                            {selectedReport.date_created
                              ? new Date(selectedReport.date_created).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })
                              : "—"}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <MapPin className="text-orange-600" size={20} />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Coordinates</div>
                          <div className="font-semibold text-gray-900 text-sm">
                            {selectedReport.latitude?.toFixed(4)}, {selectedReport.longitude?.toFixed(4)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="text-xs text-gray-500 mb-2">Description</div>
                    <p className="text-gray-900 leading-relaxed">
                      {selectedReport.description || "No description provided"}
                    </p>
                  </div>

                  {/* Status Update */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <label className="text-xs text-gray-500 block mb-3">Update Status</label>
                    <div className="flex flex-wrap gap-3">
                      {["Pending", "In Progress", "Resolved"].map((status) => (
                        <button
                          key={status}
                          onClick={() => handleStatusUpdate(selectedReport.id, status)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all hover:shadow-md ${
                            selectedReport.status === status
                              ? status === "Resolved"
                                ? "bg-green-600 text-white"
                                : status === "In Progress"
                                ? "bg-blue-600 text-white"
                                : "bg-orange-600 text-white"
                              : "bg-white text-gray-700 border border-gray-300 hover:border-gray-400"
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Report Image */}
                <div className="lg:col-span-1">
                  {selectedReport.image ? (
                    <img
                      src={selectedReport.image}
                      alt="Report"
                      className="w-full h-64 lg:h-full object-cover rounded-xl border border-gray-200 shadow-sm"
                    />
                  ) : (
                    <div className="w-full h-64 lg:h-full bg-gray-100 border border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400">
                      <MapPin size={48} className="mb-2" />
                      <span className="text-sm">No Image Provided</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapsible Table at Bottom */}
        <motion.div
          initial={false}
          animate={{ height: isTableExpanded ? "60vh" : "auto" }}
          className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-40 rounded-t-2xl"
        >
          {/* Toggle Button */}
          <button
            onClick={() => setIsTableExpanded(!isTableExpanded)}
            className="w-full py-4 px-6 flex items-center justify-between hover:bg-gray-50 transition-colors rounded-t-2xl"
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl">📋</div>
              <div className="text-left">
                <h3 className="text-lg font-semibold text-gray-900">Reports List</h3>
                <p className="text-xs text-gray-500">
                  Showing {reports.length} report{reports.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <span className="text-sm hidden sm:inline">
                {isTableExpanded ? "Collapse" : "Expand"}
              </span>
              {isTableExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
            </div>
          </button>

          {/* Table Content */}
          <AnimatePresence>
            {isTableExpanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-6 pb-6 overflow-auto max-h-[calc(60vh-80px)]"
              >
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        {["Status", "Name", "Description", "Location", "Date"].map((h) => (
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
                      {reports.map((r) => (
                        <tr
                          key={r.id}
                          className="hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => setSelectedReport(r)}
                        >
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                                r.status === "Resolved"
                                  ? "bg-green-100 text-green-700"
                                  : r.status === "In Progress"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-orange-100 text-orange-700"
                              }`}
                            >
                              {r.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-medium text-gray-900">
                            {r.name}
                          </td>
                          <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                            {r.description
                              ? `${r.description.slice(0, 60)}...`
                              : "No description"}
                          </td>
                          <td className="px-6 py-4 text-gray-600 font-mono text-xs">
                            {r.latitude?.toFixed(4)}, {r.longitude?.toFixed(4)}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {r.date_created
                              ? new Date(r.date_created).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })
                              : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}