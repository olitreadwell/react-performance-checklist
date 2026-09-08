import { useContext } from "react";
import { AppContext } from "./AppContext";
import { ProductRow } from "./ProductRow";

export function ProductList({ products }) {
  const { addToCart } = useContext(AppContext);
  // R-08: a component defined inside a component. Every render creates a
  // new type, so React unmounts and remounts every row, and memo cannot
  // help.
  const ProductItem = ({ product }) => (
    <ProductRow product={product} onAdd={() => addToCart(product)} />
  );
  return (
    <ul>
      {products.map((product, index) => (
        // R-06: key={index} in a list that reorders. The index moves
        // between items, so React rebuilds the wrong rows.
        <ProductItem key={index} product={product} />
      ))}
    </ul>
  );
}
