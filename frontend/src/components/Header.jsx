import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import apiClient from "../api/client";

const Header = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const fetchUnreadCount = async () => {
    try {
      const res = await apiClient.get("/notifications/unread-count/");
      if (res.data?.success) {
        setUnreadCount(res.data.data.count);
      }
    } catch (err) {
      console.error("Failed to fetch unread count", err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await apiClient.get("/notifications/");
      if (res.data?.success) {
        setNotifications(res.data.data.results || []);
      }
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    // Poll unread counts every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleDropdown = () => {
    setShowDropdown(!showDropdown);
    if (!showDropdown) {
      fetchNotifications();
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await apiClient.post("/notifications/read-all/");
      setUnreadCount(0);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReadNotification = async (id) => {
    try {
      await apiClient.post(`/notifications/${id}/read/`);
      fetchUnreadCount();
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 h-16 px-8 flex items-center justify-between sticky top-0 z-40">
      <h2 className="text-lg font-bold text-gray-800">AAK Enterprise Workflow Dashboard</h2>

      <div className="flex items-center space-x-4">
        {/* Notifications Icon & Dropdown */}
        <div className="relative">
          <button
            onClick={handleToggleDropdown}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 relative transition-colors focus:outline-none"
          >
            {/* Bell Icon */}
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>

            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 bg-red-500 text-white rounded-full text-xxs px-1.5 py-0.5 font-bold">
                {unreadCount}
              </span>
            )}
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-150 py-2 z-55 max-h-96 overflow-y-auto">
              <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                <span className="font-semibold text-sm text-gray-700">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-gray-400">No notifications</div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 text-sm hover:bg-gray-50 transition-colors ${
                        !n.is_read ? "bg-blue-50/50" : ""
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-gray-800">{n.title}</span>
                        {!n.is_read && (
                          <button
                            onClick={() => handleReadNotification(n.id)}
                            className="text-xxs text-blue-500 hover:text-blue-700"
                          >
                            Mark read
                          </button>
                        )}
                      </div>
                      <p className="text-gray-500 mt-1 text-xs">{n.message}</p>
                      <span className="text-xxs text-gray-450 mt-1 block">
                        {new Date(n.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex items-center space-x-2 border-l pl-4 border-gray-200">
          <span className="text-sm font-semibold text-gray-700">
            {user?.first_name} {user?.last_name}
          </span>
          <span className="bg-blue-100 text-blue-800 text-xxs font-bold px-2 py-0.5 rounded-full uppercase">
            {user?.role}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
