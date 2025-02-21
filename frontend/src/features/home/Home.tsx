import { ReactElement } from "react";
import { useNavigate } from "react-router-dom";
import { Footer, Header } from "@components";
import Paint from "./Paint";

function hexToTailwindColor(hex: string): string {
  const colorMap: { [key: string]: string } = {
    "#ff0000": "bg-red-500",
    "#00ffc3": "bg-teal-400",
    "#0000ff": "bg-blue-700",
    "#ff00ff": "bg-pink-500",
    "#00ffff": "bg-cyan-200",
    "#ffa500": "bg-orange-500",
    "#db1ddb": "bg-purple-500",
    "#008000": "bg-green-600",
    "#ffff00": "bg-yellow-500",
    "#ff1493": "bg-pink-600",
  };

  return colorMap[hex];
}

export function Home(): ReactElement {
  const navigate = useNavigate();

  const blobColors = [
    "#ff0000", // red
    "#00ffc3", // teal
    "#0000ff", // blue
    "#ff00ff", // pink
    "#00ffff", // cyan
    "#ffa500", // orange
    "#db1ddb", // purple
    "#008000", // green
    "#ffff00", // yellow
    "#ff1493", // deep pink
  ];

  const cursorColor = blobColors[Math.floor(Math.random() * blobColors.length)];
  let paintColor = blobColors[Math.floor(Math.random() * blobColors.length)];

  // Ensure cursorColor and paintColor are not the same
  while (paintColor === cursorColor) {
    paintColor = blobColors[Math.floor(Math.random() * blobColors.length)];
  }

  console.log("cursorColor", cursorColor);
  console.log("paintColor", paintColor);
  console.log(
    "hexToTailwindColor(cursorColor)",
    hexToTailwindColor(cursorColor),
  );
  console.log("hexToTailwindColor(paintColor)", hexToTailwindColor(paintColor));
  const handleLogin = () => {
    navigate("/rubric-builder");
  };

  const handleSignUp = () => {
    navigate("/signup");
  };

  return (
    <div className="h-screen w-full bg-gradient-to-br from-gray-800 via-gray-900 to-gray-700 flex flex-col justify-between">
      <Header />

      {/* Logo */}
      <Paint
        color={paintColor}
        cursorBallColor={cursorColor}
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
            className={`${hexToTailwindColor(cursorColor)} text-white rounded-lg px-8 py-3 font-semibold hover:opacity-80 transition duration-300 transform hover:scale-105`}
            onClick={handleLogin}
          >
            Log In
          </button>
          <button
            className="bg-gray-600 text-white rounded-lg px-8 py-3 font-semibold hover:bg-gray-500 transition duration-300 transform hover:scale-105"
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
