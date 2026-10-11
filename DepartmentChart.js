import React from "react";

const DepartmentChart = () => {
  const departments = [
    {
      name: "Computer Science",
      students: 320,
      percentage: 80,
    },
    {
      name: "Information Technology",
      students: 250,
      percentage: 63,
    },
    {
      name: "Electronics",
      students: 210,
      percentage: 53,
    },
    {
      name: "Mechanical",
      students: 180,
      percentage: 45,
    },
    {
      name: "Civil",
      students: 150,
      percentage: 38,
    },
  ];

  return (
    <div className="analytics-card department-card">

      <div className="chart-header">
        <div>
          <h3>Students by Department</h3>
          <p>Department-wise student distribution</p>
        </div>

        <div className="chart-icon">🎓</div>
      </div>

      <div className="department-chart">

        {departments.map((department) => (
          <div
            className="department-row"
            key={department.name}
          >

            <div className="department-info">
              <span>{department.name}</span>

              <strong>
                {department.students}
              </strong>
            </div>

            <div className="department-progress">
              <div
                className="department-progress-fill"
                style={{
                  width: `${department.percentage}%`,
                }}
              />
            </div>

          </div>
        ))}

      </div>

    </div>
  );
};

export default DepartmentChart;