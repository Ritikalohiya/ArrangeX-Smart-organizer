import React from "react";
import "./SeatingChart.css";

const SeatingChart = () => {
  const seats = [
    "occupied",
    "occupied",
    "available",
    "occupied",
    "available",
    "occupied",
    "occupied",
    "available",
    "occupied",
    "available",
    "occupied",
    "occupied",
    "available",
    "available",
    "occupied",
    "occupied",
    "available",
    "occupied",
    "available",
    "occupied",
  ];

  return (
    <div className="seating-chart-card">
      <div className="chart-header">
        <div>
          <h2>Seating Overview</h2>
          <p>Current exam hall seating status</p>
        </div>

        <button className="view-all-btn">View Details</button>
      </div>

      <div className="seat-summary">
        <div>
          <span className="summary-number">156</span>
          <span>Occupied</span>
        </div>

        <div>
          <span className="summary-number">44</span>
          <span>Available</span>
        </div>

        <div>
          <span className="summary-number">78%</span>
          <span>Utilization</span>
        </div>
      </div>

      <div className="seat-grid">
        {seats.map((seat, index) => (
          <div
            key={index}
            className={`seat ${seat}`}
            title={`Seat ${index + 1}`}
          >
            {index + 1}
          </div>
        ))}
      </div>

      <div className="seat-legend">
        <span>
          <i className="legend-box occupied"></i>
          Occupied
        </span>

        <span>
          <i className="legend-box available"></i>
          Available
        </span>
      </div>
    </div>
  );
};

export default SeatingChart;