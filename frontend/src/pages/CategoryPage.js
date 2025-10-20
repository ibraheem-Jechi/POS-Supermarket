import React, { useEffect, useState } from "react";
import axios from "axios";
import "./CategoryPage.css";

const CategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

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
        categoryName: newCategory,
        description: newDescription,
      });

      setNewCategory("");
      setNewDescription("");
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

  const startEdit = (cat) => {
    setEditId(cat._id);
    setEditName(cat.categoryName);
    setEditDescription(cat.description || "");
  };

  const saveEdit = async () => {
    try {
      if (!editName.trim()) return alert("Category name cannot be empty");

      await axios.put(`http://localhost:5000/api/categories/${editId}`, {
        categoryName: editName,
        description: editDescription,
      });

      setEditId(null);
      fetchCategories();
    } catch (err) {
      console.error("Error updating category:", err);
      alert(err.response?.data?.message || err.message || "Failed to update category");
    }
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
        <input
          type="text"
          placeholder="Enter description"
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
        />
        <button type="submit">Add</button>
      </form>

      {/* List categories */}
      <ul className="category-list">
        {categories.map((cat) => (
          <li key={cat._id} className="category-item">
            {editId === cat._id ? (
              <div>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
                <input
                  type="text"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />
                <button onClick={saveEdit}>Save</button>
                <button onClick={() => setEditId(null)}>Cancel</button>
              </div>
            ) : (
              <div>
                <strong>{cat.categoryName}</strong> — {cat.description || "No description"}
                <div className="category-buttons">
                  <button onClick={() => startEdit(cat)}>Edit</button>
                  <button onClick={() => deleteCategory(cat._id)}>Delete</button>
                  <button onClick={() => alert(cat.description || "No description")}>
                    Description
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoryPage;
