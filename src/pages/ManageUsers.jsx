import { useState } from "react";
import { createUser } from "../api/users";
import { CheckCircle, Loader2, Shield, User, Mail, Lock } from "lucide-react";

export default function ManageUsers() {
  const currentRole = localStorage.getItem("role") || "admin";
  const canCreateAdmin = currentRole === "superadmin";

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: canCreateAdmin ? "admin" : "user",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await createUser(form);

      setSuccess("User created successfully! Login credentials sent via email.");

      // Reset form
      setForm({
        name: "",
        email: "",
        password: "",
        role: canCreateAdmin ? "admin" : "user",
      });

      // Auto-hide success message
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create user");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 py-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Manage Users</h1>
        <p className="text-lg text-gray-600 mt-3">
          {canCreateAdmin
            ? "Super Admin can create both Admins and regular Users"
            : "Admin can create regular Users"}
        </p>
      </div>

      {/* Success Toast */}
      {success && (
        <div className="fixed top-6 right-6 z-50 bg-green-600 text-white px-8 py-5 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-top">
          <CheckCircle className="w-8 h-8" />
          <div>
            <p className="font-bold text-lg">Success!</p>
            <p className="text-green-50">{success}</p>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl">
          {error}
        </div>
      )}

      {/* Main Form Card */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-10 py-8">
          <h2 className="text-3xl font-bold text-white flex items-center gap-4">
            <Shield className="w-10 h-10" />
            Create New User Account
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-10">
          {/* Name */}
          <div>
            <label className="flex items-center gap-3 text-sm font-semibold text-gray-700 mb-3">
              <User className="w-5 h-5 text-gray-500" />
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Enter full name"
              className="w-full px-5 py-4 border border-gray-300 rounded-2xl text-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
          </div>

          {/* Email */}
          <div>
            <label className="flex items-center gap-3 text-sm font-semibold text-gray-700 mb-3">
              <Mail className="w-5 h-5 text-gray-500" />
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="user@company.com"
              className="w-full px-5 py-4 border border-gray-300 rounded-2xl text-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
          </div>

          {/* Password */}
          <div>
            <label className="flex items-center gap-3 text-sm font-semibold text-gray-700 mb-3">
              <Lock className="w-5 h-5 text-gray-500" />
              Password (Optional)
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Leave blank → auto-generated secure password"
              className="w-full px-5 py-4 border border-gray-300 rounded-2xl text-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
            <p className="text-sm text-gray-500 mt-3">
              Recommended: Leave empty. A strong password will be generated and emailed.
            </p>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-5">
              Assign Role
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {canCreateAdmin && (
                <label className="flex items-center gap-5 p-6 bg-purple-50 rounded-2xl border-2 border-purple-200 cursor-pointer hover:bg-purple-100 transition">
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={form.role === "admin"}
                    onChange={handleChange}
                    className="w-6 h-6 text-purple-600"
                  />
                  <div>
                    <p className="font-bold text-purple-900 text-xl">Admin</p>
                    <p className="text-purple-700">Full access: manage rooms, users, bookings</p>
                  </div>
                </label>
              )}

              <label className="flex items-center gap-5 p-6 bg-blue-50 rounded-2xl border-2 border-blue-200 cursor-pointer hover:bg-blue-100 transition">
                <input
                  type="radio"
                  name="role"
                  value="user"
                  checked={form.role === "user"}
                  onChange={handleChange}
                  className="w-6 h-6 text-blue-600"
                />
                <div>
                  <p className="font-bold text-blue-900 text-xl">User</p>
                  <p className="text-blue-700">Can book rooms and view own bookings</p>
                </div>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold text-xl py-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-4"
            >
              {saving ? (
                <>
                  <Loader2 className="w-8 h-8 animate-spin" />
                  Creating User Account...
                </>
              ) : (
                "Create User Account"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-3xl p-10">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Quick Guide</h3>
        <div className="grid md:grid-cols-3 gap-6 text-gray-700">
          <div className="flex items-start gap-4">
            <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
            <div>
              <p className="font-semibold">Instant Email</p>
              <p className="text-sm">User receives login link & password immediately</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
            <div>
              <p className="font-semibold">Auto Password</p>
              <p className="text-sm">Strong password generated if field is empty</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
            <div>
              <p className="font-semibold">Role Control</p>
              <p className="text-sm">Only Super Admin can create other Admins</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}