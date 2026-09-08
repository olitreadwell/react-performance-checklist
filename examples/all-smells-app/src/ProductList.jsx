import { useContext } from "react";
import { AppContext } from "./AppContext";
import { ProductRow } from "./ProductRow";

export function ProductList({ products }) {
  const { addToCart } = useContext(AppContext);
  return (
    <ul>
      {products.map((product, index) => (
        // R-06: key={index} in a list that reorders. The index moves
        // between items, so React rebuilds the wrong rows.
        <ProductRow
          key={index}
          product={product}
          onAdd={() => addToCart(product)}
        />
      ))}
    </ul>
  );
}
