import React from "react";
import { Search } from "lucide-react";

const NotificationSearch = ({ value, onChange, placeholder = "Search alerts..." }) => {
  return (
    <div className="relative w-full sm:w-64">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:ring-1 focus:ring-zinc-950 placeholder:text-zinc-400"
      />
    </div>
  );
};

export default React.memo(NotificationSearch);
