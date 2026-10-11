
import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./Analytics.css";

const API_BASE = "http://localhost:5522/api";

const ENDPOINTS = {
  colleges: "/colleges",
  buildings: "/buildings",
  halls: "/halls",
  students: "/students",
  exams: "/exams",
  seating: "/seating",
};

const unwrap = (result, key) => {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.[key])) return result[key];
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.data?.[key])) return result.data[key];
  if (Array.isArray(result?.results)) return result.results;
  return [];
};

const getName = (item) =>
  item?.name ||
  item?.hallName ||
  item?.examName ||
  item?.collegeName ||
  item?.buildingName ||
  item?.title ||
  "Unnamed";

const getRelationName = (value) =>
  typeof value === "object" && value !== null
    ? getName(value)
    : value || "Not specified";

const getCapacity = (hall) =>
  Number(hall?.capacity ?? hall?.totalSeats ?? hall?.seatingCapacity ?? 0);

const getStatus = (item) =>
  String(item?.status || "Unspecified").toLowerCase();

const isCompleted = (item) =>
  ["completed", "complete", "finished"].includes(getStatus(item));

const isScheduled = (item) =>
  ["scheduled", "upcoming", "pending"].includes(getStatus(item));

const Analytics = () => {
  const [data, setData] = useState({
    colleges: [],
    buildings: [],
    halls: [],
    students: [],
    exams: [],
    seating: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [activeTab, setActiveTab] = useState("exams");

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError("");

    const token =
      localStorage.getItem("arrangex_token") ||
      localStorage.getItem("token");

    try {
      const entries = await Promise.all(
        Object.entries(ENDPOINTS).map(async ([key, endpoint]) => {
          const response = await fetch(`${API_BASE}${endpoint}`, {
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          });

          const body = await response.json().catch(() => ({}));

          if (!response.ok) {
            throw new Error(
              `${key}: ${body.message || `HTTP ${response.status}`}`
            );
          }

          return [key, unwrap(body, key)];
        })
      );

      const nextData = Object.fromEntries(entries);

      setData(nextData);
      setLastUpdated(new Date());
    } catch (err) {
      setError(
        `${err.message}. Check the backend, API routes, and login token.`
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const stats = useMemo(() => {
    const totalCapacity = data.halls.reduce(
      (sum, hall) => sum + getCapacity(hall),
      0
    );

    const assignedIds = new Set();
    let allocatedCount = 0;

    data.seating.forEach((record) => {
      const studentsInRecord =
        record.students ||
        record.allocations ||
        record.seats ||
        record.assignments ||
        [];

      if (Array.isArray(studentsInRecord)) {
        studentsInRecord.forEach((student) => {
          allocatedCount += 1;
          if (student?._id || student?.student) {
            assignedIds.add(
              student._id ||
                student.student?._id ||
                student.student
            );
          }
        });
      } else {
        allocatedCount += Number(
          record.allocatedStudents || record.assignedCount || 0
        );
      }
    });

    const allocatedStudents = Math.min(
      data.students.length,
      Math.max(
        allocatedCount,
        data.seating.reduce(
          (sum, item) =>
            sum +
            Number(item.allocatedStudents || item.assignedCount || 0),
          0
        )
      )
    );

    const completedExams = data.exams.filter(isCompleted).length;
    const scheduledExams = data.exams.filter(isScheduled).length;

    return {
      totalCapacity,
      completedExams,
      scheduledExams,
      allocatedStudents,
      unallocatedStudents: Math.max(
        0,
        data.students.length - allocatedStudents
      ),
      seatingRecords: data.seating.length,
      utilization: totalCapacity
        ? Math.min(
            100,
            Math.round((allocatedStudents / totalCapacity) * 100)
          )
        : 0,
    };
  }, [data]);

  const collegeBreakdown = useMemo(() => {
    return data.colleges.map((college) => {
      const id = college._id;
      const collegeStudents = data.students.filter((student) => {
        const relation = student.college?._id || student.college;
        return relation && id && String(relation) === String(id);
      }).length;

      const collegeHalls = data.halls.filter((hall) => {
        const relation = hall.college?._id || hall.college;
        return relation && id && String(relation) === String(id);
      }).length;

      return {
        id: id || getName(college),
        name: getName(college),
        students: collegeStudents,
        halls: collegeHalls,
      };
    });
  }, [data]);

  const examBreakdown = useMemo(() => {
    return data.exams.map((exam) => ({
      id: exam._id || `${getName(exam)}-${exam.date || ""}`,
      name: getName(exam),
      code: exam.code || exam.examCode || "—",
      date: exam.date
        ? new Date(exam.date).toLocaleDateString()
        : "—",
      status: exam.status || "Unspecified",
      college: getRelationName(exam.college),
    }));
  }, [data.exams]);

  const hallBreakdown = useMemo(() => {
    return data.halls.map((hall) => ({
      id: hall._id || getName(hall),
      name: getName(hall),
      code: hall.code || hall.hallCode || hall.hallNumber || "—",
      building: getRelationName(hall.building),
      capacity: getCapacity(hall),
      status: hall.status || "Available",
    }));
  }, [data.halls]);

  const maxStudents = Math.max(
    1,
    ...collegeBreakdown.map((item) => item.students)
  );

  const maxCapacity = Math.max(
    1,
    ...hallBreakdown.map((item) => item.capacity)
  );

  const statCards = [
    { label: "Total Colleges", value: data.colleges.length, icon: "▦" },
    { label: "Total Buildings", value: data.buildings.length, icon: "▤" },
    { label: "Total Halls", value: data.halls.length, icon: "⌂" },
    { label: "Total Students", value: data.students.length, icon: "♙" },
    { label: "Total Exams", value: data.exams.length, icon: "▣" },
    { label: "Seating Records", value: data.seating.length, icon: "▥" },
  ];

  return (
    <main className="analytics-page">
      <header className="an-header">
        <div>
          <span className="an-eyebrow">ARRANGEX / REPORTING</span>
          <h1>Analytics Overview</h1>
          <p>Insights across colleges, halls, exams and seating.</p>
          {lastUpdated && (
            <small>
              Last updated: {lastUpdated.toLocaleTimeString()}
            </small>
          )}
        </div>

        <button
          className="an-refresh"
          onClick={fetchAnalytics}
          disabled={loading}
        >
          ↻ {loading ? "Loading..." : "Refresh Data"}
        </button>
      </header>

      {error && (
        <div className="an-error">
          <strong>Could not load all analytics data.</strong>
          <p>{error}</p>
          <button onClick={fetchAnalytics}>Try Again</button>
        </div>
      )}

      <section className="an-stat-grid">
        {statCards.map((item) => (
          <article className="an-stat-card" key={item.label}>
            <div className="an-stat-icon">{item.icon}</div>
            <div>
              <p>{item.label}</p>
              <h2>{loading ? "—" : item.value.toLocaleString()}</h2>
            </div>
          </article>
        ))}
      </section>

      <section className="an-stat-grid an-stat-grid-secondary">
        <article className="an-summary-card">
          <p>Total Hall Capacity</p>
          <h2>{loading ? "—" : stats.totalCapacity.toLocaleString()}</h2>
          <span>Seats across registered halls</span>
        </article>
        <article className="an-summary-card">
          <p>Scheduled Exams</p>
          <h2>{loading ? "—" : stats.scheduledExams}</h2>
          <span>Based on exam status</span>
        </article>
        <article className="an-summary-card">
          <p>Completed Exams</p>
          <h2>{loading ? "—" : stats.completedExams}</h2>
          <span>Based on exam status</span>
        </article>
        <article className="an-summary-card">
          <p>Seat Utilization</p>
          <h2>{loading ? "—" : `${stats.utilization}%`}</h2>
          <span>Estimated from available records</span>
        </article>
      </section>

      <section className="an-panel">
        <div className="an-panel-heading">
          <div>
            <h2>College-wise Overview</h2>
            <p>Students and halls linked to each college.</p>
          </div>
        </div>

        {loading ? (
          <p className="an-message">Loading college analytics...</p>
        ) : collegeBreakdown.length === 0 ? (
          <p className="an-message">No college data available.</p>
        ) : (
          <div className="an-bar-list">
            {collegeBreakdown.map((college) => (
              <div className="an-bar-item" key={college.id}>
                <div className="an-bar-label">
                  <strong>{college.name}</strong>
                  <span>
                    {college.students} students · {college.halls} halls
                  </span>
                </div>
                <div className="an-bar-track">
                  <div
                    className="an-bar-fill"
                    style={{
                      width: `${(college.students / maxStudents) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="an-panel">
        <div className="an-panel-heading">
          <div>
            <h2>Detailed Reports</h2>
            <p>Review the records retrieved from your database.</p>
          </div>
        </div>

        <div className="an-tabs">
          {["exams", "halls", "buildings", "students", "seating"].map(
            (tab) => (
              <button
                key={tab}
                className={activeTab === tab ? "an-tab active" : "an-tab"}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            )
          )}
        </div>

        {loading ? (
          <p className="an-message">Loading report...</p>
        ) : (
          <div className="an-table-wrap">
            {activeTab === "exams" && (
              <table className="an-table">
                <thead>
                  <tr>
                    <th>Exam</th>
                    <th>Code</th>
                    <th>Date</th>
                    <th>College</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {examBreakdown.map((exam) => (
                    <tr key={exam.id}>
                      <td>{exam.name}</td>
                      <td>{exam.code}</td>
                      <td>{exam.date}</td>
                      <td>{exam.college}</td>
                      <td>
                        <span className="an-status">{exam.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === "halls" && (
              <table className="an-table">
                <thead>
                  <tr>
                    <th>Hall</th>
                    <th>Code</th>
                    <th>Building</th>
                    <th>Capacity</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {hallBreakdown.map((hall) => (
                    <tr key={hall.id}>
                      <td>{hall.name}</td>
                      <td>{hall.code}</td>
                      <td>{hall.building}</td>
                      <td>{hall.capacity}</td>
                      <td>
                        <span className="an-status">{hall.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === "buildings" && (
              <table className="an-table">
                <thead>
                  <tr>
                    <th>Building</th>
                    <th>Code</th>
                    <th>College</th>
                    <th>Floor</th>
                  </tr>
                </thead>
                <tbody>
                  {data.buildings.map((building, index) => (
                    <tr key={building._id || index}>
                      <td>{getName(building)}</td>
                      <td>{building.code || "—"}</td>
                      <td>{getRelationName(building.college)}</td>
                      <td>{building.floor ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === "students" && (
              <table className="an-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Roll Number</th>
                    <th>Enrollment</th>
                    <th>College</th>
                  </tr>
                </thead>
                <tbody>
                  {data.students.map((student, index) => (
                    <tr key={student._id || index}>
                      <td>{getName(student)}</td>
                      <td>
                        {student.rollNumber || student.rollNo || "—"}
                      </td>
                      <td>{student.enrollmentNumber || "—"}</td>
                      <td>{getRelationName(student.college)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === "seating" && (
              <table className="an-table">
                <thead>
                  <tr>
                    <th>Arrangement</th>
                    <th>Exam</th>
                    <th>Hall</th>
                    <th>Allocated Students</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.seating.map((record, index) => {
                    const allocations =
                      record.students ||
                      record.allocations ||
                      record.seats ||
                      record.assignments;

                    const count = Array.isArray(allocations)
                      ? allocations.length
                      : Number(
                          record.allocatedStudents ||
                            record.assignedCount ||
                            0
                        );

                    return (
                      <tr key={record._id || index}>
                        <td>{getName(record)}</td>
                        <td>{getRelationName(record.exam)}</td>
                        <td>{getRelationName(record.hall)}</td>
                        <td>{count}</td>
                        <td>
                          <span className="an-status">
                            {record.status || "Recorded"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {activeTab === "exams" && examBreakdown.length === 0 && (
              <p className="an-message">No exams found.</p>
            )}
            {activeTab === "halls" && hallBreakdown.length === 0 && (
              <p className="an-message">No halls found.</p>
            )}
            {activeTab === "buildings" && data.buildings.length === 0 && (
              <p className="an-message">No buildings found.</p>
            )}
            {activeTab === "students" && data.students.length === 0 && (
              <p className="an-message">No students found.</p>
            )}
            {activeTab === "seating" && data.seating.length === 0 && (
              <p className="an-message">No seating records found.</p>
            )}
          </div>
        )}
      </section>
    </main>
  );
};

export default Analytics;
