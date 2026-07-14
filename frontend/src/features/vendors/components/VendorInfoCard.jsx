import React from "react";

/**
 * Reusable layout block presenting detailed metadata blocks inside vendor profile cards.
 */
const VendorInfoCard = ({ title, icon: Icon, children }) => {
  return (
    <div className="bg-white rounded-xl border border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.015)] p-5 space-y-4 font-sans select-none">
      <div className="flex items-center gap-2 pb-3 border-b border-zinc-100">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-50 border border-zinc-200/60 text-zinc-500">
          <Icon className="size-4" />
        </div>
        <h3 className="text-xs font-bold text-zinc-900 tracking-wider uppercase">{title}</h3>
      </div>
      <div className="space-y-3 pt-1 text-xs">
        {children}
      </div>
    </div>
  );
};

export default React.memo(VendorInfoCard);
