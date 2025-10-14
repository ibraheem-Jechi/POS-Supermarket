import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function Dashboard() {
  const [data, setData] = useState({ totalRevenue: 0, totalCost: 0, totalProfit: 0 });

  useEffect(() => {
    axios.get('http://localhost:5000/api/dashboard/finance')
      .then(res => setData(res.data))
      .catch(() => setData({ totalRevenue: 0, totalCost: 0, totalProfit: 0 }));
  }, []);

  const chartData = [
    { name: 'Revenue', value: data.totalRevenue },
    { name: 'Cost', value: data.totalCost },
    { name: 'Profit', value: data.totalProfit }
  ];

  return (
    <div>
      <h2>Finance Dashboard</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#4CAF50" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default Dashboard;
