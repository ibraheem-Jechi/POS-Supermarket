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
    productCategory: "",
    quantity: "",
    minStockLevel: "10",
    expiryDate: ""
  });
  const [editingId, setEditingId] = useState(null);

  // Fetch products
  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/products");
      setProducts(res.data);

      // ⚠️ Check expiry alert
      const expiring = res.data.filter(p => {
        if (!p.expiryDate) return false;
        const diff = (new Date(p.expiryDate) - new Date()) / (1000 * 60 * 60 * 24);
        return diff <= 7 && diff >= 0;
      });
      if (expiring.length > 0) {
        alert(
          "⚠️ Some products are expiring soon:\n" +
          expiring
            .map(p => `${p.productName} (Expiry: ${new Date(p.expiryDate).toLocaleDateString()})`)
            .join("\n")
        );
      }

    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  // Fetch categories
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

  // Add / Update product
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        ...newProduct,
        productPrice: parseFloat(newProduct.productPrice),
        quantity: parseInt(newProduct.quantity) || 0,
        minStockLevel: parseInt(newProduct.minStockLevel) || 10,
        expiryDate: newProduct.expiryDate ? new Date(newProduct.expiryDate) : null
      };

      if (editingId) {
        await axios.put(`http://localhost:5000/api/products/${editingId}`, productData);
        alert("✅ Product updated successfully");
      } else {
        await axios.post("http://localhost:5000/api/products", productData);
        alert("✅ Product added successfully");
      }
      setNewProduct({
        productName: "",
        productPrice: "",
        barcode: "",
        productCategory: "",
        quantity: "",
        minStockLevel: "10",
        expiryDate: ""
      });
      setEditingId(null);
      fetchProducts();
    } catch (err) {
      const serverMsg = err.response?.data?.message || err.response?.data?.error || err.message;
      console.error("Error saving product:", err.response?.data || err.message);
      alert(`❌ Error saving product: ${serverMsg}`);
    }
  };

  // Edit product
  const handleEdit = (p) => {
    setNewProduct({
      productName: p.productName,
      productPrice: p.productPrice,
      barcode: p.barcode || "",
      quantity: p.quantity || 0,
      minStockLevel: p.minStockLevel || 10,
      productCategory: typeof p.productCategory === "string"
        ? p.productCategory
        : (p.productCategory?.name || ""),
      expiryDate: p.expiryDate ? p.expiryDate.substring(0, 10) : ""
    });
    setEditingId(p._id);
  };

  // Delete product
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`);
      alert("✅ Product deleted");
      fetchProducts();
    } catch (err) {
      console.error("Error deleting product:", err);
      alert("❌ Error deleting product");
    }
  };

  // Filter products
  const filteredProducts = products.filter((p) =>
    p.productName.toLowerCase().includes(search.toLowerCase()) ||
    (p.barcode || "").toLowerCase().includes(search.toLowerCase())
  );

  // Stock status
  const getStockStatus = (product) => {
    if (product.quantity === 0) return { status: "Out of Stock", color: "#e74c3c" };
    if (product.quantity <= (product.minStockLevel || 10)) return { status: "Low Stock", color: "#f39c12" };
    return { status: "In Stock", color: "#27ae60" };
  };

  // Expiry status
  const getExpiryStatus = (product) => {
    if (!product.expiryDate) return { status: "No Date", color: "#7f8c8d" };
    const today = new Date();
    const expiry = new Date(product.expiryDate);
    const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { status: "Expired", color: "#e74c3c" };
    if (diffDays <= 7) return { status: "Expiring Soon", color: "#f39c12" };
    return { status: "Valid", color: "#27ae60" };
  };

  return (
    <div className="products-container">
      <h2>Products Management</h2>

      <input
        type="text"
        placeholder="Search by name or barcode..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-bar"
      />

      <form onSubmit={handleSubmit} className="product-form">
        <input
          type="text"
          placeholder="Product Name *"
          value={newProduct.productName}
          onChange={(e) => setNewProduct({ ...newProduct, productName: e.target.value })}
          required
        />
        <input
          type="number"
          step="0.01"
          placeholder="Price *"
          value={newProduct.productPrice}
          onChange={(e) => setNewProduct({ ...newProduct, productPrice: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Barcode"
          value={newProduct.barcode}
          onChange={(e) => setNewProduct({ ...newProduct, barcode: e.target.value })}
        />
        <input
          type="number"
          placeholder="Quantity *"
          value={newProduct.quantity}
          onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Min Stock (default: 10)"
          value={newProduct.minStockLevel}
          onChange={(e) => setNewProduct({ ...newProduct, minStockLevel: e.target.value })}
        />
        <input
          type="date"
          placeholder="Expiry Date"
          value={newProduct.expiryDate}
          onChange={(e) => setNewProduct({ ...newProduct, expiryDate: e.target.value })}
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
        <button type="submit" className="btn-submit">
          {editingId ? "Update" : "Add"} Product
        </button>
        {editingId && (
          <button
            type="button"
            className="btn-cancel"
            onClick={() => {
              setEditingId(null);
              setNewProduct({
                productName: "",
                productPrice: "",
                barcode: "",
                productCategory: "",
                quantity: "",
                minStockLevel: "10",
                expiryDate: ""
              });
            }}
          >
            Cancel
          </button>
        )}
      </form>

      {/* Stock Summary */}
      <div className="stock-summary">
        <div className="summary-item">
          <span className="summary-label">Total Products:</span>
          <span className="summary-value">{products.length}</span>
        </div>
        <div className="summary-item out-of-stock">
          <span className="summary-label">Out of Stock:</span>
          <span className="summary-value">{products.filter(p => p.quantity === 0).length}</span>
        </div>
        <div className="summary-item low-stock">
          <span className="summary-label">Low Stock:</span>
          <span className="summary-value">
            {products.filter(p => p.quantity > 0 && p.quantity <= (p.minStockLevel || 10)).length}
          </span>
        </div>
      </div>

      {/* Products Table */}
      <div className="table-wrapper">
        <table className="products-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Barcode</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Status</th>
              <th>Expiry Date</th>
              <th>Category</th>
              <th style={{ width: "150px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((p) => {
                const stockStatus = getStockStatus(p);
                const expiryStatus = getExpiryStatus(p);
                return (
                  <tr key={p._id}>
                    <td>{p.productName}</td>
                    <td>{p.barcode || "N/A"}</td>
                    <td className="price-cell">${p.productPrice.toFixed(2)}</td>
                    <td className="quantity-cell" style={{ color: stockStatus.color, fontWeight: "bold" }}>
                      {p.quantity || 0}
                    </td>
                    <td>
                      <span className="status-badge" style={{ background: stockStatus.color }}>
                        {stockStatus.status}
                      </span>
                    </td>
                    <td style={{ color: expiryStatus.color, fontWeight: "bold" }}>
                      {p.expiryDate ? new Date(p.expiryDate).toLocaleDateString() : "N/A"}
                    </td>
                    <td>
                      {typeof p.productCategory === "string"
                        ? p.productCategory
                        : (p.productCategory?.name || "N/A")}
                    </td>
                    <td>
                      <button onClick={() => handleEdit(p)} className="btn-edit">Edit</button>
                      <button onClick={() => handleDelete(p._id)} className="btn-delete">Delete</button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: "20px", color: "#7f8c8d" }}>
                  No products found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductsPage;
