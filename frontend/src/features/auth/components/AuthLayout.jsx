import React from "react";
import logo from "@/assets/vite.svg";

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-zinc-50/50 font-sans antialiased">
      {/* Left Column: Form Container */}
      <div className="lg:col-span-5 flex flex-col justify-between px-6 py-10 sm:px-12 xl:px-20 bg-white border-r border-zinc-200/80 relative overflow-hidden">
        {/* Decorative Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        {/* Top Branding Header */}
        <div className="relative z-10 flex items-center gap-3 select-none">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900 shadow-sm border border-zinc-800">
            <img src={logo} alt="Company Logo" className="h-5 w-auto" />
          </div>
          <div>
            <span className="text-sm font-bold tracking-tight text-zinc-900 block">
              AAK Hypermarket
            </span>
            <span className="text-xs font-semibold text-zinc-500 block -mt-0.5">
              Workflow Management
            </span>
          </div>
        </div>

        {/* Form Content */}
        <div className="relative z-10 my-auto py-8">
          <div className="mx-auto w-full max-w-sm">
            {children}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-xs text-zinc-400">
          &copy; {new Date().getFullYear()} AAK Hypermarkets Ltd. Secure access gateway.
        </div>
      </div>

      {/* Right Column: Premium ERP Illustration Dashboard (Visible on Desktop) */}
      <div className="hidden lg:flex lg:col-span-7 relative bg-zinc-50 items-center justify-center p-12 overflow-hidden select-none">
        {/* Stripe/Linear Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
        
        {/* Ambient Color Gradients */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-indigo-500/5 blur-[80px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[350px] h-[350px] rounded-full bg-emerald-500/5 blur-[80px] pointer-events-none" />

        <div className="relative z-10 max-w-lg w-full space-y-12">
          {/* Main Visual: Mock Invoice Card UI */}
          <div className="bg-white rounded-xl border border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 space-y-4 transform hover:translate-y-[-2px] transition-transform duration-300">
            <div className="flex justify-between items-start border-b border-zinc-100 pb-4">
              <div>
                <span className="text-xs font-semibold text-zinc-400 block tracking-wider uppercase">Pending Approval</span>
                <h3 className="text-base font-bold text-zinc-900 mt-1">Invoice BILL-00002148</h3>
              </div>
              <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800 border border-amber-200">
                Department Manager
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm py-1">
              <div>
                <span className="text-xs text-zinc-400 block">Vendor</span>
                <span className="font-semibold text-zinc-700">Dell India Pvt Ltd</span>
              </div>
              <div>
                <span className="text-xs text-zinc-400 block">Department</span>
                <span className="font-semibold text-zinc-700">Information Technology</span>
              </div>
              <div>
                <span className="text-xs text-zinc-400 block">Due Date</span>
                <span className="font-semibold text-zinc-700">Jul 28, 2026</span>
              </div>
              <div>
                <span className="text-xs text-zinc-400 block">Amount</span>
                <span className="font-bold text-zinc-900">₹1,84,500.00</span>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2 border-t border-zinc-100">
              <div className="h-8 w-20 bg-zinc-100 rounded-md flex items-center justify-center text-xs text-zinc-500 font-medium border border-zinc-200/50">
                Reject
              </div>
              <div className="h-8 w-20 bg-zinc-900 rounded-md flex items-center justify-center text-xs text-white font-medium shadow-sm">
                Approve
              </div>
            </div>
          </div>

          {/* Copy Description */}
          <div className="space-y-4 px-2">
            <div className="inline-flex items-center rounded-full bg-zinc-900/5 px-3 py-1 text-xs font-semibold text-zinc-700 border border-zinc-900/10">
              ⚡ Real-time Audit Timeline
            </div>
            <h2 className="text-3xl font-extrabold text-zinc-900 leading-tight tracking-tight">
              Hypermarket Clearance Workflows, Re-imagined.
            </h2>
            <p className="text-sm text-zinc-500 leading-relaxed">
              Connect Receiving, Data Entry, Supervisors, Managers, and Accounts clearance pipelines under a single unified dashboard, guaranteeing instant database traceability.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(AuthLayout);
