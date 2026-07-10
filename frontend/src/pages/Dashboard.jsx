import React, { useState, useEffect } from "react";
import apiClient from "../api/client";

const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMetrics = async () => {
    try {
      const res = await apiClient.get("/dashboard/");
      if (res.data?.success) {
        setMetrics(res.data.data);
      }
    } catch (err) {
      setError("Failed to load dashboard metrics.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200">{error}</div>
    );
  }

  const { summary, department_wise, vendor_wise, monthly_trends, status_wise } = metrics;

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Operational Overview</h1>
        <p className="text-slate-500 text-sm">Real-time workflow stats and system statistics.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-450 uppercase tracking-wider">
            Pending Approval
          </span>
          <div className="mt-4">
            <span className="text-3xl font-bold text-slate-800">{summary.pending_count}</span>
            <p className="text-slate-500 text-xs mt-1">Bills currently in the system</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-450 uppercase tracking-wider">
            Pending Amount
          </span>
          <div className="mt-4">
            <span className="text-2xl font-bold text-blue-600">
              ₹{summary.pending_amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
            <p className="text-slate-500 text-xs mt-1">Pending payments amount</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-450 uppercase tracking-wider">
            Completed / Cleared
          </span>
          <div className="mt-4">
            <span className="text-3xl font-bold text-emerald-650">{summary.completed_count}</span>
            <p className="text-slate-500 text-xs mt-1">Fully audited and paid bills</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-450 uppercase tracking-wider">
            My Pending Tasks
          </span>
          <div className="mt-4">
            <span className="text-3xl font-bold text-orange-600">{summary.my_assigned_count}</span>
            <p className="text-slate-500 text-xs mt-1">Bills assigned to you</p>
          </div>
        </div>
      </div>

      {/* Visual Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Monthly Trend Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-2">
          <h3 className="text-base font-bold text-slate-800 mb-6">Monthly Bill Values (Trend)</h3>
          {monthly_trends.length === 0 ? (
            <div className="h-60 flex items-center justify-center text-slate-400">No trend data</div>
          ) : (
            <div className="h-60 flex items-end justify-between px-4">
              {monthly_trends.map((item, idx) => {
                // Find maximum amount for heights scale
                const maxAmount = Math.max(...monthly_trends.map((m) => m.amount), 1);
                const heightPercentage = Math.round((item.amount / maxAmount) * 80);

                return (
                  <div key={idx} className="flex flex-col items-center w-12 group relative">
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 bg-slate-800 text-white text-xxs px-2 py-1 rounded hidden group-hover:block whitespace-nowrap z-10">
                      ₹{item.amount.toLocaleString("en-IN")}
                    </div>
                    {/* Bar */}
                    <div
                      style={{ height: `${heightPercentage}%` }}
                      className="w-full bg-blue-500 rounded-t-lg group-hover:bg-blue-600 transition-all duration-200"
                    ></div>
                    {/* Label */}
                    <span className="text-xxs text-slate-400 mt-2 rotate-45 md:rotate-0 block font-medium">
                      {item.month}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Status Breakdown */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-base font-bold text-slate-800 mb-6">Status Breakdown</h3>
          <div className="space-y-4">
            {status_wise.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-500"></span>
                  <span className="text-xs font-semibold text-slate-650 uppercase">
                    {item.status.replace("_", " ")}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-slate-850">{item.count} bills</div>
                  <div className="text-xxs text-slate-400">
                    ₹{item.amount.toLocaleString("en-IN")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detail Distributions Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Department Distribution */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-base font-bold text-slate-800 mb-4">Department Distribution</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xxs font-bold text-slate-450 uppercase">
                    Department
                  </th>
                  <th className="px-4 py-2 text-right text-xxs font-bold text-slate-450 uppercase">
                    Bill Volume
                  </th>
                  <th className="px-4 py-2 text-right text-xxs font-bold text-slate-450 uppercase">
                    Total Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs">
                {department_wise.map((item, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-3 font-semibold text-slate-750">
                      {item.name} ({item.code})
                    </td>
                    <td className="px-4 py-3 text-right text-slate-500">{item.count}</td>
                    <td className="px-4 py-3 text-right font-bold text-slate-800">
                      ₹{item.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Vendor Distribution */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-base font-bold text-slate-800 mb-4">Vendor Distribution</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xxs font-bold text-slate-450 uppercase">
                    Vendor
                  </th>
                  <th className="px-4 py-2 text-right text-xxs font-bold text-slate-450 uppercase">
                    Bill Volume
                  </th>
                  <th className="px-4 py-2 text-right text-xxs font-bold text-slate-450 uppercase">
                    Total Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs">
                {vendor_wise.map((item, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-3 font-semibold text-slate-750">{item.name}</td>
                    <td className="px-4 py-3 text-right text-slate-500">{item.count}</td>
                    <td className="px-4 py-3 text-right font-bold text-slate-800">
                      ₹{item.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
