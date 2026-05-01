import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { ArrowLeft, BadgePlus, FileText, LogOut, Sparkles } from "lucide-react";
import { fetchDevices } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import AddReadingForm from "../components/AddReadingForm";

export default function AddReadingPage() {
  const { token, user, logout } = useAuth();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [toastType, setToastType] = useState("success");

  const isAllowed = user?.role === "agronomist" || user?.role === "admin";

  useEffect(() => {
    async function loadDevices() {
      setLoading(true);
      try {
        const rows = await fetchDevices(token);
        setDevices(rows);
      } finally {
        setLoading(false);
      }
    }

    loadDevices();
  }, [token]);

  useEffect(() => {
    if (!toast) return undefined;

    const timer = window.setTimeout(() => setToast(""), 2500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  if (!isAllowed) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="page">
      <header className="hero history-hero">
        <div>
          <p className="eyebrow icon-eyebrow">
            <BadgePlus className="button-icon" aria-hidden="true" />
            Manual data entry
          </p>
          <h1>Add Reading</h1>
          <p>Record a sensor reading manually for a device in your scope.</p>
        </div>
        <div className="session-actions">
          <Link className="ghost-button" to="/">
            <ArrowLeft className="button-icon" aria-hidden="true" />
            Dashboard
          </Link>
          <Link className="ghost-button" to="/readings">
            <FileText className="button-icon" aria-hidden="true" />
            History
          </Link>
          <button className="ghost-button" type="button" onClick={logout}>
            <LogOut className="button-icon" aria-hidden="true" />
            Logout
          </button>
        </div>
      </header>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Manual Reading Entry</h2>
            <p>Add one reading at a time. A success toast confirms the save.</p>
          </div>
        </div>

        {loading ? <p>Loading devices...</p> : null}
        {!loading && devices.length === 0 ? <p>No devices available for your account.</p> : null}
        {!loading && devices.length > 0 ? (
          <>
            {toast ? (
              <div className={`toast ${toastType === "success" ? "toast-success" : "toast-error"}`}>
                <Sparkles className="button-icon" aria-hidden="true" />
                {toast}
              </div>
            ) : null}
            <AddReadingForm
              devices={devices}
              token={token}
              onSuccess={() => {
                setToastType("success");
                setToast("Reading saved successfully.");
                window.dispatchEvent(new Event("smartseason:readings-updated"));
              }}
            />
          </>
        ) : null}
      </section>
    </main>
  );
}
