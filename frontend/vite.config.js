import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// import dotenv from "dotenv"
// dotenv.config(); 
// const PORT = process.env.PORT;
// https://vite.dev/config/
export default defineConfig({
  
  plugins: [
    tailwindcss(),
    react()],
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server:{
    port: 3000,
    proxy:{
      "/api":{
        target:"http://localhost:8000",
        changeOrigin: true,
      }
    }
  }
})
