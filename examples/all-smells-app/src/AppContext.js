import { createContext } from "react";

// R-05: one context holds everything. Any change re-renders every consumer.
export const AppContext = createContext(null);
