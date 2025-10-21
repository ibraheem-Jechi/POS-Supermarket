import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Users,
  DollarSign,
  Briefcase,
  UserCheck,
  UserCog,
} from "lucide-react";
import "../App.css";

function AdminDashboard({ user }) {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSalary: 0,
    byRole: {},
  });
  const [form, setForm] = useState({
    username: "",
    password: "",
    role: "cashier",
    salary: "",
  });
  const [editingUser, setEditingUser] = useState(null);
  const [status, setStatus] = useState("");

  // Fetch users + statistics
  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/auth/all");
      setUsers(res.data.users);
      setStats({
        totalUsers: res.data.totalUsers,
        totalSalary: res.data.totalSalary,
        byRole: res.data.byRole,
      });
    } catch (err) {
      console.error("Error fetching users", err);
      setStatus("❌ Failed to fetch users");
    }
  };

  useEffect(() => {
    if (user.role === "admin") fetchUsers();
  }, [user]);

  // Create or update user
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");
    try {
      const payload = {
        username: form.username,
        password: form.password,
        role: form.role,
        salary: parseFloat(form.salary) || 0,
      };

      if (editingUser) {
        await axios.put(
          `http://localhost:5000/api/auth/${editingUser._id}`,
          payload
        );
        setStatus("✅ User updated successfully");
      } else {
        await axios.post("http://localhost:5000/api/auth/create", payload);
        setStatus("✅ User created successfully");
      }

      setForm({ username: "", password: "", role: "cashier", salary: "" });
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      setStatus("❌ " + (err.response?.data?.error || "Error saving user"));
    }
  };

  // Delete user
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/auth/${id}`);
      setStatus("✅ User deleted successfully");
      fetchUsers();
    } catch (err) {
      setStatus("❌ " + (err.response?.data?.error || "Error deleting user"));
    }
  };

  // Edit user
  const handleEdit = (u) => {
    setEditingUser(u);
    setForm({
      username: u.username,
      password: "",
      role: u.role,
      salary: u.salary || "",
    });
    setStatus("");
  };

  if (user.role !== "admin") {
    return (
      <p style={{ color: "red", textAlign: "center", marginTop: "50px" }}>
        Access denied — only admins can view this page.
      </p>
    );
  }

  return (
    <div
      style={{
        padding: "30px",
        background: "#f9fafb",
        minHeight: "100vh",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "28px", marginBottom: "10px" }}>
        🏪 Admin Dashboard
      </h1>
      <p>
        Welcome, <b>{user.username}</b> (Role: {user.role})
      </p>

      {/* ======= STATS CARDS ======= */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
          gap: "20px",
          marginTop: "30px",
          marginBottom: "40px",
        }}
      >
        <div className="card">
          <Users size={24} />
          <h3>Total Users</h3>
          <p>{stats.totalUsers}</p>
        </div>

        <div className="card">
          <DollarSign size={24} />
          <h3>Total Salary</h3>
          <p>${stats.totalSalary.toFixed(2)}</p>
        </div>

        <div className="card">
          <UserCheck size={24} />
          <h3>Cashiers</h3>
          <p>{stats.byRole.cashier || 0}</p>
        </div>

        <div className="card">
          <Briefcase size={24} />
          <h3>Accountants</h3>
          <p>{stats.byRole.accountant || 0}</p>
        </div>

        <div className="card">
          <UserCog size={24} />
          <h3>Finance</h3>
          <p>{stats.byRole.finance || 0}</p>
        </div>
      </div>

      {/* ======= USER FORM ======= */}
      <h2 style={{ marginBottom: "10px" }}>
        {editingUser ? "Edit User" : "Create New User"}
      </h2>
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        <input
          type="text"
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          required
          className="input"
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required={!editingUser}
          className="input"
        />
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          className="input"
        >
          <option value="cashier">Cashier</option>
          <option value="accountant">Accountant</option>
          <option value="finance">Finance</option>
          <option value="admin">Admin</option>
        </select>
        <input
          type="number"
          placeholder="Salary ($)"
          value={form.salary}
          onChange={(e) => setForm({ ...form, salary: e.target.value })}
          className="input"
          min="0"
        />
        <button type="submit" className="btn-primary">
          {editingUser ? "Update" : "Create"}
        </button>
        {editingUser && (
          <button
            type="button"
            className="btn-cancel"
            onClick={() => {
              setEditingUser(null);
              setForm({
                username: "",
                password: "",
                role: "cashier",
                salary: "",
              });
              setStatus("");
            }}
          >
            Cancel
          </button>
        )}
      </form>

      {status && (
        <p
          style={{
            color: status.startsWith("✅") ? "green" : "red",
            fontWeight: "bold",
          }}
        >
          {status}
        </p>
      )}

      {/* ======= USERS TABLE ======= */}
      <div
        style={{
          background: "white",
          borderRadius: "8px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
          padding: "20px",
        }}
      >
        <h3 style={{ marginBottom: "10px" }}>All Employees</h3>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr
              style={{
                background: "#f4f4f4",
                textAlign: "left",
                borderBottom: "2px solid #ddd",
              }}
            >
              <th style={{ padding: "10px" }}>Username</th>
              <th>Role</th>
              <th>Salary ($)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: "center", padding: "15px" }}>
                  No users found
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u._id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "8px" }}>{u.username}</td>
                  <td>{u.role}</td>
                  <td>${u.salary?.toFixed(2) || 0}</td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => handleEdit(u)}
                      style={{ marginRight: "8px" }}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(u._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ======= SMALL STYLE ======= */}
      <style>{`
        .card {
          background: white;
          padding: 20px;
          border-radius: 10px;
          text-align: center;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        .card h3 {
          margin: 8px 0 5px;
          font-size: 16px;
          color: #333;
        }
        .card p {
          font-size: 18px;
          font-weight: bold;
          color: #2c3e50;
        }
        .input {
          padding: 8px;
          border: 1px solid #ccc;
          border-radius: 6px;
          flex: 1;
          min-width: 150px;
        }
        .btn-primary {
          background: #2c3e50;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
        }
        .btn-primary:hover {
          background: #1a242f;
        }
        .btn-cancel {
          background: #ccc;
          color: black;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
        }
        .edit-btn {
          background: #3498db;
          color: white;
          border: none;
          padding: 5px 10px;
          border-radius: 4px;
          cursor: pointer;
        }
        .delete-btn {
          background: #e74c3c;
          color: white;
          border: none;
          padding: 5px 10px;
          border-radius: 4px;
          cursor: pointer;
        }
        .edit-btn:hover {
          background: #217dbb;
        }
        .delete-btn:hover {
          background: #c0392b;
        }
      `}</style>
    </div>
  );
}

export default AdminDashboard;
