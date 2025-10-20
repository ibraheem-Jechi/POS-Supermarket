import React, { useEffect, useState } from "react";
import axios from "axios";
import "./CategoryPage.css"; // 🟢 نستورد ملف CSS

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
    const res = await axios.get("http://localhost:5000/api/categories");
    setCategories(res.data);
  };

  const addCategory = async (e) => {
    e.preventDefault();
    await axios.post("http://localhost:5000/api/categories", {
      name: newCategory,
      description: newDescription,
    });
    setNewCategory("");
    setNewDescription("");
    fetchCategories();
  };

  const deleteCategory = async (id) => {
    await axios.delete(`http://localhost:5000/api/categories/${id}`);
    fetchCategories();
  };

  const startEdit = (cat) => {
    setEditId(cat._id);
    setEditName(cat.name);
    setEditDescription(cat.description || "");
  };

  const saveEdit = async () => {
    await axios.put(`http://localhost:5000/api/categories/${editId}`, {
      name: editName,
      description: editDescription,
    });
    setEditId(null);
    fetchCategories();
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
                <strong>{cat.name}</strong> — {cat.description || "No description"}
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
