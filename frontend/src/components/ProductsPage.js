import React, { useEffect, useState } from 'react';
import axios from 'axios';

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: '', price: '', stock: '', costPrice: '' });
  const [editId, setEditId] = useState(null);

  const fetchProducts = () => {
    axios.get('http://localhost:5000/api/products')
      .then(res => setProducts(res.data))
      .catch(() => setProducts([]));
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editId) {
      axios.put(`http://localhost:5000/api/products/${editId}`, form)
        .then(() => { fetchProducts(); setForm({ name: '', price: '', stock: '', costPrice: '' }); setEditId(null); });
    } else {
      axios.post('http://localhost:5000/api/products', form)
        .then(() => { fetchProducts(); setForm({ name: '', price: '', stock: '', costPrice: '' }); });
    }
  };

  const handleEdit = (product) => {
    setForm({ name: product.name, price: product.price, stock: product.stock, costPrice: product.costPrice || 0 });
    setEditId(product._id);
  };

  const handleDelete = (id) => {
    axios.delete(`http://localhost:5000/api/products/${id}`)
      .then(() => fetchProducts());
  };

  return (
    <div>
      <h2>Products</h2>

      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
        <input name="price" type="number" placeholder="Price" value={form.price} onChange={handleChange} required />
        <input name="stock" type="number" placeholder="Stock" value={form.stock} onChange={handleChange} required />
        <input name="costPrice" type="number" placeholder="Cost Price" value={form.costPrice} onChange={handleChange} />
        <button type="submit">{editId ? 'Update' : 'Add'} Product</button>
      </form>

      <ul>
        {products.map(p => (
          <li key={p._id}>
            {p.name} — ${p.price} — stock: {p.stock}
            <button onClick={() => handleEdit(p)}>Edit</button>
            <button onClick={() => handleDelete(p._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ProductsPage;
