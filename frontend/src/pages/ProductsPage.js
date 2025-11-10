import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ProductsPage.css";
import { FaEdit, FaTrash } from "react-icons/fa";

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);

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

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ✅ Load Data
  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/products");
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/categories");
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/suppliers");
      setSuppliers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchSuppliers();
  }, []);

  // ✅ Save product
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...newProduct,
        initialPrice: parseFloat(newProduct.initialPrice) || 0,
        productPrice: parseFloat(newProduct.productPrice) || 0,
        quantity: parseInt(newProduct.quantity) || 0,
        minStockLevel: parseInt(newProduct.minStockLevel) || 10,
      };

      if (editingId) {
        await axios.put(`http://localhost:5000/api/products/${editingId}`, data);
        alert("✅ Updated successfully");
      } else {
        await axios.post("http://localhost:5000/api/products", data);
        alert("✅ Added successfully");
      }

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
      fetchProducts();
    } catch (err) {
      alert("❌ Error saving");
    }
  };

  const handleEdit = (p) => {
    setEditingId(p._id);
    setNewProduct({
      productName: p.productName,
      productPrice: p.productPrice,
      initialPrice: p.initialPrice,
      barcode: p.barcode,
      productCategory:
        typeof p.productCategory === "string"
          ? p.productCategory
          : p.productCategory?.name || "",
      supplierName: p.supplierName,
      supplierContact: p.supplierContact,
      purchaseDate: p.purchaseDate?.substring(0, 10) || "",
      batchInfo: p.batchInfo,
      quantity: p.quantity,
      minStockLevel: p.minStockLevel,
      expiryDate: p.expiryDate?.substring(0, 10) || "",
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete product?")) return;
    await axios.delete(`http://localhost:5000/api/products/${id}`);
    fetchProducts();
  };

  const filtered = products.filter(
    (p) =>
      p.productName.toLowerCase().includes(search.toLowerCase()) ||
      (p.barcode || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const currentItems = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="products-container">
      <h2>Products Management</h2>

      <input
        type="text"
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-bar"
      />

      <form onSubmit={handleSubmit} className="product-form">
        {[
          { label: "Product Name *", key: "productName", type: "text" },
          { label: "Cost Price *", key: "initialPrice", type: "number" },
          { label: "Selling Price *", key: "productPrice", type: "number" },
          { label: "Barcode", key: "barcode", type: "text" },
          { label: "Quantity *", key: "quantity", type: "number" },
          { label: "Min Stock", key: "minStockLevel", type: "number" },
          { label: "Expiry Date", key: "expiryDate", type: "date" },
          { label: "Purchase Date", key: "purchaseDate", type: "date" },
        ].map((inp) => (
          <div className="form-group" key={inp.key}>
            <label>{inp.label}</label>
            <input
              type={inp.type}
              value={newProduct[inp.key]}
              onChange={(e) =>
                setNewProduct({ ...newProduct, [inp.key]: e.target.value })
              }
              required={inp.label.includes("*")}
            />
          </div>
        ))}

        <div className="form-group">
          <label>Supplier *</label>
          <select
            value={newProduct.supplierName}
            onChange={(e) =>
              setNewProduct({
                ...newProduct,
                supplierName: e.target.value,
              })
            }
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

      <div className="table-wrapper">
        <table className="products-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Barcode</th>
              <th>Initial</th>
              <th>Selling</th>
              <th>Profit</th>
              <th>Qty</th>
              <th>Status</th>
              <th>Supplier</th>
              <th>Purchase</th>
              <th>Batch</th>
              <th>Expiry</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {currentItems.map((p) => (
              <tr key={p._id}>
                <td>{p.productName}</td>
                <td>{p.barcode || "N/A"}</td>
                <td>${p.initialPrice.toFixed(2)}</td>
                <td>${p.productPrice.toFixed(2)}</td>
                <td style={{ color: "#16a34a" }}>
                  ${(p.productPrice - p.initialPrice).toFixed(2)}
                </td>

                <td>{p.quantity}</td>

                <td>
                  <span
                    className="status-badge"
                    style={{
                      background:
                        p.quantity === 0
                          ? "#e74c3c"
                          : p.quantity <= 10
                          ? "#f39c12"
                          : "#27ae60",
                    }}
                  >
                    {p.quantity === 0
                      ? "Out"
                      : p.quantity <= 10
                      ? "Low"
                      : "In Stock"}
                  </span>
                </td>

                <td>{p.supplierName || "N/A"}</td>
                <td>{p.purchaseDate ? p.purchaseDate.substring(0, 10) : "N/A"}</td>
                <td>{p.batchInfo || "-"}</td>
                <td>{p.expiryDate ? p.expiryDate.substring(0, 10) : "N/A"}</td>
                <td>{p.productCategory}</td>

                <td className="action-icons">
                  <FaEdit
                    className="action-btn edit"
                    onClick={() => handleEdit(p)}
                  />
                  <FaTrash
                    className="action-btn delete"
                    onClick={() => handleDelete(p._id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            Prev
          </button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              className={currentPage === i + 1 ? "active" : ""}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
