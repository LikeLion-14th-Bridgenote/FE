export default function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-8 text-gray-500 text-sm">
      <div className="w-6 h-6 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
      {label && <p>{label}</p>}
    </div>
  );
}
