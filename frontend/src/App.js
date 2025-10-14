import React, { useState } from 'react';
import POSPage from './components/POSPage';

function App() {
  const [page, setPage] = useState('pos'); // 'pos', 'dashboard', 'products'
  const [user] = useState({ username: 'john', role: 'cashier' }); // example user

  const DashboardPage = () => (
    <div>
      <h2>Dashboard</h2>
      <p>Here you can see sales summary, charts, and total revenue.</p>
    </div>
  );

  const ProductsPage = () => (
    <div>
      <h2>Products</h2>
      <p>Only admins can edit products (not implemented in this demo).</p>
    </div>
  );

  return (
    <div>
      <header style={{ background: '#2c3e50', color: 'white', padding: '10px', textAlign: 'center' }}>
        Supermarket POS
      </header>

      <div style={{ display: 'flex', minHeight: '90vh' }}>
        <div style={{ width: '200px', background: '#34495e', color: 'white', padding: '20px' }}>
          <button onClick={() => setPage('pos')} style={{ display: 'block', marginBottom: '10px' }}>POS</button>
          <button onClick={() => setPage('products')} style={{ display: 'block', marginBottom: '10px' }}>Products</button>
          <button onClick={() => setPage('dashboard')} style={{ display: 'block', marginBottom: '10px' }}>Dashboard</button>
        </div>

        <div style={{ flex: 1, padding: '20px', background: '#ecf0f1' }}>
          {page === 'pos' && <POSPage user={user} />}
          {page === 'products' && <ProductsPage />}
          {page === 'dashboard' && <DashboardPage />}
        </div>
      </div>
    </div>
  );
}

export default App;
