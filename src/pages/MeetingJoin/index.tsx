import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ConsentGate from "../../components/meeting/ConsentGate";

// 담당: 주연
// 단계: check(회의 유효성 확인) → consent(동의)
// TODO: meetingApi.get(id)로 실제 회의 정보/생성자 이름 받아오기

type Step = "check" | "consent";

export default function MeetingJoin() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("check");

  // TODO: 실제로는 meetingApi.get(id) 응답으로 대체
  const meetingCreator = "장주연";
  const meetingTitle = "오늘의 회의";
  const meetingDate = "2026.08.05 14:30";

  if (step === "consent") {
    return (
      <ConsentGate
        meetingTitle={meetingTitle}
        meetingDate={meetingDate}
        isCreator={false}
        onAgree={() => navigate(`/meetings/${id}`)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#EDECE6] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8">
        <p className="text-lg font-semibold text-gray-900 mb-1">회의 참여</p>
        <p className="text-xs text-gray-400 mb-6">로그인 확인, 회의 ID 파싱 완료</p>

        <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 mb-6">
          유효한 회의를 찾았어요. 생성자: {meetingCreator}
        </div>

        <button
          onClick={() => setStep("consent")}
          className="w-full py-3 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          다음: 데이터 처리 동의
        </button>
      </div>
    </div>
  );
}