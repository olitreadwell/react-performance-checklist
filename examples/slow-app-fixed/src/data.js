// 500 products. Each image has a srcset so small screens download small
// images, and the row adds loading="lazy" (L-03, F-01).
export const PRODUCTS = Array.from({ length: 500 }, (_, i) => ({
  id: i + 1,
  name: `Product ${i + 1}`,
  price: (i % 100) + 1,
  image: `https://picsum.photos/seed/${i + 1}/400`,
  srcset: [
    `https://picsum.photos/seed/${i + 1}/200 200w`,
    `https://picsum.photos/seed/${i + 1}/400 400w`,
  ].join(", "),
}));
