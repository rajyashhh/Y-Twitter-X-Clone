import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// import dotenv from "dotenv"
// dotenv.config(); 
// const PORT = process.env.PORT;
// https://vite.dev/config/
export default defineConfig({
  
  plugins: [
    tailwindcss(),
    react()],
  server:{
    port: 3000,
    proxy:{
      "/api":{
        target:"http:localhost:5000",
        changeOrigin: true,
      }
    }
  }
})
