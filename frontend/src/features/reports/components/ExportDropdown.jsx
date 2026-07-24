import React, { useState, useRef, useEffect } from "react";
import { Download, FileText, Table, Printer, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getExportCSVUrl, getExportHTMLUrl } from "../api/reports.api";

const ExportDropdown = ({ filters = {} }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleExport = (type) => {
    setIsOpen(false);
    
    // Clean filters to remove empty entries
    const params = {};
    Object.keys(filters).forEach((key) => {
      if (filters[key] !== "" && filters[key] !== null && filters[key] !== undefined) {
        params[key] = filters[key];
      }
    });

    if (type === "CSV" || type === "Excel") {
      const url = getExportCSVUrl(params);
      window.open(url, "_blank");
    } else if (type === "Print") {
      const url = getExportHTMLUrl(params);
      window.open(url, "_blank");
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <Button
        onClick={() => setIsOpen((prev) => !prev)}
        className="cursor-pointer gap-2 shadow-sm font-bold uppercase tracking-wider text-xs border border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50"
      >
        <Download className="size-4" />
        <span>Export Reports</span>
        <ChevronDown className="size-3" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white border border-zinc-200 shadow-lg py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-100 font-sans text-left">
          <button
            onClick={() => handleExport("CSV")}
            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-50 select-none cursor-pointer"
          >
            <FileText className="size-4 text-zinc-455" />
            <span>Export CSV Sheet</span>
          </button>
          <button
            onClick={() => handleExport("Excel")}
            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-50 select-none cursor-pointer"
          >
            <Table className="size-4 text-zinc-455" />
            <span>Export Excel Sheet</span>
          </button>
          <div className="h-px bg-zinc-100 my-1" />
          <button
            onClick={() => handleExport("Print")}
            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-50 select-none cursor-pointer"
          >
            <Printer className="size-4 text-zinc-455" />
            <span>Print Report View</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default React.memo(ExportDropdown);
