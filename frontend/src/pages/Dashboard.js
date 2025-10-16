import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function Dashboard() {
  const [data, setData] = useState({ totalRevenue: 0, totalCost: 0, totalProfit: 0 });
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ username: '', password: '', role: 'cashier' });
  const [editingUser, setEditingUser] = useState(null);

  // --------------------------
  // Finance data (chart)
  // --------------------------
  useEffect(() => {
    axios.get('http://localhost:5000/api/dashboard/finance')
      .then(res => setData(res.data))
      .catch(() => setData({ totalRevenue: 0, totalCost: 0, totalProfit: 0 }));
  }, []);

  const chartData = [
    { name: 'Revenue', value: data.totalRevenue },
    { name: 'Cost', value: data.totalCost },
    { name: 'Profit', value: data.totalProfit }
  ];

  // --------------------------
  // User management
  // --------------------------
  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/auth/all');
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await axios.put(`http://localhost:5000/api/auth/${editingUser._id}`, form);
      } else {
        await axios.post('http://localhost:5000/api/auth/create', form);
      }
      setForm({ username: '', password: '', role: 'cashier' });
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert('Error saving user');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/auth/${id}`);
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setForm({ username: user.username, password: '', role: user.role });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Admin Dashboard</h1>

      {/* ======================= */}
      {/* FINANCE CHART SECTION */}
      {/* ======================= */}
      <section style={{ marginBottom: '40px' }}>
        <h2>Finance Overview</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#4CAF50" />
          </BarChart>
        </ResponsiveContainer>
      </section>

      {/* ======================= */}
      {/* USER MANAGEMENT SECTION */}
      {/* ======================= */}
      <section>
        <h2>{editingUser ? 'Edit User' : 'Create New User'}</h2>
        <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="Username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
            style={{ marginRight: '10px' }}
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required={!editingUser}
            style={{ marginRight: '10px' }}
          />
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            style={{ marginRight: '10px' }}
          >
            <option value="cashier">Cashier</option>
            <option value="finance">Finance</option>
            <option value="accountant">Accountant</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit">{editingUser ? 'Update' : 'Create'}</button>
          {editingUser && (
            <button
              type="button"
              onClick={() => {
                setEditingUser(null);
                setForm({ username: '', password: '', role: 'cashier' });
              }}
              style={{ marginLeft: '10px' }}
            >
              Cancel
            </button>
          )}
        </form>

        <h2>All Users</h2>
        <table border="1" cellPadding="8" width="100%">
          <thead>
            <tr>
              <th>Username</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan="3">No users found</td></tr>
            ) : (
              users.map((u) => (
                <tr key={u._id}>
                  <td>{u.username}</td>
                  <td>{u.role}</td>
                  <td>
                    <button onClick={() => handleEdit(u)} style={{ marginRight: '8px' }}>Edit</button>
                    <button onClick={() => handleDelete(u._id)}>Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default Dashboard;
