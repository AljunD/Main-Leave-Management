// src/pages/ProfilePage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import "../../styles/pages/profile-page.css";

export default function ProfilePage() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    api
      .getEmployee(user._id)
      .then((data) => {
        if (!cancelled) {
          setDetail(data);
          // Merge into auth context, but avoid storing password
          setUser((prev) => ({ ...prev, ...data, password: undefined }));
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || "Failed to load profile");
      });
    return () => {
      cancelled = true;
    };
  }, [user._id, setUser]);

  const d = detail || user;

  return (
    <div className="page profile-page">
      <div className="page-intro">
        <h1>Profile</h1>
        <span className="muted">Personal Information</span>
      </div>

      {error && <p className="error-msg">{error}</p>}

      <div className="profile-card">
        <div className="profile-card__banner" aria-hidden />
        <div className="profile-avatar" aria-hidden>
          {d.firstName?.[0]}
          {d.lastName?.[0]}
        </div>
        <div className="profile-card__body">
          <p className="emp-id">
            Employee ID · {String(d._id).slice(-8).toUpperCase()}
          </p>
          <dl className="profile-dl">
            <div>
              <dt>Full name</dt>
              <dd>
                {d.firstName} {d.lastName}
              </dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{d.email}</dd>
            </div>
            <div>
              <dt>Role</dt>
              <dd>{d.role}</dd>
            </div>
            <div>
              <dt>Department</dt>
              <dd>{d.department || "—"}</dd>
            </div>
            <div>
              <dt>Position</dt>
              <dd>{d.position || "—"}</dd>
            </div>
            <div>
              <dt>Contact</dt>
              <dd>{d.contactNumber || "—"}</dd>
            </div>
          </dl>

          <div style={{ marginTop: "1.1rem" }}>
            <button
              type="button"
              className="btn btn-ghost btn-block"
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              Log out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
