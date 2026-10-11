
import React from "react";
import "./BuildingCard.css";

const BuildingCard = ({
  building,
  onEdit,
  onDelete,
}) => {
  if (!building) {
    return null;
  }

  const collegeName =
    building.college?.name ||
    building.college?.collegeName ||
    "Not Assigned";

  return (
    <div className="building-card">

      {/* HEADER */}

      <div className="building-card-header">

        <div className="building-card-icon">
          🏢
        </div>

        <div className="building-card-title">

          <h3>
            {building.name || "Unnamed Building"}
          </h3>

          <span className="building-card-code">
            {building.code || "N/A"}
          </span>

        </div>

      </div>

      {/* DETAILS */}

      <div className="building-card-details">

        {/* College */}

        <div className="building-detail">

          <div className="building-detail-icon">
            🎓
          </div>

          <div className="building-detail-content">

            <span>
              College
            </span>

            <strong>
              {collegeName}
            </strong>

          </div>

        </div>

        {/* Floor */}

        <div className="building-detail">

          <div className="building-detail-icon">
            🏬
          </div>

          <div className="building-detail-content">

            <span>
              Floor
            </span>

            <strong>
              {building.floor !== undefined &&
              building.floor !== ""
                ? `Floor ${building.floor}`
                : "Ground Floor"}
            </strong>

          </div>

        </div>

      </div>

      {/* ACTIONS */}

      <div className="building-card-actions">

        <button
          type="button"
          className="building-card-edit"
          onClick={() =>
            onEdit && onEdit(building)
          }
        >
          ✏️ Edit
        </button>

        <button
          type="button"
          className="building-card-delete"
          onClick={() =>
            onDelete &&
            onDelete(building._id)
          }
        >
          🗑️ Delete
        </button>

      </div>

    </div>
  );
};

export default BuildingCard;
