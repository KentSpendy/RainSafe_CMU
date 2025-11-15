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
  FaFileAlt,
  FaClock,
  FaSpinner,
  FaCheckCircle,
  FaPlus,
  FaTimes,
  FaChartLine,
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
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const filterReports = () => {
    let filtered = reports;

    if (filterStatus !== "All") {
      filtered = filtered.filter((r) => r.status === filterStatus);
    }

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
        error.response?.data?.error || "Failed to delete report",
        { id: loadingToast, duration: 4000 }
      );
    } finally {
      setDeleteLoading(null);
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "Pending":
        return {
          color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
          icon: <FaClock className="text-yellow-400" />,
          bgGradient: "from-yellow-500/10 to-yellow-600/10",
        };
      case "In Progress":
        return {
          color: "bg-blue-500/20 text-blue-300 border-blue-500/30",
          icon: <FaSpinner className="text-blue-400" />,
          bgGradient: "from-blue-500/10 to-blue-600/10",
        };
      case "Resolved":
        return {
          color: "bg-green-500/20 text-green-300 border-green-500/30",
          icon: <FaCheckCircle className="text-green-400" />,
          bgGradient: "from-green-500/10 to-green-600/10",
        };
      default:
        return {
          color: "bg-gray-500/20 text-gray-300 border-gray-500/30",
          icon: <FaFileAlt className="text-gray-400" />,
          bgGradient: "from-gray-500/10 to-gray-600/10",
        };
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-b from-blue-950 to-blue-800">
        <motion.div
          className="w-20 h-20 border-4 border-white/30 border-t-white rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <p className="text-white text-lg mt-4">Loading your reports...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <Toaster
        position="top-right"
        containerStyle={{ top: 80, zIndex: 99999 }}
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
        }}
      />

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

      {/* Animated Background Pattern */}
      <div className="fixed inset-0 z-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      {/* Floating Particles */}
      <div className="fixed inset-0 z-0 opacity-20">
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

      {/* Main Content */}
      <div className="relative z-10 min-h-screen p-6 md:p-8 max-w-[1800px] mx-auto">
        {/* Header with Breadcrumb */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2 text-white/60 text-sm mb-4">
            <span className="hover:text-white cursor-pointer" onClick={() => navigate('/user/dashboard')}>Dashboard</span>
            <span>/</span>
            <span className="text-white">My Reports</span>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <FaFileAlt className="text-white text-2xl" />
                </div>
                My Reports
              </h1>
              <div className="flex items-center gap-4 text-white/70">
                <span className="flex items-center gap-2">
                  <FaChartLine className="text-cyan-400" />
                  Total: <span className="font-semibold text-white">{reports.length}</span>
                </span>
                <span className="text-white/40">|</span>
                <span className="flex items-center gap-2">
                  <FaFilter className="text-purple-400" />
                  Showing: <span className="font-semibold text-white">{filteredReports.length}</span>
                </span>
              </div>
            </div>

            <motion.button
              onClick={() => navigate("/report")}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaPlus /> New Report
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <StatCard
            icon={<FaFileAlt />}
            label="Total Reports"
            value={reports.length}
            gradient="from-blue-500 to-cyan-500"
            delay={0}
          />
          <StatCard
            icon={<FaClock />}
            label="Pending"
            value={reports.filter((r) => r.status === "Pending").length}
            gradient="from-yellow-500 to-orange-500"
            delay={0.05}
          />
          <StatCard
            icon={<FaSpinner />}
            label="In Progress"
            value={reports.filter((r) => r.status === "In Progress").length}
            gradient="from-blue-500 to-purple-500"
            delay={0.1}
          />
          <StatCard
            icon={<FaCheckCircle />}
            label="Resolved"
            value={reports.filter((r) => r.status === "Resolved").length}
            gradient="from-green-500 to-emerald-500"
            delay={0.15}
          />
        </motion.div>

        {/* Filters & Search */}
        <motion.div
          className="bg-white/10 backdrop-blur-2xl rounded-3xl p-6 border border-white/20 mb-6 shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50 text-lg" />
                <input
                  type="text"
                  placeholder="Search by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all text-lg"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
            </div>

            {/* Status Filters */}
            <div className="flex flex-wrap gap-2">
              {[
                { label: "All", icon: <FaFileAlt /> },
                { label: "Pending", icon: <FaClock /> },
                { label: "In Progress", icon: <FaSpinner /> },
                { label: "Resolved", icon: <FaCheckCircle /> },
              ].map(({ label, icon }) => (
                <motion.button
                  key={label}
                  onClick={() => setFilterStatus(label)}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                    filterStatus === label
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-105"
                      : "bg-white/10 text-white/70 hover:bg-white/20 border border-white/20 hover:scale-105"
                  }`}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {icon}
                  <span className="hidden sm:inline">{label}</span>
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
            transition={{ delay: 0.3 }}
          >
            <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
              <FaFileAlt className="text-6xl text-white/40" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">
              {searchTerm || filterStatus !== "All"
                ? "No Reports Found"
                : "No Reports Yet"}
            </h3>
            <p className="text-white/60 text-lg mb-8 max-w-md mx-auto">
              {searchTerm || filterStatus !== "All"
                ? "Try adjusting your search or filter criteria"
                : "Start by submitting your first incident report"}
            </p>
            {!searchTerm && filterStatus === "All" && (
              <motion.button
                onClick={() => navigate("/report")}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-xl hover:shadow-xl transition-all duration-300 font-semibold text-lg flex items-center gap-3 mx-auto"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaPlus />
                Submit Your First Report
              </motion.button>
            )}
          </motion.div>
        ) : (
          <div className="grid gap-4">
            <AnimatePresence mode="popLayout">
              {filteredReports.map((report, index) => {
                const statusConfig = getStatusConfig(report.status);
                return (
                  <motion.div
                    key={report.id}
                    className="bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 hover:border-white/30 transition-all duration-300 shadow-xl overflow-hidden group"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    layout
                  >
                    {/* Status Indicator Bar */}
                    <div className={`h-1.5 bg-gradient-to-r ${statusConfig.bgGradient}`}></div>
                    
                    <div className="p-6">
                      <div className="flex flex-col lg:flex-row gap-6">
                        {/* Report Info */}
                        <div className="flex-1">
                          <div className="flex items-start gap-4 mb-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/10">
                              {statusConfig.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors truncate">
                                {report.name}
                              </h3>
                              <p className="text-white/70 leading-relaxed line-clamp-2">
                                {report.description}
                              </p>
                            </div>
                          </div>

                          {/* Metadata */}
                          <div className="flex flex-wrap gap-3">
                            <span className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl text-sm text-white/80 border border-white/10">
                              <FaMapMarkerAlt className="text-cyan-400 flex-shrink-0" />
                              <span className="truncate max-w-[200px]">
                                {report.address || `${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)}`}
                              </span>
                            </span>
                            <span className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl text-sm text-white/80 border border-white/10">
                              <FaCalendar className="text-purple-400 flex-shrink-0" />
                              {new Date(report.date_created).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                            <span className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold border text-sm ${statusConfig.color}`}>
                              {statusConfig.icon}
                              {report.status}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex lg:flex-col gap-3 lg:min-w-[140px]">
                          <motion.button
                            onClick={() => navigate(`/user/reports/${report.id}`)}
                            className="flex-1 lg:flex-none px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 flex items-center justify-center gap-2 font-semibold shadow-lg"
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <FaEye /> View
                          </motion.button>
                          {report.status === "Pending" && (
                            <motion.button
                              onClick={() => handleDelete(report.id)}
                              disabled={deleteLoading === report.id}
                              className="flex-1 lg:flex-none px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 flex items-center justify-center gap-2 font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                              whileHover={{ scale: deleteLoading === report.id ? 1 : 1.05, y: deleteLoading === report.id ? 0 : -2 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {deleteLoading === report.id ? (
                                <>
                                  <motion.div
                                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                  />
                                  <span className="hidden sm:inline">Deleting</span>
                                </>
                              ) : (
                                <>
                                  <FaTrash /> <span className="hidden sm:inline">Delete</span>
                                </>
                              )}
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

// Enhanced StatCard Component
function StatCard({ icon, label, value, gradient, delay }) {
  return (
    <motion.div
      className={`bg-gradient-to-br ${gradient} bg-opacity-20 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl relative overflow-hidden group`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.05, y: -5 }}
    >
      {/* Shine effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-2xl text-white">
            {icon}
          </div>
        </div>
        <div className="text-4xl font-bold text-white mb-2">{value}</div>
        <div className="text-sm text-white/80 font-medium">{label}</div>
      </div>
    </motion.div>
  );
}

export default MyReportsPage;