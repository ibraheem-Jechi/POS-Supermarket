import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [status, setStatus] = useState('Loading...');
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // backend health check
    axios.get('http://localhost:5000/')
      .then(res => setStatus(JSON.stringify(res.data)))
      .catch(err => setStatus('Backend not reachable'));

    // fetch products
    axios.get('http://localhost:5000/api/products')
      .then(res => setProducts(res.data))
      .catch(() => setProducts([]));
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Supermarket POS — Frontend</h2>
      <p>Backend status: {status}</p>

      <h3>Products</h3>
      <ul>
        {products.length ? products.map(p => (
          <li key={p._id}>{p.name} — ${p.price} — stock: {p.stock}</li>
        )) : <li>No products found</li>}
      </ul>
    </div>
  );
}

export default App;
