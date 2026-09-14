import { useSelector } from "react-redux";
import { selectAllActivity } from "../AdminSlices/activitySlice";

// AdminSetting.jsx already fetches all data once on mount —
// ActivityLogs just reads from Redux state, no fetch here.

// FIX: root cause of "Cannot convert object to primitive value" — this
// safely converts any log entry's `action` field to a displayable string,
// regardless of whether the backend sends it as a plain string, an object
// (e.g. { type, meta }), null, or something else. Previously {act.action}
// was rendered directly, and a non-primitive value there could throw
// exactly this error depending on its shape.
const toDisplayString = (value) => {
  if (value == null) return "Unknown action";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    if (typeof value.type === "string") return value.type;
    try {
      return JSON.stringify(value);
    } catch {
      return "Unknown action";
    }
  }
  return String(value);
};

export default function ActivityLogs() {
  const rawActivities = useSelector(selectAllActivity);
  const loading = useSelector((state) => state.activity.loading);
  const error = useSelector((state) => state.activity.error);

  // Defensive: guarantee an array even if the slice ever returns something
  // unexpected, so .map below can never throw on a missing/non-array value.
  const activities = Array.isArray(rawActivities) ? rawActivities : [];

  if (loading) return <p>Loading...</p>;
  if (error)
    return (
      <p>
        Error:{" "}
        {typeof error === "string" ? error : "Failed to load activity logs"}
      </p>
    );

  return (
    <div>
      <h2>Activity Logs</h2>
      {activities.length === 0 ? (
        <p>No activity yet.</p>
      ) : (
        <ul>
          {activities.map((act, index) => (
            // FIX: was key={act.id} — Mongoose documents expose _id, not
            // id. Falls back to array index only as a last resort so React
            // never crashes on a missing key, though _id should always be
            // present for real documents.
            <li key={act?._id || act?.id || index}>
              {toDisplayString(act?.action)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
