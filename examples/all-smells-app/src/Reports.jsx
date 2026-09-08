// L-01: imported eagerly. Every user downloads this heavy screen on the
// first visit, even if they never open it.
// L-02: whole-package imports. Tree-shaking cannot remove anything.
import _ from "lodash";
import moment from "moment";

export function Reports() {
  const rows = [];
  for (let i = 0; i < 5000; i++) {
    rows.push(
      <div key={i}>
        {_.camelCase(`report row ${i}`)} {moment().format("YYYY-MM-DD")}
      </div>,
    );
  }
  return <section>{rows}</section>;
}
