import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaUserTie, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaBuilding, FaPlusCircle, FaEdit, FaTrash } from "react-icons/fa";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  });

  const fetchSuppliers = async () => {
    const res = await axios.get("http://localhost:5000/api/suppliers");
    setSuppliers(res.data);
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return alert("Name is required");

    if (editing) {
      await axios.put(`http://localhost:5000/api/suppliers/${editing}`, form);
      alert("✅ Supplier updated");
    } else {
      await axios.post("http://localhost:5000/api/suppliers", form);
      alert("✅ Supplier added");
    }

    setForm({
      name: "",
      contactPerson: "",
      phone: "",
      email: "",
      address: "",
      notes: "",
    });
    setEditing(null);
    fetchSuppliers();
  };

  const startEdit = (s) => {
    setEditing(s._id);
    setForm({
      name: s.name || "",
      contactPerson: s.contactPerson || "",
      phone: s.phone || "",
      email: s.email || "",
      address: s.address || "",
      notes: s.notes || "",
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this supplier?")) return;
    await axios.delete(`http://localhost:5000/api/suppliers/${id}`);
    fetchSuppliers();
  };

  const filtered = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.phone || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={pageStyle}>
      <h2 style={titleStyle}>
        <FaBuilding style={{ marginRight: "10px", color: "#3a7bd5" }} />
        Suppliers Management
      </h2>

      {/* Search */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="🔍 Search suppliers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={searchStyle}
        />
      </div>

      {/* Supplier Form */}
      <form onSubmit={handleSubmit} style={formStyle}>
        <h3 style={{ marginBottom: "10px", color: "#2563eb" }}>
          <FaPlusCircle style={{ marginRight: "8px" }} />
          {editing ? "Update Supplier" : "Add New Supplier"}
        </h3>

        <div style={gridStyle}>
          <label style={labelStyle}>
            <FaBuilding /> Name *
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              style={inputStyle}
            />
          </label>

          <label style={labelStyle}>
            <FaUserTie /> Contact Person
            <input
              value={form.contactPerson}
              onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
              style={inputStyle}
            />
          </label>

          <label style={labelStyle}>
            <FaPhoneAlt /> Phone
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              style={inputStyle}
            />
          </label>

          <label style={labelStyle}>
            <FaEnvelope /> Email
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              style={inputStyle}
            />
          </label>

          <label style={{ ...labelStyle, gridColumn: "1 / -1" }}>
            <FaMapMarkerAlt /> Address
            <input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              style={inputStyle}
            />
          </label>

          <label style={{ ...labelStyle, gridColumn: "1 / -1" }}>
            📝 Notes
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2}
              style={{ ...inputStyle, resize: "none" }}
            />
          </label>
        </div>

        <div style={{ textAlign: "right", marginTop: "10px" }}>
          <button type="submit" style={btnPrimary}>
            {editing ? "Update" : "Add"} Supplier
          </button>
          {editing && (
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setForm({
                  name: "",
                  contactPerson: "",
                  phone: "",
                  email: "",
                  address: "",
                  notes: "",
                });
              }}
              style={btnCancel}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Supplier Cards */}
      <div style={cardsContainer}>
        {filtered.length > 0 ? (
          filtered.map((s) => (
            <div key={s._id} style={card}>
              <h4 style={{ color: "#2563eb", marginBottom: "6px" }}>
                <FaBuilding style={{ marginRight: "5px" }} />
                {s.name}
              </h4>
              <p>
                <FaUserTie /> <b>Contact:</b> {s.contactPerson || "—"}
              </p>
              <p>
                <FaPhoneAlt /> <b>Phone:</b> {s.phone || "—"}
              </p>
              <p>
                <FaEnvelope /> <b>Email:</b> {s.email || "—"}
              </p>
              <p>
                <FaMapMarkerAlt /> <b>Address:</b> {s.address || "—"}
              </p>
              {s.notes && <p>📝 {s.notes}</p>}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "10px" }}>
                <button onClick={() => startEdit(s)} style={btnEdit}>
                  <FaEdit /> Edit
                </button>
                <button onClick={() => handleDelete(s._id)} style={btnDelete}>
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p style={{ color: "#777", marginTop: "20px" }}>No suppliers found.</p>
        )}
      </div>
    </div>
  );
}

// === STYLES ===
const pageStyle = {
  padding: "25px",
  fontFamily: "'Segoe UI', sans-serif",
  backgroundColor: "#f4f6f8",
  minHeight: "100vh",
};

const titleStyle = {
  display: "flex",
  alignItems: "center",
  fontSize: "24px",
  fontWeight: "700",
  color: "#374151",
  marginBottom: "20px",
};

const searchStyle = {
  padding: "10px",
  width: "300px",
  border: "1px solid #ccc",
  borderRadius: "6px",
};

const formStyle = {
  background: "#fff",
  borderRadius: "12px",
  padding: "20px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  marginBottom: "25px",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: "15px",
};

const labelStyle = {
  display: "flex",
  flexDirection: "column",
  fontWeight: "600",
  color: "#374151",
  fontSize: "14px",
  gap: "5px",
};

const inputStyle = {
  padding: "8px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  outline: "none",
};

const btnPrimary = {
  background: "linear-gradient(90deg, #3a7bd5 0%, #00d2ff 100%)",
  border: "none",
  padding: "8px 16px",
  color: "#fff",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "600",
};

const btnCancel = {
  marginLeft: "10px",
  background: "#e5e7eb",
  border: "none",
  padding: "8px 16px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "600",
};

const cardsContainer = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "20px",
};

const card = {
  background: "#fff",
  borderRadius: "12px",
  padding: "15px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
  borderLeft: "5px solid #3a7bd5",
};

const btnEdit = {
  background: "#2563eb",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  padding: "6px 12px",
  cursor: "pointer",
  fontSize: "13px",
};

const btnDelete = {
  background: "#ef4444",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  padding: "6px 12px",
  cursor: "pointer",
  fontSize: "13px",
};
