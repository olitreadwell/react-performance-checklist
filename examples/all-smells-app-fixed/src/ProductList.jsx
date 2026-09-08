import { ProductRow } from "./ProductRow";

// R-08 fix: no component defined inside a component. The row type is
// stable, so React updates instead of remounting.
// R-03 fix: onAdd comes in as a stable prop, so memo can work.
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
