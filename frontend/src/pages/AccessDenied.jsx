import React from "react";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const AccessDenied = () => {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4 font-sans antialiased selection:bg-zinc-900 selection:text-white">
      <div className="max-w-md w-full bg-white rounded-xl border border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-8 text-center space-y-6">
        <div className="flex justify-center text-red-500">
          <ShieldAlert className="size-16 stroke-[1.5]" />
        </div>
        <div className="space-y-2 select-none">
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Access Denied</h1>
          <p className="text-sm text-zinc-500 leading-relaxed font-medium">
            Your corporate profile does not possess the permissions required to view this administrative interface.
          </p>
        </div>
        <div className="pt-2">
          <Button asChild className="cursor-pointer shadow-sm">
            <Link to="/" className="inline-flex items-center gap-2">
              <ArrowLeft className="size-4" />
              Return to Safety
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(AccessDenied);
