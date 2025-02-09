import { ReactElement } from "react";
import Navbar from "./Navbar.tsx";

export function Header(): ReactElement {
  return (
    // Sticky header with gradient
    <div className="flex-shrink-0 bg-gradient-to-r from-red-500 via-green-500 to-purple-500 min-h-12 h-16 sticky top-0 z-10">
      <Navbar />
    </div>
  );
}
