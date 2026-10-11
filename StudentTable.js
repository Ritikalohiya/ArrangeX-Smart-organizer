import React, { useMemo, useState } from "react";
import "./StudentTable.css";

const StudentTable = () => {
  const [searchText, setSearchText] = useState("");
  const [courseFilter, setCourseFilter] = useState("All Courses");
  const [sectionFilter, setSectionFilter] = useState("All Sections");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [selectedStudents, setSelectedStudents] = useState([]);

  const students = [
    {
      id: "STU001",
      name: "Ritika Lohiya",
      email: "ritika@example.com",
      phone: "9876543210",
      college: "IPS Academy",
      course: "CSIT",
      section: "A",
      semester: "6th",
      rollNo: "CSIT001",
      status: "Active",
      examCount: 6,
    },
    {
      id: "STU002",
      name: "Aarav Sharma",
      email: "aarav@example.com",
      phone: "9876543211",
      college: "Medicaps University",
      course: "Computer Science",
      section: "A",
      semester: "6th",
      rollNo: "CSE002",
      status: "Active",
      examCount: 5,
    },
    {
      id: "STU003",
      name: "Priya Verma",
      email: "priya@example.com",
      phone: "9876543212",
      college: "Acropolis Institute",
      course: "Information Technology",
      section: "B",
      semester: "6th",
      rollNo: "IT003",
      status: "Active",
      examCount: 7,
    },
    {
      id: "STU004",
      name: "Rahul Singh",
      email: "rahul@example.com",
      phone: "9876543213",
      college: "Sage University",
      course: "CSIT",
      section: "B",
      semester: "4th",
      rollNo: "CSIT004",
      status: "Active",
      examCount: 4,
    },
    {
      id: "STU005",
      name: "Ananya Patel",
      email: "ananya@example.com",
      phone: "9876543214",
      college: "SVVV University",
      course: "Computer Science",
      section: "A",
      semester: "6th",
      rollNo: "CSE005",
      status: "Inactive",
      examCount: 3,
    },
    {
      id: "STU006",
      name: "Karan Mehta",
      email: "karan@example.com",
      phone: "9876543215",
      college: "IPS Academy",
      course: "Information Technology",
      section: "C",
      semester: "4th",
      rollNo: "IT006",
      status: "Active",
      examCount: 5,
    },
    {
      id: "STU007",
      name: "Sneha Gupta",
      email: "sneha@example.com",
      phone: "9876543216",
      college: "Medicaps University",
      course: "CSIT",
      section: "A",
      semester: "6th",
      rollNo: "CSIT007",
      status: "Active",
      examCount: 6,
    },
    {
      id: "STU008",
      name: "Vikram Joshi",
      email: "vikram@example.com",
      phone: "9876543217",
      college: "Acropolis Institute",
      course: "Computer Science",
      section: "B",
      semester: "4th",
      rollNo: "CSE008",
      status: "Active",
      examCount: 4,
    },
  ];

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const search = searchText.toLowerCase();

      const matchesSearch =
        student.name.toLowerCase().includes(search) ||
        student.id.toLowerCase().includes(search) ||
        student.rollNo.toLowerCase().includes(search) ||
        student.email.toLowerCase().includes(search) ||
        student.college.toLowerCase().includes(search);

      const matchesCourse =
        courseFilter === "All Courses" ||
        student.course === courseFilter;

      const matchesSection =
        sectionFilter === "All Sections" ||
        student.section === sectionFilter;

      const matchesStatus =
        statusFilter === "All Status" ||
        student.status === statusFilter;

      return (
        matchesSearch &&
        matchesCourse &&
        matchesSection &&
        matchesStatus
      );
    });
  }, [
    searchText,
    courseFilter,
    sectionFilter,
    statusFilter,
  ]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedStudents(
        filteredStudents.map((student) => student.id)
      );
    } else {
      setSelectedStudents([]);
    }
  };

  const handleSelectStudent = (id) => {
    setSelectedStudents((prev) =>
      prev.includes(id)
        ? prev.filter((studentId) => studentId !== id)
        : [...prev, id]
    );
  };

  const handleExport = () => {
    const headers = [
      "Student ID",
      "Name",
      "Email",
      "Phone",
      "College",
      "Course",
      "Section",
      "Semester",
      "Roll No",
      "Status",
    ];

    const rows = filteredStudents.map((student) => [
      student.id,
      student.name,
      student.email,
      student.phone,
      student.college,
      student.course,
      student.section,
      student.semester,
      student.rollNo,
      student.status,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((value) => `"${value}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "arrangex-students.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const handleAddStudent = () => {
    alert("Add Student form will open");
  };

  const handleView = (student) => {
    alert(
      `Student: ${student.name}\nID: ${student.id}\nCourse: ${student.course}`
    );
  };

  const handleEdit = (student) => {
    alert(`Edit ${student.name}`);
  };

  const handleDelete = (student) => {
    const confirmed = window.confirm(
      `Delete ${student.name}?`
    );

    if (confirmed) {
      alert("Delete functionality will be connected to backend.");
    }
  };

  return (
    <div className="student-page">

      {/* Header */}
      <div className="student-page-header">
        <div>
          <div className="student-breadcrumb">
            Dashboard <span>/</span> Students
          </div>

          <h1>Student Management</h1>

          <p>
            Manage students, courses, sections and
            examination records.
          </p>
        </div>

        <div className="student-header-actions">
          <button
            className="student-export-btn"
            onClick={handleExport}
          >
            ↓ Export
          </button>

          <button
            className="student-add-btn"
            onClick={handleAddStudent}
          >
            ＋ Add Student
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="student-summary">

        <div className="student-summary-card">
          <div className="student-summary-icon blue">
            👨‍🎓
          </div>

          <div>
            <span>Total Students</span>
            <strong>12,450</strong>
            <small>Registered students</small>
          </div>
        </div>

        <div className="student-summary-card">
          <div className="student-summary-icon green">
            ✓
          </div>

          <div>
            <span>Active Students</span>
            <strong>11,820</strong>
            <small>Currently active</small>
          </div>
        </div>

        <div className="student-summary-card">
          <div className="student-summary-icon orange">
            🎓
          </div>

          <div>
            <span>Courses</span>
            <strong>24</strong>
            <small>Registered courses</small>
          </div>
        </div>

        <div className="student-summary-card">
          <div className="student-summary-icon purple">
            📝
          </div>

          <div>
            <span>Exam Eligible</span>
            <strong>11,540</strong>
            <small>Eligible students</small>
          </div>
        </div>

      </div>

      {/* Main Table Card */}
      <div className="student-table-card">

        {/* Toolbar */}
        <div className="student-toolbar">

          <div className="student-toolbar-title">
            <h2>Students</h2>
            <span>
              {filteredStudents.length} students found
            </span>
          </div>

          <div className="student-filters">

            <div className="student-search">
              <span>🔍</span>

              <input
                type="text"
                placeholder="Search students..."
                value={searchText}
                onChange={(e) =>
                  setSearchText(e.target.value)
                }
              />

              {searchText && (
                <button
                  type="button"
                  onClick={() => setSearchText("")}
                >
                  ×
                </button>
              )}
            </div>

            <select
              value={courseFilter}
              onChange={(e) =>
                setCourseFilter(e.target.value)
              }
            >
              <option>All Courses</option>
              <option>CSIT</option>
              <option>Computer Science</option>
              <option>Information Technology</option>
            </select>

            <select
              value={sectionFilter}
              onChange={(e) =>
                setSectionFilter(e.target.value)
              }
            >
              <option>All Sections</option>
              <option>A</option>
              <option>B</option>
              <option>C</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
            >
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>

          </div>

        </div>

        {/* Selection Bar */}
        {selectedStudents.length > 0 && (
          <div className="student-selection-bar">
            <span>
              {selectedStudents.length} student
              {selectedStudents.length > 1
                ? "s"
                : ""}{" "}
              selected
            </span>

            <div>
              <button type="button">
                Export Selected
              </button>

              <button type="button">
                Assign Exam
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="student-table-wrapper">

          <table className="student-table">

            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={
                      filteredStudents.length > 0 &&
                      selectedStudents.length ===
                        filteredStudents.length
                    }
                    onChange={handleSelectAll}
                  />
                </th>

                <th>STUDENT</th>
                <th>COLLEGE</th>
                <th>COURSE</th>
                <th>SECTION</th>
                <th>ROLL NO.</th>
                <th>EXAMS</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>

            <tbody>

              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.id}>

                    <td>
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(
                          student.id
                        )}
                        onChange={() =>
                          handleSelectStudent(student.id)
                        }
                      />
                    </td>

                    {/* Student */}
                    <td>
                      <div className="student-info">

                        <div className="student-avatar">
                          {student.name
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <strong>
                            {student.name}
                          </strong>

                          <span>
                            {student.id}
                          </span>

                          <small>
                            {student.email}
                          </small>
                        </div>

                      </div>
                    </td>

                    {/* College */}
                    <td>
                      <div className="college-info">
                        <strong>
                          {student.college}
                        </strong>

                        <span>
                          Main Campus
                        </span>
                      </div>
                    </td>

                    {/* Course */}
                    <td>
                      <span className="course-badge">
                        {student.course}
                      </span>
                    </td>

                    {/* Section */}
                    <td>
                      <span className="section-badge">
                        Section {student.section}
                      </span>
                    </td>

                    {/* Roll */}
                    <td>
                      <strong className="roll-number">
                        {student.rollNo}
                      </strong>

                      <span className="semester-text">
                        {student.semester} Semester
                      </span>
                    </td>

                    {/* Exams */}
                    <td>
                      <div className="exam-count">
                        <strong>
                          {student.examCount}
                        </strong>

                        <span>Exams</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td>
                      <span
                        className={`student-status ${
                          student.status === "Active"
                            ? "active"
                            : "inactive"
                        }`}
                      >
                        <span></span>
                        {student.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="student-actions">

                        <button
                          type="button"
                          title="View"
                          onClick={() =>
                            handleView(student)
                          }
                        >
                          👁
                        </button>

                        <button
                          type="button"
                          title="Edit"
                          onClick={() =>
                            handleEdit(student)
                          }
                        >
                          ✎
                        </button>

                        <button
                          type="button"
                          title="Delete"
                          onClick={() =>
                            handleDelete(student)
                          }
                        >
                          🗑
                        </button>

                      </div>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="9"
                    className="student-empty"
                  >
                    <div>
                      <span>🔍</span>
                      <h3>No students found</h3>
                      <p>
                        Try changing your search or
                        filters.
                      </p>
                    </div>
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>

        {/* Footer */}
        <div className="student-table-footer">

          <span>
            Showing{" "}
            <strong>
              {filteredStudents.length}
            </strong>{" "}
            of <strong>{students.length}</strong>{" "}
            students
          </span>

          <div className="student-pagination">

            <button type="button">
              ←
            </button>

            <button
              type="button"
              className="current"
            >
              1
            </button>

            <button type="button">
              2
            </button>

            <button type="button">
              3
            </button>

            <span>...</span>

            <button type="button">
              10
            </button>

            <button type="button">
              →
            </button>

          </div>

        </div>

      </div>

    </div>
  );
};

export default StudentTable;