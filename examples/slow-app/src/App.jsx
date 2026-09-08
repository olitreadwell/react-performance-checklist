import { useState } from "react";
import { AppContext } from "./AppContext";
import { PRODUCTS } from "./data";
import { Header } from "./Header";
import { ProductList } from "./ProductList";
import { Reports } from "./Reports";
import { SearchBox } from "./SearchBox";
import { SortControl } from "./SortControl";

export default function App() {
  const [user] = useState({ name: "Oli" });
  const [theme, setTheme] = useState("light");
  const [cart, setCart] = useState([]);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("name");

  function addToCart(product) {
    setCart((prev) => [...prev, product]);
  }

  // R-07: heavy work in render. Filter and sort run on every render,
  // including renders caused by typing in the search box.
  const visible = PRODUCTS.filter((product) =>
    product.name.toLowerCase().includes(query.toLowerCase()),
  ).sort((a, b) =>
    sort === "price" ? a.price - b.price : a.name.localeCompare(b.name),
  );

  return (
    <AppContext.Provider
      value={{ user, theme, cart, addToCart, setTheme, setQuery, setSort }}
    >
      <div className={theme}>
        <Header />
        <SearchBox />
        <SortControl sort={sort} setSort={setSort} />
        <ProductList products={visible} />
        <Reports />
      </div>
    </AppContext.Provider>
  );
}
