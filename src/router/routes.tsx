import { createBrowserRouter } from "react-router-dom";
import PageLayout from "../components/layout/PageLayout";
import ProtectedRoute from "./ProtectedRoute";

import Home from "../pages/Home";
import Auth from "../pages/Auth";
import Onboarding from "../pages/Onboarding";
import MyPage from "../pages/MyPage";
import Dashboard from "../pages/Dashboard";
import MeetingCreate from "../pages/MeetingCreate";
import MeetingJoin from "../pages/MeetingJoin";
import MeetingRoom from "../pages/MeetingRoom";
import MeetingMinutes from "../pages/MeetingMinutes";
import MeetingArchive from "../pages/MeetingArchive";

// ⚠️ 이 파일은 되도록 건드리지 않기. 라우트 경로/상단바 유무/로그인 필요 여부가 다 여기서 결정됨.
// 각자 담당 페이지(src/pages/각자폴더/index.tsx) 안의 내용만 채우면 됨.

export const router = createBrowserRouter([
  // 상단바 없음 + 로그인 불필요
  { path: "/", element: <Home /> },
  { path: "/login", element: <Auth /> },

  // 상단바 없음 + 로그인 필요 (온보딩은 가입 직후 상태, 회의 참여/회의장은 자체 헤더 있음)
  {
    element: <ProtectedRoute />,
    children: [
      { path: "/onboarding", element: <Onboarding /> },
      { path: "/meetings/:id/join", element: <MeetingJoin /> },
      { path: "/meetings/:id", element: <MeetingRoom /> },
    ],
  },

  // 상단바 있음 + 로그인 필요
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <PageLayout />,
        children: [
          { path: "/dashboard", element: <Dashboard /> },
          { path: "/mypage", element: <MyPage /> },
          { path: "/meetings/new", element: <MeetingCreate /> },
          { path: "/meetings/:id/minutes", element: <MeetingMinutes /> },
          { path: "/archive", element: <MeetingArchive /> },
        ],
      },
    ],
  },
]);
