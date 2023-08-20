import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// https://vitejs.dev/config/
export default defineConfig({
  // base: "/master/",
  plugins: [react()],
  optimizeDeps: {
    exclude: ["@ffmpeg/ffmpeg", "@ffmpeg/util"],
  },
  test: {
    environment: "jsdom",
    root: "src/",
  },
});
