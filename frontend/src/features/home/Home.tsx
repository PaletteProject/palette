import { ReactElement, useState } from "react";
import { useNavigate } from "react-router-dom";
import { randomColor } from "@utils";
import { Footer, Header } from "@components";
import Paint from "./Paint";
export function Home(): ReactElement {
  const [color, setColor] = useState("bg-red-500");
  const navigate = useNavigate();

  const blobColors = [
    "#ff0000",
    "#00ffc3",
    "#0000ff",
    "#ff00ff",
    "#00ffff",
    "#ff0000",
    "#00ffc3",
    "#0000ff",
    "#ff00ff",
    "#00ffff",
  ];
  const handleMouseEnter = () => {
    setColor(randomColor());
  };

  const handleLogin = () => {
    navigate("/rubric-builder");
  };

  const handleSignUp = () => {
    navigate("/signup");
  };

  const baseButtonStyle =
    "text-white rounded-lg px-8 py-3 font-semibold transition duration-300 transform hover:scale-105";

  return (
    <div className="h-screen w-full bg-gradient-to-br from-gray-800 via-gray-900 to-gray-700 flex flex-col justify-between">
      <Header />

      {/* Logo */}
      <Paint
        color={blobColors[Math.floor(Math.random() * blobColors.length)]}
        cursorBallColor={
          blobColors[Math.floor(Math.random() * blobColors.length)]
        }
        cursorBallSize={2}
        ballCount={15}
        animationSize={30}
        enableMouseInteraction={true}
        hoverSmoothness={0.05}
        clumpFactor={1}
        speed={0.3}
      />
      {/* Main Content Section */}
      <div className="flex flex-col items-center justify-center text-white text-center -mt-44">
        {/* Title */}
        <h1 className="text-6xl font-bold mb-4 tracking-wide">
          Welcome to Palette
        </h1>

        {/* Subtitle */}
        <p className="text-xl text-gray-400 mb-8 max-w-lg mt-1">
          Improve the Canvas project grading experience with the perfect rubric.
        </p>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            className={`${color} ${baseButtonStyle}`}
            onMouseEnter={handleMouseEnter}
            onClick={handleLogin}
          >
            Log In
          </button>
          <button
            className={`bg-gray-600 ${baseButtonStyle} hover:bg-gray-500`}
            onClick={handleSignUp}
          >
            Sign Up
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
