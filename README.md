# Bridgenote Frontend

회의 중 문화적 오해를 실시간으로 줄이고, 회의 후에는 맥락까지 담은 회의록을 제공하는 AI 협업 서비스의 프론트엔드 (React + Vite).

인증·프로필·회의 API는 메인 백엔드(`bridgenote-BE`, Spring)를 호출하고, 실시간 자막·번역·문화 각주는 BE의 WebSocket(STOMP) 채널을 구독해서 받는다. AI 처리(`bridgenote-AI`, FastAPI)는 프론트가 직접 호출하지 않는다 — BE가 중계한다.

## Tech Stack

| 항목 | 값 |
|---|---|
| Language | TypeScript |
| Framework | React 18 + Vite |
| Routing | react-router-dom |
| State | Zustand |
| Style | Tailwind CSS |
| HTTP | Axios |
| Realtime | @stomp/stompjs (+ sockjs-client, BE 폴백 방식 확인 필요) |
| Deploy | Vercel |
| Lint/Format | ESLint + Prettier |

## Prerequisites

- Node.js 20+
- npm
- `bridgenote-BE` 로컬 실행 중 (기본 포트 8080) — API/WebSocket 붙일 대상

## Project Structure

```
src/
 ├─ pages/
 │   ├─ Home/                 # 홈 (랜딩)
 │   ├─ Auth/                 # 로그인/회원가입
 │   ├─ Onboarding/           # 온보딩(프로필 설정)
 │   ├─ MyPage/                # 마이페이지
 │   ├─ Dashboard/             # 대시보드(회의 진입 로비)
 │   ├─ MeetingCreate/         # 회의 생성 설정
 │   ├─ MeetingJoin/           # 회의 참여(초대 링크), 생성자/참가자 공용 동의 컴포넌트
 │   ├─ MeetingRoom/           # 회의장 (핵심)
 │   ├─ MeetingMinutes/        # 회의록
 │   └─ MeetingArchive/        # 과거 회의록 보관함
 ├─ components/
 │   ├─ common/                # Button, Input, Select, Card, Modal 등 공용 UI
 │   ├─ layout/                # Navbar, PageLayout
 │   └─ meeting/                # SpeakerAvatarStrip, SubtitleBubble, CultureWarningPanel 등
 ├─ stores/                     # Zustand: authStore, profileStore, meetingStore
 ├─ apis/                       # axios 인스턴스 + authApi, userApi, meetingApi
 ├─ hooks/                      # useAuth, useMeetingSocket 등
 ├─ types/                      # BE DTO 네이밍 규칙과 맞춘 타입
 ├─ router/                     # routes.tsx
 ├─ styles/                     # tailwind.config, 팔레트 변수
 └─ i18n/                       # 언어팩(ko/en/vi), 프로필 언어값 연동
```

각 페이지는 `components / hooks / api` 하위 구조를 자유롭게 둘 수 있다 (페이지별 로컬 컴포넌트는 해당 페이지 폴더 안에).

## Ownership (Page → Owner, BE 페어 기준)

| 페이지 | FE 담당 | 연동 BE 담당 |
|---|---|---|
| Home, Auth, Onboarding, MyPage | 재웅 | 조수민 (auth, user) |
| Dashboard, MeetingCreate, MeetingJoin, MeetingRoom | 주연 | 전진수 (meeting, participant, realtime) |
| MeetingMinutes, MeetingArchive | 동균 | 원종윤 (AI minutes, 노션 API 명세 기준) |
| components/layout, i18n 기반 세팅 | 주연 | 공통 |

## Environment

기본 포트: 5173 (Vite 기본값)

```
VITE_API_BASE_URL=http://localhost:8080
VITE_WS_URL=http://localhost:8080/ws
```

`.env.example` 참고, 실제 값은 커밋 금지.

## API 연동

BE 도메인 요약 (BE README 기준):

| 도메인 | 경로 | 담당 |
|---|---|---|
| 인증 | `/auth/...` | 조수민 |
| 프로필 | `/users/...` | 조수민 |
| 회의 | `/api/meetings/...` | 전진수 |
| 실시간 | `/ws/meetings/{id}` (STOMP) | 전진수 |

⚠️ STOMP destination(구독 토픽) 이름은 아직 BE README에 명시 안 됨 — `/topic/meetings/{id}/transcript` 같은 정확한 채널명은 진수님과 확인 후 `hooks/useMeetingSocket.ts`에 반영 예정.

## How to Run (Local)

```bash
npm install
cp .env.example .env      # 값 채우기
npm run dev
```

브라우저: http://localhost:5173

## Available Scripts

```bash
npm run dev        # 개발 서버
npm run build      # 프로덕션 빌드
npm run lint        # ESLint
npm run format      # Prettier
```

## Git Workflow

기본 브랜치: `develop` (팀원 작업 기준) · `main` (배포/제출용, **push 제한**)
작업 브랜치 규칙: `feature/<기능>-<이름>`

예) `feature/auth-jaewoong`, `feature/meeting-juyeon`, `feature/minutes-donggyun`

```bash
git checkout develop
git checkout -b feature/meeting-juyeon
git add .
git commit -m "[ADD] 회의장 발화자 전환 UI 추가"
git push -u origin feature/meeting-juyeon
```

`develop → main` 머지는 팀장(주연)만 진행한다.

## PR 규칙

- **PR 대상 브랜치는 항상 `develop`** (팀원은 `main`에 직접 접근 불가, branch protection으로 제한됨)
- 민감 파일(`.env`, API 키)은 반드시 `.gitignore`에 추가 (이미 포함)
- PR 제목 예시:
  - `feat(meeting-room): implement speaker avatar strip`
  - `fix(auth): token refresh 오류 수정`

## Commit Convention

| 태그 | 의미 |
|---|---|
| `[INIT]` | 초기 세팅 |
| `[ADD]` | 기능 추가 |
| `[FIX]` | 버그 수정 |
| `[REFACTOR]` | 리팩토링 |
| `[HOTFIX]` | 긴급 수정 |

## 공용 컴포넌트 원칙

페이지마다 버튼·인풋·카드를 새로 만들지 않는다. `components/common`에 팔레트(청록/화이트/코랄)·폰트(Noto Sans KR 메인) 적용된 기본 컴포넌트를 먼저 만들고, 각 페이지는 이걸 가져다 쓴다. 디자인 통일성이 깨지는 걸 방지하기 위함.

## 관련 문서

- 기능 명세서 (노션)
- 기획서 (노션)
- 백엔드: `bridgenote-BE` 레포
- AI 서버: `bridgenote-AI` 레포