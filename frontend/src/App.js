import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import LoginPage from "./pages/LoginPage";
import POSPage from "./pages/POS/POSpage";
import AdminDashboard from "./pages/AdminDashboard";
import SalesHistory from "./pages/SalesHistory";
import CategoryPage from "./pages/CategoryPage";
import ProductsPage from "./pages/ProductsPage";
import AlertsPage from "./pages/AlertsPage";
import DailyReport from "./pages/DailyReport";
import { FaBars } from "react-icons/fa";

function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("");
  const [collapsed, setCollapsed] = useState(false);

  // ✅ Load saved data
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedPage = localStorage.getItem("page");
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedPage) setPage(savedPage.toLowerCase());
  }, []);

  // ✅ Save user in storage
  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  // ✅ Save page in storage
  useEffect(() => {
    if (page) localStorage.setItem("page", page);
  }, [page]);

  // ✅ Login logic
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

  // ✅ Dashboard logic
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

  // ✅ Main Layout
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        position: "relative",
        background: "#f4f6f8",
      }}
    >
      {/* === Hamburger Menu === */}
      <FaBars
        className="hamburger"
        onClick={() => setCollapsed(!collapsed)}
        style={{
          position: "fixed",
          top: "15px",
          left: "15px",
          fontSize: "24px",
          cursor: "pointer",
          zIndex: 1000,
          color: "#374151",
          background: "rgba(255,255,255,0.6)",
          padding: "6px",
          borderRadius: "6px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
        }}
      />

      {/* === Header === */}
      <header
        style={{
          background: "linear-gradient(90deg, #3a7bd5 0%, #00d2ff 100%)",
          color: "#fff",
          padding: "18px 25px",
          textAlign: "center",
          fontWeight: "700",
          fontSize: "22px",
          borderRadius: "0 0 12px 12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        🛒 Supermarket POS
      </header>

      {/* === Body === */}
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
          {/* === Page Switch === */}
          {page.toLowerCase() === "pos" && <POSPage user={user} />}
          {page.toLowerCase() === "products" && <ProductsPage />}
          {page.toLowerCase() === "dashboard" && <DashboardPage />}
          {page.toLowerCase() === "saleshistory" && <SalesHistory user={user} />}
          {page.toLowerCase() === "category" && <CategoryPage />}
          {page.toLowerCase() === "alerts" && <AlertsPage />}
          {page.toLowerCase() === "dailyreport" && <DailyReport user={user} />}
        </div>
      </div>
    </div>
  );
}

export default App;
