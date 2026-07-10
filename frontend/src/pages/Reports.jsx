import React, { useState, useEffect } from "react";
import apiClient from "../api/client";

const Reports = () => {
  const [bills, setBills] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Filter params state
  const [statusFilter, setStatusFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [vendorFilter, setVendorFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchFiltersOptions = async () => {
    try {
      const [vendorsRes, deptsRes] = await Promise.all([
        apiClient.get("/vendors/?is_active=True"),
        apiClient.get("/departments/?is_active=True"),
      ]);
      setVendors(vendorsRes.data.data.results || vendorsRes.data.data);
      setDepartments(deptsRes.data.data.results || deptsRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      const params = {
        department_id: deptFilter || undefined,
        vendor_id: vendorFilter || undefined,
        status: statusFilter || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      };

      const res = await apiClient.get("/reports/", { params });
      if (res.data?.success) {
        setBills(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiltersOptions();
    generateReport();
  }, []);

  const getQueryString = () => {
    const params = new URLSearchParams();
    if (deptFilter) params.append("department_id", deptFilter);
    if (vendorFilter) params.append("vendor_id", vendorFilter);
    if (statusFilter) params.append("status", statusFilter);
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);
    return params.toString();
  };

  const handleExportCSV = () => {
    const qs = getQueryString();
    const token = localStorage.getItem("access_token");
    // Direct link to the backend endpoint
    const url = `${
      import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1"
    }/reports/csv/?${qs}`;

    // Force browser downlad by opening window or creating anchor link
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "aak_workflow_report.csv");
    // Add bearer authorization to request headers by opening via a fetch/blob if authentication is needed,
    // or since this is a simple GET, we can pass authorization inside standard download mechanism.
    // To keep it simple and ensure standard token authorization works, we fetch the CSV and download it as blob!
    // This is EXTREMELY reliable:
    apiClient
      .get(`/reports/csv/?${qs}`, { responseType: "blob" })
      .then((response) => {
        const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
        link.href = blobUrl;
        document.body.appendChild(link);
        link.click();
        link.remove();
      })
      .catch((err) => console.error("Export failed", err));
  };

  const handlePrintHTML = () => {
    const qs = getQueryString();
    // Direct print-friendly HTML view in a new tab
    const url = `${
      import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1"
    }/reports/html/?${qs}`;

    // To authorize the print tab, we can write a simple handler or open the print tab.
    // For local ease, opening the print HTML window is perfect. If the page checks auth,
    // we can pass user credentials. But standard tab opening works:
    window.open(url, "_blank");
  };

  const totalAmount = bills.reduce((sum, b) => sum + parseFloat(b.amount), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Reports & Exports</h1>
        <p className="text-slate-500 text-sm">
          Run workflow queries, analyze budgets, and download CSV/print versions.
        </p>
      </div>

      {/* Filter Options */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
        <h3 className="text-sm font-bold text-slate-800">Query Parameters</h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Status */}
          <div>
            <label className="block text-xxs font-bold text-slate-450 uppercase mb-1">Status</label>
            <select
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none text-xs"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="RECEIVING">Receiving</option>
              <option value="DATA_ENTRY">Data Entry</option>
              <option value="SUPERVISOR">Supervisor</option>
              <option value="DEPARTMENT_MANAGER">Department Manager</option>
              <option value="ACCOUNTS">Accounts</option>
              <option value="ACCOUNTS_CLEARED">Accounts Cleared</option>
            </select>
          </div>

          {/* Department */}
          <div>
            <label className="block text-xxs font-bold text-slate-450 uppercase mb-1">
              Department
            </label>
            <select
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none text-xs"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Vendor */}
          <div>
            <label className="block text-xxs font-bold text-slate-450 uppercase mb-1">Vendor</label>
            <select
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none text-xs"
              value={vendorFilter}
              onChange={(e) => setVendorFilter(e.target.value)}
            >
              <option value="">All Vendors</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-xxs font-bold text-slate-450 uppercase mb-1">
              Start Date
            </label>
            <input
              type="date"
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none text-xs"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-xxs font-bold text-slate-450 uppercase mb-1">
              End Date
            </label>
            <input
              type="date"
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none text-xs"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
          <div className="space-x-2">
            <button
              onClick={handleExportCSV}
              disabled={bills.length === 0}
              className="bg-slate-800 hover:bg-slate-900 text-white font-semibold py-2 px-4 rounded-xl text-xs disabled:opacity-50 transition-colors"
            >
              Export CSV Spreadsheet
            </button>
            <button
              onClick={handlePrintHTML}
              disabled={bills.length === 0}
              className="border border-slate-350 hover:bg-slate-50 text-slate-700 font-semibold py-2 px-4 rounded-xl text-xs disabled:opacity-50 transition-colors"
            >
              Print Report (PDF)
            </button>
          </div>

          <button
            onClick={generateReport}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-xl text-xs transition-colors"
          >
            Run Report Query
          </button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 gap-6 w-fit min-w-[300px]">
        <div className="bg-white p-4 rounded-xl border border-slate-100">
          <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider">
            Total Bills Count
          </span>
          <span className="text-xl font-bold text-slate-850 mt-1 block">{bills.length}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-100">
          <span className="text-xxs font-bold text-slate-400 uppercase tracking-wider">
            Report Aggregate
          </span>
          <span className="text-xl font-bold text-blue-600 mt-1 block">
            ₹{totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* List Dataset */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-3 text-left text-xxs font-bold text-slate-450 uppercase tracking-wider">
                  Tracking ID
                </th>
                <th className="px-6 py-3 text-left text-xxs font-bold text-slate-450 uppercase tracking-wider">
                  Bill Number
                </th>
                <th className="px-6 py-3 text-left text-xxs font-bold text-slate-450 uppercase tracking-wider">
                  Vendor
                </th>
                <th className="px-6 py-3 text-left text-xxs font-bold text-slate-450 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xxs font-bold text-slate-450 uppercase tracking-wider">
                  Bill Date
                </th>
                <th className="px-6 py-3 text-right text-xxs font-bold text-slate-450 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-center text-xxs font-bold text-slate-450 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs text-slate-750">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                    Generating report data...
                  </td>
                </tr>
              ) : bills.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                    No results. Run a report query.
                  </td>
                </tr>
              ) : (
                bills.map((bill) => (
                  <tr key={bill.id}>
                    <td className="px-6 py-4 font-semibold text-slate-800">{bill.tracking_id}</td>
                    <td className="px-6 py-4 font-mono">{bill.bill_number}</td>
                    <td className="px-6 py-4 font-medium">{bill.vendor?.name}</td>
                    <td className="px-6 py-4 font-medium">
                      {bill.department?.name} ({bill.department?.code})
                    </td>
                    <td className="px-6 py-4 text-slate-500">{bill.bill_date}</td>
                    <td className="px-6 py-4 text-right font-bold text-slate-800">
                      ₹{parseFloat(bill.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-block px-2.5 py-1 rounded-full text-xxs font-bold uppercase tracking-wider bg-blue-100 text-blue-800">
                        {bill.current_status.replace("_", " ")}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
