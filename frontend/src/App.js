import React, { useState } from 'react';
import LoginPage from './pages/LoginPage';
import POSPage from './pages/POS/POSpage';
import AdminDashboard from './pages/AdminDashboard';
import SalesHistory from './pages/SalesHistory';

function App() {
  const [user, setUser] = useState(null); // logged-in user
  const [page, setPage] = useState('pos'); // current page

  // If not logged in, show login page
  if (!user) {
    return <LoginPage onLogin={setUser} />;
  }

  // Dashboard component (shown when clicking "Dashboard")
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
      <header
        style={{
          background: '#2c3e50',
          color: 'white',
          padding: '10px',
          textAlign: 'center',
        }}
      >
        Supermarket POS
      </header>

      <div style={{ display: 'flex', minHeight: '90vh' }}>
        {/* Sidebar */}
        <div
          style={{
            width: '200px',
            background: '#34495e',
            color: 'white',
            padding: '20px',
          }}
        >
          <p>
            Logged in as: <b>{user.username}</b> ({user.role})
          </p>
          <button
            onClick={() => setPage('pos')}
            style={{ display: 'block', marginBottom: '10px' }}
          >
            POS
          </button>
          <button
            onClick={() => setPage('products')}
            style={{ display: 'block', marginBottom: '10px' }}
          >
            Products
          </button>
          <button
            onClick={() => setPage('dashboard')}
            style={{ display: 'block', marginBottom: '10px' }}
          >
            Dashboard
          </button>
          <button
            onClick={() => setPage('salesHistory')}
            style={{ display: 'block', marginBottom: '10px' }}
          >
            Sales History
          </button>
          <button
            onClick={() => setUser(null)}
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
          {page === 'products' && <ProductsPage />}
          {page === 'dashboard' && <DashboardPage />}
          {page === 'salesHistory' && <SalesHistory user={user} />}
        </div>
      </div>
    </div>
  );
}

export default App;
