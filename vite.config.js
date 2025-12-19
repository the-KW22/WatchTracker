import { defineConfig } from 'vite'
import path from "path"
import react from '@vitejs/plugin-react'
import { fileURLToPath} from 'url'
import tailwindcss from '@tailwindcss/vite'

const _filename = fileURLToPath(import.meta.url)
const _dirname = path.dirname(_filename)


export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(_dirname, "./src")
    }
  }
})
