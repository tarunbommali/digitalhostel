import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      "@platform": path.resolve(__dirname, "./src/modules/super-admin"),
      "@organization": path.resolve(__dirname, "./src/modules/organization"),
      "@student": path.resolve(__dirname, "./src/modules/student"),
      "@guard": path.resolve(__dirname, "./src/modules/guard"),
      "@shared": path.resolve(__dirname, "./src/modules/shared"),
      "@core": path.resolve(__dirname, "./src/core"),
      "@/core": path.resolve(__dirname, "./src/core"),
      "@/modules": path.resolve(__dirname, "./src/modules"),
      "@/context": path.resolve(__dirname, "./src/core/context"),
      "@/components": path.resolve(__dirname, "./src/core/components"),
      "@/lib": path.resolve(__dirname, "./src/core/lib"),
      "@/hooks": path.resolve(__dirname, "./src/core/hooks"),
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
      },
    },
  },
});
