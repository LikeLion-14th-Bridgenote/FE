# Bridgenote Frontend

회의 중 문화적 오해를 실시간으로 짚어주고 회의 후에는 맥락이 담긴 회의록을 제공하는 AI 협업 서비스의 프론트엔드 (React + Vite).

인증·프로필·회의 API는 메인 백엔드(bridgenote-BE, Spring)를 호출하고 실시간 자막·번역·문화 각주는 BE의 순수 WebSocket 채널로 받는다 (STOMP 아님). AI 처리(bridgenote-AI, FastAPI)는 프론트가 직접 호출하지 않는다 — BE가 중계한다.

## Tech Stack

| 항목 | 값 |
|---|---|
| Language | TypeScript |
| Framework | React 18 + Vite |
| Routing | react-router-dom |
| State | Zustand |
| Style | Tailwind CSS (MeetingMinutes/MeetingArchive는 순수 CSS) |
| HTTP | Axios |
| Realtime | 브라우저 네이티브 WebSocket (STOMP 미사용) |
| Audio | MediaRecorder (webm/opus) |
| Deploy | Vercel |
| i18n | 자체 구현 (ko/en/vi) |

## Prerequisites

- Node.js 20+
- npm
- bridgenote-BE 실행 중 (현재 trycloudflare 임시 터널, 주소는 팀 채팅 공지 참고)

## Project Structure

    src/
     ├─ pages/
     │   ├─ Home/                 홈 (랜딩)
     │   ├─ Auth/                 로그인/회원가입 (온보딩 통합됨, Onboarding 폴더 삭제됨)
     │   ├─ MyPage/                마이페이지
     │   ├─ Dashboard/             대시보드
     │   ├─ MeetingCreate/         회의 생성 (consent → join 순서)
     │   ├─ MeetingJoin/           회의 참여 (consent → join 순서)
     │   ├─ MeetingRoom/           회의장 (실시간 자막/번역/각주/마이크/발화자 전환)
     │   ├─ MeetingMinutes/        회의록 상세
     │   └─ MeetingArchive/        과거 회의록 보관함
     ├─ components/
     │   ├─ common/                 Input 등 공용 UI
     │   ├─ layout/                 Navbar (i18n 연동)
     │   └─ meeting/                 ConsentGate
     ├─ stores/                     authStore(JWT sub 디코딩으로 profileId 세팅), langStore
     ├─ apis/                       axios 인스턴스 + authApi, userApi, meetingApi
     ├─ hooks/                      useMeetingSocket, useAudioCapture
     ├─ types/
     ├─ router/                     routes.tsx
     └─ i18n/                       언어팩(ko/en/vi)

## Ownership

| 페이지 | FE 담당 | 비고 |
|---|---|---|
| Home, Auth (초안) | 주연 | 이후 재웅이 마이페이지·다국어(Navbar 포함)까지 확장 | BE 페어: 조수민 |
| MyPage | 재웅 | BE 페어: 조수민 |
| Dashboard, MeetingCreate, MeetingJoin, MeetingRoom | 주연 | BE 페어: 전진수 |
| MeetingMinutes, MeetingArchive | 동균 | BE 페어: 원종윤 (AI minutes) |
| i18n, Navbar, 공용 컴포넌트 | 주연 + 재웅 |

## Environment

    VITE_API_BASE_URL=https://1-201-116-247.sslip.io
    VITE_WS_URL=wss://1-201-116-247.sslip.io/ws

BE는 Gabia 클라우드에 정식 배포되어 24시간 상시 운영, 주소 고정.

## API/실시간 연동 핵심 규칙

- 회의 참가 순서: consent → join → WebSocket 연결. 반드시 이 순서이며 호스트도 예외 없이 따라야 한다. join 미완료 상태로 WS 연결 시 4403으로 거부된다.
- WebSocket 메시지 타입: caption, translation, warning, meeting_started, meeting_ended, participant_joined, participant_left
- 종료 코드: 1000(정상) / 4401(인증실패) / 4403(참가 미완료) / 4404(회의없음) / 4409(종료된 회의)
- 오디오 캡처: MediaRecorder('audio/webm;codecs=opus'), 250ms 청크. recorder는 반드시 하나만 생성해 continuous 스트림을 유지해야 한다 — 재생성 시 STT(Deepgram)가 오디오를 디코드하지 못해 실패한다.
- 필드명 주의: 발화 식별자는 sentence_id (utterance_id 아님). 프로필/회의 참가자의 직무 필드는 job (job_role 아님). 단, 회의록(minutes) 응답의 job_role은 별개 필드로 그대로 사용한다.
- 회의록 조회: GET /api/meetings/{id}/minutes는 status: pending → ready로 비동기 처리되므로 폴링 필요.

## How to Run (Local)

    npm install
    cp .env.example .env
    npm run dev

브라우저: http://localhost:5173

## 관련 문서

- 기능 명세서 (노션)
- 기획서: https://app.notion.com/p/hufsglobal/BN-3af82a1df32180438fcbcf8353dc4a8f
- 백엔드: bridgenote-BE 레포
- AI 서버: bridgenote-AI 레포