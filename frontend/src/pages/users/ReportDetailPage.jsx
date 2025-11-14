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

function ReportDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);

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
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "In Progress":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "Resolved":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending":
        return "⏳";
      case "In Progress":
        return "🔄";
      case "Resolved":
        return "✅";
      default:
        return "📝";
    }
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

  if (!report) {
    return null;
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Navbar */}
      <UserNavbar unreadNotifications={0} />

      {/* Background */}
      <div className="fixed inset-0 z-0">
        <img
          src={weatherImg}
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
      </div>

      {/* Floating Particles */}
      <div className="fixed inset-0 z-0 opacity-20">
        {[...Array(10)].map((_, i) => (
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
      <div className="relative z-10 min-h-screen p-8 max-w-[1800px] mx-auto">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}>
          <button
            onClick={() => navigate("/user/my-reports")}
            className="flex items-center gap-2 text-white/70 hover:text-white mb-6 transition-colors group">
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to My Reports</span>
          </button>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <span className="text-5xl">{getStatusIcon(report.status)}</span>
                Report Details
              </h1>
              <p className="text-white/70 text-lg">
                Report ID:{" "}
                <span className="font-semibold text-white">#{report.id}</span>
              </p>
            </div>

            <div className="flex gap-3">
              <span
                className={`px-6 py-3 rounded-xl font-medium border ${getStatusColor(
                  report.status
                )} shadow-lg`}>
                {report.status}
              </span>
              {report.status === "Pending" && (
                <motion.button
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-300 flex items-center gap-2 font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: deleteLoading ? 1 : 1.05 }}
                  whileTap={{ scale: 0.95 }}>
                  {deleteLoading ? (
                    <>
                      <motion.div
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <FaTrash /> Delete Report
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Report Information */}
          <div className="space-y-6">
            {/* Basic Info Card */}
            <motion.div
              className="bg-white/10 backdrop-blur-2xl rounded-3xl p-6 border border-white/20 shadow-xl"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
                Report Information
              </h2>

              <div className="space-y-4">
                <InfoItem
                  icon={<FaUser className="text-purple-400" />}
                  label="Reporter Name"
                  value={report.name}
                />
                <InfoItem
                  icon={<FaPhone className="text-green-400" />}
                  label="Contact Number"
                  value={report.contact}
                />
                <InfoItem
                  icon={<FaClock className="text-blue-400" />}
                  label="Submitted"
                  value={new Date(report.date_created).toLocaleString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                />
                <InfoItem
                  icon={<FaMapMarkerAlt className="text-red-400" />}
                  label={report.address ? "Location" : "Location Coordinates"}
                  value={report.address || `${report.latitude.toFixed(6)}, ${report.longitude.toFixed(6)}`}
                />
              </div>
            </motion.div>

            {/* Description Card */}
            <motion.div
              className="bg-white/10 backdrop-blur-2xl rounded-3xl p-6 border border-white/20 shadow-xl"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                Description
              </h2>
              <p className="text-white/80 leading-relaxed text-lg">
                {report.description}
              </p>
            </motion.div>

            {/* Status Timeline Card */}
            <motion.div
              className="bg-white/10 backdrop-blur-2xl rounded-3xl p-6 border border-white/20 shadow-xl"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                Status Timeline
              </h2>

              <div className="space-y-6">
                <TimelineItem
                  icon="📝"
                  title="Submitted"
                  time={new Date(report.date_created).toLocaleString()}
                  active={true}
                  color="green"
                />
                <TimelineItem
                  icon="🔄"
                  title="In Progress"
                  time={
                    report.status === "In Progress" ||
                    report.status === "Resolved"
                      ? "Under review"
                      : "Pending"
                  }
                  active={
                    report.status === "In Progress" ||
                    report.status === "Resolved"
                  }
                  color="blue"
                />
                <TimelineItem
                  icon="✅"
                  title="Resolved"
                  time={report.status === "Resolved" ? "Completed" : "Pending"}
                  active={report.status === "Resolved"}
                  color="green"
                />
              </div>
            </motion.div>
          </div>

          {/* Right Column - Map & Image */}
          <div className="space-y-6">
            {/* Map Card */}
            <motion.div
              className="bg-white/10 backdrop-blur-2xl rounded-3xl p-6 border border-white/20 shadow-xl"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
                Location Map
              </h2>
              <div className="h-[400px] rounded-2xl overflow-hidden border-2 border-white/20">
                <MapContainer
                  center={[report.latitude, report.longitude]}
                  zoom={15}
                  style={{ height: "100%", width: "100%" }}
                  scrollWheelZoom={true}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <Marker position={[report.latitude, report.longitude]}>
                    <Popup>
                      <div className="p-2">
                        <strong className="text-lg">{report.name}</strong>
                        <br />
                        <span className="text-sm text-gray-600">
                          {report.description}
                        </span>
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            </motion.div>

            {/* Image Card */}
            {report.image && (
              <motion.div
                className="bg-white/10 backdrop-blur-2xl rounded-3xl p-6 border border-white/20 shadow-xl"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}>
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <FaImage className="text-purple-400" />
                  Attached Image
                </h2>
                <div className="rounded-2xl overflow-hidden border-2 border-white/20">
                  <img
                    src={`http://localhost:8000${report.image}`}
                    alt="Report"
                    className="w-full h-auto object-cover hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
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
function InfoItem({ icon, label, value }) {
  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300">
      <div className="flex items-center gap-3 mb-2">
        <div className="text-xl">{icon}</div>
        <label className="text-white/70 text-sm font-medium">{label}</label>
      </div>
      <p className="text-white font-semibold text-lg ml-8">{value}</p>
    </div>
  );
}

function TimelineItem({ icon, title, time, active, color }) {
  const colorClasses = {
    green: active ? "bg-green-500" : "bg-gray-500",
    blue: active ? "bg-blue-500" : "bg-gray-500",
  };

  return (
    <div className="flex items-start gap-4">
      <div className="relative">
        <div
          className={`w-12 h-12 rounded-full ${
            active ? "bg-white/20" : "bg-white/5"
          } border-2 ${
            active ? "border-white/40" : "border-white/10"
          } flex items-center justify-center text-2xl backdrop-blur-xl`}>
          {icon}
        </div>
        <div
          className={`absolute top-12 left-1/2 transform -translate-x-1/2 w-1 h-6 ${
            active ? "bg-white/30" : "bg-white/10"
          } last:hidden`}></div>
      </div>
      <div className="flex-1 pb-6">
        <p
          className={`font-bold text-lg mb-1 ${
            active ? "text-white" : "text-white/50"
          }`}>
          {title}
        </p>
        <p className={`text-sm ${active ? "text-white/70" : "text-white/40"}`}>
          {time}
        </p>
      </div>
    </div>
  );
}

export default ReportDetailPage;
