export function SortControl({ sort, setSort }) {
  return (
    <button onClick={() => setSort(sort === "price" ? "name" : "price")}>
      Sort by {sort === "price" ? "name" : "price"}
    </button>
  );
}
