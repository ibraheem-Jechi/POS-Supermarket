// pages/DailySummary.js
import React, { useState } from "react";
import axios from "axios";
import { FaPrint, FaFileInvoice, FaChartBar } from "react-icons/fa";
import "./DailySummary.css";

function DailySummary({ user }) {
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [summary, setSummary] = useState(null);
 const [showAll, setShowAll] = useState(user.role === "admin");

  const [loading, setLoading] = useState(false);

  const loadSummary = async () => {
    try {
      setLoading(true);

      // ✅ Choose correct API URL depending on checkbox
      const url = showAll
        ? `http://localhost:5000/api/reports/daily-summary?date=${date}`
        : `http://localhost:5000/api/reports/daily-summary?date=${date}&cashier=${encodeURIComponent(user.username)}`;

      const res = await axios.get(url);
      setSummary(res.data);
      setLoading(false);

      // Optional auto-print after load
      // setTimeout(() => window.print(), 600);
    } catch (err) {
      setLoading(false);
      alert("❌ Failed to load summary");
    }
  };

  const handlePrint = () => window.print();

  return (
    <div className="summary-container">
      <h2 className="title">📋 Daily Summary</h2>

      <div className="controls">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        {/* ✅ New toggle to show all cashiers */}
        <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <input
            type="checkbox"
            checked={showAll}
            onChange={(e) => setShowAll(e.target.checked)}
          />
          Show all cashiers
        </label>

        <button onClick={loadSummary}>Run</button>
        {summary && (
          <button onClick={handlePrint}>
            <FaPrint /> Print
          </button>
        )}
      </div>

      {loading && <p style={{ textAlign: "center" }}>Loading summary...</p>}

      {summary && (
        <div className="summary-paper">
          {/* 🏪 Header */}
          <div className="store-name">{summary.storeName}</div>
          <p>
            <b>Date:</b> {summary.date}
            <br />
            <b>Report:</b>{" "}
            {showAll
              ? "All Cashiers (Full Day)"
              : `Cashier: ${user.username} (${user.role})`}
          </p>

          {/* 🕓 Shift info */}
          {summary.shiftInfo && (
            <div className="shift-header">
              <p>
                <b>Start:</b>{" "}
                {summary.shiftInfo.startTime
                  ? new Date(summary.shiftInfo.startTime).toLocaleTimeString()
                  : "-"}{" "}
                | <b>End:</b>{" "}
                {summary.shiftInfo.endTime
                  ? new Date(summary.shiftInfo.endTime).toLocaleTimeString()
                  : "-"}
              </p>
              <p>
                <b>Duration:</b> {summary.shiftInfo.duration}
              </p>
            </div>
          )}

          {/* 🧾 Invoice Summary */}
          <h4 className="section-title">🧾 Invoices</h4>
          <table className="invoice-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Time</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {summary.invoices.map((inv, idx) => (
                <tr key={idx}>
                  <td>{inv.invoiceNumber}</td>
                  <td>{new Date(inv.createdAt).toLocaleTimeString()}</td>
                  <td>${inv.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* 🧺 Product Summary */}
          {summary.products && summary.products.length > 0 && (
            <>
              <h4 className="section-title">🧺 Product Summary</h4>
              <table className="product-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.products.map((p) => (
                    <tr key={p._id}>
                      <td>{p._id}</td>
                      <td>{p.totalQty}</td>
                      <td>${p.totalSales.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {/* 💰 Totals */}
          <div className="totals">
            <p>
              <b>Total Invoices:</b> {summary.totals.invoices}
            </p>
            <p>
              <b>Subtotal:</b> ${summary.totals.subtotal.toFixed(2)}
            </p>
            <p>
              <b>Tax:</b> ${summary.totals.tax.toFixed(2)}
            </p>
            <p>
              <b>Grand Total:</b> ${summary.totals.total.toFixed(2)}
            </p>
          </div>

{/* 👨‍💼 Cashier Summary */}
{summary.cashiers && summary.cashiers.length > 0 && (
  <>
    <h4 className="section-title">👨‍💼 Cashiers Summary</h4>
    <table className="cashier-table">
      <thead>
        <tr>
          <th>Cashier</th>
          <th>Start</th>
          <th>End</th>
          <th>Inv</th>
          <th>Dur</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        {summary.cashiers.map((c, idx) => (
          <tr key={idx}>
            <td>{c.cashier}</td>
            <td>{new Date(c.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
            <td>{new Date(c.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
            <td>{c.invoiceCount}</td>
            <td>{c.duration}</td>
            <td>${c.total.toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </>
)}



          <div className="footer-note">
            Printed by {user.username} —{" "}
            {new Date().toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
}

export default DailySummary;
