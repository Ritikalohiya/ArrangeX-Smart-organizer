
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import "./Colleges.css";

const Colleges = () => {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    address: "",
    email: "", 
    phone: "",
  });

  // =====================================================
  // SAMPLE 5 COLLEGES
  // =====================================================

  const sampleColleges = [
    {
      _id: "sample-1",
      name: "Acropolis Institute of Technology & Research",
      code: "AITR01",
      address: "Indore, Madhya Pradesh",
      email: "admin@acropolis.ac.in",
      phone: "0731-4730000",
    },
    {
      _id: "sample-2",
      name: "Medi-Caps University",
      code: "MCU02",
      address: "Rau, Indore, Madhya Pradesh",
      email: "info@medicaps.ac.in",
      phone: "0731-4259500",
    },
    {
      _id: "sample-3",
      name: "IPS Academy",
      code: "IPS03",
      address: "Rajendra Nagar, Indore, Madhya Pradesh",
      email: "info@ipsacademy.org",
      phone: "0731-4014600",
    },
    {
      _id: "sample-4",
      name: "Oriental University",
      code: "OU04",
      address: "Sanwer, Indore, Madhya Pradesh",
      email: "info@orientaluniversity.in",
      phone: "0731-2446700",
    },
    {
      _id: "sample-5",
      name: "Shri Vaishnav Vidyapeeth Vishwavidyalaya",
      code: "SVVV05",
      address: "Indore, Madhya Pradesh",
      email: "info@svvv.edu.in",
      phone: "0731-2725111",
    },
  ];

  // =====================================================
  // GET COLLEGES
  // =====================================================

  const fetchColleges = async () => {
    try {
      setLoading(true);

      const response = await api.get("/colleges");

      console.log("College API Response:", response.data);

      let apiColleges = [];

      if (response.data?.success) {
        apiColleges =
          response.data.colleges ||
          response.data.data ||
          [];
      } else if (Array.isArray(response.data)) {
        apiColleges = response.data;
      } else if (Array.isArray(response.data?.colleges)) {
        apiColleges = response.data.colleges;
      }

      /*
       * If MongoDB has colleges, show MongoDB colleges.
       * If MongoDB is empty, show the 5 sample colleges.
       */
      if (apiColleges.length > 0) {
        setColleges(apiColleges);
      } else {
        setColleges(sampleColleges);
      }
    } catch (error) {
      console.error("Error fetching colleges:", error);

      // Show sample colleges if backend is unavailable
      setColleges(sampleColleges);

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColleges();
  }, []);

  // =====================================================
  // INPUT CHANGE
  // =====================================================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // =====================================================
  // ADD / UPDATE COLLEGE
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.code.trim() ||
      !formData.address.trim() ||
      !formData.email.trim()
    ) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      setLoading(true);

      if (editingId) {
        // Do not update sample colleges
        if (editingId.toString().startsWith("sample-")) {
          alert(
            "Sample college cannot be edited. Add it to MongoDB first."
          );

          resetForm();
          return;
        }

        await api.put(`/colleges/${editingId}`, formData);

        alert("College updated successfully.");
      } else {
        await api.post("/colleges", formData);

        alert("College added successfully.");
      }

      resetForm();
      await fetchColleges();

    } catch (error) {
      console.error("College save error:", error);

      alert(
        error.response?.data?.message ||
          "Unable to save college."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // EDIT COLLEGE
  // =====================================================

  const handleEdit = (college) => {
    if (college._id?.toString().startsWith("sample-")) {
      alert(
        "This is a sample college. Add it to MongoDB before editing."
      );
      return;
    }

    setEditingId(college._id);

    setFormData({
      name: college.name || "",
      code: college.code || "",
      address: college.address || "",
      email: college.email || "",
      phone: college.phone || "",
    });

    setShowForm(true);
  };

  // =====================================================
  // DELETE COLLEGE
  // =====================================================

  const handleDelete = async (id) => {
    if (id?.toString().startsWith("sample-")) {
      alert(
        "Sample colleges cannot be deleted because they are demo data."
      );
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this college?"
    );

    if (!confirmDelete) return;

    try {
      setLoading(true);

      await api.delete(`/colleges/${id}`);

      alert("College deleted successfully.");

      await fetchColleges();

    } catch (error) {
      console.error("Delete error:", error);

      alert(
        error.response?.data?.message ||
          "Unable to delete college."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // RESET FORM
  // =====================================================

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      address: "",
      email: "",
      phone: "",
    });

    setEditingId(null);
    setShowForm(false);
  };

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredColleges = colleges.filter((college) => {
    const searchText = search.toLowerCase();

    return (
      college.name
        ?.toLowerCase()
        .includes(searchText) ||
      college.code
        ?.toLowerCase()
        .includes(searchText) ||
      college.email
        ?.toLowerCase()
        .includes(searchText) ||
      college.address
        ?.toLowerCase()
        .includes(searchText)
    );
  });

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="colleges-page">

      {/* ================= HEADER ================= */}

      <div className="colleges-header">

        <div>
          <h1>Colleges</h1>

          <p>
            Manage colleges and institutions in ArrangeX
          </p>
        </div>

        <button
          className="add-college-btn"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          + Add College
        </button>

      </div>

      {/* ================= STATS ================= */}

      <div className="college-stats">

        <div className="college-stat-card">

          <div className="stat-icon">
            🏫
          </div>

          <div>
            <span>Total Colleges</span>

            <h2>
              {colleges.length}
            </h2>
          </div>

        </div>

        <div className="college-stat-card">

          <div className="stat-icon">
            ✓
          </div>

          <div>
            <span>Active Colleges</span>

            <h2>
              {colleges.length}
            </h2>
          </div>

        </div>

        <div className="college-stat-card">

          <div className="stat-icon">
            📍
          </div>

          <div>
            <span>Locations</span>

            <h2>
              {colleges.length}
            </h2>
          </div>

        </div>

      </div>

      {/* ================= SEARCH ================= */}

      <div className="college-toolbar">

        <div className="college-search">

          <span>🔍</span>

          <input
            type="text"
            placeholder="Search college, code, email..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>

        <span className="college-count">
          {filteredColleges.length} Colleges
        </span>

      </div>

      {/* ================= FORM ================= */}

      {showForm && (
        <div className="college-form-overlay">

          <div className="college-form-card">

            <div className="form-header">

              <div>

                <h2>
                  {editingId
                    ? "Edit College"
                    : "Add New College"}
                </h2>

                <p>
                  Enter college information below
                </p>

              </div>

              <button
                className="close-btn"
                onClick={resetForm}
              >
                ×
              </button>

            </div>

            <form onSubmit={handleSubmit}>

              <div className="form-grid">

                <div className="form-group">

                  <label>
                    College Name *
                  </label>

                  <input
                    type="text"
                    name="name"
                    placeholder="Enter college name"
                    value={formData.name}
                    onChange={handleChange}
                  />

                </div>

                <div className="form-group">

                  <label>
                    College Code *
                  </label>

                  <input
                    type="text"
                    name="code"
                    placeholder="Example: AITR01"
                    value={formData.code}
                    onChange={handleChange}
                  />

                </div>

                <div className="form-group full-width">

                  <label>
                    Address *
                  </label>

                  <textarea
                    name="address"
                    placeholder="Enter college address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="3"
                  />

                </div>

                <div className="form-group">

                  <label>
                    Email *
                  </label>

                  <input
                    type="email"
                    name="email"
                    placeholder="college@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />

                </div>

                <div className="form-group">

                  <label>
                    Phone
                  </label>

                  <input
                    type="text"
                    name="phone"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={handleChange}
                  />

                </div>

              </div>

              <div className="form-actions">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={resetForm}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-btn"
                  disabled={loading}
                >
                  {loading
                    ? "Saving..."
                    : editingId
                    ? "Update College"
                    : "Add College"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* ================= COLLEGE TABLE ================= */}

      <div className="college-table-card">

        <div className="table-header">

          <div>

            <h2>
              College List
            </h2>

            <p>
              All registered colleges
            </p>

          </div>

        </div>

        {loading ? (

          <div className="loading">
            Loading colleges...
          </div>

        ) : filteredColleges.length === 0 ? (

          <div className="empty-state">

            <div className="empty-icon">
              🏫
            </div>

            <h3>
              No Colleges Found
            </h3>

            <p>
              Add your first college to get started.
            </p>

            <button
              className="add-college-btn"
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
            >
              + Add College
            </button>

          </div>

        ) : (

          <div className="table-wrapper">

            <table>

              <thead>

                <tr>
                  <th>College</th>
                  <th>Code</th>
                  <th>Address</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Actions</th>
                </tr>

              </thead>

              <tbody>

                {filteredColleges.map(
                  (college) => (

                    <tr key={college._id}>

                      <td>

                        <div className="college-name-cell">

                          <div className="college-avatar">

                            {college.name
                              ?.charAt(0)
                              .toUpperCase()}

                          </div>

                          <div>

                            <strong>
                              {college.name}
                            </strong>

                            <small>
                              College
                            </small>

                          </div>

                        </div>

                      </td>

                      <td>

                        <span className="code-badge">
                          {college.code}
                        </span>

                      </td>

                      <td>
                        {college.address}
                      </td>

                      <td>
                        {college.email}
                      </td>

                      <td>
                        {college.phone || "-"}
                      </td>

                      <td>

                        <div className="action-buttons">

                          <button
                            className="edit-btn"
                            onClick={() =>
                              handleEdit(college)
                            }
                          >
                            Edit
                          </button>

                          <button
                            className="delete-btn"
                            onClick={() =>
                              handleDelete(
                                college._id
                              )
                            }
                          >
                            Delete
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
};

export default Colleges