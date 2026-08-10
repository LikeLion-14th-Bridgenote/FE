import type { ReactNode } from "react";

export default function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-gray-200 rounded-xl p-5 ${className}`}>
      {children}
    </div>
  );
}
