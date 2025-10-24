import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaExclamationTriangle, FaSyncAlt, FaTrash } from "react-icons/fa";

function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/alerts");
      setAlerts(res.data.alerts || []);
    } catch (err) {
      console.error("Failed to fetch alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const deleteAlert = (productId) => {
    setAlerts(alerts.filter((alert) => alert.productId !== productId));
  };

  const filteredAlerts =
    filter === "all"
      ? alerts
      : alerts.filter((a) => a.type.toLowerCase().replace(" ", "_") === filter);

  const getAlertColor = (type) => {
    switch (type.toLowerCase()) {
      case "out of stock":
        return "#e74c3c";
      case "low stock":
        return "#f39c12";
      case "expiring soon":
        return "#f1c40f";
      case "expired":
        return "#c0392b";
      default:
        return "#95a5a6";
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ marginBottom: "15px", display: "flex", alignItems: "center" }}>
        <FaExclamationTriangle style={{ marginRight: "10px" }} />
        Product Alerts
      </h2>

      <div style={{ display: "flex", alignItems: "center", marginBottom: "15px" }}>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            padding: "8px",
            marginRight: "10px",
            borderRadius: "5px",
            border: "1px solid #ccc",
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
            padding: "8px 14px",
            backgroundColor: "#2c3e50",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <FaSyncAlt /> {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {filteredAlerts.length === 0 ? (
        <p style={{ color: "#888" }}>No alerts found.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {filteredAlerts.map((alert, idx) => (
            <div
              key={alert.productId || idx}
              style={{
                background: "white",
                border: `2px solid ${getAlertColor(alert.type)}`,
                borderLeftWidth: "8px",
                padding: "12px",
                borderRadius: "8px",
                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <p
                  style={{
                    margin: 0,
                    fontWeight: "600",
                    color: getAlertColor(alert.type),
                  }}
                >
                  {alert.type}
                </p>
                <p style={{ margin: "5px 0" }}>{alert.message}</p>
              </div>

              <FaTrash
                style={{ cursor: "pointer", color: "#c0392b" }}
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
