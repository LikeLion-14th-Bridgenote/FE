import { createBrowserRouter } from "react-router-dom";
import PageLayout from "../components/layout/PageLayout";
import ProtectedRoute from "./ProtectedRoute";

import Home from "../pages/Home";
import Auth from "../pages/Auth";
import MyPage from "../pages/MyPage";
import Dashboard from "../pages/Dashboard";
import MeetingCreate from "../pages/MeetingCreate";
import MeetingJoin from "../pages/MeetingJoin";
import MeetingRoom from "../pages/MeetingRoom";
import MeetingMinutes from "../pages/MeetingMinutes";
import MeetingArchive from "../pages/MeetingArchive";

// ⚠️ 이 파일은 되도록 건드리지 않기. 라우트 경로/상단바 유무/로그인 필요 여부가 다 여기서 결정됨.
// (2026-08-11: 회원가입 폼에 언어/문화권/직업/기관 통합되면서 온보딩 페이지 제거)

export const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/login", element: <Auth /> },

  {
    element: <ProtectedRoute />,
    children: [
      { path: "/meetings/:id/join", element: <MeetingJoin /> },
      { path: "/meetings/:id", element: <MeetingRoom /> },
    ],
  },

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