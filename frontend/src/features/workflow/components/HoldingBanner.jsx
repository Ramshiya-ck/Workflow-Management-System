import React from "react";
import { AlertTriangle, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Banner alert shown for invoices currently on HOLDING stage.
 */
const HoldingBanner = ({ heldBy, holdReason, holdDate, customNote, onResume, disabled }) => {
  return (
    <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 font-sans shadow-sm select-none">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 border border-amber-200 text-amber-600">
          <AlertTriangle className="size-5" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-amber-900 leading-none">This invoice is currently on Hold.</h4>
          <p className="text-xs text-amber-700 font-semibold leading-relaxed">
            Held by <span className="font-bold">{heldBy}</span> on <span className="font-bold">{holdDate}</span> due to{" "}
            <span className="font-bold text-amber-900 bg-amber-100/50 px-1.5 py-0.5 rounded border border-amber-200/30">{holdReason}</span>.
          </p>
          {customNote && (
            <p className="text-xs text-amber-650 italic mt-1 font-medium bg-white/40 p-2 rounded-lg border border-amber-100/50">
              Note: "{customNote}"
            </p>
          )}
        </div>
      </div>

      <Button
        onClick={onResume}
        disabled={disabled}
        className="cursor-pointer bg-amber-600 hover:bg-amber-700 text-white border-none shrink-0 text-xs font-bold gap-2 h-9 px-4 rounded-lg shadow-sm"
      >
        <Play className="size-3.5 fill-white" />
        <span>Continue Processing</span>
      </Button>
    </div>
  );
};

export default React.memo(HoldingBanner);
