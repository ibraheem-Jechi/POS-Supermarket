import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaExclamationTriangle, FaSyncAlt, FaTrash, FaClock } from "react-icons/fa";

function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all"); // ✅ added missing filter state

  // ✅ Fetch alerts from backend
  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/alerts");
      console.log("✅ Alerts data:", res.data);
      if (res.data && Array.isArray(res.data.alerts)) {
        setAlerts(res.data.alerts);
      } else {
        setAlerts([]);
      }
    } catch (err) {
      console.error("❌ Failed to load alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  // Listen for global alerts updates so page refreshes automatically
  useEffect(() => {
    const handler = (e) => {
      try {
        // If a detail is provided we can optionally use it, but always refresh to be safe
        fetchAlerts();
      } catch (err) {
        console.warn("alertsUpdated handler failed:", err);
      }
    };
    window.addEventListener("alertsUpdated", handler);
    return () => window.removeEventListener("alertsUpdated", handler);
  }, []);

  // ✅ Delete alert locally (frontend only)
  const deleteAlert = (productId) => {
    setAlerts((prev) => prev.filter((a) => a.productId !== productId));
  };

  // ✅ Filter alerts
  const filteredAlerts =
    filter === "all"
      ? alerts
      : alerts.filter(
          (a) => a.type.toLowerCase().replace(" ", "_") === filter
        );

  // ✅ Color by alert type
  const getAlertColor = (type) => {
    switch (type?.toLowerCase()) {
      case "out of stock":
        return "#e74c3c";
      case "low stock":
        return "#f39c12";
      case "expired":
        return "#c0392b";
      case "expiring soon":
        return "#f1c40f";
      default:
        return "#95a5a6";
    }
  };

  // ✅ Format time into human-readable text
  const formatTimestamp = (dateString) => {
    if (!dateString) return "Unknown time";
    const date = new Date(dateString);
    const now = new Date();
    const diff = (now - date) / 1000; // seconds difference

    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hrs ago`;
    return date.toLocaleString(); // fallback to full date/time
  };

  return (
    <div style={{ padding: "24px", fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <h2
        style={{
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          fontWeight: "700",
          color: "#1e293b",
        }}
      >
        <FaExclamationTriangle
          style={{ marginRight: "10px", color: "#e74c3c" }}
        />
        Product Alerts
      </h2>

      {/* Filter + Refresh controls */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "20px",
          gap: "10px",
        }}
      >
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #cbd5e1",
            background: "#fff",
            fontWeight: "500",
            cursor: "pointer",
          }}
        >
          <option value="all">All</option>
          <option value="low_stock">Low Stock</option>
          <option value="out_of_stock">Out of Stock</option>
          <option value="expiring_soon">Expiring Soon</option>
          <option value="expired">Expired</option>
        </select>

        <button
          onClick={fetchAlerts}
          disabled={loading}
          style={{
            padding: "10px 16px",
            backgroundColor: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontWeight: "600",
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
          }}
        >
          <FaSyncAlt />
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Alert Cards */}
      {filteredAlerts.length === 0 ? (
        <p style={{ color: "#94a3b8" }}>No alerts found.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filteredAlerts.map((alert, idx) => (
            <div
              key={idx}
              style={{
                background: "#fff",
                border: `2px solid ${getAlertColor(alert.type)}`,
                borderLeftWidth: "10px",
                padding: "14px 16px",
                borderRadius: "10px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ flex: 1 }}>
                <h5
                  style={{
                    margin: 0,
                    fontWeight: "700",
                    color: getAlertColor(alert.type),
                    textTransform: "capitalize",
                  }}
                >
                  {alert.type}
                </h5>

                <p style={{ margin: "6px 0", color: "#1e293b" }}>
                  {alert.message}
                </p>

                {/* 🕒 Timestamp */}
                {alert.createdAt && (
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#64748b",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <FaClock /> {formatTimestamp(alert.createdAt)}
                  </div>
                )}
              </div>

              {/* Delete Icon */}
              <FaTrash
                title="Delete Alert"
                style={{
                  cursor: "pointer",
                  color: "#c0392b",
                  fontSize: "18px",
                  marginLeft: "12px",
                }}
                onClick={() => deleteAlert(alert.productId)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AlertsPage;
