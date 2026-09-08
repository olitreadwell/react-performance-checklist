import { useContext } from "react";
import { AppContext } from "./AppContext";

export function SearchBox() {
  const { query, setQuery } = useContext(AppContext);
  return (
    <input
      value={query}
      onChange={(event) => setQuery(event.target.value)}
      placeholder="Search products"
    />
  );
}
