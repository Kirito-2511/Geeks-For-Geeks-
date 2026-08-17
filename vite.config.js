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
        let bodySize = 0
        const MAX_AUTH_BODY = 1024 // 1 KB — auth payloads are tiny
        req.on('data', chunk => {
          bodySize += chunk.length
          if (bodySize > MAX_AUTH_BODY) {
            res.statusCode = 413
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Payload too large' }))
            req.destroy()
            return
          }
          body += chunk
        })
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
        let bodySize = 0
        const MAX_AUTH_BODY = 1024
        req.on('data', chunk => {
          bodySize += chunk.length
          if (bodySize > MAX_AUTH_BODY) {
            res.statusCode = 413
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Payload too large' }))
            req.destroy()
            return
          }
          body += chunk
        })
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
        let bodySize = 0
        const MAX_AUTH_BODY = 1024
        req.on('data', chunk => {
          bodySize += chunk.length
          if (bodySize > MAX_AUTH_BODY) {
            res.statusCode = 413
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Payload too large' }))
            req.destroy()
            return
          }
          body += chunk
        })
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

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:4173',
]

function setCorsHeaders(req, res) {
  const origin = req.headers.origin
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }
  res.setHeader('Vary', 'Origin')
}

const dbPlugin = () => ({
  name: 'db-server-plugin',
  configureServer(server) {
    const dbPath = path.resolve(__dirname, 'src/data/db.json')
    const templatePath = path.resolve(__dirname, 'src/data/db.template.json')

    // If the live database doesn't exist (e.g., fresh clone), generate it from the template
    if (!fs.existsSync(dbPath)) {
      fs.copyFileSync(templatePath, dbPath)
      console.log('🔒 Generated secure local db.json from template')
    }

    server.middlewares.use((req, res, next) => {
      if (req.url === '/api/data') {
        if (req.method === 'GET') {
          try {
            if (fs.existsSync(dbPath)) {
              const data = fs.readFileSync(dbPath, 'utf-8')
              res.setHeader('Content-Type', 'application/json')
              setCorsHeaders(req, res)
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
          // Auth check — require valid admin token
          const authToken = req.headers['x-admin-token']
          if (!authToken || !activeTokens.has(authToken)) {
            res.statusCode = 401
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Unauthorized' }))
            return
          }

          let body = ''
          let bodySize = 0
          const MAX_BODY_SIZE = 10 * 1024 * 1024 // 10 MB limit

          req.on('data', chunk => {
            bodySize += chunk.length
            if (bodySize > MAX_BODY_SIZE) {
              res.statusCode = 413
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'Payload too large' }))
              req.destroy()
              return
            }
            body += chunk
          })
          req.on('end', () => {
            try {
              const parsed = JSON.parse(body)
              fs.writeFileSync(dbPath, JSON.stringify(parsed, null, 2), 'utf-8')
              res.setHeader('Content-Type', 'application/json')
              setCorsHeaders(req, res)
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

const securityHeadersPlugin = () => ({
  name: 'security-headers-plugin',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      // CSP as HTTP header — allows Vite HMR and external images
      const csp = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: blob: https:",
        "connect-src 'self'",
        "frame-ancestors 'none'"
      ].join('; ')
      res.setHeader('Content-Security-Policy', csp)
      res.setHeader('X-Content-Type-Options', 'nosniff')
      res.setHeader('X-Frame-Options', 'DENY')
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
      res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
      // HSTS — enable only when serving over HTTPS:
      // res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
      next()
    })
  }
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), securityHeadersPlugin(), authPlugin(), dbPlugin()],
  server: {
    host: false, // Localhost-only by default — use `npm run dev:network` for LAN access
    watch: {
      ignored: ['**/src/data/db.json', '**/db.json', '**/.git/**']
    }
  }
})
