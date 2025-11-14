import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Bell } from "lucide-react";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export default function AdminNotificationDropdown() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("access");
      const res = await axios.get("http://127.0.0.1:8000/api/reports/all/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Get the most recent 5 reports (data is already ordered by date_created desc)
      const recentReports = res.data.slice(0, 5);
      setNotifications(recentReports);

      // Count unread (reports with status "Pending")
      const unread = recentReports.filter((r) => r.status === "Pending").length;
      setUnreadCount(unread);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  const handleReportClick = (reportId) => {
    setShowDropdown(false);
    navigate(`/admin/reports?highlight=${reportId}`);
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

  return (
    <div className="relative">
      {/* Bell Icon Button */}
      <motion.div
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative cursor-pointer hover:scale-110 transition"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Bell className="text-white w-6 h-6" />
        {unreadCount > 0 && (
          <motion.span
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500 }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </motion.div>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {showDropdown && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowDropdown(false)}
            />

            {/* Dropdown Content */}
            <motion.div
              className="absolute right-0 mt-4 w-96 bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/30 z-50 overflow-hidden"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-500">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    Recent Reports
                  </h3>
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      navigate("/admin/reports");
                    }}
                    className="text-xs text-white/90 hover:text-white hover:underline transition-all"
                  >
                    View All
                  </button>
                </div>
                {unreadCount > 0 && (
                  <p className="text-xs text-white/80 mt-1">
                    {unreadCount} pending report{unreadCount !== 1 ? "s" : ""}
                  </p>
                )}
              </div>

              {/* Notifications List */}
              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center">
                    <div className="text-4xl mb-2">📭</div>
                    <p className="text-gray-600 text-sm">No recent reports</p>
                  </div>
                ) : (
                  notifications.map((report) => (
                    <motion.div
                      key={report.id}
                      onClick={() => handleReportClick(report.id)}
                      className="px-4 py-3 border-b border-gray-200 cursor-pointer transition-all hover:bg-blue-50 group"
                      whileHover={{ x: 4 }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-800 text-sm group-hover:text-blue-600 transition-colors">
                          {report.name}
                        </h4>
                        <span
                          className={`px-2 py-0.5 rounded-lg text-xs font-medium border ${getStatusColor(
                            report.status
                          )}`}
                        >
                          {report.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                        {report.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          📅 {dayjs(report.date_created).fromNow()}
                        </span>
                        {report.address && (
                          <span className="flex items-center gap-1 text-gray-400">
                            📍 {report.address.substring(0, 20)}...
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
