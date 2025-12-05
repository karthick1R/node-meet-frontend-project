import { useEffect, useRef, useState } from "react";
import { getMe, updateMe, uploadLogo } from "../api/users";
import { Camera, CheckCircle, Loader2, Upload, X } from "lucide-react";

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
  const [success, setSuccess] = useState("");

  // Load user profile
  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const res = await getMe();
        const user = res.data;

        setForm({
          name: user.name || "",
          email: user.email || "",
          password: "",
          confirmPassword: "",
        });

        setLogo(user.logo || "");
        localStorage.setItem("logo", user.logo || "");
        localStorage.setItem("name", user.name || "");
      } catch (err) {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  // Auto-hide success message
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    if (!selected.type.startsWith("image/")) {
      setError("Please select a valid image");
      return;
    }

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password && form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      // Upload logo if changed
      if (file) {
        const formData = new FormData();
        formData.append("logo", file);

        const res = await uploadLogo(formData);
        setLogo(res.data.logo);
        localStorage.setItem("logo", res.data.logo);
        window.dispatchEvent(new Event("storage"));
      }

      // Update profile
      const payload = {
        name: form.name,
        email: form.email,
      };
      if (form.password) payload.password = form.password;

      await updateMe(payload);

      localStorage.setItem("name", form.name);
      window.dispatchEvent(new Event("storage"));

      setSuccess("Profile updated successfully!");
      setFile(null);
      setPreview("");
      setForm((prev) => ({ ...prev, password: "", confirmPassword: "" }));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <ProfileSkeleton />;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Success Toast */}
      {success && (
        <div className="fixed top-6 right-6 z-50 bg-green-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top">
          <CheckCircle className="w-6 h-6" />
          <span className="font-medium">{success}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-500 mt-2">Manage your account information and preferences</p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-10 py-8">
          <div className="flex items-center gap-8">
            {/* Avatar Upload */}
            <div className="relative group">
              <div
                onClick={() => fileInputRef.current.click()}
                className="cursor-pointer"
              >
                <div className="relative">
                  <img
                    src={
                      preview
                        ? preview
                        : logo
                        ? `${BACKEND_URL}${logo}`
                        : "/default-avatar.png"
                    }
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover ring-8 ring-white/20 shadow-2xl"
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="w-10 h-10 text-white" />
                  </div>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {file && (
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
                  <Upload className="w-3 h-3" />
                  Ready to upload
                </div>
              )}
            </div>

            <div className="text-white">
              <h2 className="text-3xl font-bold">{form.name || "User"}</h2>
              <p className="text-blue-100 text-lg">{form.email}</p>
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="mt-4 bg-white/20 backdrop-blur-sm hover:bg-white/30 px-5 py-2 rounded-xl text-sm font-medium transition"
              >
                Change Photo
              </button>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="p-10">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  required
                />
              </div>
            </div>

            {/* Password Section */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Change Password (Optional)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    placeholder="Leave blank to keep current"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    placeholder="Repeat password"
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-6">
              <button
                type="submit"
                disabled={saving}
                className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-3"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    Save Changes
                    <CheckCircle className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Loading Skeleton
function ProfileSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
      <div className="h-12 bg-gray-200 rounded w-64"></div>
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="h-48 bg-gradient-to-r from-gray-200 to-gray-300"></div>
        <div className="p-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2].map((i) => (
              <div key={i}>
                <div className="h-6 bg-gray-200 rounded w-32 mb-3"></div>
                <div className="h-12 bg-gray-100 rounded-xl"></div>
              </div>
            ))}
          </div>
          <div className="h-32 bg-gray-100 rounded-xl"></div>
        </div>
      </div>
    </div>
  );
}