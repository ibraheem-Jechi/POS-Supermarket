import React from 'react';
import POSPage from './POSPage';
import Dashboard from './Dashboard';
import ProductsPage from './ProductsPage';

function MainContent({ page }) {
  return (
    <div style={{ flex: 1, padding: '20px' }}>
      {page === 'pos' && <POSPage />}
      {page === 'dashboard' && <Dashboard />}
      {page === 'products' && <ProductsPage />}
    </div>
  );
}

export default MainContent;
