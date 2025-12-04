import { defineConfig } from 'vite'
import path from "path"
import react from '@vitejs/plugin-react'
import { fileURLToPath} from 'url'

const _filename = fileURLToPath(import.meta.url)
const _dirname = path.dirname(_filename)


export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(_dirname, "./src")
    }
  }
})
