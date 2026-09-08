import { ProductRow } from "./ProductRow";

// R-03 fix: onAdd is a stable prop from the parent, so memo can work.
export function ProductList({ products, onAdd }) {
  return (
    <ul>
      {products.map((product) => (
        // R-06 fix: the id stays with the item, so React moves the row
        // instead of rebuilding it.
        <ProductRow key={product.id} product={product} onAdd={onAdd} />
      ))}
    </ul>
  );
}
