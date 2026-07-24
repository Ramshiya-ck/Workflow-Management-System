import React from "react";

const NotificationBadge = ({ count }) => {
  if (!count || count <= 0) return null;

  return (
    <span className="absolute top-1 right-1 bg-red-500 text-white font-bold text-[8px] h-3.5 min-w-[14px] px-1 flex items-center justify-center rounded-full ring-2 ring-white select-none">
      {count}
    </span>
  );
};

export default React.memo(NotificationBadge);
