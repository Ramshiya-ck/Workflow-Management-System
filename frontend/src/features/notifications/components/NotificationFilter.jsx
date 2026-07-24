import React from "react";

const NotificationFilter = ({ filter, onChange }) => {
  return (
    <div className="flex gap-2">
      {["all", "unread", "read"].map((f) => (
        <button
          key={f}
          onClick={() => onChange(f)}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border ${
            filter === f
              ? "bg-zinc-900 border-zinc-900 text-white shadow-sm"
              : "bg-white border-zinc-200 text-zinc-555 hover:bg-zinc-50"
          }`}
        >
          {f}
        </button>
      ))}
    </div>
  );
};

export default React.memo(NotificationFilter);
