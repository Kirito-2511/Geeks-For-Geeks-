import 'dotenv/config'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// In-memory token store (dev only — resets on server restart)
const activeTokens = new Set()

const authPlugin = () => ({
  name: 'auth-server-plugin',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      // --- POST /api/auth  (login) ---
      if (req.url === '/api/auth' && req.method === 'POST') {
        let body = ''
        req.on('data', chunk => { body += chunk })
        req.on('end', () => {
          try {
            const { password } = JSON.parse(body)
            const ADMIN_PASSWORD = process.env.GFG_ADMIN_PASSWORD || ''
            if (!ADMIN_PASSWORD) {
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Server not configured — set GFG_ADMIN_PASSWORD in .env' }))
              return
            }
            if (password === ADMIN_PASSWORD) {
              const token = crypto.randomUUID()
              activeTokens.add(token)
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ success: true, token }))
            } else {
              res.statusCode = 401
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Invalid password' }))
            }
          } catch (e) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Bad request' }))
          }
        })
        return
      }

      // --- POST /api/auth/verify  (token validation) ---
      if (req.url === '/api/auth/verify' && req.method === 'POST') {
        let body = ''
        req.on('data', chunk => { body += chunk })
        req.on('end', () => {
          try {
            const { token } = JSON.parse(body)
            const valid = activeTokens.has(token)
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ valid }))
          } catch (e) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Bad request' }))
          }
        })
        return
      }

      // --- POST /api/auth/logout  (token invalidation) ---
      if (req.url === '/api/auth/logout' && req.method === 'POST') {
        let body = ''
        req.on('data', chunk => { body += chunk })
        req.on('end', () => {
          try {
            const { token } = JSON.parse(body)
            activeTokens.delete(token)
          } catch (e) { /* ignore */ }
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ success: true }))
        })
        return
      }

      next()
    })
  }
})

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
  plugins: [react(), authPlugin(), dbPlugin()],
  server: {
    host: true, // Allow external devices (phones on local network) to connect
    watch: {
      ignored: ['**/src/data/db.json', '**/db.json', '**/.git/**']
    }
  }
})
