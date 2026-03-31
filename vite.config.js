import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const groqKey = env.VITE_GROQ_API_KEY || ''

  return {
    plugins: [react()],
    server: {
      port: 3000,
      proxy: {
        '/groq': {
          target: 'https://api.groq.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/groq/, ''),
          headers: {
            'Authorization': `Bearer ${groqKey}`,
            'Content-Type': 'application/json',
          },
        },
      },
    },
  }
})