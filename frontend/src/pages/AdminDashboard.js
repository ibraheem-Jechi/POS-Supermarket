import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css'; // Make sure your CSS from previous step is imported

function AdminDashboard({ user }) {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ username: '', password: '', role: 'cashier' });
  const [editingUser, setEditingUser] = useState(null);
  const [status, setStatus] = useState('');

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/auth/all');
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users', err.toJSON ? err.toJSON() : err);
      setStatus('❌ Failed to fetch users');
    }
  };

  useEffect(() => {
    if (user.role === 'admin') fetchUsers();
  }, [user]);

  // Create or update user
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');

    try {
      if (editingUser) {
        await axios.put(`http://localhost:5000/api/auth/${editingUser._id}`, form);
        setStatus('✅ User updated successfully');
      } else {
        await axios.post('http://localhost:5000/api/auth/create', form);
        setStatus('✅ User created successfully');
      }
      setForm({ username: '', password: '', role: 'cashier' });
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      setStatus('❌ ' + (err.response?.data?.error || 'Error saving user'));
    }
  };

  // Delete user
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/auth/${id}`);
      setStatus('✅ User deleted successfully');
      fetchUsers();
    } catch (err) {
      setStatus('❌ ' + (err.response?.data?.error || 'Error deleting user'));
    }
  };

  // Edit user
  const handleEdit = (user) => {
    setEditingUser(user);
    setForm({ username: user.username, password: '', role: user.role });
    setStatus('');
  };

  if (user.role !== 'admin') {
    return <p style={{ color: 'red', textAlign: 'center', marginTop: '50px' }}>Access denied — only admins can view this page.</p>;
  }

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      <p>Welcome, <b>{user.username}</b> (Role: {user.role})</p>

      {/* Form */}
      <h3>{editingUser ? 'Edit User' : 'Create New User'}</h3>
      <form onSubmit={handleSubmit} className="user-form">
        <input
          type="text"
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required={!editingUser}
        />
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="cashier">Cashier</option>
          <option value="accountant">Accountant</option>
          <option value="finance">Finance</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit">{editingUser ? 'Update' : 'Create'}</button>
        {editingUser && (
          <button
            type="button"
            className="cancel"
            onClick={() => {
              setEditingUser(null);
              setForm({ username: '', password: '', role: 'cashier' });
              setStatus('');
            }}
          >
            Cancel
          </button>
        )}
      </form>

      {status && <p className={`status ${status.startsWith('✅') ? 'success' : 'error'}`}>{status}</p>}

      {/* Users Table */}
      <div className="table-card">
        <table className="users-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan="3" style={{ textAlign: 'center', padding: '15px' }}>No users found</td></tr>
            ) : (
              users.map((u) => (
                <tr key={u._id}>
                  <td>{u.username}</td>
                  <td>{u.role}</td>
                  <td>
                    <button className="edit" onClick={() => handleEdit(u)}>Edit</button>
                    <button className="delete" onClick={() => handleDelete(u._id)}>Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminDashboard;
