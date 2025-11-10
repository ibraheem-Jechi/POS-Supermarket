// src/pages/Wins.js
import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function Wins() {
  const [data, setData] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:5000/api/profit/monthly?year=${year}`);
        if (!res.ok) throw new Error("Failed to load profit data");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [year]);

  if (loading) return <div className="p-4">Loading…</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">🏆 Monthly Profit Overview</h1>

      {/* Year selector */}
      <div className="mb-4">
        <label className="font-semibold mr-2">Select Year:</label>
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="border p-2 rounded w-24"
        />
      </div>

      {/* Chart */}
      <div style={{ width: "100%", height: 400 }}>
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="totalSales" stroke="#16a34a" name="Sales" />
            <Line type="monotone" dataKey="totalExpenses" stroke="#dc2626" name="Expenses" />
            <Line type="monotone" dataKey="profit" stroke="#2563eb" name="Profit" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Table */}
      <table className="w-full border border-gray-300 mt-6">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2 text-left">Month</th>
            <th className="border p-2 text-right">Sales ($)</th>
            <th className="border p-2 text-right">Expenses ($)</th>
            <th className="border p-2 text-right">Profit ($)</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.month}>
              <td className="border p-2">{row.month}</td>
              <td className="border p-2 text-right">{row.totalSales.toFixed(2)}</td>
              <td className="border p-2 text-right">{row.totalExpenses.toFixed(2)}</td>
              <td
                className={`border p-2 text-right ${
                  row.profit >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {row.profit.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
