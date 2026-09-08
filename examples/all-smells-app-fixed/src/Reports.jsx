// L-02 fix: no whole-package imports. Plain JS. The slow version
// imported lodash and moment for two lines of work.
export function Reports() {
  const rows = [];
  for (let i = 0; i < 5000; i++) {
    rows.push(<div key={i}>report row {i}</div>);
  }
  return <section>{rows}</section>;
}
