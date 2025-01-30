import * as React from "react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import {
  ActiveAssignmentSelection,
  ActiveCourseSelection,
  AssignmentSelectionMenu,
  CourseSelectionMenu,
  Dialog,
} from "@components";

function Navbar() {
  const [userAnchor, setUserAnchor] = useState<null | HTMLElement>(null);

  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Map paths to nav button labels.
   *
   * To add a new nav button, add a new pair to the list and ensure the route is set up to display the corresponding
   * page.
   */
  const navOptions = {
    "/templates": "Templates",
    "/rubric-builder": "Builder",
    "/grading": "Grading",
  };
  const currentPath = location.pathname;
  const isActive = (path: string) => currentPath === path;

  const renderNavButtons = () => (
    <div className={"flex justify-between items-center gap-6 mx-4"}>
      {Object.entries(navOptions).map(([path, label]) => (
        <button
          key={path}
          disabled={isActive(path)}
          className={
            isActive(path)
              ? "underline"
              : "no-underline hover:opacity-80 transition duration-300 transform" +
                " hover:scale-105"
          }
          onClick={() => navigate(path)}
        >
          {label.toUpperCase()}
        </button>
      ))}
    </div>
  );

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setUserAnchor(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setUserAnchor(null);
  };

  const handleLogoutClicked = () => {
    navigate("/");
  };

  function handleSettingsClicked() {
    navigate("/settings");
  }

  return (
    <div className="flex items-center h-16 mx-4 justify-between">
      {renderNavButtons()}

      <div className={"flex items-center gap-10"}>
        <div className={"hidden md:flex justify-around gap-4"}>
          <ActiveCourseSelection setDialogOpen={setCourseDialogOpen} />
          <ActiveAssignmentSelection setDialogOpen={setAssignmentDialogOpen} />
        </div>
        <button
          className={`self-center px-5 py-1 h-12 bg-gray-500 text-white rounded-full font-semibold hover:bg-gray-600 transition duration-300 transform hover:scale-105`}
          onClick={handleOpenUserMenu}
        >
          P
        </button>
      </div>

      <Menu
        sx={{ mt: "45px" }}
        id="user-menu"
        anchorEl={userAnchor}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        keepMounted
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={Boolean(userAnchor)}
        onClose={handleCloseUserMenu}
      >
        <MenuItem onClick={handleSettingsClicked}>Settings</MenuItem>
        <MenuItem onClick={handleLogoutClicked}>Logout</MenuItem>
      </Menu>
      <Dialog
        isOpen={courseDialogOpen}
        onClose={() => setCourseDialogOpen(false)}
        title={"Course Selection"}
      >
        <CourseSelectionMenu onSelect={setCourseDialogOpen} />
      </Dialog>
      <Dialog
        isOpen={assignmentDialogOpen}
        onClose={() => setAssignmentDialogOpen(false)}
        title={"Assignment Selection"}
      >
        <AssignmentSelectionMenu onSelect={setAssignmentDialogOpen} />
      </Dialog>
    </div>
  );
}

export default Navbar;
