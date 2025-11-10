import React, { useState, useEffect } from "react";
import { FaBars } from "react-icons/fa"; 

// Components
import Sidebar from "./components/Sidebar";
import LoginPage from "./pages/LoginPage";

// Pages
import POSPage from "./pages/POS/POSpage";
import Tops from "./pages/Tops";
import Wins from "./pages/Wins";
import Expenses from "./pages/Expenses";
import AdminDashboard from "./pages/AdminDashboard";
import SalesHistory from "./pages/SalesHistory";
import CategoryPage from "./pages/CategoryPage";
import ProductsPage from "./pages/ProductsPage";
import AlertsPage from "./pages/AlertsPage.js";
import DailyReport from "./pages/DailyReport.js";
import MonthlyReport from "./pages/MonthlyReport";
import YearlyReport from "./pages/YearlyReport";
import Reports from "./pages/Reports";
import DailySummary from "./pages/DailySummary";
import SuppliersPage from "./pages/SuppliersPage";

function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("");
  const [collapsed, setCollapsed] = useState(false);

  // Load saved user + page
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedPage = localStorage.getItem("page");

    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedPage) setPage(savedPage.toLowerCase());
  }, []);

  // Persist user
  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  // Persist page
  useEffect(() => {
    if (page) localStorage.setItem("page", page.toLowerCase());
  }, [page]);

  if (!user) {
    return (
      <LoginPage
        onLogin={(u) => {
          setUser(u);
          const defaultPage = u.role === "admin" ? "dashboard" : "pos";
          setPage(defaultPage);
          localStorage.setItem("page", defaultPage);
        }}
      />
    );
  }

  // Dashboard wrapper
  const DashboardPage = () =>
    user.role === "admin" ? (
      <AdminDashboard user={user} />
    ) : (
      <p>
        Welcome, {user.username}! You are logged in as <b>{user.role}</b>.
      </p>
    );

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        background: "#f4f6f8",
      }}
    >

      {/* Hamburger Menu */}
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
          color: "#ffffff",
          background: "rgba(0,0,0,0.7)",
          padding: "6px",
          borderRadius: "6px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
        }}
      />

      {/* Header */}
      <header
        style={{
          background: "#000000",
          color: "#ffffff",
          padding: "18px 25px",
          textAlign: "center",
          fontWeight: "700",
          fontSize: "22px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
        }}
      >
        🛒 Supermarket POS
      </header>

      {/* Main Layout */}
      <div style={{ display: "flex", flex: 1 }}>

        {/* Sidebar → ✅ هنا التعديل المهم */}
        <Sidebar
          user={user}
          page={page}              // ✅ تم تمرير الصفحة
          setPage={setPage}
          setUser={setUser}
          collapsed={collapsed}
        />

        <main
          style={{
            flex: 1,
            padding: "20px",
            background: "rgba(255, 255, 255, 0.3)",
            borderRadius: "12px",
            margin: "20px",
            boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
            backdropFilter: "blur(10px)",
          }}
        >
          {page === "dashboard" && <DashboardPage />}
          {page === "pos" && <POSPage user={user} />}
          {page === "products" && <ProductsPage />}
          {page === "saleshistory" && <SalesHistory user={user} />}
          {page === "category" && <CategoryPage />}
          {page === "alerts" && <AlertsPage />}
          {page === "dailyreport" && <DailyReport user={user} />}
          {page === "monthlyreport" && <MonthlyReport user={user} />}
          {page === "yearlyreport" && <YearlyReport user={user} />}
          {page === "reports" && <Reports user={user} />}
          {page === "dailysummary" && <DailySummary user={user} />}
          {page === "tops" && <Tops />}
          {page === "expenses" && <Expenses />}
          {page === "wins" && <Wins />}
          {page === "suppliers" && <SuppliersPage />}
        </main>
      </div>
    </div>
  );
}

export default App;
