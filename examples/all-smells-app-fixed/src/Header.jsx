import { useContext } from "react";
import { CartContext, ThemeContext, UserContext } from "./AppContext";

export function Header() {
  const user = useContext(UserContext);
  const { theme, setTheme } = useContext(ThemeContext);
  const { cart } = useContext(CartContext);
  // S-02 fix: derived during render. No effect, no second paint.
  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);
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
