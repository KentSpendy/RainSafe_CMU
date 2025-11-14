import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaFilter,
  FaSearch,
  FaTrash,
  FaEye,
  FaMapMarkerAlt,
  FaCalendar,
  FaExclamationCircle,
} from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import api from "../../api/api";
import UserNavbar from "../../components/UserNavbar";
import weatherImg from "../../assets/weather.jpg";

function MyReportsPage() {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadReports();
  }, []);

  useEffect(() => {
    filterReports();
  }, [reports, filterStatus, searchTerm]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const response = await api.get("/reports/my-reports/");
      setReports(response.data);
      setFilteredReports(response.data);
    } catch (error) {
      console.error("Error loading reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterReports = () => {
    let filtered = reports;

    // Filter by status
    if (filterStatus !== "All") {
      filtered = filtered.filter((r) => r.status === filterStatus);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredReports(filtered);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this report?")) {
      return;
    }

    const loadingToast = toast.loading("Deleting report...");

    try {
      setDeleteLoading(id);
      await api.delete(`/reports/${id}/`);
      setReports(reports.filter((r) => r.id !== id));

      toast.success("Report deleted successfully!", {
        id: loadingToast,
        duration: 3000,
        icon: "🗑️",
      });
    } catch (error) {
      console.error("Error deleting report:", error);

      toast.error(
        error.response?.data?.error ||
          "Failed to delete report. Please try again.",
        {
          id: loadingToast,
          duration: 4000,
          icon: "❌",
        }
      );
    } finally {
      setDeleteLoading(null);
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

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        containerStyle={{
          top: 80,
          zIndex: 99999,
        }}
        toastOptions={{
          duration: 3000,
          style: {
            background: "rgba(30, 41, 59, 0.95)",
            color: "#fff",
            padding: "16px",
            borderRadius: "12px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: "#10b981",
              secondary: "#fff",
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
          loading: {
            iconTheme: {
              primary: "#3b82f6",
              secondary: "#fff",
            },
          },
        }}
      />

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
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <span className="text-5xl">📋</span>
            My Reports
          </h1>
          <p className="text-white/70 text-lg">
            Total:{" "}
            <span className="font-semibold text-white">{reports.length}</span>{" "}
            reports | Showing:{" "}
            <span className="font-semibold text-white">
              {filteredReports.length}
            </span>
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}>
          <StatCard
            icon="📊"
            label="Total Reports"
            value={reports.length}
            color="blue"
          />
          <StatCard
            icon="⏳"
            label="Pending"
            value={reports.filter((r) => r.status === "Pending").length}
            color="yellow"
          />
          <StatCard
            icon="🔄"
            label="In Progress"
            value={reports.filter((r) => r.status === "In Progress").length}
            color="blue"
          />
          <StatCard
            icon="✅"
            label="Resolved"
            value={reports.filter((r) => r.status === "Resolved").length}
            color="green"
          />
        </motion.div>

        {/* Filters & Search */}
        <motion.div
          className="bg-white/10 backdrop-blur-2xl rounded-3xl p-6 border border-white/20 mb-6 shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}>
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50" />
                <input
                  type="text"
                  placeholder="Search reports by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all"
                />
              </div>
            </div>

            {/* Status Filters */}
            <div className="flex flex-wrap gap-2">
              {["All", "Pending", "In Progress", "Resolved"].map((status) => (
                <motion.button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                    filterStatus === status
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                      : "bg-white/10 text-white/70 hover:bg-white/20 border border-white/20"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}>
                  {status}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Reports List */}
        {filteredReports.length === 0 ? (
          <motion.div
            className="bg-white/10 backdrop-blur-2xl rounded-3xl p-16 border border-white/20 text-center shadow-xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}>
            <div className="text-8xl mb-6">🔍</div>
            <p className="text-white/70 text-xl mb-6">
              {searchTerm || filterStatus !== "All"
                ? "No reports found matching your criteria"
                : "No reports submitted yet"}
            </p>
            {!searchTerm && filterStatus === "All" && (
              <motion.button
                onClick={() => navigate("/report")}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 font-medium shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}>
                Submit Your First Report
              </motion.button>
            )}
          </motion.div>
        ) : (
          <div className="grid gap-4">
            <AnimatePresence>
              {filteredReports.map((report, index) => (
                <motion.div
                  key={report.id}
                  className="bg-white/10 backdrop-blur-2xl rounded-3xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 shadow-xl group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}>
                  <div className="flex flex-col lg:flex-row justify-between gap-6">
                    {/* Report Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="text-4xl">
                          {getStatusIcon(report.status)}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                            {report.name}
                          </h3>
                          <p className="text-white/70 leading-relaxed">
                            {report.description}
                          </p>
                        </div>
                      </div>

                      {/* Metadata */}
                      <div className="flex flex-wrap gap-4 text-sm text-white/60">
                        <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg">
                          <FaMapMarkerAlt className="text-cyan-400" />
                          {report.latitude.toFixed(4)},{" "}
                          {report.longitude.toFixed(4)}
                        </span>
                        <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg">
                          <FaCalendar className="text-purple-400" />
                          {new Date(report.date_created).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </span>
                        <span
                          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg font-medium border ${getStatusColor(
                            report.status
                          )}`}>
                          {report.status}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex lg:flex-col gap-3">
                      <motion.button
                        onClick={() => navigate(`/user/reports/${report.id}`)}
                        className="flex-1 lg:flex-none px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-300 flex items-center justify-center gap-2 font-medium shadow-lg"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}>
                        <FaEye /> View
                      </motion.button>
                      {report.status === "Pending" && (
                        <motion.button
                          onClick={() => handleDelete(report.id)}
                          disabled={deleteLoading === report.id}
                          className="flex-1 lg:flex-none px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-300 flex items-center justify-center gap-2 font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                          whileHover={{
                            scale: deleteLoading === report.id ? 1 : 1.05,
                          }}
                          whileTap={{ scale: 0.95 }}>
                          {deleteLoading === report.id ? (
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
                              <FaTrash /> Delete
                            </>
                          )}
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper Components
function StatCard({ icon, label, value, color }) {
  const colorClasses = {
    blue: "from-blue-500/20 to-blue-600/20 border-blue-400/30",
    yellow: "from-yellow-500/20 to-yellow-600/20 border-yellow-400/30",
    green: "from-green-500/20 to-green-600/20 border-green-400/30",
  };

  return (
    <motion.div
      className={`bg-gradient-to-br ${colorClasses[color]} backdrop-blur-xl rounded-2xl p-6 border shadow-xl`}
      whileHover={{ scale: 1.05, y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-4xl">{icon}</span>
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-white/70">{label}</div>
    </motion.div>
  );
}

export default MyReportsPage;
