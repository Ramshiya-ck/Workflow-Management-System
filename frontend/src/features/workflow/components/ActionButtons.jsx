import React from "react";
import { Check, AlertCircle, HelpCircle, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Unified panel containing status transition buttons.
 */
const ActionButtons = ({ currentStatus, onApprove, onReject, onHold, onResume, disabled }) => {
  const isHeld = currentStatus === "HOLDING";
  const isCleared = currentStatus === "ACCOUNTS_CLEARED";
  const isRejected = currentStatus === "REJECTED";

  // Hide buttons if final state
  if (isCleared || isRejected) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 p-4 bg-zinc-50 border border-zinc-200 rounded-xl select-none font-sans">
      {isHeld ? (
        <Button
          onClick={onResume}
          disabled={disabled}
          className="cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white border-none text-xs font-bold gap-1.5 h-9 px-4 rounded-lg shadow-sm"
        >
          <Play className="size-3.5 fill-white" />
          <span>Continue Processing</span>
        </Button>
      ) : (
        <>
          {/* Approve */}
          <Button
            onClick={onApprove}
            disabled={disabled}
            className="cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white border-none text-xs font-bold gap-1.5 h-9 px-4 rounded-lg shadow-sm"
          >
            <Check className="size-3.5" />
            <span>Approve</span>
          </Button>

          {/* Reject (Not allowed from Receiving status since that's the start level) */}
          {currentStatus !== "RECEIVING" && (
            <Button
              onClick={onReject}
              disabled={disabled}
              className="cursor-pointer bg-red-600 hover:bg-red-700 text-white border-none text-xs font-bold gap-1.5 h-9 px-4 rounded-lg shadow-sm"
            >
              <AlertCircle className="size-3.5" />
              <span>Reject</span>
            </Button>
          )}

          {/* Hold */}
          <Button
            onClick={onHold}
            disabled={disabled}
            variant="outline"
            className="cursor-pointer border-zinc-200 text-zinc-700 bg-white text-xs font-bold gap-1.5 h-9 px-4 rounded-lg shadow-sm"
          >
            <HelpCircle className="size-3.5 text-zinc-400" />
            <span>Place on Hold</span>
          </Button>
        </>
      )}
    </div>
  );
};

export default React.memo(ActionButtons);
