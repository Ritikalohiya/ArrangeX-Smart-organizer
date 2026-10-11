import React, { useState } from "react";
import "./StudentForm.css";

const StudentForm = ({ student = null, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: student?.name || "",
    email: student?.email || "",
    phone: student?.phone || "",
    college: student?.college || "",
    course: student?.course || "",
    section: student?.section || "",
    semester: student?.semester || "",
    rollNo: student?.rollNo || "",
    studentId: student?.id || "",
    status: student?.status || "Active",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Student name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Enter a valid email";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = "Enter a valid 10-digit phone number";
    }

    if (!formData.college) {
      newErrors.college = "Please select a college";
    }

    if (!formData.course) {
      newErrors.course = "Please select a course";
    }

    if (!formData.section) {
      newErrors.section = "Please select a section";
    }

    if (!formData.semester) {
      newErrors.semester = "Please select a semester";
    }

    if (!formData.rollNo.trim()) {
      newErrors.rollNo = "Roll number is required";
    }

    if (!formData.studentId.trim()) {
      newErrors.studentId = "Student ID is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const studentData = {
      ...formData,
      id: formData.studentId,
    };

    if (onSave) {
      onSave(studentData);
    } else {
      console.log("Student Data:", studentData);
      alert(
        student
          ? "Student updated successfully!"
          : "Student added successfully!"
      );
    }
  };

  const handleReset = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      college: "",
      course: "",
      section: "",
      semester: "",
      rollNo: "",
      studentId: "",
      status: "Active",
    });

    setErrors({});
  };

  return (
    <div className="student-form-page">
      <div className="student-form-container">

        {/* Header */}
        <div className="student-form-header">
          <div>
            <div className="student-form-breadcrumb">
              Dashboard <span>/</span> Students <span>/</span>{" "}
              {student ? "Edit Student" : "Add Student"}
            </div>

            <h1>{student ? "Edit Student" : "Add New Student"}</h1>

            <p>
              {student
                ? "Update student information and examination details."
                : "Enter student information to add a new student."}
            </p>
          </div>

          <button
            type="button"
            className="student-form-close"
            onClick={onCancel}
          >
            ✕
          </button>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="student-form">

          {/* Personal Information */}
          <div className="form-section">

            <div className="form-section-header">
              <div className="form-section-icon">👤</div>

              <div>
                <h2>Personal Information</h2>
                <p>Basic details of the student</p>
              </div>
            </div>

            <div className="form-grid">

              {/* Student Name */}
              <div className="form-group">
                <label>
                  Student Name <span>*</span>
                </label>

                <input
                  type="text"
                  name="name"
                  placeholder="Enter student full name"
                  value={formData.name}
                  onChange={handleChange}
                />

                {errors.name && (
                  <small className="form-error">
                    {errors.name}
                  </small>
                )}
              </div>

              {/* Student ID */}
              <div className="form-group">
                <label>
                  Student ID <span>*</span>
                </label>

                <input
                  type="text"
                  name="studentId"
                  placeholder="Example: STU009"
                  value={formData.studentId}
                  onChange={handleChange}
                />

                {errors.studentId && (
                  <small className="form-error">
                    {errors.studentId}
                  </small>
                )}
              </div>

              {/* Email */}
              <div className="form-group">
                <label>
                  Email Address <span>*</span>
                </label>

                <input
                  type="email"
                  name="email"
                  placeholder="student@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />

                {errors.email && (
                  <small className="form-error">
                    {errors.email}
                  </small>
                )}
              </div>

              {/* Phone */}
              <div className="form-group">
                <label>
                  Phone Number <span>*</span>
                </label>

                <input
                  type="tel"
                  name="phone"
                  placeholder="10-digit mobile number"
                  maxLength="10"
                  value={formData.phone}
                  onChange={handleChange}
                />

                {errors.phone && (
                  <small className="form-error">
                    {errors.phone}
                  </small>
                )}
              </div>

            </div>
          </div>

          {/* Academic Information */}
          <div className="form-section">

            <div className="form-section-header">
              <div className="form-section-icon">🎓</div>

              <div>
                <h2>Academic Information</h2>
                <p>College and course details</p>
              </div>
            </div>

            <div className="form-grid">

              {/* College */}
              <div className="form-group">
                <label>
                  College <span>*</span>
                </label>

                <select
                  name="college"
                  value={formData.college}
                  onChange={handleChange}
                >
                  <option value="">Select College</option>
                  <option value="IPS Academy">
                    IPS Academy
                  </option>
                  <option value="Medicaps University">
                    Medicaps University
                  </option>
                  <option value="Acropolis Institute">
                    Acropolis Institute
                  </option>
                  <option value="Sage University">
                    Sage University
                  </option>
                  <option value="SVVV University">
                    SVVV University
                  </option>
                  <option value="Chameli Devi Group">
                    Chameli Devi Group
                  </option>
                </select>

                {errors.college && (
                  <small className="form-error">
                    {errors.college}
                  </small>
                )}
              </div>

              {/* Course */}
              <div className="form-group">
                <label>
                  Course <span>*</span>
                </label>

                <select
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                >
                  <option value="">Select Course</option>
                  <option value="CSIT">CSIT</option>
                  <option value="Computer Science">
                    Computer Science
                  </option>
                  <option value="Information Technology">
                    Information Technology
                  </option>
                  <option value="Electronics">
                    Electronics
                  </option>
                  <option value="Mechanical">
                    Mechanical
                  </option>
                  <option value="Civil">
                    Civil
                  </option>
                </select>

                {errors.course && (
                  <small className="form-error">
                    {errors.course}
                  </small>
                )}
              </div>

              {/* Section */}
              <div className="form-group">
                <label>
                  Section <span>*</span>
                </label>

                <select
                  name="section"
                  value={formData.section}
                  onChange={handleChange}
                >
                  <option value="">Select Section</option>
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="C">Section C</option>
                  <option value="D">Section D</option>
                </select>

                {errors.section && (
                  <small className="form-error">
                    {errors.section}
                  </small>
                )}
              </div>

              {/* Semester */}
              <div className="form-group">
                <label>
                  Semester <span>*</span>
                </label>

                <select
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                >
                  <option value="">Select Semester</option>
                  <option value="1st">1st Semester</option>
                  <option value="2nd">2nd Semester</option>
                  <option value="3rd">3rd Semester</option>
                  <option value="4th">4th Semester</option>
                  <option value="5th">5th Semester</option>
                  <option value="6th">6th Semester</option>
                  <option value="7th">7th Semester</option>
                  <option value="8th">8th Semester</option>
                </select>

                {errors.semester && (
                  <small className="form-error">
                    {errors.semester}
                  </small>
                )}
              </div>

              {/* Roll Number */}
              <div className="form-group">
                <label>
                  Roll Number <span>*</span>
                </label>

                <input
                  type="text"
                  name="rollNo"
                  placeholder="Example: CSIT009"
                  value={formData.rollNo}
                  onChange={handleChange}
                />

                {errors.rollNo && (
                  <small className="form-error">
                    {errors.rollNo}
                  </small>
                )}
              </div>

              {/* Status */}
              <div className="form-group">
                <label>Student Status</label>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

            </div>
          </div>

          {/* Exam Information */}
          <div className="form-section">

            <div className="form-section-header">
              <div className="form-section-icon">📝</div>

              <div>
                <h2>Examination Information</h2>
                <p>Student examination eligibility</p>
              </div>
            </div>

            <div className="exam-info-box">

              <div className="exam-info-icon">
                💺
              </div>

              <div>
                <h3>Seat Allocation</h3>

                <p>
                  After adding the student, you can assign the
                  student to an examination and generate their
                  examination seat.
                </p>
              </div>

            </div>
          </div>

          {/* Form Footer */}
          <div className="student-form-footer">

            <div className="required-note">
              <span>*</span> Required fields
            </div>

            <div className="form-buttons">

              <button
                type="button"
                className="form-reset-btn"
                onClick={handleReset}
              >
                Reset
              </button>

              <button
                type="button"
                className="form-cancel-btn"
                onClick={onCancel}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="form-submit-btn"
              >
                {student ? "✓ Update Student" : "＋ Add Student"}
              </button>

            </div>
          </div>

        </form>
      </div>
    </div>
  );
};

export default StudentForm;