import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  exportJSON,
  exportCSV,
  deleteAccount,
  clearExportData,
} from "../AdminSlices/exportdeleteSlice";

// Safely coerce any error shape to a displayable string — same defensive
// pattern used elsewhere in this file's siblings (ActivityLogs, AdminSetting).
const toDisplayError = (error) => {
  if (!error) return null;
  if (typeof error === "string") return error;
  try {
    return String(error);
  } catch {
    return "An unexpected error occurred.";
  }
};

const downloadFile = (content, filename, mimeType) => {
  const blob = new Blob(
    [typeof content === "string" ? content : JSON.stringify(content, null, 2)],
    { type: mimeType },
  );
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export default function ExportDeletePanel() {
  const dispatch = useDispatch();
  const { loading, error, exportData, csvData } = useSelector(
    (state) => state.export,
  );
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleExportJSON = async () => {
    const result = await dispatch(exportJSON());
    if (exportJSON.fulfilled.match(result)) {
      downloadFile(result.payload, "export.json", "application/json");
      dispatch(clearExportData());
    }
  };

  const handleExportCSV = async () => {
    const result = await dispatch(exportCSV());
    if (exportCSV.fulfilled.match(result)) {
      downloadFile(result.payload, "export.csv", "text/csv");
      dispatch(clearExportData());
    }
  };

  const handleDeleteAccount = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    dispatch(deleteAccount());
    setConfirmDelete(false);
  };

  return (
    <div className="bg-white/80 backdrop-blur-md p-4 rounded-xl border border-rose-100 shadow-sm">
      <h2 className="text-lg font-semibold text-rose-900 mb-4">
        Export & Account Data
      </h2>

      {error && (
        <p className="text-sm text-red-600 mb-3">{toDisplayError(error)}</p>
      )}

      <div className="flex flex-wrap gap-3 mb-6">
        <button
          type="button"
          onClick={handleExportJSON}
          disabled={loading}
          className="px-4 py-2 bg-rose-600 text-white rounded-md hover:bg-rose-700 transition disabled:opacity-50"
        >
          {loading ? "Working..." : "Export as JSON"}
        </button>
        <button
          type="button"
          onClick={handleExportCSV}
          disabled={loading}
          className="px-4 py-2 bg-rose-500 text-white rounded-md hover:bg-rose-600 transition disabled:opacity-50"
        >
          {loading ? "Working..." : "Export as CSV"}
        </button>
      </div>

      <div className="pt-4 border-t border-rose-100">
        <h3 className="text-sm font-semibold text-red-700 mb-2">Danger Zone</h3>
        <p className="text-xs text-gray-500 mb-3">
          Deleting an account is permanent and cannot be undone.
        </p>
        <button
          type="button"
          onClick={handleDeleteAccount}
          disabled={loading}
          className={`px-4 py-2 rounded-md text-white transition disabled:opacity-50 ${
            confirmDelete
              ? "bg-red-700 hover:bg-red-800"
              : "bg-red-500 hover:bg-red-600"
          }`}
        >
          {confirmDelete ? "Click again to confirm delete" : "Delete Account"}
        </button>
        {confirmDelete && (
          <button
            type="button"
            onClick={() => setConfirmDelete(false)}
            className="ml-3 text-sm text-gray-500 underline"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
