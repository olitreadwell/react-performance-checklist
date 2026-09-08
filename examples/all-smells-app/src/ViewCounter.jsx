import { useStore } from "./store";

export function ViewCounter() {
  // S-01: subscribes to the whole store. Any store change re-renders,
  // even a field this component never reads.
  const state = useStore();
  return <p data-testid="view-counter">Views synced: {state.syncCount}</p>;
}
