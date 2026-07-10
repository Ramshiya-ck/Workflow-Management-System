import React, { useState, useEffect } from "react";
import apiClient from "../api/client";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState("DATA_ENTRY");
  const [isActive, setIsActive] = useState(true);
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await apiClient.get("/users/");
      if (res.data?.success) {
        setUsers(res.data.data.results || res.data.data);
      }
    } catch (err) {
      setError("Failed to load users list.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenCreate = () => {
    setEditId(null);
    setEmail("");
    setPassword("");
    setFirstName("");
    setLastName("");
    setPhoneNumber("");
    setRole("DATA_ENTRY");
    setIsActive(true);
    setFormError("");
    setShowModal(true);
  };

  const handleOpenEdit = (u) => {
    setEditId(u.id);
    setEmail(u.email);
    setPassword(""); // Leave blank unless changing
    setFirstName(u.first_name);
    setLastName(u.last_name || "");
    setPhoneNumber(u.phone_number || "");
    setRole(u.role);
    setIsActive(u.is_active);
    setFormError("");
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);

    try {
      const payload = {
        email,
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
        role,
        is_active: isActive,
      };

      if (password) {
        payload.password = password;
      }

      let res;
      if (editId) {
        res = await apiClient.put(`/users/${editId}/`, payload);
      } else {
        if (!password) {
          setFormError("Password is required for new users.");
          setFormLoading(false);
          return;
        }
        res = await apiClient.post("/users/", payload);
      }

      if (res.data?.success) {
        setShowModal(false);
        fetchUsers();
      }
    } catch (err) {
      setFormError(err.response?.data?.message || "Operation failed.");
    } finally {
      setFormLoading(false);
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
          <h1 className="text-2xl font-bold text-slate-800">Users & Roles</h1>
          <p className="text-slate-500 text-sm">Super Admin management of users and RBAC roles.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl text-sm shadow-md shadow-blue-500/10 transition-colors"
        >
          Add User
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-200">
          {error}
        </div>
      )}

      {/* Grid list */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {users.map((u) => (
          <div
            key={u.id}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="bg-blue-50 text-blue-800 text-xxs font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                  {u.role.replace("_", " ")}
                </span>
                <span
                  className={`h-2.5 w-2.5 rounded-full ${u.is_active ? "bg-emerald-500" : "bg-slate-300"}`}
                ></span>
              </div>
              <h3 className="text-base font-bold text-slate-800 mt-3">
                {u.first_name} {u.last_name}
              </h3>
              <div className="text-slate-500 text-xs mt-1 truncate">{u.email}</div>
              {u.phone_number && <div className="text-slate-400 text-xxs mt-0.5">{u.phone_number}</div>}
            </div>

            <div className="flex items-center mt-6 pt-4 border-t border-slate-50">
              <button
                onClick={() => handleOpenEdit(u)}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
              >
                Edit Account & Roles
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
                {editId ? "Edit User & Roles" : "Add User & Role"}
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  disabled={!!editId}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-xs disabled:bg-slate-50"
                  placeholder="user@aak.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password {editId && "(Leave blank to keep current)"}
                </label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
                  placeholder="Min 10 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Role</label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="SUPER_ADMIN">Super Admin</option>
                    <option value="DATA_ENTRY">Data Entry</option>
                    <option value="SUPERVISOR">Supervisor</option>
                    <option value="DEPARTMENT_MANAGER">Department Manager</option>
                    <option value="ACCOUNTS">Accounts</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                <label htmlFor="isActive" className="text-xs font-semibold text-slate-750">
                  Active / Enabled login
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
                  {formLoading ? "Saving..." : "Save User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
