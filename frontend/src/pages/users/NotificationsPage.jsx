import { useEffect, useState } from "react";
import API from "../../api/api";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await API.get("notifications/all/");
        setNotifications(res.data);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await API.put(`notifications/${id}/read/`, { is_read: true });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 to-blue-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-4">🔔 Notification</h1>
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <p className="text-white/70">No notifications yet.</p>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-lg border ${
                notif.is_read ? "border-white/20 bg-white/5" : "border-blue-400 bg-blue-800/40"
              }`}
            >
              <h2 className="text-lg font-semibold">{notif.title}</h2>
              <p className="text-white/80 text-sm">{notif.message}</p>
              <p className="text-xs text-white/50 mt-2">
                {new Date(notif.created_at).toLocaleString()}
              </p>
              {!notif.is_read && (
                <button
                  onClick={() => markAsRead(notif.id)}
                  className="mt-3 text-sm bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded"
                >
                  Mark as Read
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
