import React from "react";
import { Bell } from "lucide-react";
import NotificationBadge from "./NotificationBadge";

const NotificationBell = ({ onClick, unreadCount, isOpen }) => {
  return (
    <button
      onClick={onClick}
      className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50 rounded-lg relative cursor-pointer"
      aria-label="Open notifications dropdown"
      aria-haspopup="true"
      aria-expanded={isOpen}
    >
      <Bell className="size-4.5" />
      <NotificationBadge count={unreadCount} />
    </button>
  );
};

export default React.memo(NotificationBell);
