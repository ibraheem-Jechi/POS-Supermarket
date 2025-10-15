import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AdminDashboard({ user }) {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'cashier' });
  const [status, setStatus] = useState('');

  // Fetch all users (admins only)
  useEffect(() => {
    if (user.role === 'admin') {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/auth/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users', err);
    }
  };

  const createUser = async (e) => {
    e.preventDefault();
    setStatus('');

    try {
      const res = await axios.post('http://localhost:5000/api/auth/create', newUser);
      setStatus('✅ User created successfully');
      setNewUser({ username: '', password: '', role: 'cashier' });
      fetchUsers();
    } catch (err) {
      setStatus('❌ ' + (err.response?.data?.error || 'Error creating user'));
    }
  };

  if (user.role !== 'admin') {
    return <p style={{ color: 'red' }}>Access denied — only admins can view this page.</p>;
  }

  return (
    <div>
      <h2>Admin Dashboard</h2>
      <p>Welcome, {user.username} (Role: {user.role})</p>

      <h3>Create New User</h3>
      <form onSubmit={createUser} style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Username"
          value={newUser.username}
          onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={newUser.password}
          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
          required
        />
        <select
          value={newUser.role}
          onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
        >
          <option value="cashier">Cashier</option>
          <option value="accountant">Accountant</option>
          <option value="finance">Finance</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit">Create</button>
      </form>

      {status && <p>{status}</p>}

      <h3>All Users</h3>
      <ul>
        {users.map((u) => (
          <li key={u._id}>
            {u.username} — <b>{u.role}</b>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AdminDashboard;
