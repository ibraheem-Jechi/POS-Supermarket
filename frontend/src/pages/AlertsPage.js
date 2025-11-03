import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaExclamationTriangle, FaSyncAlt, FaTrash } from "react-icons/fa";

function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

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

  const deleteAlert = (productId) => {
    setAlerts(alerts.filter((a) => a.productId !== productId));
  };

  const getAlertColor = (type) => {
    switch (type?.toLowerCase()) {
      case "out of stock":
        return "#e74c3c";
      case "low stock":
        return "#f39c12";
      case "expired":
        return "#c0392b";
      default:
        return "#95a5a6";
    }
  };

  return (
    <div style={{ padding: "20px", minHeight: "100vh", background: "#f9f9f9" }}>
      <h2 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <FaExclamationTriangle /> Product Alerts
      </h2>

      <div style={{ marginBottom: "10px" }}>
        <button
          onClick={fetchAlerts}
          disabled={loading}
          style={{
            padding: "8px 16px",
            backgroundColor: "#2c3e50",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <FaSyncAlt /> {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {alerts.length === 0 ? (
        <p style={{ color: "#888", marginTop: "20px" }}>
          No alerts found.
        </p>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            marginTop: "15px",
          }}
        >
          {alerts.map((alert, i) => (
            <div
              key={i}
              style={{
                background: "#fff",
                borderLeft: `8px solid ${getAlertColor(alert.type)}`,
                padding: "12px",
                borderRadius: "8px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h5 style={{ color: getAlertColor(alert.type), margin: 0 }}>
                  {alert.type}
                </h5>
                <p style={{ margin: "4px 0", color: "#333" }}>
                  {alert.message}
                </p>
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
