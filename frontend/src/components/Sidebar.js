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
    const id = setInterval(fetchAlertsCount, 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    console.log("Alert count updated:", alertCount);
  }, [alertCount]);

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

     

      <button className="nav-button" onClick={() => setPage("salesHistory")}>
        <FaHistory />
        <span>Sales History</span>
      </button>

      <button className="nav-button" onClick={() => setPage("dailyReport")}>
        <FaChartLine />
        <span>Daily Report</span>
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
                  <span>TOPS</span>
                </button>
                <button className="nav-button" onClick={() => setPage("expenses")}>
                  <span>EXPENSES</span>
                </button>
                <button className="nav-button" onClick={() => setPage("wins")}>
                  <span>WINS</span>
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* === Logout === */}
      <button
        className="logout-btn"
        onClick={() => {
          setUser(null);
          setPage("");
          localStorage.clear();
        }}
      >
        <FaSignOutAlt />
        <span>Logout</span>
      </button>
    </div>
  );
}

export default Sidebar;
