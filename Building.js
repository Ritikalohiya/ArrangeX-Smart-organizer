
import React, { useCallback, useEffect, useState } from "react";
import api from "../../services/api";
import BuildingCard from "./BuildingCard";
import "./Building.css";

const initialForm = {
  name: "",
  code: "",
  college: "",
  floor: "",
};

// Handles common API response formats
const getArrayFromResponse = (response) => {
  const result = response.data;

  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.buildings)) return result.buildings;
  if (Array.isArray(result?.colleges)) return result.colleges;

  return [];
};

const Building = () => {
  const [buildings, setBuildings] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState(null);

  const [formData, setFormData] = useState(initialForm);

  // FETCH BUILDINGS
  const fetchBuildings = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/buildings");
      const data = getArrayFromResponse(response);

      console.log("Buildings loaded:", data);

      setBuildings(data);
    } catch (err) {
      console.error("Fetch buildings error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load buildings. Check your API and server."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // FETCH COLLEGES
  const fetchColleges = useCallback(async () => {
    try {
      const response = await api.get("/colleges");
      const data = getArrayFromResponse(response);

      console.log("Colleges loaded:", data);

      setColleges(data);
    } catch (err) {
      console.error("Fetch colleges error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load colleges. Please refresh the page."
      );
    }
  }, []);

  // INITIAL LOAD
  useEffect(() => {
    fetchBuildings();
    fetchColleges();
  }, [fetchBuildings, fetchColleges]);

  // HANDLE INPUT
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // OPEN ADD FORM
  const handleAddBuilding = () => {
    setEditingBuilding(null);
    setFormData({ ...initialForm });
    setError("");
    setShowForm(true);
  };

  // OPEN EDIT FORM
  const handleEdit = (building) => {
    setEditingBuilding(building);

    setFormData({
      name: building.name || "",
      code: building.code || "",
      college:
        building.college?._id ||
        building.college ||
        "",
      floor:
        building.floor !== undefined &&
        building.floor !== null
          ? String(building.floor)
          : "",
    });

    setError("");
    setShowForm(true);
  };

  // CLOSE FORM
  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingBuilding(null);
    setFormData({ ...initialForm });
    setError("");
  };

  // ADD OR UPDATE BUILDING
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("Please enter building name.");
      return;
    }

    if (!formData.code.trim()) {
      setError("Please enter building code.");
      return;
    }

    if (!formData.college) {
      setError("Please select a college.");
      return;
    }

    const floor = formData.floor === ""
      ? 0
      : Number(formData.floor);

    if (!Number.isFinite(floor) || floor < 0) {
      setError("Please enter a valid floor number.");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      code: formData.code.trim(),
      college: formData.college,
      floor,
    };

    try {
      setSaving(true);

      if (editingBuilding) {
        await api.put(
          `/buildings/${editingBuilding._id}`,
          payload
        );
      } else {
        await api.post("/buildings", payload);
      }

      setShowForm(false);
      setEditingBuilding(null);
      setFormData({ ...initialForm });

      await fetchBuildings();
    } catch (err) {
      console.error("Save building error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to save building."
      );
    } finally {
      setSaving(false);
    }
  };

  // DELETE BUILDING
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this building?"
    );

    if (!confirmed) return;

    try {
      setError("");

      await api.delete(`/buildings/${id}`);

      setBuildings((previous) =>
        previous.filter((building) => building._id !== id)
      );
    } catch (err) {
      console.error("Delete building error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to delete building."
      );
    }
  };

  // REFRESH
  const handleRefresh = () => {
    fetchBuildings();
    fetchColleges();
  };

  return (
    <div className="building-page">
      {/* HEADER */}
      <div className="building-header">
        <div>
          <span className="building-header-label">
            ARRANGEX
          </span>

          <h1>Buildings</h1>

          <p>
            Manage college buildings and floors for exam seating.
          </p>
        </div>

        <div className="building-header-actions">
          <button
            type="button"
            className="building-refresh-btn"
            onClick={handleRefresh}
            disabled={loading}
          >
            ↻ {loading ? "Loading..." : "Refresh"}
          </button>

          <button
            type="button"
            className="building-add-btn"
            onClick={handleAddBuilding}
          >
            + Add Building
          </button>
        </div>
      </div>

      {/* BUILDING FORM */}
      {showForm && (
        <div className="building-form-card">
          <div className="building-form-header">
            <div>
              <h2>
                {editingBuilding
                  ? "Edit Building"
                  : "Add New Building"}
              </h2>

              <p>Enter building information below.</p>
            </div>

            <button
              type="button"
              className="building-close-btn"
              onClick={closeForm}
              disabled={saving}
              aria-label="Close form"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="building-form-grid">
              <div className="building-form-group">
                <label htmlFor="building-name">
                  Building Name *
                </label>

                <input
                  id="building-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Main Building"
                  required
                />
              </div>

              <div className="building-form-group">
                <label htmlFor="building-code">
                  Building Code *
                </label>

                <input
                  id="building-code"
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="e.g. MB-01"
                  required
                />
              </div>

              <div className="building-form-group">
                <label htmlFor="building-college">
                  College *
                </label>

                <select
                  id="building-college"
                  name="college"
                  value={formData.college}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Select College
                  </option>

                  {colleges.map((college) => (
                    <option
                      key={college._id}
                      value={college._id}
                    >
                      {college.name}
                    </option>
                  ))}
                </select>

                {colleges.length === 0 && (
                  <small>
                    No colleges available. Check the colleges API.
                  </small>
                )}
              </div>

              <div className="building-form-group">
                <label htmlFor="building-floor">
                  Floor
                </label>

                <input
                  id="building-floor"
                  type="number"
                  name="floor"
                  value={formData.floor}
                  onChange={handleChange}
                  placeholder="e.g. 1"
                  min="0"
                />
              </div>
            </div>

            {error && (
              <div className="building-error">
                ⚠️ {error}
              </div>
            )}

            <div className="building-form-actions">
              <button
                type="button"
                className="building-cancel-btn"
                onClick={closeForm}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="building-save-btn"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingBuilding
                  ? "Update Building"
                  : "Save Building"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PAGE ERROR */}
      {error && !showForm && (
        <div className="building-error">
          ⚠️ {error}
        </div>
      )}

      {/* BUILDINGS CONTENT */}
      {loading ? (
        <div className="building-loading">
          <div className="building-spinner" />
          <p>Loading buildings...</p>
        </div>
      ) : buildings.length === 0 ? (
        <div className="building-empty">
          <div className="building-empty-icon">🏢</div>

          <h2>No Buildings Found</h2>

          <p>
            No buildings were returned by the API.
            Add a building or check your backend response.
          </p>

          <button
            type="button"
            className="building-add-btn"
            onClick={handleAddBuilding}
          >
            + Add Building
          </button>
        </div>
      ) : (
        <>
          <div className="building-summary">
            <h2>Registered Buildings</h2>
            <p>Total Buildings: {buildings.length}</p>
          </div>

          <div className="building-grid">
            {buildings.map((building) => (
              <BuildingCard
                key={building._id}
                building={building}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Building;
