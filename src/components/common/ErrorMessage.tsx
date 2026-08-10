export default function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
      <span>⚠</span>
      <span>{message}</span>
    </div>
  );
}
