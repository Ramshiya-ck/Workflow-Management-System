import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import apiClient from "../api/client";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await apiClient.post("/auth/forgot-password/", { email });
      if (res.data?.success) {
        setMessage(res.data.message);
        // For development/test comfort, notify the developer of mock verification code '123456'
        const code = res.data.data?.code;
        if (code) {
          setMessage(`${res.data.message} (Development Code: ${code})`);
        }
        setTimeout(() => {
          navigate("/reset-password", { state: { email } });
        }, 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Forgot Password</h2>
          <p className="mt-2 text-sm text-slate-500">Provide your registered email address</p>
        </div>

        {message && (
          <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm border border-green-200">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-200">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-800 text-sm"
              placeholder="name@aak.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 border border-transparent rounded-lg text-sm font-semibold text-white bg-blue-650 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-550 transition-colors shadow-md shadow-blue-500/10"
          >
            {loading ? "Requesting..." : "Send Verification Code"}
          </button>
        </form>

        <div className="text-center mt-4">
          <Link to="/login" className="text-sm text-blue-655 hover:underline">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
