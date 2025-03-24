import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";
import { defineConfig } from 'vite'

export default defineConfig({
  base: "/helix-jump/",
  plugins: [
    wasm(),
    topLevelAwait()
  ],
  build: {
    rollupOptions: {
      treeshake: false,
    }
  }
})
