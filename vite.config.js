import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dbPlugin = () => ({
  name: 'db-server-plugin',
  configureServer(server) {
    const dbPath = path.resolve(__dirname, 'src/data/db.json')

    server.middlewares.use((req, res, next) => {
      if (req.url === '/api/data') {
        if (req.method === 'GET') {
          try {
            if (fs.existsSync(dbPath)) {
              const data = fs.readFileSync(dbPath, 'utf-8')
              res.setHeader('Content-Type', 'application/json')
              res.setHeader('Access-Control-Allow-Origin', '*')
              res.end(data)
              return
            }
          } catch (e) {
            console.error('Error reading db.json', e)
          }
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({}))
          return
        }

        if (req.method === 'POST') {
          let body = ''
          req.on('data', chunk => {
            body += chunk
          })
          req.on('end', () => {
            try {
              const parsed = JSON.parse(body)
              fs.writeFileSync(dbPath, JSON.stringify(parsed, null, 2), 'utf-8')
              res.setHeader('Content-Type', 'application/json')
              res.setHeader('Access-Control-Allow-Origin', '*')
              res.end(JSON.stringify({ success: true }))
              return
            } catch (e) {
              console.error('Error writing db.json', e)
              res.statusCode = 500
              res.end(JSON.stringify({ error: 'Failed to write data' }))
              return
            }
          })
          return
        }
      }
      next()
    })
  }
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), dbPlugin()],
  server: {
    host: true, // Allow external devices (phones on local network) to connect
    watch: {
      ignored: ['**/src/data/db.json', '**/db.json', '**/.git/**']
    }
  }
})
