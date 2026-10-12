export default function Loading() {
  return (
    <div className="p-8">
      <div className="animate-pulse flex flex-col gap-4">
        <div className="h-8 w-1/4 rounded" style={{ background: "var(--surface-3)" }}></div>
        <div className="h-4 w-1/2 rounded" style={{ background: "var(--surface-2)" }}></div>
      </div>
    </div>
  );
}