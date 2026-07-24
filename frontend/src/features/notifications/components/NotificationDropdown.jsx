import React, { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../hooks/useNotifications";
import { useUnreadNotificationCount } from "../hooks/useUnreadNotificationCount";
import { useMarkNotificationRead } from "../hooks/useMarkNotificationRead";
import { useMarkAllNotificationsRead } from "../hooks/useMarkAllNotificationsRead";
import NotificationList from "./NotificationList";

const NotificationDropdown = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const { data: notificationsRes } = useNotifications({ page_size: 5 });
  const { data: countRes } = useUnreadNotificationCount();
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();

  const notifications = notificationsRes?.data?.results || [];
  const unreadCount = countRes?.data?.count || 0;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  const handleNotificationClick = async (notif) => {
    if (!notif.is_read) {
      await markReadMutation.mutateAsync(notif.id);
    }
    onClose();
    if (notif.bill?.id) {
      if (notif.bill.current_status === "ACCOUNTS_CLEARED") {
        navigate(`/bills/${notif.bill.id}`);
      } else {
        navigate(`/workflow/${notif.bill.id}`);
      }
    } else {
      navigate("/workflow");
    }
  };

  const handleMarkAllRead = async (e) => {
    e.stopPropagation();
    await markAllReadMutation.mutateAsync();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2.5 w-80 bg-white border border-zinc-200 rounded-xl shadow-xl z-50 overflow-hidden font-sans"
    >
      <div className="px-4 py-3 bg-zinc-50 border-b border-zinc-200/80 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-zinc-900 text-xs">Notifications</span>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white font-bold text-[9px] px-1.5 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={markAllReadMutation.isPending}
            className="text-[10px] text-zinc-500 hover:text-zinc-900 font-bold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
          >
            Mark all read
          </button>
        )}
      </div>

      <NotificationList
        notifications={notifications}
        onClick={handleNotificationClick}
        onMarkRead={markReadMutation.mutate}
        isCompact={true}
      />

      <div className="border-t border-zinc-150 p-2 bg-zinc-50 text-center">
        <button
          onClick={() => {
            navigate("/notifications");
            onClose();
          }}
          className="text-[10px] font-bold text-zinc-800 hover:text-zinc-900 uppercase tracking-wider cursor-pointer"
        >
          View All Notifications
        </button>
      </div>
    </div>
  );
};

export default React.memo(NotificationDropdown);
