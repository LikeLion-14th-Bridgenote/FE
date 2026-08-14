import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { meetingApi } from "../../apis/meetingApi";
import ConsentGate from "../../components/meeting/ConsentGate";

// 담당: 주연
// 참가 흐름: URL의 ?code= 쿼리로 자동 참가 시도 → 동의
// 예: /meetings/{id}/join?code=IQWLG9

type Step = "joining" | "consent" | "error";

export default function MeetingJoin() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("joining");
  const [error, setError] = useState("");
  const [meetingTitle, setMeetingTitle] = useState("");

  const inviteCode = searchParams.get("code");

  useEffect(() => {
    const doJoin = async () => {
      if (!id || !inviteCode) {
        setError("유효하지 않은 초대 링크입니다. 코드가 포함된 링크로 다시 접속해주세요.");
        setStep("error");
        return;
      }
      try {
        const res = await meetingApi.join(id, inviteCode);
        setMeetingTitle(res.data.profile?.nickname ? "회의" : "회의"); // TODO: 회의 제목은 별도 조회 필요
        setStep("consent");
      } catch (e) {
        setError("초대 코드가 올바르지 않거나, 회의를 찾을 수 없습니다.");
        setStep("error");
      }
    };
    doJoin();
  }, [id, inviteCode]);

  if (step === "consent" && id) {
    const meetingId = id;
    return (
      <ConsentGate
        meetingId={meetingId}
        meetingTitle={meetingTitle || "참여 회의"}
        meetingDate={new Date().toLocaleString("ko-KR")}
        isCreator={false}
        onAgree={() => navigate(`/meetings/${meetingId}`)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#EDECE6] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8 text-center">
        {step === "joining" && (
          <p className="text-sm text-gray-500">회의 참가 확인 중...</p>
        )}
        {step === "error" && (
          <>
            <p className="text-sm text-accent mb-4">{error}</p>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50"
            >
              대시보드로 돌아가기
            </button>
          </>
        )}
      </div>
    </div>
  );
}