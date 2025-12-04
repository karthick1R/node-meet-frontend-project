import { useEffect, useRef, useState } from "react";
import { getMe, updateMe, uploadLogo } from "../api/users";

const BACKEND_URL = "http://localhost:5000";

export default function Profile() {
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [logo, setLogo] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(""); // ✅ Used for UI notification

  // ✅ LOAD USER DATA
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getMe();

        setForm({
          name: res.data.name,
          email: res.data.email,
          password: "",
          confirmPassword: "",
        });

        setLogo(res.data.logo || "");
        localStorage.setItem("logo", res.data.logo || "");
        localStorage.setItem("name", res.data.name || "");
      } catch (err) {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // ✅ AUTO HIDE SUCCESS MESSAGE
  useEffect(() => {
    if (!success) return;

    const timer = setTimeout(() => {
      setSuccess("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [success]);

  // ✅ IMAGE PREVIEW BEFORE UPLOAD
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  // ✅ UPDATE PROFILE (LOGO + NAME + EMAIL + PASSWORD)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    if (form.password && form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      setSaving(false);
      return;
    }

    try {
      // ✅ 1. Upload logo automatically if selected
      if (file) {
        const formData = new FormData();
        formData.append("logo", file);

        const res = await uploadLogo(formData);

        setLogo(res.data.logo);
        localStorage.setItem("logo", res.data.logo);
        window.dispatchEvent(new Event("storage"));

        setFile(null);
        setPreview("");
      }

      // ✅ 2. Update profile data
      const payload = {
        name: form.name,
        email: form.email,
      };

      if (form.password) payload.password = form.password;

      await updateMe(payload);

      localStorage.setItem("name", form.name);
      window.dispatchEvent(new Event("storage"));

      // ✅ SUCCESS TOAST MESSAGE
      setSuccess("Profile updated successfully ✅");

      setForm((prev) => ({
        ...prev,
        password: "",
        confirmPassword: "",
      }));
    } catch (err) {
      setError("Profile update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="relative">
      {/* ✅ SUCCESS NOTIFICATION */}
      {success && (
        <div className="fixed top-6 right-6 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-pulse">
          {success}
        </div>
      )}

      <h1 className="text-3xl font-bold mb-6">Profile Settings</h1>

      {error && <p className="text-red-500 mb-3">{error}</p>}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow p-6 space-y-6 max-w-lg"
      >
        {/* ✅ CUSTOM LOGO UPLOAD UI */}
        <div className="flex items-center gap-6">
          {/* Clickable Avatar */}
          <div
            onClick={() => fileInputRef.current.click()}
            className="relative cursor-pointer"
          >
            <img
              src={
                preview
                  ? preview
                  : logo
                  ? `${BACKEND_URL}${logo}`
                  : "/default-avatar.png"
              }
              alt="User Logo"
              className="w-24 h-24 rounded-full border object-cover hover:opacity-80 transition"
            />

            <div className="absolute bottom-0 right-0 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
              Edit
            </div>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept="image/*"
          />

          {/* Change Button */}
          <div>
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="bg-gray-200 hover:bg-gray-300 text-sm px-4 py-2 rounded"
            >
              Change Photo
            </button>

            {file && (
              <p className="text-xs text-green-600 mt-1">
                New image selected
              </p>
            )}
          </div>
        </div>

        {/* ✅ NAME */}
        <div>
          <label className="block text-sm mb-1">Name</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border p-2 w-full"
            required
          />
        </div>

        {/* ✅ EMAIL */}
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="border p-2 w-full"
            type="email"
            required
          />
        </div>

        {/* ✅ PASSWORD */}
        <div className="grid grid-cols-2 gap-4">
          <input
            type="password"
            placeholder="New Password"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
            className="border p-2"
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={(e) =>
              setForm({ ...form, confirmPassword: e.target.value })
            }
            className="border p-2"
          />
        </div>

        {/* ✅ SUBMIT BUTTON */}
        <button
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
