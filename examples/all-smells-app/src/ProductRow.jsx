import { memo } from "react";

// R-03: memoized, but the parent passes an inline function and an inline
// style object, so memo sees a new prop every render and cannot help.
export const ProductRow = memo(function ProductRow({ product, onAdd }) {
  return (
    <li>
      <img src={product.image} alt={product.name} />
      <span>{product.name}</span>
      <span>${product.price}</span>
      <button onClick={onAdd}>Add</button>
    </li>
  );
});
