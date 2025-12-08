import { useState } from "react";
import { createUser } from "../api/users";
import { CheckCircle, Loader2, Shield, User, Mail, Lock } from "lucide-react";

export default function ManageUsers() {
  const currentRole = localStorage.getItem("role") || "admin";
  const isSuperAdmin = currentRole === "superadmin";

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user", // ✅ SAFE DEFAULT (IMPORTANT)
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* -------------------- HANDLERS -------------------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    // 🔒 HARD CLIENT-SIDE GUARD (DON’T REMOVE)
    if (form.role === "admin" && !isSuperAdmin) {
      setError("Only Super Admin can create Admin accounts.");
      setSaving(false);
      return;
    }

    try {
      await createUser({
        name: form.name,
        email: form.email,
        password: form.password || undefined,
        role: isSuperAdmin ? form.role : "user", // ✅ FORCE USER ROLE FOR ADMIN
      });

      setSuccess("User created successfully! Login credentials sent via email.");

      // Reset safely
      setForm({
        name: "",
        email: "",
        password: "",
        role: "user",
      });

      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create user");
    } finally {
      setSaving(false);
    }
  };

  /* -------------------- UI -------------------- */
  return (
    <div className="max-w-5xl mx-auto space-y-10 py-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Manage Users</h1>
        <p className="text-lg text-gray-600 mt-3">
          {isSuperAdmin
            ? "Super Admin can create Admins and Users"
            : "Admin can create regular Users only"}
        </p>
      </div>

      {/* Success Toast */}
      {success && (
        <div className="fixed top-6 right-6 z-50 bg-green-600 text-white px-8 py-5 rounded-2xl shadow-2xl flex items-center gap-4">
          <CheckCircle className="w-8 h-8" />
          <div>
            <p className="font-bold text-lg">Success</p>
            <p className="text-green-50">{success}</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl">
          {error}
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-10 py-8">
          <h2 className="text-3xl font-bold text-white flex items-center gap-4">
            <Shield className="w-10 h-10" />
            Create New User
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-10">
          {/* Name */}
          <Input
            icon={User}
            label="Full Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="Enter full name"
          />

          {/* Email */}
          <Input
            icon={Mail}
            label="Email Address"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="user@company.com"
          />

          {/* Password */}
          <Input
            icon={Lock}
            label="Password (Optional)"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Leave blank → auto-generated"
            helper="Recommended: Leave blank for auto password"
          />

          {/* Role */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-5">
              Assign Role
            </label>

            <div className="grid md:grid-cols-2 gap-6">
              {isSuperAdmin && (
                <RoleCard
                  title="Admin"
                  desc="Manage rooms, users & bookings"
                  value="admin"
                  checked={form.role === "admin"}
                  onChange={handleChange}
                  color="purple"
                />
              )}

              <RoleCard
                title="User"
                desc="Book rooms & view own bookings"
                value="user"
                checked={form.role === "user"}
                onChange={handleChange}
                color="blue"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold text-xl py-6 rounded-2xl shadow-xl disabled:opacity-60 flex justify-center gap-4"
          >
            {saving ? (
              <>
                <Loader2 className="w-8 h-8 animate-spin" />
                Creating...
              </>
            ) : (
              "Create User Account"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

/* -------------------- REUSABLE COMPONENTS -------------------- */
function Input({ icon: Icon, label, helper, ...props }) {
  return (
    <div>
      <label className="flex items-center gap-3 text-sm font-semibold text-gray-700 mb-3">
        <Icon className="w-5 h-5 text-gray-500" />
        {label}
      </label>
      <input
        {...props}
        className="w-full px-5 py-4 border border-gray-300 rounded-2xl text-lg focus:ring focus:ring-blue-200"
      />
      {helper && <p className="text-sm text-gray-500 mt-2">{helper}</p>}
    </div>
  );
}

function RoleCard({ title, desc, value, checked, onChange, color }) {
  const colors = {
    blue: "bg-blue-50 border-blue-200 text-blue-900",
    purple: "bg-purple-50 border-purple-200 text-purple-900",
  };

  return (
    <label className={`flex gap-5 p-6 border-2 rounded-2xl cursor-pointer ${colors[color]}`}>
      <input
        type="radio"
        name="role"
        value={value}
        checked={checked}
        onChange={onChange}
        className="w-6 h-6"
      />
      <div>
        <p className="font-bold text-xl">{title}</p>
        <p className="text-sm opacity-80">{desc}</p>
      </div>
    </label>
  );
}
