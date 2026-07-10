import React, { useState, useEffect } from "react";
import apiClient from "../api/client";

const AuditLogs = () => {
  const [activeTab, setActiveTab] = useState("logins");
  const [logins, setLogins] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "logins") {
        const res = await apiClient.get("/audit/logins/");
        setLogins(res.data.data.results || []);
      } else {
        const res = await apiClient.get("/audit/activities/");
        setActivities(res.data.data.results || []);
      }
    } catch (err) {
      setError("Failed to load audit logs.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">System Audit Trails</h1>
        <p className="text-slate-500 text-sm">Super Admin access to login records and database mutations logs.</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-200">
          {error}
        </div>
      )}

      {/* Tabs list */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab("logins")}
          className={`py-2 px-6 font-bold text-sm border-b-2 transition-all ${
            activeTab === "logins"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-400 hover:text-slate-650"
          }`}
        >
          Auth History Logins
        </button>
        <button
          onClick={() => setActiveTab("activities")}
          className={`py-2 px-6 font-bold text-sm border-b-2 transition-all ${
            activeTab === "activities"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-400 hover:text-slate-650"
          }`}
        >
          Database Modifications Auditing
        </button>
      </div>

      {/* Tables container */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : activeTab === "logins" ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-3 text-left text-xxs font-bold text-slate-450 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xxs font-bold text-slate-450 uppercase tracking-wider">
                    Email Account
                  </th>
                  <th className="px-6 py-3 text-left text-xxs font-bold text-slate-450 uppercase tracking-wider">
                    IP Address
                  </th>
                  <th className="px-6 py-3 text-left text-xxs font-bold text-slate-450 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xxs font-bold text-slate-450 uppercase tracking-wider">
                    Browser User Agent
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs text-slate-750">
                {logins.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-slate-400">
                      No logins audit logs.
                    </td>
                  </tr>
                ) : (
                  logins.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 text-slate-500">
                        {new Date(item.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 font-semibold">{item.email}</td>
                      <td className="px-6 py-4 font-mono">{item.ip_address || "N/A"}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded text-xxs font-bold uppercase ${
                          item.status === "SUCCESS"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400 truncate max-w-xs" title={item.user_agent}>
                        {item.user_agent}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-3 text-left text-xxs font-bold text-slate-450 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xxs font-bold text-slate-450 uppercase tracking-wider">
                    Performed By
                  </th>
                  <th className="px-6 py-3 text-left text-xxs font-bold text-slate-450 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xxs font-bold text-slate-450 uppercase tracking-wider">
                    Model
                  </th>
                  <th className="px-6 py-3 text-left text-xxs font-bold text-slate-450 uppercase tracking-wider">
                    Representation
                  </th>
                  <th className="px-6 py-3 text-left text-xxs font-bold text-slate-450 uppercase tracking-wider">
                    Changed Fields
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs text-slate-750">
                {activities.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-slate-400">
                      No activities logs recorded.
                    </td>
                  </tr>
                ) : (
                  activities.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-slate-500">
                        {new Date(item.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 font-semibold">
                        {item.user ? item.user.email : "System / Anonymous"}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-xxs font-bold uppercase ${
                          item.action === "CREATE"
                            ? "bg-emerald-100 text-emerald-800"
                            : item.action === "UPDATE"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {item.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-550 uppercase">
                        {item.content_type_name}
                      </td>
                      <td className="px-6 py-4 font-medium">{item.object_repr}</td>
                      <td className="px-6 py-4">
                        {item.changes && Object.keys(item.changes).length > 0 ? (
                          <div className="space-y-1 max-w-sm overflow-hidden">
                            {Object.entries(item.changes).map(([field, val]) => (
                              <div key={field} className="text-xxs">
                                <strong>{field}</strong>:{" "}
                                {Array.isArray(val) ? (
                                  <>
                                    <span className="text-red-500 line-through">{String(val[0])}</span> →{" "}
                                    <span className="text-emerald-600 font-semibold">{String(val[1])}</span>
                                  </>
                                ) : (
                                  <span>{String(val)}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">None</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;
