import React, { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import POSPage from './pages/POS/POSpage';
import AdminDashboard from './pages/AdminDashboard';
import CategoryPage from './pages/CategoryPage';
import ProductsPage from "./pages/ProductsPage";   // ✅ خليها هي الصفحة الأساسية
import SalesHistory from './pages/SalesHistory';

function App() {
  const [user, setUser] = useState(null); 
  const [page, setPage] = useState('');

  // 🟢 استرجاع user + page من localStorage عند أول تحميل
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedPage = localStorage.getItem("page");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    if (savedPage) {
      setPage(savedPage);
    }
  }, []);

  // 🟢 كل ما يتغير user نخزنه
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  // 🟢 كل ما تتغير الصفحة نخزنها
  useEffect(() => {
    if (page) {
      localStorage.setItem("page", page);
    }
  }, [page]);

  // 🟢 لو مش عامل login
  if (!user) {
    return (
      <LoginPage onLogin={(u) => {
        setUser(u);
        if (u.role === 'admin') {
          setPage('dashboard');
        } else {
          setPage('pos');
        }
      }} />
    );
  }

  // 🟢 Dashboard
  const DashboardPage = () => (
    <div>
      {user.role === 'admin' ? (
        <AdminDashboard user={user} />
      ) : (
        <p>
          Welcome, {user.username}! You are logged in as <b>{user.role}</b>.
        </p>
      )}
    </div>
  );

  // Products page
  const ProductsPage = () => (
    <div>
      {user.role === 'admin' ? (
        <p>Admin can manage or edit products here (coming soon).</p>
      ) : (
        <p>Only admins can edit products.</p>
      )}
    </div>
  );

  return (
    <div>
      <header style={{ background: '#2c3e50', color: 'white', padding: '10px', textAlign: 'center' }}>
        Supermarket POS
      </header>

      <div style={{ display: 'flex', minHeight: '90vh' }}>
        {/* Sidebar */}
        <div style={{ width: '200px', background: '#34495e', color: 'white', padding: '20px' }}>
          <p>
            Logged in as: <b>{user.username}</b> ({user.role})
          </p>
          <button onClick={() => setPage('pos')} style={{ display: 'block', marginBottom: '10px' }}>POS</button>
          <button onClick={() => setPage('products')} style={{ display: 'block', marginBottom: '10px' }}>Products</button>

          {user.role === 'admin' && (
            <>
              <button onClick={() => setPage('dashboard')} style={{ display: 'block', marginBottom: '10px' }}>Dashboard</button>
              <button onClick={() => setPage('category')} style={{ display: 'block', marginBottom: '10px' }}>Categories</button>
            </>
          )}

          <button
            onClick={() => {
              setUser(null);
              setPage('');
              localStorage.clear();
            }}
            style={{
              display: 'block',
              marginTop: '20px',
              background: '#c0392b',
              color: 'white',
              padding: '8px',
              border: 'none',
              width: '100%',
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, padding: '20px', background: '#ecf0f1' }}>
          {page === 'pos' && <POSPage user={user} />}
          {page === 'products' && <ProductsPage />}   {/* ✅ هون صار يستعمل الصفحة الحقيقية */}
          {page === 'dashboard' && <DashboardPage />}
          {page === 'category' && <CategoryPage />}
          {page === 'salesHistory' && <SalesHistory user={user} />}
        </div>
      </div>
    </div>
  );
}

export default App;
