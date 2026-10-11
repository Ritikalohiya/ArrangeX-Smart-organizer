import React from "react";
import "./StatsGrid.css";

import StatCard from "./StatCard";

const StatsGrid = () => {
  const stats = [
    {
      title: "Total Colleges",
      value: "24",
      change: "+12%",
      icon: "🏫",
    },
    {
      title: "Total Campuses",
      value: "48",
      change: "+8%",
      icon: "🏢",
    },
    {
      title: "Total Students",
      value: "12,450",
      change: "+15%",
      icon: "👨‍🎓",
    },
    {
      title: "Total Exams",
      value: "186",
      change: "+10%",
      icon: "📝",
    },
  ];

  return (
    <div className="stats-grid">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          change={stat.change}
          icon={stat.icon}
        />
      ))}
    </div>
  );
};

export default StatsGrid;