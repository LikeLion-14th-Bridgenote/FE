import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function PageLayout() {
  return (
    <div className="min-h-screen bg-[#EDECE6]">
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}