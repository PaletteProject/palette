/*
Entry point for the entire application.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import React from "react";
import {
  GradingMain,
  Home,
  NotFoundPage,
  RubricBuilderMain,
  SettingsMain,
} from "@features";
import {
  AssignmentProvider,
  CourseProvider,
  DialogProvider,
  RubricProvider,
} from "@context";
import TemplatesMain from "./features/templatesPage/TempatesMain.tsx";

// Defined a "root" div in index.html that we pull in here and then call the React render method.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CourseProvider>
      <AssignmentProvider>
        <RubricProvider>
          <DialogProvider>
            <Router>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/templates" element={<TemplatesMain />} />
                <Route path="/rubric-builder" element={<RubricBuilderMain />} />
                <Route path="/grading" element={<GradingMain />} />
                <Route path="/settings" element={<SettingsMain />} />
                <Route path={"*"} element={<NotFoundPage />} />
              </Routes>
            </Router>
          </DialogProvider>
        </RubricProvider>
      </AssignmentProvider>
    </CourseProvider>
  </StrictMode>
);
