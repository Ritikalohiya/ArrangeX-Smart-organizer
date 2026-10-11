import React from "react";
import "./Dashboard.css";


import StatsGrid from "./StatsGrid";
import SeatingChart from "./SeatingChart";
import RecentActivity from "./RecentActivity";

const Dashboard = () => {
  return (
    <div className="dashboard-page">
      

      <StatsGrid />

      <div className="dashboard-content-grid">
        <SeatingChart />
        <RecentActivity />
      </div>
    </div>
  );
};

export default Dashboard;