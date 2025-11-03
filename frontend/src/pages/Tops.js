import React, { useEffect, useState } from "react";

export default function Tops() {
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  const [products, setProducts] = useState([]);
  const [cashiers, setCashiers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [prodRes, cashRes, catRes] = await Promise.all([
          fetch(`http://localhost:5000/api/stats/top-products/monthly?month=${month}`),
          fetch(`http://localhost:5000/api/stats/top-cashiers/monthly?month=${month}`),
          fetch(`http://localhost:5000/api/stats/top-categories/monthly?month=${month}`),
        ]);

        if (!prodRes.ok || !cashRes.ok || !catRes.ok)
          throw new Error("Failed to fetch stats");

        const prodJson = await prodRes.json();
        const cashJson = await cashRes.json();
        const catJson = await catRes.json();

        setProducts(prodJson.topProducts || []);
        setCashiers(cashJson.topCashiers || []);
        setCategories(catJson.topCategories || []);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [month]);

  if (loading) return <div className="p-4">Loading…</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">TOPS – {month}</h1>

      <div className="mb-6">
        <label className="mr-2 font-semibold">Select Month: </label>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="border rounded px-2 py-1"
        />
      </div>

      {/* === Top Products === */}
      <h2 className="text-xl font-semibold mb-2">🏆 Top 10 Products</h2>
      <table className="w-full border border-gray-300 mb-8">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2 text-left">#</th>
            <th className="border p-2 text-left">Product</th>
            <th className="border p-2 text-right">Units Sold</th>
            <th className="border p-2 text-right">Revenue ($)</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr>
              <td colSpan="4" className="p-3 text-center text-gray-500">
                No product sales
              </td>
            </tr>
          ) : (
            products.map((p, i) => (
              <tr key={p.productId}>
                <td className="border p-2">{i + 1}</td>
                <td className="border p-2">{p.name || "Unknown"}</td>
                <td className="border p-2 text-right">{p.unitsSold}</td>
                <td className="border p-2 text-right">{p.revenue?.toFixed(2)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* === Top Cashiers === */}
      <h2 className="text-xl font-semibold mb-2">💰 Top 3 Cashiers</h2>
      <table className="w-full border border-gray-300 mb-8">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2 text-left">#</th>
            <th className="border p-2 text-left">Cashier</th>
            <th className="border p-2 text-right">Total Sales ($)</th>
          </tr>
        </thead>
        <tbody>
          {cashiers.length === 0 ? (
            <tr>
              <td colSpan="3" className="p-3 text-center text-gray-500">
                No cashier data
              </td>
            </tr>
          ) : (
            cashiers.map((c, i) => (
              <tr key={c.cashier}>
                <td className="border p-2">{i + 1}</td>
                <td className="border p-2">{c.cashier}</td>
                <td className="border p-2 text-right">{c.total.toFixed(2)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* === Top Categories === */}
      <h2 className="text-xl font-semibold mb-2">📦 Top 5 Categories</h2>
      <table className="w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2 text-left">#</th>
            <th className="border p-2 text-left">Category</th>
            <th className="border p-2 text-right">Units Sold</th>
            <th className="border p-2 text-right">Revenue ($)</th>
          </tr>
        </thead>
        <tbody>
          {categories.length === 0 ? (
            <tr>
              <td colSpan="4" className="p-3 text-center text-gray-500">
                No category sales
              </td>
            </tr>
          ) : (
            categories.map((c, i) => (
              <tr key={c.category || i}>
                <td className="border p-2">{i + 1}</td>
                <td className="border p-2">{c.category || "Unknown"}</td>
                <td className="border p-2 text-right">{c.totalUnits}</td>
                <td className="border p-2 text-right">
                  {c.totalRevenue.toFixed(2)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
