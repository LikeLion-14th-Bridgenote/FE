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
| Dashboard, MeetingCreate, MeetingJoin, MeetingRoom | 주연 | BE 페어: 전진수 |
| MeetingMinutes, MeetingArchive | 동균 | BE 페어: 원종윤 (AI minutes) |
| i18n, Navbar, 공용 컴포넌트 | 주연 + 재웅 |

## Environment

    VITE_API_BASE_URL=<BE 서버 주소, 팀 채팅 공지 참고>
    VITE_WS_URL=<WS 주소>/ws

현재 BE는 trycloudflare 임시 터널을 사용 중이라 서버 재시작 시 주소가 바뀐다. 최신 주소는 팀 채팅에서 확인. 정식 서버(가비아) 전환 후 고정 예정.

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

## Available Scripts

    npm run dev        개발 서버
    npm run build       프로덕션 빌드 (tsc -b && vite build)
    npm run lint         ESLint

## Git Workflow

기본 브랜치: develop (팀원 작업 기준) · main (배포/제출용, push 제한)

    git checkout develop
    git pull origin develop
    git checkout -b feature/<기능>-<이름>
    git add .
    git commit -m "[ADD] 기능 설명"
    git push -u origin feature/<기능>-<이름>

develop → main 머지는 팀장(주연)만 진행한다.

## PR 규칙

- PR 대상 브랜치는 항상 develop (팀원은 main에 직접 접근 불가, branch protection으로 제한됨)
- 민감 파일(.env, API 키)은 반드시 .gitignore에 추가 (이미 포함)
- 작업 전 PR을 먼저 올리고 팀 확인 후 머지 (직접 머지 지양)

## Commit Convention

| 태그 | 의미 |
|---|---|
| [INIT] | 초기 세팅 |
| [ADD] | 기능 추가 |
| [FIX] | 버그 수정 |
| [REFACTOR] | 리팩토링 |
| [HOTFIX] | 긴급 수정 |

## 공용 컴포넌트 원칙

페이지마다 버튼·인풋·카드를 새로 만들지 않는다. components/common에 팔레트(청록 #2C7B98, 코랄 #E2795F, 배경 #EDECE6)·폰트(YuhanKimberlyPureunsoop)가 적용된 기본 컴포넌트를 먼저 만들고 각 페이지는 이걸 가져다 쓴다.

## 관련 문서

- 기능 명세서 (노션)
- 기획서 (노션)
- 백엔드: bridgenote-BE 레포
- AI 서버: bridgenote-AI 레포