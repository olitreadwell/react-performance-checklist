import { lazy, Suspense, useCallback, useMemo, useState } from "react";
import { CartContext, ThemeContext, UserContext } from "./AppContext";
import { PRODUCTS } from "./data";
import { Header } from "./Header";
import { ProductList } from "./ProductList";
import { SearchBox } from "./SearchBox";
import { SortControl } from "./SortControl";

// L-01 fix: the heavy screen loads only when it is opened.
const Reports = lazy(() =>
  import("./Reports").then((module) => ({ default: module.Reports })),
);

export default function App() {
  const [user] = useState({ name: "Oli" });
  const [theme, setTheme] = useState("light");
  const [cart, setCart] = useState([]);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("name");

  // R-03 fix: stable identity, so memo can work.
  const addToCart = useCallback((product) => {
    setCart((prev) => [...prev, product]);
  }, []);

  // R-07 fix: the filter and sort run only when query or sort change.
  const visible = useMemo(
    () =>
      PRODUCTS.filter((product) =>
        product.name.toLowerCase().includes(query.toLowerCase()),
      ).sort((a, b) =>
        sort === "price" ? a.price - b.price : a.name.localeCompare(b.name),
      ),
    [query, sort],
  );

  // R-05 fix: memoize the context values so a change in one does not
  // re-render the consumers of another.
  const themeValue = useMemo(() => ({ theme, setTheme }), [theme]);
  const cartValue = useMemo(() => ({ cart, addToCart }), [cart, addToCart]);

  return (
    <UserContext.Provider value={user}>
      <ThemeContext.Provider value={themeValue}>
        <CartContext.Provider value={cartValue}>
          <div className={theme}>
            <Header />
            <SearchBox query={query} setQuery={setQuery} />
            <SortControl sort={sort} setSort={setSort} />
            <ProductList products={visible} onAdd={addToCart} />
            <Suspense fallback={<p>Loading reports...</p>}>
              <Reports />
            </Suspense>
          </div>
        </CartContext.Provider>
      </ThemeContext.Provider>
    </UserContext.Provider>
  );
}
