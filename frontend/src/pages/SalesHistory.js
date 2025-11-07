import React, { useEffect, useState } from "react";

export default function SalesHistory() {
  const [sales, setSales] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [rangeFilter, setRangeFilter] = useState("all");
  const [selectedSale, setSelectedSale] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const receiptsPerPage = 20;

  useEffect(() => {
    loadSales();
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const res = await fetch("http://localhost:5000/api/sales/stats");
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch stats", err);
    }
  }

  async function loadSales() {
    try {
      const res = await fetch("http://localhost:5000/api/sales");
      const data = await res.json();

      // ✅ Sort by invoice number ascending
      const sorted = data.sort((a, b) => {
        const numA = Number(a.invoiceNumber) || 0;
        const numB = Number(b.invoiceNumber) || 0;
        if (numA !== numB) return numB - numA;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      setSales(sorted);
      setFiltered(sorted);
    } catch (err) {
      console.error("Failed to fetch sales", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let temp = [...sales];

    if (search.trim()) {
      const q = search.toLowerCase();
      temp = temp.filter(
        (s) =>
          s.invoiceNumber?.toString().includes(q) ||
          s._id.toLowerCase().includes(q)
      );
    }

    if (filterDate) {
      temp = temp.filter((s) => {
        const saleDate = new Date(s.createdAt).toISOString().slice(0, 10);
        return saleDate === filterDate;
      });
    }

    if (rangeFilter !== "all") {
      const now = new Date();
      let start = null;
      if (rangeFilter === "today")
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      else if (rangeFilter === "week") {
        start = new Date(now);
        start.setDate(now.getDate() - now.getDay());
      } else if (rangeFilter === "month")
        start = new Date(now.getFullYear(), now.getMonth(), 1);
      temp = temp.filter((s) => new Date(s.createdAt) >= start);
    }

    setFiltered(temp);
    setCurrentPage(1);
  }, [search, filterDate, rangeFilter, sales]);

  // Pagination logic
  const indexOfLast = currentPage * receiptsPerPage;
  const indexOfFirst = indexOfLast - receiptsPerPage;
  const currentReceipts = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / receiptsPerPage);

  // --- CRUD functions ---
  const handleDeleteSale = async (id) => {
    if (!window.confirm("Delete this entire sale?")) return;
    await fetch(`http://localhost:5000/api/sales/${id}`, { method: "DELETE" });
    setSales((prev) => prev.filter((s) => s._id !== id));
    alert("Sale deleted");
  };

  const openEdit = async (id) => {
    const res = await fetch(`http://localhost:5000/api/sales/${id}`);
    const data = await res.json();
    setSelectedSale(data);
    setShowModal(true);
  };

  const removeItemFromSale = (index) => {
    const updated = { ...selectedSale };
    updated.lines.splice(index, 1);
    recalcTotals(updated);
    setSelectedSale(updated);
  };

  const changeQty = (index, qty) => {
    const updated = { ...selectedSale };
    updated.lines[index].qty = qty;
    recalcTotals(updated);
    setSelectedSale(updated);
  };

  const recalcTotals = (sale) => {
    const subtotal = sale.lines.reduce((s, i) => s + i.price * i.qty, 0);
    const tax = +(subtotal * 0.11).toFixed(2);
    const total = +(subtotal + tax).toFixed(2);
    sale.subtotal = subtotal;
    sale.tax = tax;
    sale.total = total;
  };

  const saveChanges = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/sales/${selectedSale._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedSale),
      });
      const data = await res.json();
      setSales((prev) => prev.map((s) => (s._id === data._id ? data : s)));
      setShowModal(false);
      alert("✅ Sale updated");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to update sale");
    }
  };

  if (loading) return <p>Loading sales history...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Sales History</h2>

      {/* Stats */}
      {stats && (
        <div
          style={{
            display: "flex",
            gap: "15px",
            flexWrap: "wrap",
            marginBottom: "20px",
          }}
        >
          <StatCard title="Receipts Today" value={stats.today.receipts} />
          <StatCard title="Total Sales Today" value={`$${stats.today.total.toFixed(2)}`} />
          <StatCard title="Receipts This Week" value={stats.week.receipts} />
          <StatCard title="Receipts This Month" value={stats.month.receipts} />
          <StatCard title="Average Sale" value={`$${stats.averageSale.toFixed(2)}`} />
        </div>
      )}

      {/* Filters */}
      <div style={{ marginBottom: "15px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Search by invoice number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "8px", width: "200px", border: "1px solid #ccc", borderRadius: "5px" }}
        />
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "5px" }}
        />
        {filterDate && (
          <button onClick={() => setFilterDate("")}>Clear</button>
        )}
        <div style={{ display: "flex", gap: "5px" }}>
          <button onClick={() => setRangeFilter("all")}>All</button>
          <button onClick={() => setRangeFilter("today")}>Today</button>
          <button onClick={() => setRangeFilter("week")}>This Week</button>
          <button onClick={() => setRangeFilter("month")}>This Month</button>
        </div>
      </div>

      {/* Sales Table */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "#fff",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        }}
      >
        <thead style={{ background: "#2c3e50", color: "#fff" }}>
          <tr>
            <th style={{ padding: "10px" }}>Invoice #</th>
            <th style={{ padding: "10px" }}>Cashier</th>
            <th style={{ padding: "10px" }}>Date</th>
            <th style={{ padding: "10px", textAlign: "right" }}>Total</th>
            <th style={{ padding: "10px", textAlign: "center" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentReceipts.map((sale) => (
            <tr key={sale._id}>
              <td style={{ padding: "8px" }}>#{sale.invoiceNumber}</td>
              <td style={{ padding: "8px" }}>{sale.cashier}</td>
              <td style={{ padding: "8px" }}>{new Date(sale.createdAt).toLocaleString()}</td>
              <td style={{ padding: "8px", textAlign: "right" }}>${sale.total.toFixed(2)}</td>
              <td style={{ padding: "8px", textAlign: "center" }}>
                <button onClick={() => openEdit(sale._id)} style={{ marginRight: "8px" }}>✏️ View/Edit</button>
                <button onClick={() => handleDeleteSale(sale._id)} style={{ color: "red" }}>🗑️ Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ marginTop: "15px", display: "flex", gap: "5px" }}>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              style={{
                padding: "5px 10px",
                background: i + 1 === currentPage ? "#2c3e50" : "#fff",
                color: i + 1 === currentPage ? "#fff" : "#000",
                border: "1px solid #ccc",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Edit/View Modal */}
      {showModal && selectedSale && (
        <div style={overlay}>
          <div style={modal}>
            <h3>Invoice #{selectedSale.invoiceNumber}</h3>
            <p><b>Cashier:</b> {selectedSale.cashier}</p>
            <p><b>Date:</b> {new Date(selectedSale.createdAt).toLocaleString()}</p>

            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "10px" }}>
              <thead>
                <tr>
                  <th style={th}>Item</th>
                  <th style={th}>Price</th>
                  <th style={th}>Qty</th>
                  <th style={th}>Total</th>
                  <th style={th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {selectedSale.lines.map((item, i) => (
                  <tr key={i}>
                    <td style={td}>{item.name}</td>
                    <td style={td}>${item.price.toFixed(2)}</td>
                    <td style={td}>
                      <input
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={(e) => changeQty(i, parseInt(e.target.value) || 1)}
                        style={{ width: "50px", padding: "2px" }}
                      />
                    </td>
                    <td style={td}>${(item.price * item.qty).toFixed(2)}</td>
                    <td style={td}>
                      <button style={{ color: "red", cursor: "pointer" }} onClick={() => removeItemFromSale(i)}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ marginTop: "15px", padding: "10px", background: "#f5f5f5", borderRadius: "5px" }}>
              <p><b>Subtotal:</b> ${selectedSale.subtotal.toFixed(2)}</p>
              <p><b>Tax (11%):</b> ${selectedSale.tax.toFixed(2)}</p>
              <p style={{ fontSize: "18px" }}><b>Total:</b> ${selectedSale.total.toFixed(2)}</p>
            </div>

            <div style={{ marginTop: "15px", display: "flex", gap: "10px" }}>
              <button onClick={saveChanges} style={{ padding: "8px 16px", background: "#2c3e50", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}>💾 Save Changes</button>
              <button onClick={() => setShowModal(false)} style={{ padding: "8px 16px", background: "#ccc", border: "none", borderRadius: "5px", cursor: "pointer" }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Stats Card ---
function StatCard({ title, value }) {
  return (
    <div style={{ background: "#fff", borderRadius: "8px", padding: "15px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", minWidth: "180px", textAlign: "center" }}>
      <h4 style={{ margin: "0 0 8px", color: "#2c3e50" }}>{title}</h4>
      <p style={{ fontSize: "1.2em", fontWeight: "bold" }}>{value}</p>
    </div>
  );
}

// --- Modal Styles ---
const overlay = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 };
const modal = { background: "#fff", padding: "20px", borderRadius: "10px", width: "90%", maxWidth: "600px", maxHeight: "80vh", overflowY: "auto", boxShadow: "0 4px 20px rgba(0,0,0,0.3)" };
const th = { borderBottom: "2px solid #2c3e50", textAlign: "left", padding: "8px", background: "#f5f5f5" };
const td = { borderBottom: "1px solid #eee", padding: "8px" };
