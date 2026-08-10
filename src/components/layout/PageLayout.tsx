import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

// 상단바가 있는 페이지 그룹을 감싸는 레이아웃.
// routes.tsx에서 이 레이아웃으로 감싼 라우트들만 Navbar가 붙음.
export default function PageLayout() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
