import React, { useEffect, useState } from "react";
import axios from "axios";
import "./CategoryPage.css";

const CategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");

  const [expandedCategory, setExpandedCategory] = useState(null);
  const [categoryProducts, setCategoryProducts] = useState({}); // store products per category

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/categories");
      setCategories(res.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const addCategory = async (e) => {
    e.preventDefault();
    try {
      if (!newCategory.trim()) return alert("Category name is required");

      await axios.post("http://localhost:5000/api/categories", {
        name: newCategory,
      });

      setNewCategory("");
      fetchCategories();
    } catch (err) {
      console.error("Error adding category:", err);
      alert(err.response?.data?.message || err.message || "Failed to add category");
    }
  };

  const deleteCategory = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/categories/${id}`);
      fetchCategories();
    } catch (err) {
      console.error("Error deleting category:", err);
      alert("Failed to delete category");
    }
  };

  const toggleCategory = async (categoryName) => {
    if (expandedCategory === categoryName) {
      setExpandedCategory(null);
      return;
    }

    // Fetch products for this category ONLY if not already fetched
    if (!categoryProducts[categoryName]) {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/products?category=${encodeURIComponent(categoryName)}`
        );
        setCategoryProducts((prev) => ({ ...prev, [categoryName]: res.data }));
      } catch (err) {
        console.error("Error fetching products for category:", err);
        alert("Failed to fetch products");
        return;
      }
    }

    setExpandedCategory(categoryName);
  };

  return (
    <div className="category-container">
      <h1>📦 Categories</h1>

      {/* Add category form */}
      <form onSubmit={addCategory} className="category-form">
        <input
          type="text"
          placeholder="Enter category name"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        />
        <button type="submit">Add</button>
      </form>

      {/* List categories */}
      <ul className="category-list">
        {categories.map((cat) => {
          const catName = cat.name || cat.categoryName;
          const isExpanded = expandedCategory === catName;

          return (
            <li key={cat._id} className="category-item">
              <div
                className="category-header"
                style={{ cursor: "pointer" }}
                onClick={() => toggleCategory(catName)}
              >
                <span className="category-name">{catName} {isExpanded ? "▼" : "▶"}</span>
              </div>

              {/* Expanded products for this specific category ONLY */}
              {isExpanded && categoryProducts[catName] && categoryProducts[catName].length > 0 && (
                <ul className="products-list">
                  {categoryProducts[catName].map((p) => (
                    <li key={p._id}>
                      {p.productName} — ${p.productPrice.toFixed(2)}
                    </li>
                  ))}
                </ul>
              )}

              {/* Delete button at the bottom, centered */}
              <div style={{ display: "flex", justifyContent: "center", marginTop: "8px" }}>
                <button
                  style={{ backgroundColor: "crimson", color: "white", padding: "6px 12px", border: "none", borderRadius: "4px", cursor: "pointer" }}
                  onClick={() => deleteCategory(cat._id)}
                >
                  🗑 Delete
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default CategoryPage;
