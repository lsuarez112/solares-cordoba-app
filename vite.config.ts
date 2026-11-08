import { reactRouter } from "@react-router/dev/vite"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"

export default defineConfig({
  resolve: {
    dedupe: ["react", "react-dom"],
    tsconfigPaths: true,
  },
  optimizeDeps: {
    // Recorre todas las rutas al arrancar el dev server: así Vite pre-empaqueta
    // todas las dependencias de una vez. Sin esto las descubre al navegar, recarga
    // la página ("optimized dependencies changed. reloading") y puede quedar con
    // dos copias de React ("Invalid hook call").
    entries: ["./app/root.tsx", "./app/routes/**/*.tsx"],
  },
  server: {
    host: true,
    port: 5173,
    strictPort: true,
  },
  plugins: [tailwindcss(), reactRouter()],
})
