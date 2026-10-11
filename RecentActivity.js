import React from "react";
import { Link } from "react-router-dom";
import "./RecentActivity.css";

const RecentActivity = () => {
  const activities = [
    {
      id: 1,
      title: "New college added",
      description: "IPS Academy was added successfully.",
      time: "10 min ago",
    },
    {
      id: 2,
      title: "Exam seating generated",
      description: "B.Tech Semester 5 seating arrangement created.",
      time: "25 min ago",
    },
    {
      id: 3,
      title: "New students imported",
      description: "120 students were added.",
      time: "1 hour ago",
    },
  ];

  return (
    <div className="recent-activity-card">

      <div className="activity-header">
        <div>
          <h3>Recent Activity</h3>
          <p>Latest updates from ArrangeX</p>
        </div>

        <Link to="/activities" className="view-all-btn">
          View All →
        </Link>
      </div>

      <div className="activity-list">
        {activities.map((activity) => (
          <div className="activity-item" key={activity.id}>
            <div className="activity-icon">
              ✓
            </div>

            <div className="activity-content">
              <h4>{activity.title}</h4>
              <p>{activity.description}</p>
            </div>

            <span className="activity-time">
              {activity.time}
            </span>
          </div>
        ))}
      </div>

    </div>
  );
};

export default RecentActivity;