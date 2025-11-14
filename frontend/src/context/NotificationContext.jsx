import React, { createContext, useState, useEffect, useCallback, useContext } from "react";
import API from "../api/api";
import { AuthContext } from "./AuthContext";

export const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { isAuthenticated } = useContext(AuthContext);

  const fetchNotifications = useCallback(async () => {
    // Only fetch if user is authenticated
    if (!isAuthenticated) {
      return;
    }

    try {
      const res = await API.get("notifications/");
      setNotifications(res.data);
      setUnreadCount(res.data.filter((n) => !n.is_read).length);
    } catch (error) {
      // Silently fail on 401 - user might be logging out
      if (error.response?.status !== 401) {
        console.error("Failed to fetch notifications:", error);
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Only fetch and poll when authenticated
    if (!isAuthenticated) {
      // Clear notifications when logged out
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    // Fetch immediately when authenticated
    fetchNotifications();

    // Poll every 30 seconds while authenticated
    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, [fetchNotifications, isAuthenticated]);

  const markAsRead = async (id) => {
    try {
      await API.patch(`notifications/${id}/mark_as_read/`);
      fetchNotifications();
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const clearAll = async () => {
    try {
      await API.delete("notifications/clear_all/");
      fetchNotifications();
    } catch (error) {
      console.error("Failed to clear notifications:", error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAsRead, clearAll }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
