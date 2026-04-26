// src/pages/LeaveHistoryPage.jsx
import { useEffect, useState } from "react";
import API from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { labelForLeaveType } from "../../utils/leave";
import "../../styles/pages/leave-history-page.css";

export default function LeaveHistoryPage() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const list = await api.getLeaves(user._id);
        if (!cancelled) setLeaves(list);
      } catch (e) {
        if (!cancelled) setError(e.message || "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [user._id]);

  return (
    <div className="page leave-history-page">
      <div className="page-intro">
        <h1>Leave history</h1>
        <span className="muted">
          All requests linked to your employee record.
        </span>
      </div>

      {loading && <p className="muted">Loading…</p>}
      {error && <p className="error-msg">{error}</p>}

      <div className="card-list">
        {leaves.length === 0 && !loading ? (
          <p className="muted">No leave records yet.</p>
        ) : (
          leaves.map((leave) => (
            <article key={leave._id} className="history-card">
              <div className="history-top">
                <h3>{labelForLeaveType(leave.leaveType)}</h3>
                <span
                  className={`badge badge-${leave.status?.toLowerCase() || "pending"}`}
                >
                  {leave.status || "Pending"}
                </span>
              </div>
              <p className="muted small">
                {new Date(leave.startDate).toLocaleDateString()} –{" "}
                {new Date(leave.endDate).toLocaleDateString()}
              </p>
              <p>{leave.reason}</p>
              {leave.adminRemarks && (
                <p className="admin-remarks">
                  <span className="muted">Admin remarks:</span>{" "}
                  {leave.adminRemarks}
                </p>
              )}
            </article>
          ))
        )}
      </div>
    </div>
  );
}
