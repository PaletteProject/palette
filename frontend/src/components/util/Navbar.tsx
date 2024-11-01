import * as React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";

function Navbar() {
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const onRubrics = location.pathname === "/rubrics";
  const onTemplates = location.pathname === "/clusters";
  const onBuilder = location.pathname === "/rubric-builder";
  const onGrading = location.pathname === "/grading";

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleClosenNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleHomeClicked = () => {
    navigate("/");
  };

  const handleRubricsClicked = () => {
    navigate("/rubrics");
  };

  const handleClustersClicked = () => {
    navigate("/clusters");
  };

  const handleBuilderClicked = () => {
    navigate("/rubric-builder");
  };

  const handleGradingClicked = () => {
    navigate("/grading");
  };

  // define string constants to ensure tailwind always loads necessary styles and reduces repetitive class names
  const SELECTED = "underline";
  const NOT_SELECTED =
    "no-underline hover:opacity-80 transition duration-300 transform hover:scale-105";
  const NAV_BUTTON_STYLE = `px-3 py-5 ${onRubrics ? SELECTED : NOT_SELECTED}`;

  return (
    <div className="flex justify-between items-centersm h-16 display: {} mx-4">
      <div className={"flex"}>
        <button
          className="px-6 py-4 text-2xl font-bond text-gray-950 hover:opacity-80 transition duration-300 transform hover:scale-105"
          onClick={handleHomeClicked}
        >
          HOME
        </button>
        <button
          disabled={location.pathname === "/rubrics"}
          className={NAV_BUTTON_STYLE}
          onClick={handleRubricsClicked}
        >
          RUBRICS
        </button>

        <button
          disabled={location.pathname === "/clusters"}
          className={`px-3 py-5 ${onTemplates ? "underline" : "no-underline hover:opacity-80 transition duration-300 transform hover:scale-105"}`}
          onClick={handleClustersClicked}
        >
          TEMPLATES
        </button>

        <button
          disabled={location.pathname === "/rubric-builder"}
          className={`px-3 py-5 ${onBuilder ? "underline" : "no-underline hover:opacity-80 transition duration-300 transform hover:scale-105"}`}
          onClick={handleBuilderClicked}
        >
          BUILDER
        </button>
        <button
          disabled={location.pathname === "/grading"}
          className={`px-3 py-5 ${
            onGrading
              ? "underline"
              : "no-underline hover:opacity-80 transition duration-300" +
                " transform hover:scale-105"
          }`}
          onClick={handleGradingClicked}
        >
          GRADING
        </button>
      </div>

      <button
        className={`self-center px-5 py-1 h-12 bg-gray-500 text-white rounded-full font-semibold hover:opacity-80 transition duration-300 transform hover:scale-105`}
        onClick={handleOpenUserMenu}
      >
        U
      </button>

      <Menu
        sx={{ mt: "45px" }}
        id="hamburger-menu"
        anchorEl={anchorElNav}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        keepMounted
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={Boolean(anchorElNav)}
        onClose={handleClosenNavMenu}
      >
        <MenuItem onClick={handleRubricsClicked}>Rubrics</MenuItem>
        <MenuItem onClick={handleClustersClicked}>Templates</MenuItem>
        <MenuItem onClick={handleBuilderClicked}>Builder</MenuItem>
      </Menu>

      <Menu
        sx={{ mt: "45px" }}
        id="user-menu"
        anchorEl={anchorElUser}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        keepMounted
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={Boolean(anchorElUser)}
        onClose={handleCloseUserMenu}
      >
        <MenuItem onClick={handleCloseUserMenu}>Settings</MenuItem>
        <MenuItem onClick={handleHomeClicked}>Logout</MenuItem>
      </Menu>
    </div>
  );
}
export default Navbar;
