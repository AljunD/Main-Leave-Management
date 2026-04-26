// src/pages/DashboardPage.jsx
import { useEffect, useState } from "react";
import API from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/pages/dashboard-page.css";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      setLoading(true);
      try {
        // Fetch user profile
        const userRes = await fetch("http://localhost:5000/api/v1/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!userRes.ok) {
          throw new Error("Session expired. Please login again.");
        }

        const userJson = await userRes.json();
        setUserData(userJson.data);

        // Fetch leave history
        const leaveRes = await fetch(
          "http://localhost:5000/api/v1/employee/leaves/my",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (leaveRes.ok) {
          const leaveJson = await leaveRes.json();
          setLeaves(leaveJson.data || []);
        }
      } catch (e) {
        setError(e.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const recent = leaves.slice(0, 5);
  const used = leaves.filter((l) => l.status === "Approved").length;

  if (loading) {
    return (
      <div className="page dashboard-page">
        <p>Loading…</p>
      </div>
    );
  }

  return (
    <div className="page dashboard-page">
      <div className="page-intro">
        <h1>Hello, {userData?.firstName || "User"}!</h1>
        <span className="muted">Here is your leave overview.</span>
        <button
          onClick={handleLogout}
          className="btn btn-sm"
          style={{ marginLeft: "10px" }}
        >
          Logout
        </button>
      </div>

      {error ? <p className="error-msg">{error}</p> : null}

      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-label">Total available (all types)</span>
          <strong className="stat-num">{userData?.leaveBalance || 0}</strong>
          <span className="stat-unit">days</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Used this year (approved)</span>
          <strong className="stat-num">{used}</strong>
          <span className="stat-unit">days</span>
        </div>
      </div>

      <Link to="/apply-leave" className="btn btn-dark btn-block apply-cta">
        + Apply for leave
      </Link>

      <h2 className="section-title">Recent leave requests</h2>
      <div className="card-list">
        {recent.length === 0 ? (
          <p className="muted">No requests yet.</p>
        ) : (
          recent.map((leave) => (
            <article key={leave._id} className="leave-card">
              <div className="leave-card-top">
                <div>
                  <h3>{leave.leaveType || "Leave"}</h3>
                  <p className="muted small">
                    Applied{" "}
                    {leave.createdAt
                      ? new Date(leave.createdAt).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
                <span
                  className={`badge badge-${(leave.status || "Pending").toLowerCase()}`}
                >
                  {leave.status || "Pending"}
                </span>
              </div>
              <p className="leave-meta">
                {leave.startDate
                  ? new Date(leave.startDate).toLocaleDateString()
                  : "—"}{" "}
                –{" "}
                {leave.endDate
                  ? new Date(leave.endDate).toLocaleDateString()
                  : "—"}
              </p>
              <p className="leave-reason">{leave.reason}</p>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
