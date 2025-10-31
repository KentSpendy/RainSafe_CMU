import { useContext } from "react";
import { NotificationContext } from "../context/NotificationContext";
import dayjs from "dayjs";

export default function NotificationsPage() {
  const { notifications, markAsRead, clearAll } = useContext(NotificationContext);

  // Sort notifications by date descending (most recent first)
  const sortedNotifications = [...notifications].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  // Analytics for notifications
  const analytics = {
    total: notifications.length,
    unread: notifications.filter(n => !n.is_read).length,
    read: notifications.filter(n => n.is_read).length,
    today: notifications.filter(n => 
      dayjs(n.created_at).isSame(dayjs(), 'day')
    ).length
  };

  return (
    <div className="space-y-6">
      {/* ====== Analytics Section ====== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { 
            label: "Total Notifications", 
            value: analytics.total, 
            icon: "🔔",
            color: "text-gray-900"
          },
          { 
            label: "Unread", 
            value: analytics.unread, 
            icon: "📬",
            color: "text-blue-600"
          },
          { 
            label: "Already Read", 
            value: analytics.read, 
            icon: "📭",
            color: "text-green-600"
          },
          { 
            label: "Today", 
            value: analytics.today, 
            icon: "📅",
            color: "text-purple-600"
          },
        ].map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500 mb-1">{item.label}</div>
                <div className={`text-xl font-semibold ${item.color}`}>
                  {item.value}
                </div>
              </div>
              <div className="text-2xl">{item.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ====== Notifications Table ====== */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-900">📋 Notifications</h3>
            {analytics.unread > 0 && (
              <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs font-medium rounded-full">
                {analytics.unread} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              {sortedNotifications.length} notification{sortedNotifications.length !== 1 ? "s" : ""}
            </span>
            {sortedNotifications.length > 0 && (
              <button
                onClick={clearAll}
                className="px-3 py-1 text-sm bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition font-medium"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {sortedNotifications.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {["Status", "Title", "Message", "Date", "Actions"].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedNotifications.map((notification) => (
                  <tr 
                    key={notification.id} 
                    className={`hover:bg-gray-50 transition ${
                      !notification.is_read ? 'bg-blue-50 hover:bg-blue-100' : ''
                    }`}
                  >
                    {/* Status Column */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        notification.is_read 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {notification.is_read ? 'Read' : 'Unread'}
                      </span>
                    </td>

                    {/* Title Column */}
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {notification.title}
                      </div>
                    </td>

                    {/* Message Column */}
                    <td className="px-6 py-4">
                      <div className="text-gray-600 max-w-md truncate">
                        {notification.message}
                      </div>
                    </td>

                    {/* Date Column */}
                    <td className="px-6 py-4 text-gray-500">
                      {dayjs(notification.created_at).format("MMM D, YYYY")}
                      <div className="text-xs text-gray-400">
                        {dayjs(notification.created_at).format("h:mm A")}
                      </div>
                    </td>

                    {/* Actions Column */}
                    <td className="px-6 py-4">
                      {!notification.is_read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="px-3 py-1 text-xs bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 transition font-medium"
                        >
                          Mark Read
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          // ====== Empty State ======
          <div className="p-8 text-center">
            <div className="text-gray-300 text-4xl mb-4">🔔</div>
            <h4 className="text-lg font-semibold text-gray-600 mb-2">
              No Notifications Found
            </h4>
            <p className="text-gray-500">
              You're all caught up! Check back later for new updates and alerts.
            </p>
          </div>
        )}
      </div>

      {/* ====== Quick Actions ====== */}
      {sortedNotifications.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">⚡ Quick Actions</h4>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={clearAll}
              className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition font-medium"
            >
              Clear All Notifications
            </button>
            <button
              onClick={() => {
                sortedNotifications
                  .filter(n => !n.is_read)
                  .forEach(n => markAsRead(n.id));
              }}
              className="px-4 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 transition font-medium"
            >
              Mark All as Read
            </button>
            <div className="flex-1"></div>
            <span className="text-sm text-gray-500 self-center">
              {analytics.unread} unread • {analytics.read} read
            </span>
          </div>
        </div>
      )}
    </div>
  );
}