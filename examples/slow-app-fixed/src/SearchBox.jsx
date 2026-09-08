// R-05 fix: query is local state, passed as props. No context needed.
export function SearchBox({ query, setQuery }) {
  return (
    <input
      value={query}
      onChange={(event) => setQuery(event.target.value)}
      placeholder="Search products"
    />
  );
}
