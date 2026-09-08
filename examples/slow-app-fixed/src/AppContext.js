import { createContext } from "react";

// R-05 fix: one small context per concern. A theme change re-renders
// only theme consumers, not the whole tree.
export const UserContext = createContext(null);
export const ThemeContext = createContext(null);
export const CartContext = createContext(null);
