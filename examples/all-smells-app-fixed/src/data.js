// 500 products. Images are local SVG data URIs: deterministic, instant,
// and no network cost. The row adds loading="lazy" and a srcset
// (L-03, F-01). The slow version used remote photos, which is exactly
// why its LCP failed the Lighthouse budget.
function svgUri(text, width, height) {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">` +
    `<rect width="100%" height="100%" fill="#e8e8e8"/>` +
    `<text x="50%" y="50%" font-size="28" text-anchor="middle" ` +
    `dominant-baseline="middle" font-family="system-ui">${text}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export const PRODUCTS = Array.from({ length: 500 }, (_, i) => {
  const id = i + 1;
  return {
    id,
    name: `Product ${id}`,
    // Product 1 is expensive on purpose: name sort and price sort must
    // produce a different first row, so the R-06 key test can see it.
    price: i === 0 ? 999 : (i % 100) + 1,
    image: svgUri(`Product ${id}`, 400, 300),
    srcset: [
      `${svgUri(`Product ${id}`, 200, 150)} 200w`,
      `${svgUri(`Product ${id}`, 400, 300)} 400w`,
    ].join(", "),
  };
});
