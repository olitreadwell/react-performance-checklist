import { useContext } from "react";
import { CartContext, ThemeContext, UserContext } from "./AppContext";

export function Header() {
  const user = useContext(UserContext);
  const { theme, setTheme } = useContext(ThemeContext);
  const { cart } = useContext(CartContext);
  return (
    <header>
      <span>{user.name}</span>
      <span>Cart: {cart.length}</span>
      <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
        Toggle theme
      </button>
    </header>
  );
}
