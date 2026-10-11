import React from "react";
import "./StatCard.css";

const StatCard = ({ title, value, change, icon }) => {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <div className="stat-icon">{icon}</div>

        <span className="stat-change">{change}</span>
      </div>

      <div className="stat-info">
        <p>{title}</p>
        <h2>{value}</h2>
      </div>
    </div>
  );
};

export default StatCard;