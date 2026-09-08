import { useStore } from "./store";

export function ViewCounter() {
  // S-01 fix: subscribe to the slice this component reads. Other store
  // changes do not re-render it.
  const syncCount = useStore((state) => state.syncCount);
  return <p data-testid="view-counter">Views synced: {syncCount}</p>;
}
