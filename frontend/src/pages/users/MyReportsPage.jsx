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
  FaPlus,
  FaChartBar,
  FaFileAlt,
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

  // Online icon assets URLs
  const iconUrls = {
    pending: "https://img.icons8.com/ios-filled/50/ffa726/clock--v1.png",
    inProgress: "https://img.icons8.com/ios-filled/50/4285f4/synchronize.png",
    resolved: "https://img.icons8.com/ios-filled/50/34a853/checked.png",
    total: "https://img.icons8.com/ios-filled/50/ffffff/documents.png",
    search: "https://img.icons8.com/ios-filled/50/ffffff/search.png",
    empty: "https://img.icons8.com/ios-filled/100/ffffff/nothing-found.png",
    weather: "https://img.icons8.com/ios-filled/100/ffffff/partly-cloudy-day.png",
    report: "https://img.icons8.com/ios-filled/100/ffffff/complaint.png",
    location: "https://img.icons8.com/ios-filled/50/00bcd4/marker.png",
    calendar: "https://img.icons8.com/ios-filled/50/9c27b0/calendar.png",
    stats: "https://img.icons8.com/ios-filled/100/64b5f6/statistics.png"
  };

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
      });
    } catch (error) {
      console.error("Error deleting report:", error);

      toast.error(
        error.response?.data?.error ||
          "Failed to delete report. Please try again.",
        {
          id: loadingToast,
          duration: 4000,
        }
      );
    } finally {
      setDeleteLoading(null);
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
        return iconUrls.total;
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
          <p className="text-white/80 text-lg font-medium">Loading your reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
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
            background: "rgba(15, 23, 42, 0.95)",
            color: "#fff",
            padding: "16px",
            borderRadius: "12px",
            border: "1px solid rgba(100, 116, 139, 0.3)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
            fontSize: "14px",
            fontWeight: "500",
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
        {/* Header Section */}
        <motion.div
          className="mb-8 pt-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
                  <img 
                    src={iconUrls.stats} 
                    alt="Reports" 
                    className="w-8 h-8 filter brightness-0 invert"
                  />
                </div>
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold text-white">
                    Weather Reports
                  </h1>
                  <p className="text-white/60 text-lg mt-2">
                    Total: <span className="font-semibold text-white">{reports.length}</span> reports • 
                    Showing: <span className="font-semibold text-white">{filteredReports.length}</span>
                  </p>
                </div>
              </div>
            </div>
            
            <motion.button
              onClick={() => navigate("/report")}
              className="mt-4 lg:mt-0 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl hover:from-blue-700 hover:to-cyan-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl flex items-center gap-3 group"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaPlus className="text-sm group-hover:rotate-90 transition-transform duration-300" />
              New Report
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
        >
          <StatCard
            icon={iconUrls.total}
            label="Total Reports"
            value={reports.length}
            color="blue"
            description="All submitted reports"
          />
          <StatCard
            icon={iconUrls.pending}
            label="Pending Review"
            value={reports.filter((r) => r.status === "Pending").length}
            color="amber"
            description="Awaiting action"
          />
          <StatCard
            icon={iconUrls.inProgress}
            label="In Progress"
            value={reports.filter((r) => r.status === "In Progress").length}
            color="cyan"
            description="Being addressed"
          />
          <StatCard
            icon={iconUrls.resolved}
            label="Resolved"
            value={reports.filter((r) => r.status === "Resolved").length}
            color="emerald"
            description="Completed reports"
          />
        </motion.div>

        {/* Search and Filter Section */}
        <motion.div
          className="bg-white/5 backdrop-blur-2xl rounded-2xl p-6 border border-white/10 shadow-2xl mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search Input */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-white/80 mb-2">
                Search Reports
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <img 
                    src={iconUrls.search} 
                    alt="Search" 
                    className="w-4 h-4 opacity-60"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Search by report name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all duration-300 font-medium"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="lg:w-64">
              <label className="block text-sm font-medium text-white/80 mb-2">
                Filter by Status
              </label>
              <div className="flex flex-wrap gap-2">
                {["All", "Pending", "In Progress", "Resolved"].map((status) => (
                  <motion.button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${
                      filterStatus === status
                        ? "bg-white text-slate-900 shadow-lg"
                        : "bg-white/10 text-white/70 hover:bg-white/20 border border-white/10"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {status}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Reports List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          {filteredReports.length === 0 ? (
            <motion.div
              className="bg-white/5 backdrop-blur-2xl rounded-2xl p-12 border border-white/10 text-center shadow-2xl"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex justify-center mb-6">
                <img 
                  src={iconUrls.empty} 
                  alt="No reports" 
                  className="w-24 h-24 opacity-60"
                />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                {searchTerm || filterStatus !== "All"
                  ? "No matching reports found"
                  : "No reports yet"}
              </h3>
              <p className="text-white/60 text-lg mb-8 max-w-md mx-auto">
                {searchTerm || filterStatus !== "All"
                  ? "Try adjusting your search criteria or filters to find what you're looking for."
                  : "Start by submitting your first weather incident report to get started."}
              </p>
              {!searchTerm && filterStatus === "All" && (
                <motion.button
                  onClick={() => navigate("/report")}
                  className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-cyan-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Submit Your First Report
                </motion.button>
              )}
            </motion.div>
          ) : (
            <div className="grid gap-4">
              <AnimatePresence mode="popLayout">
                {filteredReports.map((report, index) => (
                  <motion.div
                    key={report.id}
                    className="group"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ 
                      duration: 0.4,
                      delay: index * 0.05,
                      layout: { duration: 0.3 }
                    }}
                    layout
                  >
                    <div className="bg-white/5 backdrop-blur-2xl rounded-2xl p-6 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-500 shadow-lg hover:shadow-xl">
                      <div className="flex flex-col lg:flex-row gap-6">
                        {/* Status Indicator */}
                        <div className="flex lg:flex-col items-start lg:items-center gap-4 lg:gap-3">
                          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(report.status)}`}>
                            {report.status}
                          </div>
                          <div className="w-8 h-8 flex items-center justify-center">
                            <img 
                              src={getStatusIcon(report.status)} 
                              alt={report.status}
                              className="w-6 h-6 opacity-70"
                            />
                          </div>
                        </div>

                        {/* Report Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors duration-300 line-clamp-1">
                                {report.name}
                              </h3>
                              <p className="text-white/70 leading-relaxed line-clamp-2">
                                {report.description}
                              </p>
                            </div>
                            
                            {/* Actions */}
                            <div className="flex lg:flex-col gap-2 shrink-0">
                              <motion.button
                                onClick={() => navigate(`/user/reports/${report.id}`)}
                                className="px-4 py-2 bg-blue-600/20 text-blue-300 border border-blue-500/30 rounded-lg hover:bg-blue-600/40 transition-all duration-300 flex items-center gap-2 text-sm font-medium"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <FaEye className="text-xs" /> Details
                              </motion.button>
                              {report.status === "Pending" && (
                                <motion.button
                                  onClick={() => handleDelete(report.id)}
                                  disabled={deleteLoading === report.id}
                                  className="px-4 py-2 bg-red-600/20 text-red-300 border border-red-500/30 rounded-lg hover:bg-red-600/40 transition-all duration-300 flex items-center gap-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                  whileHover={{ scale: deleteLoading === report.id ? 1 : 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  {deleteLoading === report.id ? (
                                    <>
                                      <motion.div
                                        className="w-3 h-3 border-2 border-red-300 border-t-transparent rounded-full"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                      />
                                      Deleting
                                    </>
                                  ) : (
                                    <>
                                      <FaTrash className="text-xs" /> Delete
                                    </>
                                  )}
                                </motion.button>
                              )}
                            </div>
                          </div>

                          {/* Metadata */}
                          <div className="flex flex-wrap gap-3 text-sm">
                            <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg text-white/60">
                              <img 
                                src={iconUrls.location} 
                                alt="Location" 
                                className="w-3 h-3"
                              />
                              {report.address || `${report.latitude?.toFixed(4) || 'N/A'}, ${report.longitude?.toFixed(4) || 'N/A'}`}
                            </span>
                            <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg text-white/60">
                              <img 
                                src={iconUrls.calendar} 
                                alt="Date" 
                                className="w-3 h-3"
                              />
                              {new Date(report.date_created).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

// Enhanced StatCard Component
function StatCard({ icon, label, value, color, description }) {
  const colorClasses = {
    blue: "from-blue-500/20 to-blue-600/20 border-blue-400/30",
    amber: "from-amber-500/20 to-amber-600/20 border-amber-400/30",
    cyan: "from-cyan-500/20 to-cyan-600/20 border-cyan-400/30",
    emerald: "from-emerald-500/20 to-emerald-600/20 border-emerald-400/30",
  };

  return (
    <motion.div
      className={`bg-gradient-to-br ${colorClasses[color]} backdrop-blur-xl rounded-2xl p-6 border shadow-lg hover:shadow-xl transition-all duration-500 group`}
      whileHover={{ scale: 1.02, y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          <img 
            src={icon} 
            alt={label}
            className="w-6 h-6 filter brightness-0 invert"
          />
        </div>
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm font-semibold text-white/90 mb-1">{label}</div>
      <div className="text-xs text-white/60">{description}</div>
    </motion.div>
  );
}

export default MyReportsPage;