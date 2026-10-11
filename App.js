import React from "react";
import {BrowserRouter,Routes,Route,Navigate,} from "react-router-dom"; 

import "./App.css"; 

// ======================================================
// LAYOUT
// ======================================================

import Layout from "./Components/Layout/Layout"; 

// ======================================================
// AUTH
// ======================================================

import Login from "./Components/Login/Login";
import Register from "./Components/Register/Register";

// ======================================================
// DASHBOARD
// ======================================================

import Dashboard from "./Components/Dashboard/Dashboard";

// ======================================================
// COLLEGES
// ======================================================

import Colleges from "./Components/Colleges/Colleges";

// ======================================================
// BUILDINGS
// ======================================================

import Buildings from "./Components/Buildings/Building";

// ======================================================
// HALLS
// ======================================================

import Halls from "./Components/Halls/Hall";

// ======================================================
// STUDENTS
// ======================================================

import Students from "./Components/Students/Student";

// ======================================================
// EXAMS
// ======================================================

import Exam from "./Components/Exams/Exam";

// ======================================================
// SEATING
// ======================================================

import Seating from "./Components/Seating/Seating";

// ======================================================
// SEAT SLIPS
// ======================================================

import SeatSlips from "./Components/SeatSlips/SeatSlips";

// ======================================================
// HALL DISPLAY
// ======================================================

import HallDisplay from "./Components/HallDisplay/HallDisplay";

// ======================================================
// ANALYTICS
// ======================================================

import Analytics from "./Components/Analytics/Analytics";

// ======================================================
// REPORTS
// ======================================================

import Reports from "./Components/Reports/Reports";

// ======================================================
// PROFILE
// ======================================================
 
import Profile from "./Components/Profile/Profile";

// ======================================================
// SETTINGS
// ======================================================

import Settings from "./Components/Settings/Setting";

// ======================================================
// PROTECTED ROUTE
// ======================================================

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// ======================================================
// APP
// ======================================================

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ==================================================
            PUBLIC ROUTES
        ================================================== */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* ==================================================
            PROTECTED APPLICATION
        ================================================== */}

        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >

          {/* ==================================================
              DASHBOARD
          ================================================== */}

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          {/* ==================================================
              COLLEGES
          ================================================== */}

          <Route
            path="/colleges"
            element={<Colleges />}
          />

          {/* ==================================================
              BUILDINGS
          ================================================== */}

          <Route
            path="/buildings"
            element={<Buildings />}
          />

          {/* ==================================================
              HALLS
          ================================================== */}

          <Route
            path="/halls"
            element={<Halls />}
          />

          {/* ==================================================
              STUDENTS
          ================================================== */}

          <Route
            path="/students"
            element={<Students />}
          />

          {/* ==================================================
              EXAMS
          ================================================== */}

          <Route
            path="/exams"
            element={<Exam />}
          />

          {/* ==================================================
              SEATING
          ================================================== */}

          <Route
            path="/seating"
            element={<Seating />}
          />

          {/* ==================================================
              SEAT SLIPS
          ================================================== */}

          <Route
            path="/seat-slips"
            element={<SeatSlips />}
          />

          {/* ==================================================
              HALL DISPLAY
          ================================================== */}

          <Route
            path="/hall-display"
            element={<HallDisplay />}
          />

          {/* ==================================================
              ANALYTICS
          ================================================== */}

          <Route
            path="/analytics"
            element={<Analytics />}
          />

          {/* ==================================================
              REPORTS
          ================================================== */}

          <Route
            path="/reports"
            element={<Reports />}
          />

          {/* ==================================================
              PROFILE
          ================================================== */}

          <Route
            path="/profile"
            element={<Profile />}
          />

          {/* ==================================================
              SETTINGS
          ================================================== */}

          <Route
            path="/settings"
            element={<Settings />}
          />

        </Route>

        {/* ==================================================
            ROOT ROUTE
        ================================================== */}

        <Route
          path="/"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

        {/* ==================================================
            404 ROUTE
        ================================================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
};

export default App;