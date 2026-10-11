import React from "react";

const AttendenceChart = () => {
  const attendanceData = [
    { day: "Mon", present: 85, absent: 15 },
    { day: "Tue", present: 92, absent: 8 },
    { day: "Wed", present: 78, absent: 22 },
    { day: "Thu", present: 95, absent: 5 },
    { day: "Fri", present: 88, absent: 12 },
    { day: "Sat", present: 82, absent: 18 },
  ];

  return (
    <div className="analytics-card attendance-card">
      <div className="chart-header">
        <div>
          <h3>Attendance Overview</h3>
          <p>Weekly student attendance</p>
        </div>

        <div className="chart-icon">📊</div>
      </div>

      <div className="attendance-chart">
        {attendanceData.map((item) => (
          <div className="attendance-column" key={item.day}>
            <div className="attendance-bars">
              <div
                className="attendance-present"
                style={{
                  height: `${item.present}%`,
                }}
                title={`Present: ${item.present}%`}
              />

              <div
                className="attendance-absent"
                style={{
                  height: `${item.absent}%`,
                }}
                title={`Absent: ${item.absent}%`}
              />
            </div>

            <span>{item.day}</span>
          </div>
        ))}
      </div>

      <div className="chart-legend">
        <div>
          <span className="legend-dot present" />
          Present
        </div>

        <div>
          <span className="legend-dot absent" />
          Absent
        </div>
      </div>  
    </div>
  );
};

export default AttendenceChart;