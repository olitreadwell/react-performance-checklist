// 500 products. Every image is a full-size remote image with no lazy
// loading and no srcset (L-03, F-01).
export const PRODUCTS = Array.from({ length: 500 }, (_, i) => ({
  id: i + 1,
  name: `Product ${i + 1}`,
  // Product 1 is expensive on purpose: name sort and price sort must
  // produce a different first row, so the R-06 key test can see it.
  price: i === 0 ? 999 : (i % 100) + 1,
  image: `https://picsum.photos/seed/${i + 1}/400`,
}));
