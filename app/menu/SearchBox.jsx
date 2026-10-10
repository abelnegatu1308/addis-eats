export default function SearchBox({ value, onChange, isSearching, error }) {
  return (
    <div className="mb-6">
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label="Search dishes"
        placeholder="Search dishes..."
        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
      />

      {isSearching && (
        <p className="mt-2 text-sm text-gray-500" role="status">
          Searching...
        </p>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          Failed to load search results.
        </p>
      )}
    </div>
  );
}