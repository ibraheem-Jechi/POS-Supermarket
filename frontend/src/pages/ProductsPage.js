import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ProductsPage.css";

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [newProduct, setNewProduct] = useState({
    productName: "",
    productPrice: "",
    barcode: "",
    productCategory: ""
  });
  const [editingId, setEditingId] = useState(null);

  // 🟢 Fetch products
  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/products");
      setProducts(res.data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  // 🟢 Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/categories");
      setCategories(res.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // 🟢 Add / Update product
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/products/${editingId}`, newProduct);
      } else {
        await axios.post("http://localhost:5000/api/products", newProduct);
      }
      setNewProduct({ productName: "", productPrice: "", barcode: "", productCategory: "" });
      setEditingId(null);
      fetchProducts();
    } catch (err) {
      console.error("Error saving product:", err);
    }
  };

  // 🟢 Edit product
  const handleEdit = (p) => {
    setNewProduct({
      productName: p.productName,
      productPrice: p.productPrice,
      barcode: p.barcode,
      // productCategory in DB may be a plain string (category name) or an object; prefer the name
      productCategory: typeof p.productCategory === 'string' ? p.productCategory : (p.productCategory?.name || "")
    });
    setEditingId(p._id);
  };

  // 🟢 Delete product
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`);
      fetchProducts();
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  };

  // 🟢 Filter products
  const filteredProducts = products.filter((p) =>
    p.productName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="products-container">
      <h2>Products Management</h2>

      {/* Search */}
      <input
        type="text"
        placeholder="Search product..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-bar"
      />

      {/* Form */}
      <form onSubmit={handleSubmit} className="product-form">
        <input
          type="text"
          placeholder="Product Name"
          value={newProduct.productName}
          onChange={(e) => setNewProduct({ ...newProduct, productName: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Price"
          value={newProduct.productPrice}
          onChange={(e) => setNewProduct({ ...newProduct, productPrice: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Barcode"
          value={newProduct.barcode}
          onChange={(e) => setNewProduct({ ...newProduct, barcode: e.target.value })}
          required
        />
        <select
          value={newProduct.productCategory}
          onChange={(e) => setNewProduct({ ...newProduct, productCategory: e.target.value })}
          required
        >
          <option value="">-- Select Category --</option>
          {categories.map((c) => (
            <option key={c._id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
        <button type="submit">{editingId ? "Update" : "Add"} Product</button>
      </form>

      {/* Products Table */}
      <table className="products-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Barcode</th>
            <th>Price</th>
            <th>Category</th>
            <th style={{ width: "150px" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.length > 0 ? (
            filteredProducts.map((p) => (
              <tr key={p._id}>
                <td>{p.productName}</td>
                <td>{p.barcode}</td>
                <td>${p.productPrice}</td>
                <td>{typeof p.productCategory === 'string' ? p.productCategory : (p.productCategory?.name || p.productCategory?.categoryName || "N/A")}</td>
                <td>
                  <button onClick={() => handleEdit(p)}>Edit</button>
                  <button onClick={() => handleDelete(p._id)}>Delete</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ textAlign: "center" }}>
                No products found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProductsPage;
