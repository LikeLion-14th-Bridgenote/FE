import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../components/common/Input";
import ConsentGate from "../../components/meeting/ConsentGate";
import { meetingApi } from "../../apis/meetingApi";

// 담당: 주연
// 단계: form(정보 입력) → created(링크 발급) → consent(동의, ConsentGate 내부 처리) → join → 회의장 이동
// 백엔드 확정: 호스트도 consent → join 호출 필수 (2026.08.17 확인)

type Step = "form" | "created" | "consent";

export default function MeetingCreate() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("form");

  const now = new Date();
  const defaultTitle = `회의 - ${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  const [title, setTitle] = useState(defaultTitle);
  const [description, setDescription] = useState("");
  const [expectedCount, setExpectedCount] = useState("");
  const [inviteUrl, setInviteUrl] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [meetingId, setMeetingId] = useState("");
  const [copied, setCopied] = useState(false);
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await meetingApi.create({
        title,
        description: description || undefined,
        expected_count: expectedCount ? Number(expectedCount) : undefined,
      });
      setInviteUrl(res.data.invite_url);
      setInviteCode(res.data.invite_code);
      setMeetingId(res.data.id);
      setStep("created");
    } catch (e) {
      // TODO: 회의 생성 실패 에러 처리
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // ConsentGate 내부에서 consent API 호출 및 성공 처리까지 끝낸 뒤 이 콜백이 실행됨
  const handleAgreeAndJoin = async () => {
    setJoining(true);
    setJoinError("");
    try {
      await meetingApi.join(meetingId, inviteCode);
      navigate(`/meetings/${meetingId}`);
    } catch (e) {
      setJoinError("회의 참가 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setJoining(false);
    }
  };

  if (step === "consent") {
    return (
      <div>
        <ConsentGate
          meetingId={meetingId}
          meetingTitle={title}
          meetingDate={now.toLocaleString("ko-KR")}
          isCreator
          onAgree={handleAgreeAndJoin}
        />
        {joinError && (
          <p className="text-center text-xs text-accent mt-4 px-4">{joinError}</p>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EDECE6] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8">
        {step === "form" ? (
          <>
            <p className="text-lg font-semibold text-gray-900 mb-1">새 회의 만들기</p>
            <p className="text-xs text-gray-400 mb-6">기본 정보를 입력하고 회의를 생성</p>

            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-800 block mb-1.5">회의 제목</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-800 block mb-1.5">
                  회의 설명 <span className="text-gray-400 font-normal">(선택)</span>
                </label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="예: 3분기 예산안 검토 회의"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-800 block mb-1.5">
                  예상 참가 인원 <span className="text-gray-400 font-normal">(선택)</span>
                </label>
                <Input
                  value={expectedCount}
                  onChange={(e) => setExpectedCount(e.target.value)}
                  placeholder="예: 3"
                />
              </div>

              <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-600 flex flex-col gap-1.5">
                <p>ⓘ 참가자 언어·문화권은 각자 로그인 프로필에서 자동으로 인식돼요</p>
                <p>🎙 마이크는 나(생성자)로 기본 설정되며, 회의 중 다른 참가자로 전환할 수 있어요</p>
              </div>

              <button
                type="submit"
                className="mt-2 w-full py-3 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90 transition-opacity"
              >
                회의 생성
              </button>
            </form>
          </>
        ) : (
          <>
            <p className="text-lg font-semibold text-gray-900 mb-1">회의 생성됐어요</p>
            <p className="text-xs text-gray-400 mb-6">링크를 공유하고 입장해보세요</p>

            <label className="text-sm font-semibold text-gray-800 block mb-1.5">초대 링크</label>
            <div className="flex gap-2 mb-6">
              <input
                readOnly
                value={inviteUrl}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-gray-50"
              />
              <button
                onClick={handleCopy}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
              >
                {copied ? "복사됨" : "복사"}
              </button>
            </div>

            <button
              onClick={() => setStep("consent")}
              disabled={joining}
              className="w-full py-3 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {joining ? "입장 중..." : "다음: 데이터 처리 동의"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}