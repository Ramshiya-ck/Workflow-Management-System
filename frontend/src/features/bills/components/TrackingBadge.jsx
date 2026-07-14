import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

/**
 * Visual badge display for unique bill workflow tracking IDs. Supports copy to clipboard gesture.
 */
const TrackingBadge = ({ trackingId }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    if (!trackingId) return;
    navigator.clipboard.writeText(trackingId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="inline-flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 rounded-md px-2 py-1 font-mono text-[10px] font-bold text-zinc-650 hover:bg-zinc-100 transition-colors select-none max-w-max">
      <span>{trackingId || "TRK-PENDING"}</span>
      <button
        onClick={handleCopy}
        className="text-zinc-400 hover:text-zinc-700 transition-colors focus:outline-none cursor-pointer"
        aria-label="Copy tracking ID"
        title="Copy tracking ID"
      >
        {copied ? (
          <Check className="size-3 text-emerald-650" />
        ) : (
          <Copy className="size-3" />
        )}
      </button>
    </div>
  );
};

export default React.memo(TrackingBadge);
