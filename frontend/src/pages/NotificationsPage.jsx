import { useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NotificationContext } from "../context/NotificationContext";
import UserNavbar from "../components/UserNavbar";
import dayjs from "dayjs";
import weatherImg from "../assets/weather.jpg";

export default function NotificationsPage() {
  const { notifications, markAsRead, clearAll } =
    useContext(NotificationContext);

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
    <div className="min-h-screen relative overflow-hidden">
      {/* Navbar */}
      <UserNavbar unreadNotifications={analytics.unread} />

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
            <span className="text-5xl">🔔</span>
            Notifications
          </h1>
          <p className="text-white/70 text-lg">
            Total:{" "}
            <span className="font-semibold text-white">{analytics.total}</span>{" "}
            notifications | Unread:{" "}
            <span className="font-semibold text-white">{analytics.unread}</span>
          </p>
        </motion.div>

        {/* Analytics Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}>
          <StatCard
            icon="🔔"
            label="Total Notifications"
            value={analytics.total}
            color="blue"
          />
          <StatCard
            icon="📬"
            label="Unread"
            value={analytics.unread}
            color="yellow"
          />
          <StatCard
            icon="📭"
            label="Already Read"
            value={analytics.read}
            color="green"
          />
          <StatCard
            icon="📅"
            label="Today"
            value={analytics.today}
            color="purple"
          />
        </motion.div>

        {/* Action Buttons */}
        {sortedNotifications.length > 0 && (
          <motion.div
            className="bg-white/10 backdrop-blur-2xl rounded-3xl p-6 border border-white/20 mb-6 shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}>
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="flex items-center gap-3">
                {analytics.unread > 0 && (
                  <span className="px-4 py-2 bg-blue-500/20 text-blue-300 border border-blue-500/30 text-sm font-medium rounded-xl">
                    {analytics.unread} new notification
                    {analytics.unread !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <div className="flex gap-3">
                {analytics.unread > 0 && (
                  <motion.button
                    onClick={handleMarkAllAsRead}
                    className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-300 font-medium shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}>
                    Mark All as Read
                  </motion.button>
                )}
                <motion.button
                  onClick={clearAll}
                  className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-300 font-medium shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}>
                  Clear All
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Notifications List */}
        {sortedNotifications.length > 0 ? (
          <div className="space-y-4">
            <AnimatePresence>
              {sortedNotifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  className={`bg-white/10 backdrop-blur-2xl rounded-3xl p-6 border shadow-xl hover:bg-white/15 transition-all duration-300 group ${
                    !notification.is_read
                      ? "border-blue-400/50"
                      : "border-white/20"
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}>
                  <div className="flex flex-col lg:flex-row justify-between gap-6">
                    {/* Notification Content */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4 mb-3">
                        <div className="text-4xl">
                          {notification.is_read ? "📭" : "📬"}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                              {notification.title}
                            </h3>
                            <span
                              className={`px-3 py-1 rounded-lg text-xs font-medium border ${
                                notification.is_read
                                  ? "bg-green-500/20 text-green-300 border-green-500/30"
                                  : "bg-blue-500/20 text-blue-300 border-blue-500/30"
                              }`}>
                              {notification.is_read ? "Read" : "Unread"}
                            </span>
                          </div>
                          <p className="text-white/70 leading-relaxed mb-3">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-white/60">
                            <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg">
                              📅{" "}
                              {dayjs(notification.created_at).format(
                                "MMM D, YYYY"
                              )}
                            </span>
                            <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg">
                              🕒{" "}
                              {dayjs(notification.created_at).format("h:mm A")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    {!notification.is_read && (
                      <div className="flex items-center">
                        <motion.button
                          onClick={() => markAsRead(notification.id)}
                          className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all duration-300 font-medium shadow-lg"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}>
                          Mark as Read
                        </motion.button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          // Empty State
          <motion.div
            className="bg-white/10 backdrop-blur-2xl rounded-3xl p-16 border border-white/20 text-center shadow-xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}>
            <div className="text-8xl mb-6">🔔</div>
            <h3 className="text-2xl font-bold text-white mb-3">
              No Notifications Found
            </h3>
            <p className="text-white/70 text-lg">
              You're all caught up! Check back later for new updates and alerts.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Helper Component
function StatCard({ icon, label, value, color }) {
  const colorClasses = {
    blue: "from-blue-500/20 to-blue-600/20 border-blue-400/30",
    yellow: "from-yellow-500/20 to-yellow-600/20 border-yellow-400/30",
    green: "from-green-500/20 to-green-600/20 border-green-400/30",
    purple: "from-purple-500/20 to-purple-600/20 border-purple-400/30",
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
