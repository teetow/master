import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import crossOriginIsolation from "vite-plugin-cross-origin-isolation";
import { execSync } from "child_process";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/master/",
  plugins: [
    react(),
    crossOriginIsolation(),
    {
      writeBundle() {
        execSync("cp ./coi-serviceworker.min.js ./dist");
      },
    },
  ],
});
