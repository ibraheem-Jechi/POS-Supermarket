import React, { useState } from 'react';
import axios from 'axios';

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        username,
        password,
      });
      onLogin(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Logo / Brand */}
        <div style={styles.logoContainer}>
          <div style={styles.logo}>🛒</div>
          <h1 style={styles.brand}>Supermarket POS</h1>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={styles.input}
              placeholder="Enter your username"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" style={styles.button}>Login</button>
        </form>

        <p style={styles.footerText}>© {new Date().getFullYear()} Supermarket POS</p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: 'linear-gradient(135deg, #74ebd5 0%, #ACB6E5 100%)',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  card: {
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
    width: '350px',
    padding: '30px',
    textAlign: 'center',
  },
  logoContainer: {
    marginBottom: '20px',
  },
  logo: {
    fontSize: '48px',
    marginBottom: '10px',
  },
  brand: {
    margin: 0,
    fontSize: '24px',
    color: '#2c3e50',
    fontWeight: '600',
  },
  error: {
    color: 'red',
    marginBottom: '15px',
    fontWeight: '500',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  inputGroup: {
    textAlign: 'left',
  },
  label: {
    fontWeight: '500',
    marginBottom: '5px',
    display: 'block',
    color: '#34495e',
  },
  input: {
    width: '100%',
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    outline: 'none',
    transition: 'border 0.2s',
  },
  button: {
    padding: '12px',
    backgroundColor: '#27ae60',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'background 0.2s',
  },
  footerText: {
    marginTop: '20px',
    fontSize: '12px',
    color: '#7f8c8d',
  },
};

export default LoginPage;
