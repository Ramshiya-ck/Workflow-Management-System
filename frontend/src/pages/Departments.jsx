import React, { useState, useEffect } from "react";
import apiClient from "../api/client";

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const fetchDepartments = async () => {
    try {
      const res = await apiClient.get("/departments/");
      if (res.data?.success) {
        setDepartments(res.data.data.results || res.data.data);
      }
    } catch (err) {
      setError("Failed to load departments.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleOpenCreate = () => {
    setEditId(null);
    setName("");
    setCode("");
    setIsActive(true);
    setFormError("");
    setShowModal(true);
  };

  const handleOpenEdit = (d) => {
    setEditId(d.id);
    setName(d.name);
    setCode(d.code);
    setIsActive(d.is_active);
    setFormError("");
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);

    try {
      const payload = { name, code, is_active: isActive };
      let res;
      if (editId) {
        res = await apiClient.put(`/departments/${editId}/`, payload);
      } else {
        res = await apiClient.post("/departments/", payload);
      }

      if (res.data?.success) {
        setShowModal(false);
        fetchDepartments();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || "Operation failed.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this department?")) return;
    try {
      const res = await apiClient.delete(`/departments/${id}/`);
      if (res.data?.success) {
        fetchDepartments();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Departments</h1>
          <p className="text-slate-500 text-sm">Manage internal hypermarket departments.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl text-sm shadow-md shadow-blue-500/10 transition-colors"
        >
          Add Department
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-200">
          {error}
        </div>
      )}

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {departments.map((d) => (
          <div
            key={d.id}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="bg-slate-100 text-slate-700 text-xxs font-mono font-bold px-2 py-0.5 rounded uppercase">
                  {d.code}
                </span>
                <span
                  className={`h-2.5 w-2.5 rounded-full ${d.is_active ? "bg-emerald-500" : "bg-slate-300"}`}
                ></span>
              </div>
              <h3 className="text-base font-bold text-slate-800 mt-3">{d.name}</h3>
            </div>

            <div className="flex items-center space-x-2 mt-6 pt-4 border-t border-slate-50">
              <button
                onClick={() => handleOpenEdit(d)}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(d.id)}
                className="text-xs text-red-650 hover:text-red-800 font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-lg font-bold text-slate-800 text-left w-full">
                {editId ? "Edit Department" : "Add Department"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-650">
                ✕
              </button>
            </div>

            {formError && (
              <div className="bg-red-50 text-red-700 p-3 rounded-lg text-xs border border-red-200">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
                  placeholder="e.g., Electronics, Fresh Food"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department Code
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-xs uppercase"
                  placeholder="e.g., ELEC, FRESH"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                <label htmlFor="isActive" className="text-xs font-semibold text-slate-750">
                  Active and Enabled
                </label>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-lg text-slate-500 text-xs hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
                >
                  {formLoading ? "Saving..." : "Save Department"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Departments;
