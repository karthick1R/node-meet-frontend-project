import { useState } from "react";
import { createUser } from "../api/users";

export default function ManageUsers() {
  const role = localStorage.getItem("role");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: role === "superadmin" ? "admin" : "user",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const canAssignAdmin = role === "superadmin";

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
      const res = await createUser(form); // ✅ API call

      if (res?.data) {
        // ✅ SUCCESS MESSAGE STATE
        setSuccess("User created and credentials emailed successfully!");

        // ✅ RESET FORM
        setForm({
          name: "",
          email: "",
          password: "",
          role: role === "superadmin" ? "admin" : "user",
        });

        // ✅ GUARANTEED POPUP
        setTimeout(() => {
          window.alert("✅ User created successfully!\nCredentials sent via email.");
        }, 150);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to create user");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Manage Users</h1>
          <p className="text-gray-500">
            Super Admin can create Admin & Users. Admin can create Users.
          </p>
        </div>
      </div>

      {/* ✅ ERROR MESSAGE */}
      {error && <p className="text-red-500 mb-3 text-sm">{error}</p>}

      {/* ✅ SUCCESS MESSAGE */}
      {success && <p className="text-green-600 mb-3 text-sm">{success}</p>}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow p-6 space-y-4 max-w-lg"
      >
        <div>
          <label className="block text-sm text-gray-600 mb-1">Name</label>
          <input
            type="text"
            name="name"
            className="border rounded-lg w-full p-2"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Email</label>
          <input
            type="email"
            name="email"
            className="border rounded-lg w-full p-2"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Password (optional)
          </label>
          <input
            type="password"
            name="password"
            className="border rounded-lg w-full p-2"
            value={form.password}
            onChange={handleChange}
          />
          <p className="text-xs text-gray-400 mt-1">
            If left empty, a strong password will be generated automatically.
          </p>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Role</label>
          <select
            name="role"
            className="border rounded-lg w-full p-2"
            value={form.role}
            onChange={handleChange}
            disabled={!canAssignAdmin}
          >
            {canAssignAdmin && <option value="admin">Admin</option>}
            <option value="user">User</option>
          </select>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-60"
          disabled={saving}
        >
          {saving ? "Creating..." : "Create User"}
        </button>
      </form>
    </div>
  );
}
