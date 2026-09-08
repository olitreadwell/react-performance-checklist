import { useContext } from "react";
import { AppContext } from "./AppContext";

export function Header() {
  const { user, theme, cart, setTheme } = useContext(AppContext);
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
