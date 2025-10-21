import React from "react";
import "./Sidebar.css";
import {
  FaCashRegister,
  FaBoxOpen,
  FaChartLine,
  FaTags,
  FaHistory,
  FaSignOutAlt,
} from "react-icons/fa";

function Sidebar({ user, setPage, setUser, collapsed }) {
  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <p style={{ fontWeight: 600 }}>
        👋 Hello, {user.username} <br />
        <small>({user.role})</small>
      </p>

      <button onClick={() => setPage('pos')}><FaCashRegister /> POS</button>
      <button onClick={() => setPage('products')}><FaBoxOpen /> Products</button>

      {user.role === 'admin' && (
        <>
          <button onClick={() => setPage('dashboard')}><FaChartLine /> Dashboard</button>
          <button onClick={() => setPage('category')}><FaTags /> Categories</button>
        </>
      )}

      <button onClick={() => setPage('salesHistory')}><FaHistory /> Sales History</button>

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
