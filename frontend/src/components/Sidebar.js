import React, { useEffect, useState } from "react";
import "./Sidebar.css";
import {
  FaCashRegister,
  FaBoxOpen,
  FaChartLine,
  FaTags,
  FaHistory,
  FaSignOutAlt,
  FaBell,
  FaChevronDown,
  FaChevronUp,
  FaCog,
  FaTruck,
} from "react-icons/fa";
import axios from "axios";

function Sidebar({ user, setPage, setUser, collapsed }) {
  const [alertCount, setAlertCount] = useState(0);
  const [adminOpen, setAdminOpen] = useState(false); // ✅ Admin section toggle

  // === Fetch alert count from backend ===
  const fetchAlertsCount = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/alerts");
      if (res.data && typeof res.data.count === "number") {
        setAlertCount(res.data.count);
      } else if (Array.isArray(res.data)) {
        setAlertCount(res.data.length);
      } else {
        setAlertCount(0);
      }
    } catch (err) {
      console.error("Failed to fetch alerts:", err?.response?.data || err.message);
      setAlertCount(0);
    }
  };

  // === Initial load + periodic refresh ===
  useEffect(() => {
    fetchAlertsCount();
    // Listen for manual updates triggered elsewhere (e.g. after a sale)
    const onAlertsUpdated = (e) => {
      try {
        const count = e?.detail?.count;
        if (typeof count === "number") setAlertCount(count);
        else fetchAlertsCount();
      } catch (err) {
        fetchAlertsCount();
      }
    };
    window.addEventListener("alertsUpdated", onAlertsUpdated);
    const id = setInterval(fetchAlertsCount, 30000);
    return () => clearInterval(id);
    // cleanup listener
    // note: return only cleans interval; also remove listener on unmount
    // so we remove it here via a separate cleanup
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const count = e?.detail?.count;
      if (typeof count === "number") setAlertCount(count);
    };
    window.addEventListener("alertsUpdated", handler);
    return () => window.removeEventListener("alertsUpdated", handler);
  }, []);

  // === Sidebar UI ===
  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      {/* === User Info === */}
      <div className="sidebar-header">
        <p style={{ fontWeight: 600 }}>
          👋 Hello, {user.username}
          <br />
          <small>({user.role})</small>
        </p>
      </div>

      {/* === Navigation Buttons === */}
      <button className="nav-button" onClick={() => setPage("pos")}>
        <FaCashRegister />
        <span>POS</span>
      </button>

      <button className="nav-button" onClick={() => setPage("products")}>
        <FaBoxOpen />
        <span>Products</span>
      </button>

      <button className="nav-button" onClick={() => setPage("suppliers")}>
        <FaTruck />
  <span>Suppliers</span>
</button>


      {user.role === "admin" && (
        <>
          <button className="nav-button" onClick={() => setPage("dashboard")}>
            <FaChartLine />
            <span>User Management</span>
          </button>

          <button className="nav-button" onClick={() => setPage("category")}>
            <FaTags />
            <span>Categories</span>
          </button>

          {/* === Collapsible Admin Section === */}
          <div className="admin-section">
            <button
              className="nav-button"
              onClick={() => setAdminOpen(!adminOpen)}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <FaCog />
                <span>Admin</span>
              </div>
              {adminOpen ? <FaChevronUp /> : <FaChevronDown />}
            </button>

            {adminOpen && (
              <div className="admin-submenu" style={{ marginLeft: "25px" }}>
                <button className="nav-button" onClick={() => setPage("tops")}>
                  <span>• TOPS</span>
                </button>
                <button className="nav-button" onClick={() => setPage("expenses")}>
                  <span>• EXPENSES</span>
                </button>
                <button className="nav-button" onClick={() => setPage("wins")}>
                  <span>• WINS</span>
                </button>
              </div>
            )}
          </div>
        </>
      )}

      <button className="nav-button" onClick={() => setPage("saleshistory")}>
        <FaHistory />
        <span>Sales History</span>
      </button>

      <button className="nav-button" onClick={() => setPage("dailysummary")}>
        📖 Main Reading
      </button>

      <button className="nav-button" onClick={() => setPage("reports")}>
        📑 Reports
      </button>

      {/* === Alerts Button (with badge) === */}
      <button className="nav-button" onClick={() => setPage("alerts")}>
        <FaBell />
        <span>Alerts</span>
        {alertCount > 0 && (
          <span className="badge" aria-label={`${alertCount} alerts`}>
            {alertCount}
          </span>
        )}
      </button>

      {/* === Logout === */}
      <button
        className={`logout-btn ${localStorage.getItem("activeShift") ? "disabled" : ""}`}
        onClick={() => {
          const activeShift = JSON.parse(localStorage.getItem("activeShift") || "null");

          if (activeShift) {
            alert(
              `🚫 You cannot log out while a shift is active.\n\nCashier: ${activeShift.cashier}\nStarted: ${new Date(
                activeShift.startTime
              ).toLocaleString()}\n\nPlease end your shift first.`
            );
            return;
          }

          const confirmLogout = window.confirm("Are you sure you want to log out?");
          if (!confirmLogout) return;

          localStorage.removeItem("user");
          localStorage.removeItem("page");
          localStorage.removeItem("activeShift");
          setUser(null);
          setPage("");
        }}
      >
        <FaSignOutAlt /> Logout
      </button>
    </div>
  );
}

export default Sidebar;
