import React, { useEffect, useState } from 'react';
import axios from 'axios';

function SalesHistory() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/sales');
        setSales(res.data);
      } catch (err) {
        console.error('Error fetching sales:', err.response || err);
      } finally {
        setLoading(false);
      }
    };

    fetchSales();
  }, []);

  if (loading) return <p>Loading sales history...</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Sales History</h2>
      <p>Viewing sales for: <b>All</b></p>

      <div style={{ overflowX: 'auto' }}>
        <table 
          style={{ 
            width: '100%', 
            borderCollapse: 'collapse', 
            background: '#fff', 
            boxShadow: '0 0 10px rgba(0,0,0,0.1)' 
          }}
        >
          <thead style={{ background: '#2c3e50', color: '#fff' }}>
            <tr>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Date</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Items</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Subtotal</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Tax</th>
              <th style={{ padding: '10px', border: '1px solid #ddd' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {sales.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '15px' }}>No sales found</td>
              </tr>
            ) : (
              sales.map(cart => (
                <tr key={cart._id}>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                    {new Date(cart.createdAt).toLocaleString()}
                  </td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                      {cart.lines.map((item, idx) => (
                        <li key={idx}>{item.name} x{item.qty} (${item.price.toFixed(2)})</li>
                      ))}
                    </ul>
                  </td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>${cart.subtotal.toFixed(2)}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>${cart.tax.toFixed(2)}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold' }}>${cart.total.toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SalesHistory;
