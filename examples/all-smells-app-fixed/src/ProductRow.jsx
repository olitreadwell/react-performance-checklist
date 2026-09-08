import { memo } from "react";

// R-03: memoized, but the parent passes an inline function and an inline
// style object, so memo sees a new prop every render and cannot help.
export const ProductRow = memo(function ProductRow({ product, onAdd }) {
  return (
    <li>
      {/* L-03 + F-01 fix: lazy loading and a srcset. */}
      <img
        src={product.image}
        srcSet={product.srcset}
        sizes="(max-width: 600px) 50vw, 200px"
        loading="lazy"
        alt={product.name}
      />
      <span>{product.name}</span>
      <span>${product.price}</span>
      <button onClick={onAdd}>Add</button>
    </li>
  );
});
