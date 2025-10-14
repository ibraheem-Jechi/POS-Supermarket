import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../App.css';


function POSPage({ user }) {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = () => {
    axios.get('http://localhost:5000/api/products')
      .then(res => setProducts(res.data))
      .catch(() => setProducts([]));
  };

  const addToCart = (product) => {
    if (user.role !== 'cashier') return alert('Only cashiers can add products to the cart');
    if (product.stock === 0) return alert('Out of stock');

    const existing = cart.find(p => p.product === product._id);
    if (existing) {
      setCart(cart.map(p => p.product === product._id
        ? { ...p, quantity: p.quantity + 1 }
        : p
      ));
    } else {
      setCart([...cart, { product: product._id, name: product.name, price: product.price, quantity: 1 }]);
    }

    setProducts(products.map(p => p._id === product._id
      ? { ...p, stock: p.stock - 1 }
      : p
    ));
  };

  const removeFromCart = (productId) => {
    const item = cart.find(c => c.product === productId);
    if (!item) return;

    setCart(cart.filter(c => c.product !== productId));
    setProducts(products.map(p => p._id === productId
      ? { ...p, stock: p.stock + item.quantity }
      : p
    ));
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const checkout = () => {
    if (user.role !== 'cashier') return alert('Only cashiers can perform checkout');
    if (cart.length === 0) return alert('Cart is empty');

    axios.post('http://localhost:5000/api/sales', { products: cart })
      .then(() => {
        setStatus('Sale completed!');
        setCart([]);
        fetchProducts();
      })
      .catch(err => setStatus(err.response?.data?.error || 'Error'));
  };

  return (
    <div>
      <h2>POS</h2>
      <p>Logged in as: {user.username} ({user.role})</p>

      <h3>Products</h3>
      <ul>
        {products.map(p => (
          <li key={p._id}>
            {p.name} — ${p.price} — stock: {p.stock} 
            {user.role === 'cashier' && (
              <button onClick={() => addToCart(p)} disabled={p.stock === 0}>Add to Cart</button>
            )}
          </li>
        ))}
      </ul>

      <h3>Cart</h3>
      <ul>
        {cart.map(c => (
          <li key={c.product}>
            {c.name} — qty: {c.quantity} — ${c.price * c.quantity}
            {user.role === 'cashier' && (
              <button onClick={() => removeFromCart(c.product)}>Remove</button>
            )}
          </li>
        ))}
      </ul>

      <h3>Total: ${totalAmount.toFixed(2)}</h3>
      {cart.length > 0 && user.role === 'cashier' && (
        <button onClick={checkout}>Checkout</button>
      )}
      <p>{status}</p>
    </div>
  );
}

export default POSPage;
