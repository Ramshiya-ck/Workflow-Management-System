import React from "react";
import { Inbox, Bell } from "lucide-react";

const NotificationEmptyState = ({ isCompact = false }) => {
  if (isCompact) {
    return (
      <div className="p-8 text-center text-zinc-400 font-semibold text-xs space-y-1">
        <Bell className="size-6 text-zinc-300 mx-auto animate-bounce" />
        <p>All caught up!</p>
        <p className="text-[10px] text-zinc-455 font-normal">No notifications found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white border border-zinc-200 rounded-xl text-center max-w-sm mx-auto">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-50 border border-zinc-150 text-zinc-400 mb-4">
        <Inbox className="size-6" />
      </div>
      <h3 className="text-sm font-bold text-zinc-900">No Notifications</h3>
      <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
        We couldn't find any notification alerts matching your active filters.
      </p>
    </div>
  );
};

export default React.memo(NotificationEmptyState);
