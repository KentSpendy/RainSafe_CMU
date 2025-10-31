import React, { useContext, useState } from "react";
import { NotificationContext } from "../context/NotificationContext";
import { motion, AnimatePresence } from "framer-motion";
import { Bell } from "lucide-react";

export default function Navbar() {
  const { notifications, unreadCount, markAsRead, clearAll } =
    useContext(NotificationContext);
  const [showPanel, setShowPanel] = useState(false);

  return (
    <div className="flex justify-between items-center px-6 py-3 bg-blue-900 text-white shadow-md relative">
      <h1 className="font-bold text-lg">RainSafe CMU</h1>

      <div className="relative">
        <button
          className="relative p-2 rounded-full hover:bg-blue-800 transition"
          onClick={() => setShowPanel((prev) => !prev)}
        >
          <Bell size={24} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </button>

        <AnimatePresence>
          {showPanel && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-80 bg-white text-black rounded-lg shadow-lg z-50"
            >
              <div className="flex justify-between items-center px-4 py-2 border-b">
                <h3 className="font-semibold">Notifications</h3>
                <button
                  onClick={clearAll}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Clear all
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="p-4 text-center text-gray-500">
                    No notifications yet
                  </p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markAsRead(n.id)}
                      className={`px-4 py-3 border-b cursor-pointer transition ${
                        n.is_read ? "bg-gray-50" : "bg-blue-50"
                      } hover:bg-blue-100`}
                    >
                      <p className="font-medium">{n.title}</p>
                      <p className="text-sm text-gray-600">{n.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(n.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
