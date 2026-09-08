import { useContext, useEffect, useState } from "react";
import { AppContext } from "./AppContext";

export function Header() {
  const { user, theme, cart, setTheme } = useContext(AppContext);
  // S-02: derived state computed in an effect. cartTotal is derivable
  // from cart, but the effect updates state after the first paint, so
  // every cart change costs an extra render.
  const [cartTotal, setCartTotal] = useState(0);
  useEffect(() => {
    setCartTotal(cart.reduce((sum, item) => sum + item.price, 0));
  }, [cart]);
  return (
    <header>
      <span>{user.name}</span>
      <span>Cart: {cart.length} ({formatTotal(cartTotal)})</span>
      <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
        Toggle theme
      </button>
    </header>
  );
}

function formatTotal(total) {
  return `$${total.toFixed(2)}`;
}
