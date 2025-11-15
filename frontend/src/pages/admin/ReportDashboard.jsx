import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  X,
  MapPin,
  Phone,
  Calendar,
  FileText,
  CheckCircle,
  AlertCircle,
  Maximize2,
  Image as ImageIcon,
  Activity,
  Clock,
  Zap,
} from "lucide-react";
import L from "leaflet";
import API from "../../api/api";
import "leaflet/dist/leaflet.css";
import weatherImg from "../../assets/weather.jpg";

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

// Custom colored marker icons for different report statuses
const pendingIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const inProgressIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const resolvedIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function ReportDashboard() {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isTableExpanded, setIsTableExpanded] = useState(false);
  const [toast, setToast] = useState(null);
  const [fullScreenImage, setFullScreenImage] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);

  // Helper function to get marker icon based on status
  const getMarkerIcon = (status) => {
    switch (status) {
      case "Pending":
        return pendingIcon;
      case "In Progress":
        return inProgressIcon;
      case "Resolved":
        return resolvedIcon;
      default:
        return pendingIcon;
    }
  };

  // Fetch reports from backend
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await API.get("reports/all/");
        console.log("📊 Reports data:", res.data);
        console.log("📸 First report image:", res.data[0]?.image);
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-950 to-blue-800 relative overflow-hidden">
        {/* Floating Particles */}
        <div className="absolute inset-0 opacity-20">
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

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center relative z-10">
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
            }}
            className="text-6xl mb-6">
            🗺️
          </motion.div>
          <h2 className="text-3xl font-bold text-white mb-3">
            Loading Reports
          </h2>
          <p className="text-white/70">Fetching data from the database...</p>
          <div className="flex justify-center gap-2 mt-4">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
              className="w-2 h-2 bg-white rounded-full"
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
              className="w-2 h-2 bg-white rounded-full"
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
              className="w-2 h-2 bg-white rounded-full"
            />
          </div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-950 to-blue-800">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-white/10 backdrop-blur-2xl p-8 rounded-3xl shadow-2xl border border-white/20">
          <AlertCircle className="text-red-400 mx-auto mb-4" size={48} />
          <h2 className="text-xl font-bold text-white mb-2">Error Loading Reports</h2>
          <p className="text-red-300">{error}</p>
        </motion.div>
      </div>
    );
  }

  // Show confirmation dialog before status update
  const handleStatusUpdateRequest = (id, status) => {
    setConfirmDialog({
      reportId: id,
      newStatus: status,
      currentStatus: reports.find((r) => r.id === id)?.status,
    });
  };

  // Confirm and execute status update
  const confirmStatusUpdate = async () => {
    if (!confirmDialog) return;

    const { reportId, newStatus } = confirmDialog;

    try {
      await API.patch(`reports/${reportId}/update_status/`, {
        status: newStatus,
      });
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status: newStatus } : r))
      );
      showToast(`Status updated to ${newStatus}`, "success");
      
      if (newStatus === "Resolved" && selectedReport?.id === reportId) {
        setSelectedReport(null);
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to update status", "error");
    } finally {
      setConfirmDialog(null);
    }
  };

  // Toast notification function
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Calculate analytics
  const pendingCount = reports.filter((r) => r.status === "Pending").length;
  const inProgressCount = reports.filter(
    (r) => r.status === "In Progress"
  ).length;
  const resolvedCount = reports.filter((r) => r.status === "Resolved").length;

  // Filter out resolved reports from map markers
  const activeReports = reports.filter((r) => r.status !== "Resolved");

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0">
        <img
          src={weatherImg}
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
      </div>

      {/* Floating Particles */}
      <div className="fixed inset-0 z-0 opacity-30">
        {[...Array(20)].map((_, i) => (
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

      {/* Confirmation Dialog */}
      <AnimatePresence>
        {confirmDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10001] flex items-center justify-center p-4"
            onClick={() => setConfirmDialog(null)}>
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white/10 backdrop-blur-3xl rounded-3xl shadow-2xl max-w-md w-full p-8 border border-white/20">
              <div className="flex items-start gap-4 mb-6">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                  className="p-3 bg-blue-500/20 rounded-2xl border border-blue-400/30">
                  <AlertCircle className="text-blue-300" size={28} />
                </motion.div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-3">
                    Confirm Status Change
                  </h3>
                  <p className="text-white/80 leading-relaxed">
                    Change status from{" "}
                    <span className="font-bold text-white px-2 py-1 bg-white/20 rounded-lg">
                      {confirmDialog.currentStatus}
                    </span>{" "}
                    to{" "}
                    <span className="font-bold text-white px-2 py-1 bg-blue-500/30 rounded-lg border border-blue-400/30">
                      {confirmDialog.newStatus}
                    </span>
                    ?
                  </p>
                  {confirmDialog.newStatus === "Resolved" && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-2 mt-4 p-3 bg-orange-500/20 border border-orange-400/30 rounded-xl">
                      <AlertCircle className="text-orange-300 flex-shrink-0 mt-0.5" size={18} />
                      <p className="text-sm text-orange-200 font-medium">
                        This report will be hidden from the map once resolved.
                      </p>
                    </motion.div>
                  )}
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setConfirmDialog(null)}
                  className="px-6 py-3 text-white bg-white/20 backdrop-blur-xl hover:bg-white/30 rounded-xl font-semibold transition-all border border-white/30">
                  Cancel
                </button>
                <button
                  onClick={confirmStatusUpdate}
                  className="px-6 py-3 text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-xl font-semibold transition-all shadow-lg">
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed top-6 right-6 z-[9999] flex items-center gap-3 bg-white/10 backdrop-blur-3xl rounded-2xl shadow-2xl border border-white/20 px-6 py-4 min-w-[320px]">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 300 }}>
              {toast.type === "success" ? (
                <CheckCircle className="text-green-400 flex-shrink-0" size={24} />
              ) : (
                <AlertCircle className="text-red-400 flex-shrink-0" size={24} />
              )}
            </motion.div>
            <span className="text-white font-semibold flex-1">{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="text-white/70 hover:text-white p-1 hover:bg-white/10 rounded-lg transition-all">
              <X size={18} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Screen Image Modal */}
      <AnimatePresence>
        {fullScreenImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[10000] flex items-center justify-center p-4"
            onClick={() => setFullScreenImage(null)}>
            <button
              onClick={() => setFullScreenImage(null)}
              className="absolute top-6 right-6 text-white hover:text-white/70 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-all">
              <X size={28} />
            </button>
            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              src={fullScreenImage}
              alt="Full screen"
              className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="relative z-10 h-screen flex flex-col">
        {/* Header with Glassmorphism */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-2xl border-b border-white/20 shadow-2xl px-8 py-6 flex-shrink-0">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <Link to="/admin/dashboard">
                  <div className="p-2 bg-gradient-to-b from-black/40 via-black/30 to-black/50 backdrop-blur-3xl rounded-xl shadow-lg cursor-pointer hover:from-black/50 hover:via-black/40 hover:to-black/60 transition-all">
                    <Activity className="text-white" size={24} />
                  </div>
                </Link>
                <h1 className="text-3xl font-bold text-white">
                  Reports Dashboard
                </h1>
              </div>
              <p className="text-white/70 text-sm ml-14">
                Real-time monitoring and management system
              </p>
            </div>
            
            {/* Quick Stats */}
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                whileHover={{ scale: 1.05, y: -2 }}
                className="bg-white/10 backdrop-blur-2xl rounded-2xl p-4 border border-orange-400/30 shadow-xl min-w-[100px]">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="text-orange-400" size={16} />
                  <div className="text-xs font-bold text-orange-300 uppercase">Pending</div>
                </div>
                <div className="text-2xl font-black text-white">
                  {pendingCount}
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.05, y: -2 }}
                className="bg-white/10 backdrop-blur-2xl rounded-2xl p-4 border border-blue-400/30 shadow-xl min-w-[100px]">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="text-blue-400" size={16} />
                  <div className="text-xs font-bold text-blue-300 uppercase">In Progress</div>
                </div>
                <div className="text-2xl font-black text-white">
                  {inProgressCount}
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.05, y: -2 }}
                className="bg-white/10 backdrop-blur-2xl rounded-2xl p-4 border border-green-400/30 shadow-xl min-w-[100px]">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="text-green-400" size={16} />
                  <div className="text-xs font-bold text-green-300 uppercase">Resolved</div>
                </div>
                <div className="text-2xl font-black text-white">
                  {resolvedCount}
                </div>
              </motion.div>
            </div>
          </div>
        </motion.header>

        {/* Map Section */}
        <div className="relative flex-1 min-h-0">
          <div className="absolute inset-0">
            <MapContainer
              center={[7.859, 125.0485]}
              zoom={13}
              style={{ height: '100%', width: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />

            {activeReports.map((report) => (
              <Marker
                key={report.id}
                position={[report.latitude, report.longitude]}
                icon={getMarkerIcon(report.status)}
                eventHandlers={{
                  click: () => setSelectedReport(report),
                }}>
                <Popup>
                  <div className="font-semibold text-blue-700 text-lg mb-1">
                    {report.name}
                  </div>
                  <p className="text-sm text-gray-700">{report.description}</p>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
          </div>

          {/* Report Details Modal */}
          <AnimatePresence>
            {selectedReport && (
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className="fixed bottom-0 left-0 right-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50 backdrop-blur-3xl border-t border-white/20 shadow-2xl p-8 z-50 max-h-[85vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-1">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                      <h2 className="text-3xl font-bold text-white">
                        Report Details
                      </h2>
                    </div>
                    <p className="text-white/70 text-sm ml-6">
                      Review and update report information
                    </p>
                  </motion.div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedReport(null)}
                    className="text-white/70 hover:text-white transition-colors p-2.5 hover:bg-white/10 rounded-xl">
                    <X size={24} />
                  </motion.button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Report Information */}
                  <div className="lg:col-span-2 space-y-5">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="flex items-start gap-3 p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
                          <div className="p-2.5 bg-blue-500/20 rounded-xl border border-blue-400/30">
                            <FileText className="text-blue-300" size={20} />
                          </div>
                          <div className="flex-1">
                            <div className="text-xs font-semibold text-white/70 uppercase mb-1">
                              Reporter Name
                            </div>
                            <div className="font-bold text-white text-lg">
                              {selectedReport.name}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
                          <div className="p-2.5 bg-green-500/20 rounded-xl border border-green-400/30">
                            <Phone className="text-green-300" size={20} />
                          </div>
                          <div className="flex-1">
                            <div className="text-xs font-semibold text-white/70 uppercase mb-1">
                              Contact Number
                            </div>
                            <div className="font-bold text-white text-lg">
                              {selectedReport.number}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
                          <div className="p-2.5 bg-purple-500/20 rounded-xl border border-purple-400/30">
                            <Calendar className="text-purple-300" size={20} />
                          </div>
                          <div className="flex-1">
                            <div className="text-xs font-semibold text-white/70 uppercase mb-1">
                              Date Reported
                            </div>
                            <div className="font-bold text-white text-lg">
                              {selectedReport.date_created
                                ? new Date(
                                    selectedReport.date_created
                                  ).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })
                                : "—"}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
                          <div className="p-2.5 bg-orange-500/20 rounded-xl border border-orange-400/30">
                            <MapPin className="text-orange-300" size={20} />
                          </div>
                          <div className="flex-1">
                            <div className="text-xs font-semibold text-white/70 uppercase mb-1">
                              Location
                            </div>
                            <div className="font-bold text-white text-sm leading-tight">
                              {selectedReport.address || "Address unavailable"}
                            </div>
                            <div className="text-xs text-white/60 font-mono mt-1.5 bg-white/10 px-2 py-1 rounded inline-block">
                              {selectedReport.latitude?.toFixed(4)},{" "}
                              {selectedReport.longitude?.toFixed(4)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Description */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                      <div className="text-xs font-semibold text-white/70 uppercase mb-3">
                        Description
                      </div>
                      <p className="text-white leading-relaxed text-base">
                        {selectedReport.description || "No description provided"}
                      </p>
                    </motion.div>

                    {/* Status Update */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                      <label className="text-xs font-semibold text-white/70 uppercase block mb-4">
                        Update Status
                      </label>
                      <div className="flex flex-wrap gap-3">
                        {["Pending", "In Progress", "Resolved"].map((status) => (
                          <motion.button
                            key={status}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() =>
                              handleStatusUpdateRequest(selectedReport.id, status)
                            }
                            className={`px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg ${
                              selectedReport.status === status
                                ? status === "Resolved"
                                  ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white border border-green-400/30"
                                  : status === "In Progress"
                                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white border border-blue-400/30"
                                  : "bg-gradient-to-r from-orange-500 to-red-600 text-white border border-orange-400/30"
                                : "bg-white/20 backdrop-blur-xl text-white border border-white/30 hover:bg-white/30"
                            }`}>
                            {status === "Resolved" && selectedReport.status === status && (
                              <CheckCircle className="inline-block mr-2" size={16} />
                            )}
                            {status === "In Progress" && selectedReport.status === status && (
                              <Zap className="inline-block mr-2" size={16} />
                            )}
                            {status === "Pending" && selectedReport.status === status && (
                              <Clock className="inline-block mr-2" size={16} />
                            )}
                            {status}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  </div>

                  {/* Report Image */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-1">
                    {selectedReport.image ? (
                      <div className="relative group h-full">
                        <img
                          src={
                            selectedReport.image.startsWith('http') 
                              ? selectedReport.image 
                              : `https://res.cloudinary.com/dpj2yac8o/${selectedReport.image}`
                          }
                          alt="Report"
                          className="w-full h-64 lg:h-full object-cover rounded-2xl border border-white/20 shadow-2xl cursor-pointer transition-all group-hover:scale-[1.02]"
                          onClick={() => setFullScreenImage(
                            selectedReport.image.startsWith('http') 
                              ? selectedReport.image 
                              : `https://res.cloudinary.com/dpj2yac8o/${selectedReport.image}`
                          )}
                          onLoad={() => console.log("✅ Image loaded successfully!")}
                          onError={(e) => {
                            console.error("❌ Failed to load image:", e.target.src);
                            e.target.onerror = null;
                            e.target.src = "https://via.placeholder.com/400x300?text=Image+Not+Found";
                          }}
                        />
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setFullScreenImage(
                            selectedReport.image.startsWith('http') 
                              ? selectedReport.image 
                              : `https://res.cloudinary.com/dpj2yac8o/${selectedReport.image}`
                          )}
                          className="absolute top-4 right-4 bg-white/20 backdrop-blur-xl hover:bg-white/30 text-white p-2.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all border border-white/30">
                          <Maximize2 size={20} />
                        </motion.button>
                      </div>
                    ) : (
                      <div className="w-full h-64 lg:h-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex flex-col items-center justify-center text-white/50">
                        <ImageIcon size={56} className="mb-3 opacity-50" />
                        <span className="text-sm font-medium">No Image Provided</span>
                      </div>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Collapsible Table */}
          <motion.div
            initial={false}
            animate={{ height: isTableExpanded ? "60vh" : "auto" }}
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50 backdrop-blur-3xl border-t border-white/20 shadow-2xl z-40">
            {/* Toggle Button */}
            <motion.button
              whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}
              onClick={() => setIsTableExpanded(!isTableExpanded)}
              className="w-full py-5 px-8 flex items-center justify-between transition-colors rounded-t-3xl">
              <div className="flex items-center gap-4">
                <motion.div
                  animate={{ rotate: isTableExpanded ? 0 : 360 }}
                  transition={{ duration: 0.5 }}
                  className="text-3xl">
                  📋
                </motion.div>
                <div className="text-left">
                  <h3 className="text-xl font-black text-white">
                    Reports List
                  </h3>
                  <p className="text-xs text-white/70 mt-1">
                    Showing <span className="font-bold text-blue-300">{reports.length}</span> report
                    {reports.length !== 1 ? "s" : ""} · <span className="font-bold text-green-300">{activeReports.length}</span> active on map
                  </p>
                </div>
              </div>
              <motion.div
                animate={{ rotate: isTableExpanded ? 180 : 0 }}
                className="flex items-center gap-2 text-white bg-white/20 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/30">
                <span className="text-sm font-semibold hidden sm:inline">
                  {isTableExpanded ? "Collapse" : "Expand"}
                </span>
                <ChevronDown size={20} />
              </motion.div>
            </motion.button>

            {/* Table Content */}
            <AnimatePresence>
              {isTableExpanded && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-8 pb-8 overflow-auto max-h-[calc(60vh-100px)]">
                  <div className="overflow-x-auto rounded-2xl border border-white/20">
                    <table className="w-full text-sm">
                      <thead className="bg-white/10 backdrop-blur-xl sticky top-0">
                        <tr>
                          {[
                            "Status",
                            "Name",
                            "Description",
                            "Address",
                            "Date",
                          ].map((h, i) => (
                            <motion.th
                              key={h}
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.05 }}
                              className="px-6 py-4 text-left text-xs font-black text-white/90 uppercase tracking-wider">
                              {h}
                            </motion.th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white/5 backdrop-blur-xl divide-y divide-white/10">
                        {reports.map((r, idx) => (
                          <motion.tr
                            key={r.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.03 }}
                            whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.1)", scale: 1.01 }}
                            className="cursor-pointer transition-all"
                            onClick={() => setSelectedReport(r)}>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm backdrop-blur-xl ${
                                  r.status === "Resolved"
                                    ? "bg-green-500/20 text-green-300 border border-green-400/30"
                                    : r.status === "In Progress"
                                    ? "bg-blue-500/20 text-blue-300 border border-blue-400/30"
                                    : "bg-orange-500/20 text-orange-300 border border-orange-400/30"
                                }`}>
                                {r.status === "Resolved" && <CheckCircle size={12} />}
                                {r.status === "In Progress" && <Zap size={12} />}
                                {r.status === "Pending" && <Clock size={12} />}
                                {r.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-bold text-white">
                              {r.name}
                            </td>
                            <td className="px-6 py-4 text-white/70 max-w-xs truncate">
                              {r.description
                                ? `${r.description.slice(0, 60)}...`
                                : "No description"}
                            </td>
                            <td className="px-6 py-4 text-white/70 max-w-sm">
                              <div className="truncate font-medium">
                                {r.address || "Address unavailable"}
                              </div>
                              <div className="text-xs text-white/50 font-mono mt-1 bg-white/10 px-2 py-0.5 rounded inline-block">
                                {r.latitude?.toFixed(4)},{" "}
                                {r.longitude?.toFixed(4)}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-white/90 font-medium">
                              {r.date_created
                                ? new Date(r.date_created).toLocaleDateString(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    }
                                  )
                                : "—"}
                            </td>
                          </motion.tr>
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
    </div>
  );
}