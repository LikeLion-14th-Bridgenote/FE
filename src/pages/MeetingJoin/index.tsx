import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { meetingApi } from "../../apis/meetingApi";
import ConsentGate from "../../components/meeting/ConsentGate";

// 담당: 주연
// 참가 흐름: URL의 ?code= 쿼리 → 동의(consent, ConsentGate 내부에서 처리) → 참가(join) → 회의장
// 백엔드 확정: consent → join → WS 연결 순서 필수 (2026.08.17 확인)

type Step = "loading" | "consent" | "joining" | "error";

export default function MeetingJoin() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("loading");
  const [error, setError] = useState("");

  const inviteCode = searchParams.get("code");

  useEffect(() => {
    if (!id || !inviteCode) {
      setError("유효하지 않은 초대 링크입니다. 코드가 포함된 링크로 다시 접속해주세요.");
      setStep("error");
      return;
    }
    setStep("consent");
  }, [id, inviteCode]);

  // ConsentGate 내부에서 consent API 호출 및 성공 처리까지 끝낸 뒤 이 콜백이 실행됨
  const handleAgreeAndJoin = async () => {
    if (!id || !inviteCode) return;
    setStep("joining");
    try {
      await meetingApi.join(id, inviteCode);
      navigate(`/meetings/${id}`);
    } catch (e) {
      setError("참가 처리 중 오류가 발생했습니다. 초대 코드를 다시 확인해주세요.");
      setStep("error");
    }
  };

  if (step === "consent" && id) {
    return (
      <ConsentGate
        meetingId={id}
        meetingTitle="참여 회의"
        meetingDate={new Date().toLocaleString("ko-KR")}
        isCreator={false}
        onAgree={handleAgreeAndJoin}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#EDECE6] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8 text-center">
        {(step === "loading" || step === "joining") && (
          <p className="text-sm text-gray-500">
            {step === "joining" ? "회의 참가 처리 중..." : "회의 정보를 확인하는 중..."}
          </p>
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