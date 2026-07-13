import React from "react";
import { Search, X } from "lucide-react";

/**
 * Filter search bar with clean animations and text resetting.
 */
const SearchBar = ({ value, onChange, onClear, placeholder = "Search departments..." }) => {
  return (
    <div className="relative w-full md:max-w-xs font-sans text-xs select-none">
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-zinc-400">
        <Search className="size-4" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white border border-zinc-200 hover:border-zinc-350 focus:border-zinc-950 rounded-lg pl-9 pr-9 py-2.5 outline-none transition-all placeholder-zinc-400 text-zinc-800"
      />
      {value && (
        <button
          onClick={onClear}
          className="absolute inset-y-0 right-3 flex items-center text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
          aria-label="Clear search"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
};

export default React.memo(SearchBar);
