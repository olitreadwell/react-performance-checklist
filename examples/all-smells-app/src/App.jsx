import { useState } from "react";
import { AppContext } from "./AppContext";
import moment from "moment";
import { PRODUCTS } from "./data";
import { Header } from "./Header";
import { ProductList } from "./ProductList";
import { Reports } from "./Reports";
import { SearchBox } from "./SearchBox";
import { SortControl } from "./SortControl";
import { Stats } from "./Stats";
import { ViewCounter } from "./ViewCounter";

export default function App() {
  const [user] = useState({ name: "Oli" });
  const [theme, setTheme] = useState("light");
  const [cart, setCart] = useState([]);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("name");

  function addToCart(product) {
    setCart((prev) => [...prev, product]);
  }

  // M-02: the click handler blocks the main thread. 200,000 rows of work
  // in one synchronous loop freezes the page.
  function handleExport() {
    const rows = [];
    for (let i = 0; i < 200000; i++) {
      rows.push(`${moment().format("HH:mm:ss")} row ${i}`);
    }
    console.log(`exported ${rows.length} rows`);
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
        <ViewCounter />
        <Stats />
        <button onClick={handleExport}>Export report</button>
        <Reports />
      </div>
    </AppContext.Provider>
  );
}
