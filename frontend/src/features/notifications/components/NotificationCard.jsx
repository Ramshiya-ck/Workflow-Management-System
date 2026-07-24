import React from "react";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileText,
  PlayCircle,
  PauseCircle,
  Check,
} from "lucide-react";

const getRelativeTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.round(diffMs / 60000);
  const diffHours = Math.round(diffMs / 3600000);
  const diffDays = Math.round(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
};

const getNotificationIcon = (type) => {
  switch (type) {
    case "ASSIGNED":
      return <FileText className="size-4.5 text-blue-600" />;
    case "APPROVAL_REQUIRED":
      return <Clock className="size-4.5 text-amber-500" />;
    case "APPROVED":
    case "WORKFLOW_COMPLETED":
      return <CheckCircle2 className="size-4.5 text-emerald-600" />;
    case "REJECTED":
      return <AlertTriangle className="size-4.5 text-rose-500" />;
    case "HOLD":
      return <PauseCircle className="size-4.5 text-orange-500" />;
    case "RESUMED":
      return <PlayCircle className="size-4.5 text-indigo-500" />;
    default:
      return <Bell className="size-4.5 text-zinc-500" />;
  }
};

const getNotificationBg = (type) => {
  switch (type) {
    case "ASSIGNED":
      return "bg-blue-50 border-blue-100";
    case "APPROVAL_REQUIRED":
      return "bg-amber-50 border-amber-100";
    case "APPROVED":
    case "WORKFLOW_COMPLETED":
      return "bg-emerald-50 border-emerald-100";
    case "REJECTED":
      return "bg-rose-50 border-rose-100";
    case "HOLD":
      return "bg-orange-50 border-orange-100";
    case "RESUMED":
      return "bg-indigo-50 border-indigo-100";
    default:
      return "bg-zinc-50 border-zinc-200/80";
  }
};

const NotificationCard = ({ notif, onClick, onMarkRead, isCompact = false }) => {
  if (isCompact) {
    return (
      <div
        onClick={() => onClick(notif)}
        className="p-3 hover:bg-zinc-55/80 transition-colors cursor-pointer flex gap-3 items-start select-none relative"
      >
        {!notif.is_read && (
          <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-red-500" />
        )}
        <div className={`p-1.5 rounded-lg shrink-0 ${getNotificationBg(notif.notification_type)}`}>
          {getNotificationIcon(notif.notification_type)}
        </div>
        <div className="space-y-0.5 min-w-0 flex-1">
          <p className={`text-xs font-bold truncate leading-tight ${notif.is_read ? "text-zinc-800" : "text-zinc-900"}`}>
            {notif.title}
          </p>
          <p className={`text-[10px] line-clamp-2 leading-snug ${notif.is_read ? "text-zinc-555 font-semibold" : "text-zinc-600 font-medium"}`}>
            {notif.message}
          </p>
          <span className="text-[9px] text-zinc-400 font-semibold block">
            {getRelativeTime(notif.created_at)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => onClick(notif)}
      className={`p-4 transition-all flex gap-4 items-start cursor-pointer hover:bg-zinc-50/50 select-none relative ${
        !notif.is_read ? "bg-zinc-50/20" : "opacity-80"
      }`}
    >
      {!notif.is_read && (
        <div className="absolute left-2.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-red-500" />
      )}
      <div className={`p-2 rounded-xl border shrink-0 ${getNotificationBg(notif.notification_type)}`}>
        {getNotificationIcon(notif.notification_type)}
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between gap-4">
          <h4 className={`text-xs font-bold leading-tight ${!notif.is_read ? "text-zinc-950" : "text-zinc-800"}`}>
            {notif.title}
          </h4>
          <span className="text-[10px] text-zinc-400 font-semibold shrink-0">
            {getRelativeTime(notif.created_at)}
          </span>
        </div>
        <p className={`text-xs leading-relaxed ${!notif.is_read ? "text-zinc-700 font-medium" : "text-zinc-550 font-normal"}`}>
          {notif.message}
        </p>
      </div>
      {!notif.is_read && onMarkRead && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMarkRead(notif.id);
          }}
          className="p-1 rounded-lg border border-zinc-200 text-zinc-400 hover:text-zinc-800 hover:bg-zinc-50 shrink-0 self-center transition-all cursor-pointer"
          title="Mark as read"
        >
          <Check className="size-4" />
        </button>
      )}
    </div>
  );
};

export default React.memo(NotificationCard);
export { getRelativeTime, getNotificationIcon, getNotificationBg };
