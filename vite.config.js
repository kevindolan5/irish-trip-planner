import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Served from https://<user>.github.io/irish-trip-planner/.
  // Change to "/" if you later point a custom domain at it.
  base: "/irish-trip-planner/",
  plugins: [react()],
});
