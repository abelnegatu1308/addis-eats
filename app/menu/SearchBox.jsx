export default function SearchBox({ value, onChange, isSearching, error }) {
  return (
    <div className="mb-6">
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label="Search dishes"
        placeholder="Search dishes..."
        className="w-full rounded-xl border px-4 py-3 outline-none transition"
        style={{
          background: "var(--input-bg)",
          borderColor: "var(--input-border)",
          color: "var(--text)",
        }}
      />

      {isSearching && (
        <p className="mt-2 text-sm" role="status" style={{ color: "var(--text-muted)" }}>
          Searching...
        </p>
      )}

      {error && (
        <p className="mt-2 text-sm" role="alert" style={{ color: "var(--error)" }}>
          Failed to load search results.
        </p>
      )}
    </div>
  );
}