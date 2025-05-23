import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      external: ['@tanstack/react-query', '@radix-ui/react-tooltip', 'class-variance-authority'],
    },
  },
  optimizeDeps: {
    include: ['@tanstack/react-query', '@radix-ui/react-tooltip', 'class-variance-authority'],
  },
});
