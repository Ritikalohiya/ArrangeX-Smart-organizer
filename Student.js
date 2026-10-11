
import React, { useCallback, useEffect, useState } from "react";
import api from "../../services/api";
import "./Student.css";

const initialForm = {
  name: "",
  rollNumber: "",
  email: "",
  phone: "",
  course: "",
  semester: "",
  college: "",
  building: "",
  hall: "",
};

const getList = (response, keys = []) => {
  const result = response?.data;

  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;

  for (const key of keys) {
    if (Array.isArray(result?.[key])) return result[key];
    if (Array.isArray(result?.data?.[key])) {
      return result.data[key];
    }
  }

  return [];
};

const getId = (value) => {
  if (!value) return "";
  if (typeof value === "object") {
    return String(value._id || value.id || "");
  }
  return String(value);
};

const Student = () => {
  const [students, setStudents] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [halls, setHalls] = useState([]);

  const [form, setForm] = useState(initialForm);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch students
  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/students");
      console.log("Students API response:", response.data);

      const result = response.data;

      const studentList = Array.isArray(result)
        ? result
        : Array.isArray(result?.students)
        ? result.students
        : Array.isArray(result?.data)
        ? result.data
        : Array.isArray(result?.data?.students)
        ? result.data.students
        : Array.isArray(result?.data?.data)
        ? result.data.data
        : null;

      if (studentList === null) {
        console.error("Unexpected students response:", result);
        setStudents([]);
        setError(
          result?.message ||
            "Unexpected response from students API."
        );
        return;
      }

      setStudents(studentList);
    } catch (err) {
      console.error(
        "Fetch students error:",
        err.response?.status,
        err.response?.data || err.message
      );

      setStudents([]);
      setError(
        err.response?.data?.message ||
          "Unable to load students. Check your login and backend API."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch dropdown data
  const fetchDropdownData = useCallback(async () => {
    const requests = [
      {
        url: "/colleges",
        setter: setColleges,
        keys: ["colleges"],
      },
      {
        url: "/buildings",
        setter: setBuildings,
        keys: ["buildings"],
      },
      {
        url: "/halls",
        setter: setHalls,
        keys: ["halls"],
      },
    ];

    await Promise.all(
      requests.map(async ({ url, setter, keys }) => {
        try {
          const response = await api.get(url);
          setter(getList(response, keys));
        } catch (err) {
          console.error(
            `Failed to fetch ${url}:`,
            err.response?.status,
            err.response?.data || err.message
          );
        }
      })
    );
  }, []);

  useEffect(() => {
    fetchStudents();
    fetchDropdownData();
  }, [fetchStudents, fetchDropdownData]);

  // Form input handler
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "college"
        ? { building: "", hall: "" }
        : {}),
      ...(name === "building" ? { hall: "" } : {}),
    }));

    setError("");
    setSuccess("");
  };

  // Add student
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (
      !form.name.trim() ||
      !form.rollNumber.trim() ||
      !form.course.trim() ||
      !form.college
    ) {
      setError(
        "Name, roll number, course and college are required."
      );
      return;
    }

    const payload = {
      name: form.name.trim(),
      rollNumber: form.rollNumber.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      course: form.course.trim(),
      semester: form.semester
        ? Number(form.semester)
        : undefined,
      college: form.college,
      building: form.building || undefined,
      hall: form.hall || undefined,
    };

    try {
      setSaving(true);

      const response = await api.post("/students", payload);

      setSuccess(
        response.data?.message || "Student added successfully."
      );
      setForm(initialForm);
      setShowForm(false);

      await fetchStudents();
    } catch (err) {
      console.error(
        "Add student error:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
          "Failed to add student. Check required fields and API."
      );
    } finally {
      setSaving(false);
    }
  };

  // Delete student
  const handleDelete = async (id) => {
    if (!id) {
      setError("Student ID is missing.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this student?")) {
      return;
    }

    try {
      setError("");
      setSuccess("");
      setDeletingId(id);

      await api.delete(`/students/${id}`);

      setStudents((prev) =>
        prev.filter(
          (student) => String(student._id || student.id) !== String(id)
        )
      );

      setSuccess("Student deleted successfully.");
    } catch (err) {
      console.error(
        "Delete student error:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message || "Failed to delete student."
      );
    } finally {
      setDeletingId("");
    }
  };

  // Find names for college, building and hall references
  const getName = (value, collection) => {
    if (!value) return "—";

    if (typeof value === "object") {
      return value.name || value.code || "—";
    }

    const item = collection.find(
      (entry) =>
        String(entry._id || entry.id) === String(value)
    );

    return item?.name || item?.code || "—";
  };

  const availableBuildings = buildings.filter((building) => {
    if (!form.college) return true;

    return (
      getId(building.college) === form.college ||
      getId(building.college?._id) === form.college
    );
  });

  const availableHalls = halls.filter((hall) => {
    const hallBuilding = getId(hall.building);
    const hallCollege = getId(hall.college);

    if (form.building && hallBuilding !== form.building) {
      return false;
    }

    if (form.college && hallCollege && hallCollege !== form.college) {
      return false;
    }

    return true;
  });

  // Search
  const query = search.trim().toLowerCase();

  const filteredStudents = students.filter((student) =>
    [
      student.name,
      student.rollNumber,
      student.email,
      student.phone,
      student.course,
      getName(student.college, colleges),
      getName(student.building, buildings),
      getName(student.hall, halls),
    ].some((value) =>
      String(value || "").toLowerCase().includes(query)
    )
  );

  const assignedCount = students.filter(
    (student) => Boolean(getId(student.hall))
  ).length;

  const unassignedCount = students.length - assignedCount;

  return (
    <div className="student-page">
      <div className="student-header">
        <div>
          <h1>Student Management</h1>
          <p>Manage students and their exam seating details.</p>
        </div>

        <button
          type="button"
          className="student-add-btn"
          onClick={() => {
            setShowForm((prev) => !prev);
            setError("");
            setSuccess("");
          }}
        >
          {showForm ? "✕ Cancel" : "+ Add Student"}
        </button>
      </div>

      <div className="student-stats">
        <div className="student-stat-card">
          <span>Total Students</span>
          <h2>{students.length}</h2>
        </div>

        <div className="student-stat-card">
          <span>Assigned to Hall</span>
          <h2>{assignedCount}</h2>
        </div>

        <div className="student-stat-card">
          <span>Unassigned</span>
          <h2>{unassignedCount}</h2>
        </div>
      </div>

      {error && (
        <div className="student-alert error" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="student-alert success" role="status">
          {success}
        </div>
      )}

      {showForm && (
        <div className="student-form-card">
          <h2>Add New Student</h2>

          <form onSubmit={handleSubmit}>
            <div className="student-form-grid">
              <div className="student-field">
                <label htmlFor="student-name">Student Name *</label>
                <input
                  id="student-name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter student name"
                  required
                />
              </div>

              <div className="student-field">
                <label htmlFor="student-roll">Roll Number *</label>
                <input
                  id="student-roll"
                  name="rollNumber"
                  value={form.rollNumber}
                  onChange={handleChange}
                  placeholder="Enter roll number"
                  required
                />
              </div>

              <div className="student-field">
                <label htmlFor="student-email">Email</label>
                <input
                  id="student-email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="student@example.com"
                />
              </div>

              <div className="student-field">
                <label htmlFor="student-phone">Phone</label>
                <input
                  id="student-phone"
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                />
              </div>

              <div className="student-field">
                <label htmlFor="student-course">Course *</label>
                <input
                  id="student-course"
                  name="course"
                  value={form.course}
                  onChange={handleChange}
                  placeholder="e.g. B.Tech CSIT"
                  required
                />
              </div>

              <div className="student-field">
                <label htmlFor="student-semester">Semester</label>
                <select
                  id="student-semester"
                  name="semester"
                  value={form.semester}
                  onChange={handleChange}
                >
                  <option value="">Select Semester</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((semester) => (
                    <option key={semester} value={semester}>
                      Semester {semester}
                    </option>
                  ))}
                </select>
              </div>

              <div className="student-field">
                <label htmlFor="student-college">College *</label>
                <select
                  id="student-college"
                  name="college"
                  value={form.college}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select College</option>
                  {colleges.map((college) => (
                    <option
                      key={college._id || college.id}
                      value={college._id || college.id}
                    >
                      {college.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="student-field">
                <label htmlFor="student-building">Building</label>
                <select
                  id="student-building"
                  name="building"
                  value={form.building}
                  onChange={handleChange}
                >
                  <option value="">Select Building</option>
                  {availableBuildings.map((building) => (
                    <option
                      key={building._id || building.id}
                      value={building._id || building.id}
                    >
                      {building.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="student-field">
                <label htmlFor="student-hall">Exam Hall</label>
                <select
                  id="student-hall"
                  name="hall"
                  value={form.hall}
                  onChange={handleChange}
                >
                  <option value="">Not Assigned</option>
                  {availableHalls.map((hall) => (
                    <option
                      key={hall._id || hall.id}
                      value={hall._id || hall.id}
                    >
                      {hall.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="student-form-actions">
              <button
                type="button"
                className="student-cancel-btn"
                onClick={() => {
                  setShowForm(false);
                  setForm(initialForm);
                  setError("");
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="student-submit-btn"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Student"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="student-table-card">
        <div className="student-table-header">
          <div>
            <h2>All Students</h2>
            <p>View and manage registered students.</p>
          </div>

          <div className="student-table-tools">
            <input
              className="student-search"
              type="search"
              placeholder="Search students..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <button
              type="button"
              className="student-add-btn"
              onClick={() => {
                fetchStudents();
                fetchDropdownData();
              }}
              disabled={loading}
            >
              {loading ? "Loading..." : "↻ Refresh"}
            </button>
          </div>
        </div>

        <div className="student-table-wrapper">
          <table className="student-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Roll Number</th>
                <th>Course</th>
                <th>College</th>
                <th>Building</th>
                <th>Exam Hall</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {loading && students.length === 0 ? (
                <tr>
                  <td colSpan="8" className="student-empty">
                    Loading students...
                  </td>
                </tr>
              ) : filteredStudents.length > 0 ? (
                filteredStudents.map((student) => {
                  const studentId = student._id || student.id;
                  const assigned = Boolean(getId(student.hall));

                  return (
                    <tr key={studentId}>
                      <td>
                        <div className="student-person">
                          <div className="student-avatar">
                            {(student.name || "S")
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <strong>{student.name || "Unnamed Student"}</strong>
                            <small>{student.email || "No email"}</small>
                          </div>
                        </div>
                      </td>

                      <td>{student.rollNumber || "—"}</td>
                      <td>{student.course || "—"}</td>
                      <td>{getName(student.college, colleges)}</td>
                      <td>{getName(student.building, buildings)}</td>
                      <td>{getName(student.hall, halls)}</td>

                      <td>
                        <span
                          className={`student-status ${
                            assigned ? "assigned" : "pending"
                          }`}
                        >
                          {assigned ? "Assigned" : "Unassigned"}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="student-delete-btn"
                          onClick={() => handleDelete(studentId)}
                          disabled={
                            deletingId === String(studentId) || !studentId
                          }
                          title="Delete student"
                        >
                          {deletingId === String(studentId)
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="student-empty">
                    {search
                      ? "No matching students found."
                      : "No students available. Check the students API response or add a student."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="student-table-footer">
          Showing {filteredStudents.length} of {students.length} students
        </div>
      </div>
    </div>
  );
};

export default Student;
