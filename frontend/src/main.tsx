/*
Entry point for the entire application.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";

import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import {
  GradingMain,
  Home,
  NotFoundPage,
  RubricBuilderMain,
  SettingsMain,
} from "@features";
import { AssignmentProvider, CourseProvider } from "@context"; // Defined a "root" div in index.html that we pull in here and then call the React render method.
import TemplatesMain from "./features/templatesPage/TempatesMain.tsx";
import { DialogProvider } from "./context/DialogContext.tsx";

// Defined a "root" div in index.html that we pull in here and then call the React render method.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/*Provides the course context for consistent active course state across the application*/}
    <CourseProvider>
      {/* Router and Routes are the mechanism for client-side routing */}
      <AssignmentProvider>
        <DialogProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/templates" element={<TemplatesMain />} />
              <Route path="/rubric-builder" element={<RubricBuilderMain />} />
              <Route path="/grading" element={<GradingMain />} />
              <Route path="/settings" element={<SettingsMain />} />
              {/*Any route that doesn't match the routes defined above will go to the 404 page*/}
              <Route path={"*"} element={<NotFoundPage />} />
            </Routes>
          </Router>
        </DialogProvider>
      </AssignmentProvider>
    </CourseProvider>
  </StrictMode>,
);
