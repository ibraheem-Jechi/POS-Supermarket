import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ProductsPage.css";

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);

  // Product form
  const [newProduct, setNewProduct] = useState({
    productName: "",
    productPrice: "",
    initialPrice: "",
    barcode: "",
    productCategory: "",
    supplierName: "",
    supplierContact: "",
    purchaseDate: "",
    batchInfo: "",
    quantity: "",
    minStockLevel: "10",
    expiryDate: "",
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch all data
  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/products");
      setProducts(res.data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/categories");
      setCategories(res.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/suppliers");
      setSuppliers(res.data);
    } catch (err) {
      console.error("Error fetching suppliers:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchSuppliers();
  }, []);

  // Add or update product
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        ...newProduct,
        productPrice: parseFloat(newProduct.productPrice),
        initialPrice: parseFloat(newProduct.initialPrice) || 0,
        quantity: parseInt(newProduct.quantity) || 0,
        minStockLevel: parseInt(newProduct.minStockLevel) || 10,
        expiryDate: newProduct.expiryDate ? new Date(newProduct.expiryDate) : null,
        purchaseDate: newProduct.purchaseDate ? new Date(newProduct.purchaseDate) : null,
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
        initialPrice: "",
        barcode: "",
        productCategory: "",
        supplierName: "",
        supplierContact: "",
        purchaseDate: "",
        batchInfo: "",
        quantity: "",
        minStockLevel: "10",
        expiryDate: "",
      });
      setEditingId(null);
      fetchProducts();
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      alert(`❌ Error saving product: ${msg}`);
    }
  };

  const handleEdit = (p) => {
    setNewProduct({
      productName: p.productName,
      productPrice: p.productPrice,
      initialPrice: p.initialPrice || "",
      barcode: p.barcode || "",
      quantity: p.quantity || 0,
      minStockLevel: p.minStockLevel || 10,
      productCategory:
        typeof p.productCategory === "string"
          ? p.productCategory
          : p.productCategory?.name || "",
      supplierName: p.supplierName || "",
      supplierContact: p.supplierContact || "",
      purchaseDate: p.purchaseDate ? p.purchaseDate.substring(0, 10) : "",
      batchInfo: p.batchInfo || "",
      expiryDate: p.expiryDate ? p.expiryDate.substring(0, 10) : "",
    });
    setEditingId(p._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`);
      fetchProducts();
      alert("✅ Product deleted");
    } catch {
      alert("❌ Error deleting product");
    }
  };

  // Auto fill contact info when selecting supplier
  const handleSupplierSelect = (e) => {
    const name = e.target.value;
    const selected = suppliers.find((s) => s.name === name);
    setNewProduct({
      ...newProduct,
      supplierName: name,
      supplierContact: selected ? selected.phone || selected.email || "" : "",
    });
  };

  // Filters
  const filtered = products.filter(
    (p) =>
      p.productName.toLowerCase().includes(search.toLowerCase()) ||
      (p.barcode || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.supplierName || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const currentItems = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Helpers
  const getStockStatus = (p) => {
    if (p.quantity === 0) return { status: "Out of Stock", color: "#e74c3c" };
    if (p.quantity <= (p.minStockLevel || 10)) return { status: "Low Stock", color: "#f39c12" };
    return { status: "In Stock", color: "#27ae60" };
  };

  const getExpiryStatus = (p) => {
    if (!p.expiryDate) return { status: "No Date", color: "#7f8c8d" };
    const diffDays = Math.ceil(
      (new Date(p.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays < 0) return { status: "Expired", color: "#e74c3c" };
    if (diffDays <= 7) return { status: "Expiring Soon", color: "#f39c12" };
    return { status: "Valid", color: "#27ae60" };
  };

  return (
    <div className="products-container">
      <h2>Products Management</h2>

      <input
        type="text"
        placeholder="Search by name, barcode, or supplier..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setCurrentPage(1);
        }}
        className="search-bar"
      />

      {/* ✅ Product Form */}
      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-group">
          <label>Product Name *</label>
          <input
            type="text"
            value={newProduct.productName}
            onChange={(e) =>
              setNewProduct({ ...newProduct, productName: e.target.value })
            }
            required
          />
        </div>

        <div className="form-group">
          <label>Initial Price (Cost) *</label>
          <input
            type="number"
            step="0.01"
            value={newProduct.initialPrice}
            onChange={(e) =>
              setNewProduct({ ...newProduct, initialPrice: e.target.value })
            }
            required
          />
        </div>

        <div className="form-group">
          <label>Selling Price *</label>
          <input
            type="number"
            step="0.01"
            value={newProduct.productPrice}
            onChange={(e) =>
              setNewProduct({ ...newProduct, productPrice: e.target.value })
            }
            required
          />
        </div>

        <div className="form-group">
          <label>Barcode</label>
          <input
            type="text"
            value={newProduct.barcode}
            onChange={(e) =>
              setNewProduct({ ...newProduct, barcode: e.target.value })
            }
          />
        </div>

        <div className="form-group">
          <label>Quantity *</label>
          <input
            type="number"
            value={newProduct.quantity}
            onChange={(e) =>
              setNewProduct({ ...newProduct, quantity: e.target.value })
            }
            required
          />
        </div>

        <div className="form-group">
          <label>Min Stock (default: 10)</label>
          <input
            type="number"
            value={newProduct.minStockLevel}
            onChange={(e) =>
              setNewProduct({ ...newProduct, minStockLevel: e.target.value })
            }
          />
        </div>

        <div className="form-group">
          <label>Expiry Date</label>
          <input
            type="date"
            value={newProduct.expiryDate}
            onChange={(e) =>
              setNewProduct({ ...newProduct, expiryDate: e.target.value })
            }
          />
        </div>

        <div className="form-group">
          <label>Purchase Date</label>
          <input
            type="date"
            value={newProduct.purchaseDate}
            onChange={(e) =>
              setNewProduct({ ...newProduct, purchaseDate: e.target.value })
            }
          />
        </div>

        <div className="form-group">
          <label>Supplier *</label>
          <select
            value={newProduct.supplierName}
            onChange={handleSupplierSelect}
            required
          >
            <option value="">-- Select Supplier --</option>
            {suppliers.map((s) => (
              <option key={s._id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Supplier Contact (auto)</label>
          <input
            type="text"
            value={newProduct.supplierContact}
            readOnly
            placeholder="Auto-filled"
          />
        </div>

        <div className="form-group">
          <label>Batch Info</label>
          <input
            type="text"
            value={newProduct.batchInfo}
            onChange={(e) =>
              setNewProduct({ ...newProduct, batchInfo: e.target.value })
            }
          />
        </div>

        <div className="form-group">
          <label>Category *</label>
          <select
            value={newProduct.productCategory}
            onChange={(e) =>
              setNewProduct({ ...newProduct, productCategory: e.target.value })
            }
            required
          >
            <option value="">-- Select Category --</option>
            {categories.map((c) => (
              <option key={c._id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group full-width">
          <button type="submit" className="btn-submit">
            {editingId ? "Update Product" : "Add Product"}
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
                  initialPrice: "",
                  barcode: "",
                  productCategory: "",
                  supplierName: "",
                  supplierContact: "",
                  purchaseDate: "",
                  batchInfo: "",
                  quantity: "",
                  minStockLevel: "10",
                  expiryDate: "",
                });
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* ✅ Products Table */}
      <div className="table-wrapper">
        <table className="products-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Barcode</th>
              <th>Initial Price</th>
              <th>Selling Price</th>
              <th>Profit</th>
              <th>Qty</th>
              <th>Status</th>
              <th>Supplier</th>
              <th>Purchase Date</th>
              <th>Batch</th>
              <th>Expiry</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((p) => {
              const stock = getStockStatus(p);
              const exp = getExpiryStatus(p);
              const profit = (p.productPrice - (p.initialPrice || 0)).toFixed(2);
              return (
                <tr key={p._id}>
                  <td>{p.productName}</td>
                  <td>{p.barcode || "N/A"}</td>
                  <td>${p.initialPrice?.toFixed(2) || "0.00"}</td>
                  <td>${p.productPrice?.toFixed(2) || "0.00"}</td>
                  <td style={{ color: "#16a34a", fontWeight: "bold" }}>${profit}</td>
                  <td style={{ color: stock.color }}>{p.quantity}</td>
                  <td>
                    <span
                      className="status-badge"
                      style={{ background: stock.color }}
                    >
                      {stock.status}
                    </span>
                  </td>
                  <td>
                    {p.supplierName || "N/A"}
                    <br />
                    <small style={{ color: "#6b7280" }}>
                      {p.supplierContact || ""}
                    </small>
                  </td>
                  <td>
                    {p.purchaseDate
                      ? new Date(p.purchaseDate).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td>{p.batchInfo || "-"}</td>
                  <td style={{ color: exp.color }}>
                    {p.expiryDate
                      ? new Date(p.expiryDate).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td>
                    {typeof p.productCategory === "string"
                      ? p.productCategory
                      : p.productCategory?.name || "N/A"}
                  </td>
                  <td>
                    <button onClick={() => handleEdit(p)} className="btn-edit">
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p._id)}
                      className="btn-delete"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
          >
            ⬅ Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={currentPage === i + 1 ? "active" : ""}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() =>
              setCurrentPage((p) => Math.min(p + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Next ➡
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
