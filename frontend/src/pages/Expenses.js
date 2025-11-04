import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({
    category: "",
    description: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    addedBy: localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user")).username
      : "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterMonth, setFilterMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [filterCategory, setFilterCategory] = useState("");
  const [summary, setSummary] = useState([]);
  const [editId, setEditId] = useState(null);

  // === Fetch all expenses ===
  const loadExpenses = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/expenses");
      if (!res.ok) throw new Error("Failed to fetch expenses");
      const data = await res.json();
      setExpenses(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // === Fetch monthly summary ===
  const loadSummary = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/expenses/summary/monthly");
      if (!res.ok) throw new Error("Failed to fetch summary");
      const data = await res.json();
      const formatted = data.map((item) => ({
        month: `${item._id.year}-${String(item._id.month).padStart(2, "0")}`,
        total: item.totalAmount,
      }));
      setSummary(formatted);
    } catch (err) {
      console.error(err);
    }
  };

  // === Add or Update Expense ===
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category || !form.amount) return alert("Please fill all required fields");

    try {
      setLoading(true);
      const method = editId ? "PUT" : "POST";
      const url = editId
        ? `http://localhost:5000/api/expenses/${editId}`
        : "http://localhost:5000/api/expenses";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to save expense");
      setForm({
        category: "",
        description: "",
        amount: "",
        date: new Date().toISOString().split("T")[0],
        addedBy: form.addedBy,
      });
      setEditId(null);
      await loadExpenses();
      await loadSummary();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // === Delete Expense ===
  const deleteExpense = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    try {
      await fetch(`http://localhost:5000/api/expenses/${id}`, { method: "DELETE" });
      await loadExpenses();
      await loadSummary();
    } catch (err) {
      console.error(err);
    }
  };

  // === Edit Expense ===
  const editExpense = (exp) => {
    setForm({
      category: exp.category,
      description: exp.description,
      amount: exp.amount,
      date: new Date(exp.date).toISOString().split("T")[0],
      addedBy: exp.addedBy,
    });
    setEditId(exp._id);
  };

  // === Filtered Expenses ===
  const filtered = expenses.filter((e) => {
    const d = new Date(e.date);
    const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const monthMatch = monthStr === filterMonth;
    const catMatch = filterCategory ? e.category === filterCategory : true;
    return monthMatch && catMatch;
  });

  const totalMonth = filtered.reduce((sum, e) => sum + e.amount, 0);

  useEffect(() => {
    loadExpenses();
    loadSummary();
  }, []);

  const categories = [
    "Rent",
    "Utilities",
    "Salaries",
    "Maintenance",
    "Suppliers",
    "Miscellaneous",
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">💸 Expenses Management</h1>

      {/* === Add/Edit Form === */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6"
      >
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          className="border p-2 rounded"
        />
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="border p-2 rounded"
        >
          <option value="">Select Category</option>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Amount"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) })}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="border p-2 rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          {editId ? "Update" : "Add"} Expense
        </button>
      </form>

      {/* === Filters === */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div>
          <label className="mr-2 font-semibold">Filter by Month:</label>
          <input
            type="month"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="border rounded p-1"
          />
        </div>
        <div>
          <label className="mr-2 font-semibold">Filter by Category:</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border rounded p-1"
          >
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* === Monthly Total === */}
      <div className="mb-6 text-lg font-semibold text-gray-700">
        🗓 Total for {filterMonth}:{" "}
        <span className="text-blue-700">${totalMonth.toFixed(2)}</span>
      </div>

      {/* === Table === */}
      <table className="w-full border border-gray-300 mb-10">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2 text-left">Date</th>
            <th className="border p-2 text-left">Category</th>
            <th className="border p-2 text-left">Description</th>
            <th className="border p-2 text-right">Amount ($)</th>
            <th className="border p-2 text-left">Added By</th>
            <th className="border p-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center p-3 text-gray-500">
                No expenses found
              </td>
            </tr>
          ) : (
            filtered.map((e) => (
              <tr key={e._id}>
                <td className="border p-2">{new Date(e.date).toLocaleDateString()}</td>
                <td className="border p-2">{e.category}</td>
                <td className="border p-2">{e.description}</td>
                <td className="border p-2 text-right">{e.amount.toFixed(2)}</td>
                <td className="border p-2">{e.addedBy}</td>
                <td className="border p-2 text-center space-x-2">
                  <button
                    onClick={() => editExpense(e)}
                    className="bg-yellow-400 text-white px-2 py-1 rounded hover:bg-yellow-500"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteExpense(e._id)}
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* === Summary Chart === */}
      <h2 className="text-xl font-bold mb-4">📊 Monthly Expense Summary</h2>
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={summary} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
