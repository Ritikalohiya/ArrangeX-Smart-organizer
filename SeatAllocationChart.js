import React from "react";

const SeatAllocationChart = () => {
  const totalSeats = 400;
  const allocatedSeats = 320;
  const availableSeats = 80;

  const allocatedPercentage =
    (allocatedSeats / totalSeats) * 100;

  const availablePercentage =
    (availableSeats / totalSeats) * 100;

  return (
    <div className="analytics-card seat-allocation-card">
      <div className="chart-header">
        <div>
          <h3>Seat Allocation</h3>
          <p>Current examination seating</p>
        </div>

        <div className="chart-icon">💺</div>
      </div>

      <div className="seat-chart-wrapper">

        <div
          className="seat-donut"
          style={{
            background: `conic-gradient(
              #2563eb 0% ${allocatedPercentage}%,
              #e5e7eb ${allocatedPercentage}% 100%
            )`,
          }}
        >
          <div className="seat-donut-inner">
            <strong>{allocatedPercentage}%</strong>
            <span>Allocated</span>
          </div>
        </div>

      </div>

      <div className="seat-summary">

        <div className="seat-summary-item">
          <span className="legend-dot allocated" />

          <div>
            <strong>{allocatedSeats}</strong>
            <small>Allocated</small>
          </div>
        </div>

        <div className="seat-summary-item">
          <span className="legend-dot available" />

          <div>
            <strong>{availableSeats}</strong>
            <small>Available</small>
          </div>
        </div>

        <div className="seat-summary-item">
          <span className="legend-dot total" />

          <div>
            <strong>{totalSeats}</strong>
            <small>Total Seats</small>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SeatAllocationChart;