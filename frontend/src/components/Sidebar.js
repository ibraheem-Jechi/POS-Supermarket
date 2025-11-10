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

function Sidebar({ user, page, setPage, setUser, collapsed }) {
  const [alertCount, setAlertCount] = useState(0);
  const [adminOpen, setAdminOpen] = useState(false);

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

  useEffect(() => {
    fetchAlertsCount();
    const handler = (e) => {
      const count = e?.detail?.count;
      if (typeof count === "number") setAlertCount(count);
      else fetchAlertsCount();
    };
    window.addEventListener("alertsUpdated", handler);
    return () => window.removeEventListener("alertsUpdated", handler);
  }, []);

  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      {/* HEADER */}
      <div className="sidebar-header">
        <p style={{ fontWeight: 600 }}>
          👋 Hello, {user.username}
          <br />
          <small>({user.role})</small>
        </p>
      </div>

      {/* POS */}
      <button
        className={`nav-button ${page?.toLowerCase() === "pos" ? "active" : ""}`}
        onClick={() => setPage("pos")}
      >
        <FaCashRegister />
        <span>POS</span>
      </button>

      {/* PRODUCTS */}
      <button
        className={`nav-button ${page?.toLowerCase() === "products" ? "active" : ""}`}
        onClick={() => setPage("products")}
      >
        <FaBoxOpen />
        <span>Products</span>
      </button>

      {/* SUPPLIERS */}
      <button
        className={`nav-button ${page?.toLowerCase() === "suppliers" ? "active" : ""}`}
        onClick={() => setPage("suppliers")}
      >
        <FaTruck />
        <span>Suppliers</span>
      </button>

      {/* ADMIN ONLY */}
      {user.role === "admin" && (
        <>
          {/* USER MANAGEMENT */}
          <button
            className={`nav-button ${page?.toLowerCase() === "dashboard" ? "active" : ""}`}
            onClick={() => setPage("dashboard")}
          >
            <FaChartLine />
            <span>User Management</span>
          </button>

          {/* CATEGORIES */}
          <button
            className={`nav-button ${page?.toLowerCase() === "category" ? "active" : ""}`}
            onClick={() => setPage("category")}
          >
            <FaTags />
            <span>Categories</span>
          </button>

          {/* ADMIN SUB MENU */}
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
                <button
                  className={`nav-button ${page?.toLowerCase() === "tops" ? "active" : ""}`}
                  onClick={() => setPage("tops")}
                >
                  <span>• TOPS</span>
                </button>

                <button
                  className={`nav-button ${page?.toLowerCase() === "expenses" ? "active" : ""}`}
                  onClick={() => setPage("expenses")}
                >
                  <span>• EXPENSES</span>
                </button>

                <button
                  className={`nav-button ${page?.toLowerCase() === "wins" ? "active" : ""}`}
                  onClick={() => setPage("wins")}
                >
                  <span>• WINS</span>
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* SALES HISTORY */}
      <button
        className={`nav-button ${page?.toLowerCase() === "saleshistory" ? "active" : ""}`}
        onClick={() => setPage("saleshistory")}
      >
        <FaHistory />
        <span>Sales History</span>
      </button>

      {/* MAIN READING */}
      <button
        className={`nav-button ${page?.toLowerCase() === "dailysummary" ? "active" : ""}`}
        onClick={() => setPage("dailysummary")}
      >
        📖 Main Reading
      </button>

      {/* REPORTS */}
      <button
        className={`nav-button ${page?.toLowerCase() === "reports" ? "active" : ""}`}
        onClick={() => setPage("reports")}
      >
        📑 Reports
      </button>

      {/* ALERTS */}
      <button
        className={`nav-button ${page?.toLowerCase() === "alerts" ? "active" : ""}`}
        onClick={() => setPage("alerts")}
      >
        <FaBell />
        <span>Alerts</span>
        {alertCount > 0 && (
          <span className="badge">{alertCount}</span>
        )}
      </button>

      {/* LOGOUT */}
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

          if (!window.confirm("Are you sure you want to log out?")) return;

          localStorage.removeItem("user");
          localStorage.removeItem("page");
          localStorage.removeItem("activeShift");
          setUser(null);
          setPage("");
        }}
      >
        <FaSignOutAlt />
        Logout
      </button>
    </div>
  );
}

export default Sidebar;
