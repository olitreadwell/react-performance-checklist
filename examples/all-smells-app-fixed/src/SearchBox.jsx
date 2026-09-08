export function SearchBox({ query, setQuery }) {
  return (
    <input
      value={query}
      onChange={(event) => setQuery(event.target.value)}
      placeholder="Search products"
      aria-label="Search products"
    />
  );
}
