import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import {
  FaArrowLeft,
  FaTrash,
  FaMapMarkerAlt,
  FaPhone,
  FaClock,
  FaUser,
  FaImage,
} from "react-icons/fa";
import api from "../../api/api";
import UserNavbar from "../../components/UserNavbar";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import weatherImg from "../../assets/weather.jpg";

// Fix Leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom marker icon
const customIcon = new L.Icon({
  iconUrl: "https://img.icons8.com/ios-filled/50/FF6B6B/map-pin.png",
  iconRetinaUrl: "https://img.icons8.com/ios-filled/100/FF6B6B/map-pin.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [35, 46],
  iconAnchor: [17, 46],
  popupAnchor: [1, -34],
  shadowSize: [46, 46]
});

function ReportDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Online icon assets URLs
  const iconUrls = {
    pending: "https://img.icons8.com/ios-filled/50/ffa726/clock--v1.png",
    inProgress: "https://img.icons8.com/ios-filled/50/4285f4/synchronize.png",
    resolved: "https://img.icons8.com/ios-filled/50/34a853/checked.png",
    user: "https://img.icons8.com/ios-filled/50/8b5cf6/user.png",
    phone: "https://img.icons8.com/ios-filled/50/10b981/phone.png",
    clock: "https://img.icons8.com/ios-filled/50/3b82f6/clock.png",
    location: "https://img.icons8.com/ios-filled/50/ef4444/map-pin.png",
    description: "https://img.icons8.com/ios-filled/50/f59e0b/comments.png",
    image: "https://img.icons8.com/ios-filled/50/a855f7/image.png",
    timeline: "https://img.icons8.com/ios-filled/50/06b6d4/timeline.png",
    map: "https://img.icons8.com/ios-filled/50/dc2626/map.png",
    back: "https://img.icons8.com/ios-filled/50/ffffff/back.png",
    delete: "https://img.icons8.com/ios-filled/50/ffffff/trash.png",
    report: "https://img.icons8.com/ios-filled/100/ffffff/complaint.png",
    submitted: "https://img.icons8.com/ios-filled/50/10b981/checked-document.png",
    inProgress: "https://img.icons8.com/ios-filled/50/3b82f6/in-progress.png",
    completed: "https://img.icons8.com/ios-filled/50/34a853/approval.png"
  };

  useEffect(() => {
    loadReport();
  }, [id]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/reports/${id}/`);
      setReport(response.data);
    } catch (error) {
      console.error("Error loading report:", error);
      alert("Report not found or you don't have permission to view it.");
      navigate("/user/my-reports");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this report?")) {
      return;
    }

    try {
      setDeleteLoading(true);
      await api.delete(`/reports/${id}/`);
      navigate("/user/my-reports");
    } catch (error) {
      console.error("Error deleting report:", error);
      alert(
        "Failed to delete report. " +
          (error.response?.data?.error || "Please try again.")
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      case "In Progress":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "Resolved":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending":
        return iconUrls.pending;
      case "In Progress":
        return iconUrls.inProgress;
      case "Resolved":
        return iconUrls.resolved;
      default:
        return iconUrls.report;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="text-center">
          <motion.div
            className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-white/80 text-lg font-medium">Loading report details...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* Navbar */}
      <UserNavbar unreadNotifications={0} />

      {/* Enhanced Background */}
      <div className="fixed inset-0 z-0">
        <img
          src={weatherImg}
          alt="Weather Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-blue-900/80 to-slate-900/90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent" />
      </div>

      {/* Subtle Grid Overlay */}
      <div className="fixed inset-0 z-0 opacity-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen p-6 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-8 pt-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Back Button */}
          <motion.button
            onClick={() => navigate("/user/my-reports")}
            className="flex items-center gap-3 text-white/70 hover:text-white mb-6 transition-all duration-300 group bg-white/5 hover:bg-white/10 px-4 py-3 rounded-2xl border border-white/10 backdrop-blur-xl"
            whileHover={{ x: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <img src={iconUrls.back} alt="Back" className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span className="font-medium">Back to Reports</span>
          </motion.button>

          {/* Header Content */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
                <img 
                  src={getStatusIcon(report.status)} 
                  alt={report.status}
                  className="w-8 h-8"
                />
              </div>
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold text-white mb-2">
                  Report Details
                </h1>
                <p className="text-white/60 text-lg">
                  Report ID: <span className="font-semibold text-white">#{report.id}</span>
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className={`px-6 py-3 rounded-xl font-semibold border backdrop-blur-xl ${getStatusColor(report.status)} shadow-lg flex items-center gap-3`}>
                <img src={getStatusIcon(report.status)} alt={report.status} className="w-5 h-5" />
                {report.status}
              </div>
              {report.status === "Pending" && (
                <motion.button
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="px-6 py-3 bg-red-600/20 text-red-300 border border-red-500/30 rounded-xl hover:bg-red-600/40 transition-all duration-300 flex items-center gap-3 font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-xl"
                  whileHover={{ scale: deleteLoading ? 1 : 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {deleteLoading ? (
                    <>
                      <motion.div
                        className="w-4 h-4 border-2 border-red-300 border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <img src={iconUrls.delete} alt="Delete" className="w-4 h-4" />
                      Delete Report
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - Report Information & Timeline */}
          <div className="xl:col-span-2 space-y-6">
            {/* Report Information Card */}
            <motion.div
              className="bg-white/5 backdrop-blur-2xl rounded-2xl p-6 border border-white/10 shadow-2xl"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
                <h2 className="text-2xl font-bold text-white">Report Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem
                  icon={iconUrls.user}
                  label="Reporter Name"
                  value={report.name}
                  color="purple"
                />
                <InfoItem
                  icon={iconUrls.phone}
                  label="Contact Number"
                  value={report.contact}
                  color="emerald"
                />
                <InfoItem
                  icon={iconUrls.clock}
                  label="Submitted Date"
                  value={new Date(report.date_created).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                  color="blue"
                />
                <InfoItem
                  icon={iconUrls.clock}
                  label="Submitted Time"
                  value={new Date(report.date_created).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  color="blue"
                />
                <div className="md:col-span-2">
                  <InfoItem
                    icon={iconUrls.location}
                    label={report.address ? "Location Address" : "Coordinates"}
                    value={report.address || `${report.latitude.toFixed(6)}, ${report.longitude.toFixed(6)}`}
                    color="red"
                  />
                </div>
              </div>
            </motion.div>

            {/* Description Card */}
            <motion.div
              className="bg-white/5 backdrop-blur-2xl rounded-2xl p-6 border border-white/10 shadow-2xl"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <img src={iconUrls.description} alt="Description" className="w-6 h-6" />
                <h2 className="text-2xl font-bold text-white">Incident Description</h2>
              </div>
              <p className="text-white/80 leading-relaxed text-lg bg-white/5 rounded-xl p-4 border border-white/10">
                {report.description}
              </p>
            </motion.div>

            {/* Status Timeline Card */}
            <motion.div
              className="bg-white/5 backdrop-blur-2xl rounded-2xl p-6 border border-white/10 shadow-2xl"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <img src={iconUrls.timeline} alt="Timeline" className="w-6 h-6" />
                <h2 className="text-2xl font-bold text-white">Status Timeline</h2>
              </div>

              <div className="space-y-6">
                <TimelineItem
                  icon={iconUrls.submitted}
                  title="Report Submitted"
                  time={new Date(report.date_created).toLocaleString()}
                  active={true}
                  completed={true}
                />
                <TimelineItem
                  icon={iconUrls.inProgress}
                  title="Under Review"
                  time={
                    report.status === "In Progress" || report.status === "Resolved" 
                      ? "Currently being reviewed" 
                      : "Waiting for review"
                  }
                  active={report.status === "In Progress" || report.status === "Resolved"}
                  completed={report.status === "Resolved"}
                />
                <TimelineItem
                  icon={iconUrls.completed}
                  title="Resolved"
                  time={report.status === "Resolved" ? "Issue resolved" : "Pending resolution"}
                  active={report.status === "Resolved"}
                  completed={report.status === "Resolved"}
                />
              </div>
            </motion.div>
          </div>

          {/* Right Column - Map & Image */}
          <div className="space-y-6">
            {/* Map Card */}
            <motion.div
              className="bg-white/5 backdrop-blur-2xl rounded-2xl p-6 border border-white/10 shadow-2xl"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <img src={iconUrls.map} alt="Map" className="w-6 h-6" />
                <h2 className="text-2xl font-bold text-white">Incident Location</h2>
              </div>
              <div className="h-80 rounded-xl overflow-hidden border-2 border-white/10">
                <MapContainer
                  center={[report.latitude, report.longitude]}
                  zoom={15}
                  style={{ height: "100%", width: "100%" }}
                  scrollWheelZoom={true}
                >
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker position={[report.latitude, report.longitude]} icon={customIcon}>
                    <Popup>
                      <div className="p-2 text-slate-800">
                        <strong className="text-lg">{report.name}</strong>
                        <br />
                        <span className="text-sm text-gray-600">
                          {report.description.substring(0, 100)}...
                        </span>
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
              <div className="mt-3 text-sm text-white/60">
                <div className="flex items-center gap-2">
                  <img src={iconUrls.location} alt="Location" className="w-4 h-4" />
                  Coordinates: {report.latitude.toFixed(6)}, {report.longitude.toFixed(6)}
                </div>
              </div>
            </motion.div>

            {/* Image Card */}
            {report.image && (
              <motion.div
                className="bg-white/5 backdrop-blur-2xl rounded-2xl p-6 border border-white/10 shadow-2xl"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <img src={iconUrls.image} alt="Image" className="w-6 h-6" />
                  <h2 className="text-2xl font-bold text-white">Attached Photo</h2>
                </div>
                <div className="rounded-xl overflow-hidden border-2 border-white/10 bg-white/5">
                  <img
                    src={`http://localhost:8000${report.image}`}
                    alt="Report evidence"
                    className="w-full h-64 object-cover hover:scale-105 transition-transform duration-500 cursor-zoom-in"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "block";
                    }}
                  />
                  <div className="hidden text-center p-8 text-white/60">
                    <img src={iconUrls.image} alt="No image" className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Image not available</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function InfoItem({ icon, label, value, color }) {
  const colorClasses = {
    purple: "bg-purple-500/20 border-purple-500/30",
    emerald: "bg-emerald-500/20 border-emerald-500/30",
    blue: "bg-blue-500/20 border-blue-500/30",
    red: "bg-red-500/20 border-red-500/30",
  };

  return (
    <div className={`rounded-xl p-4 border backdrop-blur-xl hover:bg-white/5 transition-all duration-300 ${colorClasses[color]}`}>
      <div className="flex items-center gap-3 mb-2">
        <img src={icon} alt={label} className="w-5 h-5" />
        <label className="text-white/70 text-sm font-medium">{label}</label>
      </div>
      <p className="text-white font-semibold text-lg ml-8 truncate" title={value}>
        {value}
      </p>
    </div>
  );
}

function TimelineItem({ icon, title, time, active, completed }) {
  return (
    <div className="flex items-start gap-4">
      <div className="relative flex-shrink-0">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center backdrop-blur-xl border-2 ${
          completed 
            ? "bg-emerald-500/20 border-emerald-400/30" 
            : active 
            ? "bg-blue-500/20 border-blue-400/30" 
            : "bg-white/5 border-white/10"
        }`}>
          <img src={icon} alt={title} className="w-6 h-6" />
        </div>
        {!completed && (
          <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-1 h-6 bg-white/10"></div>
        )}
      </div>
      <div className="flex-1 pb-6">
        <p className={`font-bold text-lg mb-1 ${
          completed ? "text-emerald-300" : active ? "text-blue-300" : "text-white/50"
        }`}>
          {title}
        </p>
        <p className={`text-sm ${completed ? "text-emerald-200/80" : active ? "text-blue-200/80" : "text-white/40"}`}>
          {time}
        </p>
      </div>
    </div>
  );
}

export default ReportDetailPage;