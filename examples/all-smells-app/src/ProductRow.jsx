import { memo } from "react";
// L-05: imports from the barrel index instead of the exact module. The
// bundler pulls in every module the barrel re-exports.
import { formatPrice } from "./lib";

// R-03: memoized, but the parent passes an inline function, so memo sees
// a new prop every render and cannot help.
export const ProductRow = memo(function ProductRow({ product, onAdd }) {
  return (
    <li>
      <img src={product.image} alt={product.name} />
      <span>{product.name}</span>
      <span>{formatPrice(product.price)}</span>
      <button onClick={onAdd}>Add</button>
    </li>
  );
});
