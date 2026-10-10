export default function Loading() {
  return (
    <div className="p-8">
      <div className="animate-pulse flex flex-col gap-4">
        <div className="h-8 bg-gray-300 w-1/4 rounded"></div>
        <div className="h-4 bg-gray-200 w-1/2 rounded"></div>
      </div>
    </div>
  );
}