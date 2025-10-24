import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import LoginPage from "./pages/LoginPage";
import POSPage from "./pages/POS/POSpage";
import AdminDashboard from "./pages/AdminDashboard";
import SalesHistory from "./pages/SalesHistory";
import CategoryPage from "./pages/CategoryPage";
import ProductsPage from "./pages/ProductsPage";
import AlertsPage from "./pages/AlertsPage"; // ✅ NEW IMPORT
import { FaBars } from "react-icons/fa";

function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("");
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedPage = localStorage.getItem("page");
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedPage) setPage(savedPage.toLowerCase());
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  useEffect(() => {
    if (page) localStorage.setItem("page", page);
  }, [page]);

  if (!user) {
    return (
      <LoginPage
        onLogin={(u) => {
          setUser(u);
          setPage(u.role === "admin" ? "dashboard" : "pos");
        }}
      />
    );
  }

  const DashboardPage = () => (
    <div>
      {user.role === "admin" ? (
        <AdminDashboard user={user} />
      ) : (
        <p>
          Welcome, {user.username}! You are logged in as <b>{user.role}</b>.
        </p>
      )}
    </div>
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(135deg, #74ebd5 0%, #ACB6E5 100%)",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        position: "relative",
      }}
    >
      {/* Hamburger Menu */}
      <FaBars className="hamburger" onClick={() => setCollapsed(!collapsed)} />

      <header
        style={{
          background: "rgba(255, 255, 255, 0.3)",
          color: "#2c3e50",
          padding: "15px",
          textAlign: "center",
          fontWeight: "600",
          fontSize: "20px",
          backdropFilter: "blur(10px)",
        }}
      >
        🛒 Supermarket POS
      </header>

      <div style={{ display: "flex", flex: 1 }}>
        <Sidebar
          user={user}
          setPage={setPage}
          setUser={setUser}
          collapsed={collapsed}
        />

        <div
          style={{
            flex: 1,
            padding: "20px",
            background: "rgba(255, 255, 255, 0.3)",
            borderRadius: "12px",
            margin: "20px",
            boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
            backdropFilter: "blur(10px)",
            transition: "margin-left 0.3s ease",
            marginLeft: collapsed ? "0px" : "0px",
          }}
        >
          {page === "pos" && <POSPage user={user} />}
          {page === "products" && <ProductsPage />}
          {page === "dashboard" && <DashboardPage />}
          {page === "salesHistory" && <SalesHistory user={user} />}
          {page === "category" && <CategoryPage />}
          {page === "alerts" && <AlertsPage />} {/* ✅ NEW ALERTS PAGE */}
        </div>
      </div>
    </div>
  );
}

export default App;
