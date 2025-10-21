import React, { useEffect, useState } from "react";

export default function SalesHistory() {
  const [sales, setSales] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [filterDate, setFilterDate] = useState(""); 
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // --- Pagination ---
  const [currentPage, setCurrentPage] = useState(1);
  const receiptsPerPage = 20;

  useEffect(() => {
    loadSales();
  }, []);

  async function loadSales() {
    try {
      const res = await fetch("http://localhost:5000/api/sales");
      const data = await res.json();
      const sorted = data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
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
      temp = temp.filter((s) => 
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
    setFiltered(temp);
    setCurrentPage(1);
  }, [search, filterDate, sales]);

  // --- Pagination logic ---
  const indexOfLast = currentPage * receiptsPerPage;
  const indexOfFirst = indexOfLast - receiptsPerPage;
  const currentReceipts = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / receiptsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
      const res = await fetch(
        `http://localhost:5000/api/sales/${selectedSale._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(selectedSale)
        }
      );
      const data = await res.json();
      setSales((prev) =>
        prev.map((s) => (s._id === data._id ? data : s))
      );
      setShowModal(false);
      alert("✅ Sale updated");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to update sale");
    }
  };

  if (loading) return <p style={{ padding: "20px" }}>Loading sales history...</p>;

  return (
    <div style={{ padding: "20px", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <h2 style={{ marginBottom: "20px" }}>Sales History</h2>
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
          <button onClick={() => setFilterDate("")} style={{ padding: "8px 12px", cursor: "pointer" }}>
            Clear Date
          </button>
        )}
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", boxShadow: "0 0 10px rgba(0,0,0,0.1)" }}>
          <thead style={{ background: "#2c3e50", color: "#fff" }}>
            <tr>
              <th style={{ padding: "10px", textAlign: "left" }}>Invoice #</th>
              <th style={{ padding: "10px", textAlign: "left" }}>Cashier</th>
              <th style={{ padding: "10px", textAlign: "left" }}>Date</th>
              <th style={{ padding: "10px", textAlign: "right" }}>Subtotal</th>
              <th style={{ padding: "10px", textAlign: "right" }}>Tax</th>
              <th style={{ padding: "10px", textAlign: "right" }}>Total</th>
              <th style={{ padding: "10px", textAlign: "center" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentReceipts.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "15px", color: "#666" }}>No sales found</td>
              </tr>
            ) : (
              currentReceipts.map((sale) => (
                <tr key={sale._id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "8px", fontWeight: "bold", color: "#2c3e50" }}>
                    #{sale.invoiceNumber || "N/A"}
                  </td>
                  <td style={{ padding: "8px" }}>{sale.cashier || "Unknown"}</td>
                  <td style={{ padding: "8px" }}>{new Date(sale.createdAt).toLocaleString()}</td>
                  <td style={{ padding: "8px", textAlign: "right" }}>${sale.subtotal.toFixed(2)}</td>
                  <td style={{ padding: "8px", textAlign: "right" }}>${sale.tax.toFixed(2)}</td>
                  <td style={{ padding: "8px", fontWeight: "bold", textAlign: "right" }}>${sale.total.toFixed(2)}</td>
                  <td style={{ padding: "8px", textAlign: "center" }}>
                    <button 
                      onClick={() => openEdit(sale._id)} 
                      style={{ marginRight: "8px", padding: "4px 8px", cursor: "pointer" }}
                    >
                      ✏️ View/Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteSale(sale._id)} 
                      style={{ color: "red", padding: "4px 8px", cursor: "pointer" }}
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div style={{ marginTop: "15px", display: "flex", gap: "5px", flexWrap: "wrap" }}>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => paginate(i + 1)}
              style={{
                padding: "5px 10px",
                background: i + 1 === currentPage ? "#2c3e50" : "#fff",
                color: i + 1 === currentPage ? "#fff" : "#000",
                border: "1px solid #ccc",
                borderRadius: "5px",
                cursor: "pointer"
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {showModal && selectedSale && (
        <div style={overlay}>
          <div style={modal}>
            <h3 style={{ marginTop: 0 }}>Invoice #{selectedSale.invoiceNumber || "N/A"}</h3>
            <p><b>Cashier:</b> {selectedSale.cashier || "Unknown"}</p>
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
                      <button 
                        style={{ color: "red", cursor: "pointer", padding: "4px 8px" }} 
                        onClick={() => removeItemFromSale(i)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ marginTop: "15px", padding: "10px", background: "#f5f5f5", borderRadius: "5px" }}>
              <p style={{ margin: "5px 0" }}><b>Subtotal:</b> ${selectedSale.subtotal.toFixed(2)}</p>
              <p style={{ margin: "5px 0" }}><b>Tax (11%):</b> ${selectedSale.tax.toFixed(2)}</p>
              <p style={{ margin: "5px 0", fontSize: "18px" }}><b>Total:</b> ${selectedSale.total.toFixed(2)}</p>
            </div>

            <div style={{ marginTop: "15px", display: "flex", gap: "10px" }}>
              <button 
                onClick={saveChanges} 
                style={{ 
                  padding: "8px 16px", 
                  background: "#2c3e50", 
                  color: "#fff", 
                  border: "none", 
                  borderRadius: "5px",
                  cursor: "pointer"
                }}
              >
                💾 Save Changes
              </button>
              <button 
                onClick={() => setShowModal(false)}
                style={{ 
                  padding: "8px 16px", 
                  background: "#ccc", 
                  border: "none", 
                  borderRadius: "5px",
                  cursor: "pointer"
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const overlay = { 
  position: "fixed", 
  inset: 0, 
  background: "rgba(0,0,0,0.5)", 
  display: "flex", 
  justifyContent: "center", 
  alignItems: "center",
  zIndex: 1000
};

const modal = { 
  background: "#fff", 
  padding: "20px", 
  borderRadius: "10px", 
  width: "90%",
  maxWidth: "600px", 
  maxHeight: "80vh", 
  overflowY: "auto",
  boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
};

const th = { 
  borderBottom: "2px solid #2c3e50", 
  textAlign: "left", 
  padding: "8px",
  background: "#f5f5f5"
};

const td = { 
  borderBottom: "1px solid #eee", 
  padding: "8px" 
};