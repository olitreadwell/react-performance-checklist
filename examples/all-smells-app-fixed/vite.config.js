import reactCompiler from "babel-plugin-react-compiler";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  // G-02 fix: React Compiler adds memoization at build time, so manual
  // memo code is less necessary.
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler", {}]],
      },
    }),
  ],
  test: {
    environment: "jsdom",
  },
});
