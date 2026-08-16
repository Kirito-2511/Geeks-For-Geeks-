import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function dataApiPlugin() {
  const dbPath = path.resolve(__dirname, 'src/data/db.json')

  const handleApi = (req, res, next) => {
    const url = req.url ? req.url.split('?')[0] : ''
    if (url === '/api/data') {
      if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*')
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
        res.statusCode = 204
        res.end()
        return
      }

      if (req.method === 'GET') {
        try {
          if (fs.existsSync(dbPath)) {
            const fileData = fs.readFileSync(dbPath, 'utf-8')
            res.setHeader('Content-Type', 'application/json')
            res.setHeader('Access-Control-Allow-Origin', '*')
            res.end(fileData)
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
            fs.mkdirSync(path.dirname(dbPath), { recursive: true })
            fs.writeFileSync(dbPath, JSON.stringify(parsed, null, 2), 'utf-8')
            res.setHeader('Content-Type', 'application/json')
            res.setHeader('Access-Control-Allow-Origin', '*')
            res.end(JSON.stringify({ success: true }))
          } catch (e) {
            console.error('Error writing db.json', e)
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ success: false, error: e.message }))
          }
        })
        return
      }
    }
    next()
  }

  return {
    name: 'data-api-plugin',
    configureServer(server) {
      server.middlewares.use(handleApi)
    },
    configurePreviewServer(server) {
      server.middlewares.use(handleApi)
    }
  }
}

export default defineConfig({
  plugins: [react(), dataApiPlugin()],
})
