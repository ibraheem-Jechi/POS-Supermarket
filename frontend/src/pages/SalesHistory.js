import React, { useEffect, useState } from "react";
import axios from "axios";

export default function SalesHistory() {
  const [sales, setSales] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [selectedSale, setSelectedSale] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadSales();
  }, []);

  async function loadSales() {
    try {
      const res = await axios.get("http://localhost:5000/api/sales");
      setSales(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error("Failed to fetch sales", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!search.trim()) return setFiltered(sales);
    const q = search.toLowerCase();
    setFiltered(sales.filter((s) => s._id.toLowerCase().includes(q)));
  }, [search, sales]);

  const handleDeleteSale = async (id) => {
    if (!window.confirm("Delete this entire sale?")) return;
    await axios.delete(`http://localhost:5000/api/sales/${id}`);
    setSales((prev) => prev.filter((s) => s._id !== id));
    alert("Sale deleted");
  };

  const openEdit = async (id) => {
    const res = await axios.get(`http://localhost:5000/api/sales/${id}`);
    setSelectedSale(res.data);
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
      const res = await axios.put(
        `http://localhost:5000/api/sales/${selectedSale._id}`,
        selectedSale
      );
      setSales((prev) =>
        prev.map((s) => (s._id === res.data._id ? res.data : s))
      );
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

      <input
        type="text"
        placeholder="Search by receipt number..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          padding: "8px",
          width: "300px",
          marginBottom: "15px",
          border: "1px solid #ccc",
          borderRadius: "5px",
        }}
      />

      <div style={{ overflowX: "auto" }}>
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
              <th style={{ padding: "10px" }}>Receipt #</th>
              <th style={{ padding: "10px" }}>Date</th>
              <th style={{ padding: "10px" }}>Subtotal</th>
              <th style={{ padding: "10px" }}>Tax</th>
              <th style={{ padding: "10px" }}>Total</th>
              <th style={{ padding: "10px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "15px" }}>
                  No sales found
                </td>
              </tr>
            ) : (
              filtered.map((sale) => (
                <tr key={sale._id}>
                  <td style={{ padding: "8px" }}>{sale._id}</td>
                  <td style={{ padding: "8px" }}>
                    {new Date(sale.createdAt).toLocaleString()}
                  </td>
                  <td style={{ padding: "8px" }}>${sale.subtotal.toFixed(2)}</td>
                  <td style={{ padding: "8px" }}>${sale.tax.toFixed(2)}</td>
                  <td style={{ padding: "8px", fontWeight: "bold" }}>
                    ${sale.total.toFixed(2)}
                  </td>
                  <td style={{ padding: "8px" }}>
                    <button
                      onClick={() => openEdit(sale._id)}
                      style={{ marginRight: "8px" }}
                    >
                      ✏️ View/Edit
                    </button>
                    <button
                      onClick={() => handleDeleteSale(sale._id)}
                      style={{ color: "red" }}
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

      {showModal && selectedSale && (
        <div style={overlay}>
          <div style={modal}>
            <h3>Receipt #{selectedSale._id}</h3>
            <p>
              <b>Date:</b>{" "}
              {new Date(selectedSale.createdAt).toLocaleString()}
            </p>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginBottom: "10px",
              }}
            >
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
                        onChange={(e) =>
                          changeQty(i, parseInt(e.target.value) || 1)
                        }
                        style={{ width: "50px" }}
                      />
                    </td>
                    <td style={td}>${(item.price * item.qty).toFixed(2)}</td>
                    <td style={td}>
                      <button
                        style={{ color: "red" }}
                        onClick={() => removeItemFromSale(i)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div>
              <p>
                <b>Subtotal:</b> ${selectedSale.subtotal.toFixed(2)}
              </p>
              <p>
                <b>Tax (11%):</b> ${selectedSale.tax.toFixed(2)}
              </p>
              <p>
                <b>Total:</b> ${selectedSale.total.toFixed(2)}
              </p>
            </div>

            <div style={{ marginTop: "10px" }}>
              <button onClick={saveChanges} style={{ marginRight: "10px" }}>
                💾 Save
              </button>
              <button onClick={() => setShowModal(false)}>Close</button>
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
};
const modal = {
  background: "#fff",
  padding: "20px",
  borderRadius: "10px",
  width: "600px",
  maxHeight: "80vh",
  overflowY: "auto",
};
const th = {
  borderBottom: "1px solid #ccc",
  textAlign: "left",
  padding: "5px",
};
const td = {
  borderBottom: "1px solid #eee",
  padding: "5px",
};
