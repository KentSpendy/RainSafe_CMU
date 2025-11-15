import { useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NotificationContext } from "../context/NotificationContext";
import UserNavbar from "../components/UserNavbar";
import dayjs from "dayjs";
import weatherImg from "../assets/weather.jpg";

export default function NotificationsPage() {
  const { notifications, markAsRead, clearAll } =
    useContext(NotificationContext);

  // Online icon assets URLs
  const iconUrls = {
    bell: "https://img.icons8.com/ios-filled/100/3b82f6/bell.png",
    notification: "https://img.icons8.com/ios-filled/100/ffffff/notification.png",
    total: "https://img.icons8.com/ios-filled/100/ffffff/bell.png",
    unread: "https://img.icons8.com/ios-filled/100/ffffff/new-message.png",
    read: "https://img.icons8.com/ios-filled/100/ffffff/opened-letter.png",
    today: "https://img.icons8.com/ios-filled/100/ffffff/calendar.png",
    empty: "https://img.icons8.com/ios-filled/100/ffffff/nothing-found.png",
    time: "https://img.icons8.com/ios-filled/50/94a3b8/clock.png",
    date: "https://img.icons8.com/ios-filled/50/94a3b8/calendar.png",
    markRead: "https://img.icons8.com/ios-filled/50/ffffff/checkmark.png",
    clearAll: "https://img.icons8.com/ios-filled/50/ffffff/trash.png",
    unreadIcon: "https://img.icons8.com/ios-filled/50/3b82f6/new-message.png",
    readIcon: "https://img.icons8.com/ios-filled/50/10b981/opened-letter.png"
  };

  // Sort notifications by date descending (most recent first)
  const sortedNotifications = [...notifications].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  // Analytics for notifications
  const analytics = {
    total: notifications.length,
    unread: notifications.filter((n) => !n.is_read).length,
    read: notifications.filter((n) => n.is_read).length,
    today: notifications.filter((n) =>
      dayjs(n.created_at).isSame(dayjs(), "day")
    ).length,
  };

  const handleMarkAllAsRead = () => {
    sortedNotifications
      .filter((n) => !n.is_read)
      .forEach((n) => markAsRead(n.id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* Navbar */}
      <UserNavbar unreadNotifications={analytics.unread} />

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
      <div className="relative z-10 min-h-screen p-6 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-8 pt-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20">
                <img 
                  src={iconUrls.bell} 
                  alt="Notifications" 
                  className="w-8 h-8"
                />
              </div>
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold text-white">
                  Notifications
                </h1>
                <p className="text-white/60 text-lg mt-2">
                  Total: <span className="font-semibold text-white">{analytics.total}</span> • 
                  Unread: <span className="font-semibold text-white">{analytics.unread}</span>
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            {sortedNotifications.length > 0 && (
              <div className="flex gap-3">
                {analytics.unread > 0 && (
                  <motion.button
                    onClick={handleMarkAllAsRead}
                    className="px-6 py-3 bg-blue-600/20 text-blue-300 border border-blue-500/30 rounded-xl hover:bg-blue-600/40 transition-all duration-300 font-semibold shadow-lg flex items-center gap-3 backdrop-blur-xl"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <img src={iconUrls.markRead} alt="Mark all read" className="w-4 h-4" />
                    Mark All Read
                  </motion.button>
                )}
                <motion.button
                  onClick={clearAll}
                  className="px-6 py-3 bg-red-600/20 text-red-300 border border-red-500/30 rounded-xl hover:bg-red-600/40 transition-all duration-300 font-semibold shadow-lg flex items-center gap-3 backdrop-blur-xl"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <img src={iconUrls.clearAll} alt="Clear all" className="w-4 h-4" />
                  Clear All
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Analytics Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
        >
          <StatCard
            icon={iconUrls.total}
            label="Total Notifications"
            value={analytics.total}
            color="blue"
            description="All notifications"
          />
          <StatCard
            icon={iconUrls.unread}
            label="Unread Messages"
            value={analytics.unread}
            color="amber"
            description="Require attention"
          />
          <StatCard
            icon={iconUrls.read}
            label="Already Read"
            value={analytics.read}
            color="emerald"
            description="Reviewed notifications"
          />
          <StatCard
            icon={iconUrls.today}
            label="Today"
            value={analytics.today}
            color="purple"
            description="Recent activity"
          />
        </motion.div>

        {/* Unread Alert */}
        {analytics.unread > 0 && (
          <motion.div
            className="bg-blue-600/20 border border-blue-500/30 rounded-2xl p-4 mb-6 backdrop-blur-xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-blue-300 font-semibold">
                You have {analytics.unread} unread notification{analytics.unread !== 1 ? "s" : ""}
              </span>
            </div>
          </motion.div>
        )}

        {/* Notifications List */}
        {sortedNotifications.length > 0 ? (
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <AnimatePresence mode="popLayout">
              {sortedNotifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  className={`bg-white/5 backdrop-blur-2xl rounded-2xl p-6 border shadow-lg hover:shadow-xl transition-all duration-500 group ${
                    !notification.is_read
                      ? "border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10"
                      : "border-white/10 hover:bg-white/10"
                  }`}
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
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Status Indicator */}
                    <div className="flex lg:flex-col items-start lg:items-center gap-4 lg:gap-3">
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        notification.is_read 
                          ? "bg-emerald-600/20 text-emerald-300 border border-emerald-500/30" 
                          : "bg-blue-600/20 text-blue-300 border border-blue-500/30"
                      }`}>
                        {notification.is_read ? "Read" : "Unread"}
                      </div>
                      <div className="w-8 h-8 flex items-center justify-center">
                        <img 
                          src={notification.is_read ? iconUrls.readIcon : iconUrls.unreadIcon} 
                          alt={notification.is_read ? "Read" : "Unread"}
                          className="w-5 h-5 opacity-70"
                        />
                      </div>
                    </div>

                    {/* Notification Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <h3 className={`text-xl font-bold mb-2 group-hover:text-cyan-300 transition-colors duration-300 ${
                            !notification.is_read ? "text-white" : "text-white/90"
                          }`}>
                            {notification.title}
                          </h3>
                          <p className={`leading-relaxed ${
                            !notification.is_read ? "text-white/80" : "text-white/60"
                          }`}>
                            {notification.message}
                          </p>
                        </div>
                        
                        {/* Action Button */}
                        {!notification.is_read && (
                          <div className="flex lg:flex-col gap-2 shrink-0">
                            <motion.button
                              onClick={() => markAsRead(notification.id)}
                              className="px-4 py-2 bg-blue-600/20 text-blue-300 border border-blue-500/30 rounded-lg hover:bg-blue-600/40 transition-all duration-300 flex items-center gap-2 text-sm font-medium"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <img src={iconUrls.markRead} alt="Mark read" className="w-3 h-3" />
                              Mark Read
                            </motion.button>
                          </div>
                        )}
                      </div>

                      {/* Metadata */}
                      <div className="flex flex-wrap gap-3 text-sm">
                        <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg text-white/60">
                          <img src={iconUrls.date} alt="Date" className="w-3 h-3" />
                          {dayjs(notification.created_at).format("MMM D, YYYY")}
                        </span>
                        <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg text-white/60">
                          <img src={iconUrls.time} alt="Time" className="w-3 h-3" />
                          {dayjs(notification.created_at).format("h:mm A")}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          // Empty State
          <motion.div
            className="bg-white/5 backdrop-blur-2xl rounded-2xl p-12 border border-white/10 text-center shadow-2xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex justify-center mb-6">
              <img 
                src={iconUrls.empty} 
                alt="No notifications" 
                className="w-24 h-24 opacity-60"
              />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">
              All Caught Up!
            </h3>
            <p className="text-white/60 text-lg mb-8 max-w-md mx-auto">
              You don't have any notifications at the moment. 
              Check back later for updates and alerts about your weather reports.
            </p>
            <div className="w-12 h-1 bg-blue-500/50 rounded-full mx-auto"></div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Enhanced StatCard Component
function StatCard({ icon, label, value, color, description }) {
  const colorClasses = {
    blue: "from-blue-500/20 to-blue-600/20 border-blue-400/30",
    amber: "from-amber-500/20 to-amber-600/20 border-amber-400/30",
    emerald: "from-emerald-500/20 to-emerald-600/20 border-emerald-400/30",
    purple: "from-purple-500/20 to-purple-600/20 border-purple-400/30",
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