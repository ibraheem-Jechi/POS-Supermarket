import React from 'react';

function Sidebar({ setPage }) {
  return (
    <div style={{ width: '200px', background: '#f1f1f1', padding: '10px' }}>
      <button style={{ display: 'block', margin: '10px 0' }} onClick={() => setPage('pos')}>
        POS
      </button>
      <button style={{ display: 'block', margin: '10px 0' }} onClick={() => setPage('dashboard')}>
        Dashboard
      </button>
      <button style={{ display: 'block', margin: '10px 0' }} onClick={() => setPage('products')}>
        Products
      </button>
      <button style={{ display: 'block', margin: '10px 0' }} onClick={() => setPage('salesHistory')}>
        Sales History
      </button>
    </div>
  );
}

export default Sidebar;
