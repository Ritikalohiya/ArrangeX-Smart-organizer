import React from "react";
import "./StudentCard.css";

const StudentCard = ({
  student,
  onView,
  onEdit,
  onDelete,
}) => {
  if (!student) {
    return null;
  }

  return (
    <div className="student-card">

      <div className="student-card-header">

        <div className="student-card-avatar">
          {student.name?.charAt(0)?.toUpperCase() || "S"}
        </div>

        <span
          className={`student-card-status ${
            student.status === "Active"
              ? "active"
              : "inactive"
          }`}
        >
          ● {student.status || "Active"}
        </span>

      </div>

      <div className="student-card-body">

        <h3>{student.name}</h3>

        <span className="student-card-id">
          {student.id}
        </span>

        <div className="student-card-info">
          <div>
            <small>College</small>
            <strong>
              {student.college || "Not Available"}
            </strong>
          </div>

          <div>
            <small>Course</small>
            <strong>
              {student.course || "Not Available"}
            </strong>
          </div>

          <div>
            <small>Section</small>
            <strong>
              {student.section || "-"}
            </strong>
          </div>

          <div>
            <small>Roll No.</small>
            <strong>
              {student.rollNo || "-"}
            </strong>
          </div>
        </div>

        <div className="student-card-exam">
          <span>Examinations</span>
          <strong>
            {student.examCount || 0}
          </strong>
        </div>

      </div>

      <div className="student-card-actions">

        <button
          type="button"
          onClick={() =>
            onView && onView(student)
          }
        >
          👁 View
        </button>

        <button
          type="button"
          onClick={() =>
            onEdit && onEdit(student)
          }
        >
          ✎ Edit
        </button>

        <button
          type="button"
          onClick={() =>
            onDelete && onDelete(student)
          }
        >
          🗑
        </button>

      </div>

    </div>
  );
};

export default StudentCard;