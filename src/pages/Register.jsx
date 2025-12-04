import { useState } from "react";
import { registerUser } from "../api/auth";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await registerUser({ ...form });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>

        {error && (
          <p className="text-red-500 text-center text-sm mb-4">{error}</p>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            className="w-full border px-4 py-2 rounded-lg mb-4"
            value={form.name}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full border px-4 py-2 rounded-lg mb-4"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full border px-4 py-2 rounded-lg mb-4"
            value={form.password}
            onChange={handleChange}
            required
          />

          <button
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Creating..." : "Register"}
          </button>
        </form>

        <p className="text-center mt-4">
          Already have an account?
          <Link to="/login" className="text-blue-600 ml-1">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
