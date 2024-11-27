/*
Entry point for the entire application.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import NotFoundPage from "./components/NotFoundPage";
import UserTemplates from "../src/features/templatesPage/UserTemplates.tsx";
import { CourseProvider } from "./context/CourseProvider";
import { AssignmentProvider } from "./context/AssignmentProvider.tsx";
import { GradingMain, Home, RubricBuilderMain, SettingsMain } from "@features";

// Defined a "root" div in index.html that we pull in here and then call the React render method.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/*Provides the course context for consistent active course state across the application*/}
    <CourseProvider>
      {/* Router and Routes are the mechanism for client-side routing */}
      <AssignmentProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/templates" element={<UserTemplates />} />
            <Route path="/rubric-builder" element={<RubricBuilderMain />} />
            <Route path="/grading" element={<GradingMain />} />
            <Route path="/settings" element={<SettingsMain />} />
            {/*Any route that doesn't match the routes defined above will go to the 404 page*/}
            <Route path={"*"} element={<NotFoundPage />} />
          </Routes>
        </Router>
      </AssignmentProvider>
    </CourseProvider>
  </StrictMode>,
);
