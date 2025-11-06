import React, { useState } from "react";
import DailyReport from "./DailyReport";
import MonthlyReport from "./MonthlyReport";
import YearlyReport from "./YearlyReport";
import "./Reports.css";

function Reports({ user }) {
  const [activeTab, setActiveTab] = useState("daily");

  const tabs = [
    { id: "daily", label: "📅 Daily" },
    { id: "monthly", label: "📈 Monthly" },
    { id: "yearly", label: "📊 Yearly" },
  ];

  return (
    <div className="reports-wrapper">
      <div className="reports-header">
        <h2>Reports Dashboard</h2>
        <p className="subtitle">
          View detailed insights of your sales, expenses, and profits.
        </p>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Report Content */}
      <div className="report-content">
        {activeTab === "daily" && <DailyReport user={user} />}
        {activeTab === "monthly" && <MonthlyReport user={user} />}
        {activeTab === "yearly" && <YearlyReport user={user} />}
      </div>
    </div>
  );
}

export default Reports;
