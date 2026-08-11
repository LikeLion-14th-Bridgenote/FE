import type { ReactNode } from "react";

interface ConsentGateProps {
  meetingTitle: string;
  meetingDate: string;
  isCreator: boolean;
  onAgree: () => void;
  children?: ReactNode;
}

export default function ConsentGate({
  meetingTitle,
  meetingDate,
  isCreator,
  onAgree,
}: ConsentGateProps) {
  return (
    <div className="min-h-screen bg-[#EDECE6] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8">
        <p className="text-xs text-gray-400 mb-1">
          {isCreator ? "내가 생성한 회의" : "초대받은 회의"}
        </p>
        <p className="text-lg font-semibold text-gray-900 mb-4">
          {meetingTitle} - {meetingDate}
        </p>

        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <label className="flex items-start gap-2 text-sm text-gray-700">
            <input type="checkbox" className="mt-1" defaultChecked />
            <span>
              음성 및 텍스트 데이터가 실시간 전사/번역/문화 오해 감지를 위해
              처리되는 것에 동의합니다.
            </span>
          </label>
        </div>

        <button
          onClick={onAgree}
          className="w-full py-3 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          동의하고 회의장 입장
        </button>
      </div>
    </div>
  );
}