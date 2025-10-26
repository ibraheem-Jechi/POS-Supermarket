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
} from "react-icons/fa";
import axios from "axios";




function Sidebar({ user, setPage, setUser, collapsed }) {
  const [alertCount, setAlertCount] = useState(0);

  const fetchAlertsCount = async () => {
    try {
      // Fetch alerts list and count them. If you later add a /alerts/count endpoint,
      // change this to axios.get('/api/products/alerts/count') and read res.data.count.
      const res = await axios.get("http://localhost:5000/api/products/alerts");
      if (Array.isArray(res.data)) {
        setAlertCount(res.data.length);
      } else if (res.data && typeof res.data.count === "number") {
        setAlertCount(res.data.count);
      } else {
        setAlertCount(0);
      }
    } catch (err) {
      console.error("Failed to fetch alerts:", err?.response?.data || err.message);
      setAlertCount(0);
    }
  };

  useEffect(() => {
    // initial fetch
    fetchAlertsCount();

    // poll every 30s
    const id = setInterval(fetchAlertsCount, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <p style={{ fontWeight: 600 }}>
        👋 Hello, {user.username} <br />
        <small>({user.role})</small>
      </p>

      <button className="nav-button" onClick={() => setPage('pos')}>
        <FaCashRegister /> <span>POS</span>
      </button>

      <button className="nav-button" onClick={() => setPage('products')}>
        <FaBoxOpen /> <span>Products</span>
      </button>

      {user.role === 'admin' && (
        <>
          <button className="nav-button" onClick={() => setPage('dashboard')}>
            <FaChartLine /> <span>Dashboard</span>
          </button>
          <button className="nav-button" onClick={() => setPage('category')}>
            <FaTags /> <span>Categories</span>
          </button>
        </>
      )}

      <button className="nav-button" onClick={() => setPage('salesHistory')}>
        <FaHistory /> <span>Sales History</span>
      </button>
      
      <button className="nav-button" onClick={() => setPage('dailyReport')}>
      <FaChartLine /> <span>Daily Report</span>
    </button>
      {/* Alerts button - visible for all (you can restrict to admin if needed) */}
      <button className="nav-button" onClick={() => setPage('alerts')}>
        <FaBell /> <span>Alerts</span>
        {alertCount > 0 && (
          <span className="badge" aria-label={`${alertCount} alerts`}>{alertCount}</span>
        )}
      </button>
      

      <button
        className="logout-btn"
        onClick={() => {
          setUser(null);
          setPage('');
          localStorage.clear();
        }}
      >
        <FaSignOutAlt /> Logout
      </button>
    </div>
  );
}

export default Sidebar;
