import React, { useState } from "react";
import DailyReport from "./DailyReport";
import MonthlyReport from "./MonthlyReport";
import YearlyReport from "./YearlyReport";
import "./Reports.css";

function Reports({ user }) {
  const [activeTab, setActiveTab] = useState("daily");

  return (
    <div className="reports-container">
      <h2 className="page-title">📊 Reports Dashboard</h2>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={activeTab === "daily" ? "tab active" : "tab"}
          onClick={() => setActiveTab("daily")}
        >
          Daily
        </button>
        <button
          className={activeTab === "monthly" ? "tab active" : "tab"}
          onClick={() => setActiveTab("monthly")}
        >
          Monthly
        </button>
        <button
          className={activeTab === "yearly" ? "tab active" : "tab"}
          onClick={() => setActiveTab("yearly")}
        >
          Yearly
        </button>
      </div>

      {/* Render selected report */}
      <div className="tab-content">
        {activeTab === "daily" && <DailyReport user={user} />}
        {activeTab === "monthly" && <MonthlyReport user={user} />}
        {activeTab === "yearly" && <YearlyReport user={user} />}
      </div>
    </div>
  );
}

export default Reports;
