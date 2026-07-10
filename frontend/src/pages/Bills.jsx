import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiClient from "../api/client";
import { useAuth } from "../context/AuthContext";

const Bills = () => {
  const { user } = useAuth();

  // Lists state
  const [bills, setBills] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Filter params state
  const [statusFilter, setStatusFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [vendorFilter, setVendorFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);

  // Modal / Form state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [billNumber, setBillNumber] = useState("");
  const [billDate, setBillDate] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedVendor, setSelectedVendor] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [formError, setFormError] = useState("");
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
      console.error("Failed to load filter options", err);
    }
  };

  const fetchBills = async () => {
    try {
      const params = {
        page,
        current_status: statusFilter || undefined,
        department: deptFilter || undefined,
        vendor: vendorFilter || undefined,
        search: searchTerm || undefined,
      };

      const res = await apiClient.get("/bills/", { params });
      if (res.data?.success) {
        setBills(res.data.data.results || []);
        setCount(res.data.data.count || 0);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFiltersOptions();
  }, []);

  useEffect(() => {
    fetchBills();
  }, [statusFilter, deptFilter, vendorFilter, searchTerm, page]);

  const handleCreateBill = async (e) => {
    e.preventDefault();
    setFormError("");
    setLoading(true);

    try {
      const payload = {
        bill_number: billNumber,
        bill_date: billDate,
        amount: parseFloat(amount),
        vendor_id: parseInt(selectedVendor),
        department_id: parseInt(selectedDept),
      };

      const res = await apiClient.post("/bills/", payload);
      if (res.data?.success) {
        setShowCreateModal(false);
        // Reset form
        setBillNumber("");
        setBillDate("");
        setAmount("");
        setSelectedVendor("");
        setSelectedDept("");
        fetchBills();
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Verification/Validation failed.";
      const detailErr = err.response?.data?.errors;
      if (detailErr) {
        // Collect exact error details
        const details = Object.entries(detailErr)
          .map(([key, val]) => `${key}: ${val.join(", ")}`)
          .join(" | ");
        setFormError(`${msg} (${details})`);
      } else {
        setFormError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Bills & Workflows</h1>
          <p className="text-slate-500 text-sm">Register new bills and trace approval stages.</p>
        </div>

        {/* Data entry role and super admin can create bills */}
        {(user?.role === "DATA_ENTRY" || user?.role === "SUPER_ADMIN" || user?.is_superuser) && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl text-sm shadow-md shadow-blue-500/10 transition-colors"
          >
            Register Bill
          </button>
        )}
      </div>

      {/* Filters card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search */}
          <input
            type="text"
            className="px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 text-xs w-64"
            placeholder="Search by Bill No, Tracking ID, Vendor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* Status filter */}
          <select
            className="px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 text-xs"
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

          {/* Department filter */}
          <select
            className="px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 text-xs"
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

          {/* Vendor filter */}
          <select
            className="px-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 text-xs"
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
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-3.5 text-left text-xxs font-bold text-slate-450 uppercase tracking-wider">
                  Tracking ID
                </th>
                <th className="px-6 py-3.5 text-left text-xxs font-bold text-slate-450 uppercase tracking-wider">
                  Bill Number
                </th>
                <th className="px-6 py-3.5 text-left text-xxs font-bold text-slate-450 uppercase tracking-wider">
                  Vendor
                </th>
                <th className="px-6 py-3.5 text-left text-xxs font-bold text-slate-450 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3.5 text-left text-xxs font-bold text-slate-450 uppercase tracking-wider">
                  Bill Date
                </th>
                <th className="px-6 py-3.5 text-right text-xxs font-bold text-slate-450 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3.5 text-center text-xxs font-bold text-slate-450 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3.5 text-left text-xxs font-bold text-slate-450 uppercase tracking-wider">
                  Assigned To
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs text-slate-750">
              {bills.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-slate-400">
                    No bills found matching filters.
                  </td>
                </tr>
              ) : (
                bills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-blue-650">
                      <Link to={`/bills/${bill.id}`} className="hover:underline">
                        {bill.tracking_id}
                      </Link>
                    </td>
                    <td className="px-6 py-4 font-mono font-medium">{bill.bill_number}</td>
                    <td className="px-6 py-4 font-medium">{bill.vendor?.name}</td>
                    <td className="px-6 py-4 font-medium">
                      {bill.department?.name} ({bill.department?.code})
                    </td>
                    <td className="px-6 py-4 text-slate-500">{bill.bill_date}</td>
                    <td className="px-6 py-4 text-right font-bold text-slate-800">
                      ₹{parseFloat(bill.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xxs font-bold uppercase tracking-wider ${
                        bill.current_status === "ACCOUNTS_CLEARED"
                          ? "bg-emerald-100 text-emerald-800"
                          : bill.current_status === "RECEIVING"
                          ? "bg-slate-100 text-slate-700"
                          : "bg-blue-100 text-blue-800"
                      }`}>
                        {bill.current_status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {bill.assigned_to
                        ? `${bill.assigned_to.first_name} (${bill.assigned_to.role})`
                        : "Unassigned"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        {count > 20 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Showing {bills.length} of {count} bills</span>
            <div className="flex space-x-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <button
                disabled={page * 20 >= count}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-lg font-bold text-slate-800">Register Bill</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-650"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="bg-red-50 text-red-700 p-3 rounded-lg text-xs border border-red-200">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateBill} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Bill Number
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
                    value={billNumber}
                    onChange={(e) => setBillNumber(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Bill Date
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
                    value={billDate}
                    onChange={(e) => setBillDate(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Amount (INR)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Vendor</label>
                  <select
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
                    value={selectedVendor}
                    onChange={(e) => setSelectedVendor(e.target.value)}
                  >
                    <option value="">Select Vendor</option>
                    {vendors.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Department
                  </label>
                  <select
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                  >
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border rounded-lg text-slate-500 text-xs hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
                >
                  {loading ? "Registering..." : "Submit Registration"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bills;
