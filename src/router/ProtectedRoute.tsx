import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

// 개발 중엔 .env에 VITE_SKIP_AUTH=true 넣으면 로그인 체크를 건너뜀.
// 실제 배포 빌드에서는 이 값을 안 넣으면(또는 false) 원래대로 동작함.
const SKIP_AUTH = import.meta.env.VITE_SKIP_AUTH === "true";

export default function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated && !SKIP_AUTH) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}