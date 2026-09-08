// L-01: imported eagerly. Every user downloads this heavy screen on the
// first visit, even if they never open it.
export function Reports() {
  const rows = [];
  for (let i = 0; i < 5000; i++) {
    rows.push(<div key={i}>report row {i}</div>);
  }
  return <section>{rows}</section>;
}
