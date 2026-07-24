import React from "react";
import NotificationCard from "./NotificationCard";
import NotificationEmptyState from "./NotificationEmptyState";

const NotificationList = ({ notifications, onClick, onMarkRead, isCompact = false }) => {
  if (notifications.length === 0) {
    return <NotificationEmptyState isCompact={isCompact} />;
  }

  if (isCompact) {
    const unreadNotifs = notifications.filter((n) => !n.is_read);
    const readNotifs = notifications.filter((n) => n.is_read);

    return (
      <div className="max-h-72 overflow-y-auto divide-y divide-zinc-100">
        {unreadNotifs.length > 0 && (
          <div>
            <div className="px-4 py-1 text-[9px] font-bold text-zinc-400 uppercase tracking-wider bg-zinc-50/50">
              Unread
            </div>
            {unreadNotifs.map((notif) => (
              <NotificationCard
                key={notif.id}
                notif={notif}
                onClick={onClick}
                onMarkRead={onMarkRead}
                isCompact={true}
              />
            ))}
          </div>
        )}

        {readNotifs.length > 0 && (
          <div>
            <div className="px-4 py-1 text-[9px] font-bold text-zinc-400 uppercase tracking-wider bg-zinc-50/50">
              Read
            </div>
            {readNotifs.map((notif) => (
              <NotificationCard
                key={notif.id}
                notif={notif}
                onClick={onClick}
                onMarkRead={onMarkRead}
                isCompact={true}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border border-zinc-250/60 rounded-xl divide-y divide-zinc-100 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
      {notifications.map((notif) => (
        <NotificationCard
          key={notif.id}
          notif={notif}
          onClick={onClick}
          onMarkRead={onMarkRead}
          isCompact={false}
        />
      ))}
    </div>
  );
};

export default React.memo(NotificationList);
