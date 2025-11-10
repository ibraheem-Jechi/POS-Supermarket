import React, { useState } from "react";
import axios from "axios";

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        username,
        password,
      });
      onLogin(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div style={styles.container}>
      {/* ⭐ stars */}
      <div style={styles.stars}></div>
      <div style={styles.stars2}></div>
      <div style={styles.stars3}></div>

      {/* 🌌 NEBULA */}
      <div style={styles.nebula}></div>

      {/* 🌠 shooting stars */}
      <div style={styles.shootingStar1}></div>
      <div style={styles.shootingStar2}></div>

      {/* LOGIN CARD */}
      <div style={styles.card}>
        <div style={styles.logo}>🛒</div>
        <h1 style={styles.brand}>Supermarket POS</h1>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleLogin} style={styles.form}>
          <label style={styles.label}>Username</label>
          <input
            style={styles.input}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <label style={styles.label}>Password</label>
          <input
            style={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" style={styles.button}>Login</button>
        </form>

        <p style={styles.footer}>
          © {new Date().getFullYear()} Supermarket POS
        </p>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes starMove {
          from { transform: translateY(0); }
          to { transform: translateY(-2000px); }
        }

        @keyframes shooting {
          0% { transform: translateX(-200px) translateY(-200px); opacity: 1; }
          100% { transform: translateX(800px) translateY(600px); opacity: 0; }
        }

        @keyframes shooting2 {
          0% { transform: translateX(600px) translateY(-100px); opacity: 1; }
          100% { transform: translateX(-200px) translateY(400px); opacity: 0; }
        }

        @keyframes nebulaMove {
          0% { transform: translate(-50%, -50%) scale(1) rotate(0deg); opacity: 0.6; }
          50% { transform: translate(-50%, -50%) scale(1.3) rotate(180deg); opacity: 0.9; }
          100% { transform: translate(-50%, -50%) scale(1) rotate(360deg); opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}

/* ==== Styles ==== */
const styles = {
  container: {
    background: "#000",
    height: "100vh",
    overflow: "hidden",
    position: "relative",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Segoe UI, sans-serif",
  },

  // ⭐ Stars layers
  stars: {
    width: "2px",
    height: "2px",
    background: "transparent",
    boxShadow: createStarField(400),
    animation: "starMove 80s linear infinite",
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 1,
  },
  stars2: {
    width: "2px",
    height: "2px",
    background: "transparent",
    boxShadow: createStarField(300),
    animation: "starMove 120s linear infinite",
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 1,
  },
  stars3: {
    width: "3px",
    height: "3px",
    background: "transparent",
    boxShadow: createStarField(150),
    animation: "starMove 160s linear infinite",
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 1,
  },

  // 🌌 Nebula
  nebula: {
    position: "absolute",
    width: "1000px",
    height: "1000px",
    borderRadius: "50%",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    background: "radial-gradient(circle, rgba(140,50,255,0.9), rgba(50,0,80,0.5), transparent)",
    filter: "blur(80px)",
    animation: "nebulaMove 25s infinite linear",
    zIndex: 0,
  },

  // ℹ shooting stars
  shootingStar1: {
    position: "absolute",
    width: "3px",
    height: "3px",
    background: "#fff",
    boxShadow: "0 0 15px 5px white",
    borderRadius: "50%",
    animation: "shooting 3s ease-out infinite",
    zIndex: 2,
  },

  shootingStar2: {
    position: "absolute",
    width: "3px",
    height: "3px",
    background: "#fff",
    boxShadow: "0 0 15px 5px white",
    borderRadius: "50%",
    animation: "shooting2 4s ease-out infinite",
    zIndex: 2,
  },

  // Login card
  card: {
    background: "rgba(0,0,0,0.85)",
    padding: "40px",
    borderRadius: "12px",
    width: "380px",
    textAlign: "center",
    color: "#fff",
    zIndex: 99,
    boxShadow: "0 0 40px rgba(0,0,0,0.7)",
  },

  logo: {
    fontSize: "50px",
    marginBottom: "10px",
  },

  brand: {
    fontSize: "26px",
    marginBottom: "20px",
  },

  label: {
    textAlign: "left",
  },

  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "6px",
    background: "#111",
    border: "1px solid #444",
    color: "#fff",
    marginBottom: "12px",
  },

  button: {
    width: "100%",
    padding: "12px",
    borderRadius: "6px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },

  footer: {
    opacity: 0.6,
    marginTop: "15px",
    fontSize: "12px",
  },

  error: {
    color: "red",
    marginBottom: "10px",
  },
};

/* Generate star positions */
function createStarField(count) {
  let stars = [];
  for (let i = 0; i < count; i++) {
    stars.push(
      `${Math.random() * window.innerWidth}px ${Math.random() * window.innerHeight}px #fff`
    );
  }
  return stars.join(",");
}

export default LoginPage;
