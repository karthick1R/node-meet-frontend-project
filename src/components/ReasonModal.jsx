import { useState } from "react";
import Swal from "sweetalert2";

export default function ReasonModal({ title, onSubmit, onClose }) {
  const [reason, setReason] = useState("");

  const handleSubmit = () => {
    if (!reason.trim()) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "Please enter a reason!",
        showConfirmButton: false,
        timer: 2000,
      });
      return;
    }

    // Show success toast before sending the value to parent
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: "Reason submitted",
      showConfirmButton: false,
      timer: 1500,
    });

    onSubmit(reason);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl w-96 shadow-xl animate-fadeIn">
        <h2 className="text-lg font-bold mb-3">{title}</h2>

        <textarea
          className="w-full border rounded-lg p-2"
          rows="3"
          placeholder="Enter reason..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        <div className="flex justify-end gap-3 mt-4">
          <button className="px-4 py-2 bg-gray-300 rounded-lg" onClick={onClose}>
            Cancel
          </button>

          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
