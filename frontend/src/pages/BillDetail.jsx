import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../api/client";
import { useAuth } from "../context/AuthContext";

const BillDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [bill, setBill] = useState(null);
  const [history, setHistory] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Transition form state
  const [comments, setComments] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchBillDetails = async () => {
    try {
      const [billRes, historyRes] = await Promise.all([
        apiClient.get(`/bills/${id}/`),
        apiClient.get(`/bills/${id}/history/`),
      ]);
      setBill(billRes.data.data);
      setHistory(historyRes.data.data || []);
    } catch (err) {
      setError("Failed to load bill details.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      // Super Admin and managers fetch active users list for reassignments
      const res = await apiClient.get("/users/?is_active=True");
      setUsers(res.data.data.results || res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBillDetails();
    fetchUsers();
  }, [id]);

  const handleAction = async (actionType) => {
    setActionError("");
    setActionLoading(true);

    try {
      const payload = {
        action: actionType,
        comments,
        target_user_id: actionType === "REASSIGN" ? parseInt(selectedUser) : undefined,
      };

      const res = await apiClient.post(`/bills/${id}/transition/`, payload);
      if (res.data?.success) {
        setComments("");
        setSelectedUser("");
        fetchBillDetails();
      }
    } catch (err) {
      setActionError(err.response?.data?.message || "Workflow action failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this bill?")) return;
    try {
      const res = await apiClient.delete(`/bills/${id}/`);
      if (res.data?.success) {
        navigate("/bills");
      }
    } catch (err) {
      setActionError(err.response?.data?.message || "Delete failed.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !bill) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200">
        {error || "Bill not found."}
      </div>
    );
  }

  // Check if current user is authorized to act on the bill
  const statusRoleMap = {
    RECEIVING: "DATA_ENTRY",
    DATA_ENTRY: "DATA_ENTRY",
    SUPERVISOR: "SUPERVISOR",
    DEPARTMENT_MANAGER: "DEPARTMENT_MANAGER",
    ACCOUNTS: "ACCOUNTS",
  };
  const requiredRole = statusRoleMap[bill.current_status];
  const isAuthorized = user?.role === "SUPER_ADMIN" || user?.is_superuser || user?.role === requiredRole;

  return (
    <div className="space-y-8">
      {/* Page Title & Back */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate("/bills")}
            className="text-xs font-semibold text-slate-500 hover:text-blue-600 mb-2 block"
          >
            ← Back to bills list
          </button>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center space-x-2">
            <span>Bill: {bill.tracking_id}</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xxs font-bold uppercase tracking-wider ${
              bill.current_status === "ACCOUNTS_CLEARED"
                ? "bg-emerald-100 text-emerald-800"
                : bill.current_status === "RECEIVING"
                ? "bg-slate-100 text-slate-700"
                : "bg-blue-100 text-blue-800"
            }`}>
              {bill.current_status.replace("_", " ")}
            </span>
          </h1>
        </div>

        {/* Delete button for draft bills */}
        {bill.current_status === "RECEIVING" && (bill.created_by?.id === user?.id || user?.role === "SUPER_ADMIN" || user?.is_superuser) && (
          <button
            onClick={handleDelete}
            className="px-4 py-2 border border-red-200 text-red-650 hover:bg-red-50 font-semibold rounded-xl text-xs transition-colors"
          >
            Delete Draft
          </button>
        )}
      </div>

      {actionError && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-200">
          {actionError}
        </div>
      )}

      {/* Grid details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Bill Info Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-2 space-y-6">
          <h3 className="text-base font-bold text-slate-800 border-b pb-3">Bill Metadata</h3>

          <div className="grid grid-cols-2 gap-6 text-sm text-slate-700">
            <div>
              <span className="block text-xxs font-bold text-slate-450 uppercase tracking-wider">
                Bill Number
              </span>
              <span className="font-mono mt-1 block font-medium">{bill.bill_number}</span>
            </div>
            <div>
              <span className="block text-xxs font-bold text-slate-450 uppercase tracking-wider">
                Bill Date
              </span>
              <span className="mt-1 block font-medium">{bill.bill_date}</span>
            </div>
            <div>
              <span className="block text-xxs font-bold text-slate-450 uppercase tracking-wider">
                Vendor
              </span>
              <span className="mt-1 block font-medium">{bill.vendor?.name}</span>
            </div>
            <div>
              <span className="block text-xxs font-bold text-slate-450 uppercase tracking-wider">
                Department
              </span>
              <span className="mt-1 block font-medium">
                {bill.department?.name} ({bill.department?.code})
              </span>
            </div>
            <div>
              <span className="block text-xxs font-bold text-slate-450 uppercase tracking-wider">
                Amount (INR)
              </span>
              <span className="mt-1 block text-lg font-bold text-slate-850">
                ₹{parseFloat(bill.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="block text-xxs font-bold text-slate-450 uppercase tracking-wider">
                Assigned Reviewer
              </span>
              <span className="mt-1 block font-medium text-slate-500">
                {bill.assigned_to
                  ? `${bill.assigned_to.first_name} (${bill.assigned_to.role})`
                  : "Unassigned"}
              </span>
            </div>
            <div>
              <span className="block text-xxs font-bold text-slate-450 uppercase tracking-wider">
                Registered By
              </span>
              <span className="mt-1 block font-medium text-slate-500">{bill.created_by?.email}</span>
            </div>
            <div>
              <span className="block text-xxs font-bold text-slate-450 uppercase tracking-wider">
                Registered At
              </span>
              <span className="mt-1 block font-medium text-slate-500">
                {new Date(bill.created_at).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Workflow Action Panel */}
          {bill.current_status !== "ACCOUNTS_CLEARED" && isAuthorized && (
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-150 space-y-4">
              <h4 className="text-sm font-bold text-slate-800">Process Action Log</h4>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Comments / Reasons
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-slate-250 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-xs text-slate-850"
                  rows="3"
                  placeholder="Enter comments (mandatory for rejection/reassignment)"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                ></textarea>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                {bill.current_status === "RECEIVING" ? (
                  <button
                    onClick={() => handleAction("SUBMIT")}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
                  >
                    Submit Bill
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => handleAction("APPROVE")}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction("REJECT")}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-red-650 hover:bg-red-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
                    >
                      Reject Back
                    </button>

                    {/* Reassign select & button */}
                    <div className="flex items-center space-x-2 border-l pl-4 border-slate-200">
                      <select
                        className="px-2 py-1.5 border rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500"
                        value={selectedUser}
                        onChange={(e) => setSelectedUser(e.target.value)}
                      >
                        <option value="">Select Target User</option>
                        {users
                          .filter((u) => u.role === requiredRole || u.role === "SUPER_ADMIN")
                          .map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.first_name} {u.last_name} ({u.role})
                            </option>
                          ))}
                      </select>
                      <button
                        onClick={() => handleAction("REASSIGN")}
                        disabled={actionLoading || !selectedUser}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
                      >
                        Reassign
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* History Timeline */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
          <h3 className="text-base font-bold text-slate-800 border-b pb-3">Workflow Log</h3>

          {history.length === 0 ? (
            <div className="text-sm text-slate-400 text-center py-8">No history events logged</div>
          ) : (
            <div className="relative border-l border-slate-100 pl-4 ml-2 space-y-6 text-xs text-slate-700">
              {history.map((h) => (
                <div key={h.id} className="relative">
                  {/* Timeline Dot */}
                  <span className="absolute -left-[21px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-blue-500"></span>

                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">{h.action}</span>
                    <span className="text-xxs text-slate-400">
                      {new Date(h.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="mt-1 text-slate-500">
                    <div>
                      Performed by: <strong>{h.performed_by?.email}</strong>
                    </div>
                    {h.from_status && (
                      <div className="mt-0.5">
                        Status: {h.from_status} → <strong>{h.to_status}</strong>
                      </div>
                    )}
                    {h.comments && (
                      <div className="mt-1 bg-slate-50 p-2 rounded text-slate-600 font-serif italic">
                        "{h.comments}"
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BillDetail;
