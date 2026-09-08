import { memo } from "react";
// L-05 fix: import from the exact module, not the barrel index. The
// bundler loads only what the page uses.
import { formatPrice } from "./lib/format";

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
      <span>{formatPrice(product.price)}</span>
      <button onClick={onAdd}>Add</button>
    </li>
  );
});
