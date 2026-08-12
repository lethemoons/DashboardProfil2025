import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import multer from 'multer'
import csv from 'csv-parser'
import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'

const app = express()
const prisma = new PrismaClient()
const PORT = 3000
const JWT_SECRET = 'supersecret_for_demo'

app.use(cors())
app.use(express.json())

const upload = multer({ dest: 'uploads/' })

// Disk storage that preserves extension for Excel files
const excelStorage = multer.diskStorage({
  destination: 'uploads/',
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname) || '.xlsx'
    cb(null, unique + ext)
  }
})
const uploadExcel = multer({ storage: excelStorage })

// --- Auth Middleware ---
const authenticateAdmin = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ error: 'No token provided' })
  
  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    if (decoded.role !== 'admin') throw new Error('Not admin')
    req.user = decoded
    next()
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' })
  }
}

// --- Auth Routes ---
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body
  const user = await prisma.user.findUnique({ where: { username } })
  if (!user) return res.status(401).json({ error: 'Invalid credentials' })
  
  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' })
  
  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1d' })
  res.json({ token, role: user.role })
})

// --- Guest Data Routes ---
app.get('/api/data', async (req, res) => {
  try {
    const year = parseInt(req.query.year as string) || 2025
    const data = await prisma.dashboardData.findMany({ where: { year } })
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data' })
  }
})

app.get('/api/years', async (req, res) => {
  try {
    const years = await prisma.dashboardData.findMany({
      select: { year: true },
      distinct: ['year'],
      orderBy: { year: 'asc' }
    })
    res.json(years.map(y => y.year))
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch years' })
  }
})

// --- Admin CRUD Routes ---
app.get('/api/admin/data', authenticateAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 50
    const search = (req.query.search as string) || ''
    const year = parseInt(req.query.year as string) || 2025

    const where = {
      year,
      OR: [
        { kabupaten: { contains: search } },
        { metric: { contains: search } }
      ]
    }

    const [total, data] = await Promise.all([
      prisma.dashboardData.count({ where }),
      prisma.dashboardData.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: 'desc' }
      })
    ])
    
    res.json({ data, total, page, limit })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch data' })
  }
})

app.post('/api/admin/data', authenticateAdmin, async (req, res) => {
  const { tableNo, no, kabupaten, metric, value, year } = req.body
  try {
    const newData = await prisma.dashboardData.create({
      data: { tableNo: Number(tableNo), no: String(no), kabupaten, metric, value: String(value), year: Number(year) || 2025 }
    })
    res.json(newData)
  } catch (err) {
    res.status(500).json({ error: 'Failed to create data' })
  }
})

app.put('/api/admin/data/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params
  const { tableNo, no, kabupaten, metric, value, year } = req.body
  try {
    const updated = await prisma.dashboardData.update({
      where: { id: Number(id) },
      data: { tableNo: Number(tableNo), no: String(no), kabupaten, metric, value: String(value), year: Number(year) || 2025 }
    })
    res.json(updated)
  } catch (err) {
    res.status(500).json({ error: 'Failed to update data' })
  }
})

app.delete('/api/admin/data/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params
  try {
    await prisma.dashboardData.delete({ where: { id: Number(id) } })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete data' })
  }
})

app.delete('/api/admin/data/year/:year', authenticateAdmin, async (req, res) => {
  const { year } = req.params
  try {
    await prisma.dashboardData.deleteMany({ where: { year: parseInt(year) } })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete data for year' })
  }
})

// --- Admin Import/Export ---
app.post('/api/admin/import', authenticateAdmin, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
  
  const year = parseInt(req.body.year) || 2025
  const results: any[] = []
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => {
      if (data.table_no && data.kabupaten && data.metric) {
        results.push({
          year,
          tableNo: parseInt(data.table_no),
          no: data.no || '',
          kabupaten: data.kabupaten,
          metric: data.metric,
          value: data.value || ''
        })
      }
    })
    .on('end', async () => {
      try {
        await prisma.dashboardData.deleteMany({ where: { year } })
        await prisma.dashboardData.createMany({ data: results })
        fs.unlinkSync(req.file!.path)
        res.json({ success: true, count: results.length })
      } catch (err) {
        res.status(500).json({ error: 'Database import failed' })
      }
    })
})

app.post('/api/admin/import-excel', authenticateAdmin, uploadExcel.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
  
  const year = parseInt(req.body.year) || 2025
  // Use process.cwd() which is the 'backend' dir; __dirname may be 'backend/src'
  const excelPath = path.resolve(process.cwd(), req.file.path)
  const csvPath = `${excelPath}.parsed.csv`
  // Locate parse_excel.py relative to this source file (backend/src -> backend)
  const scriptPath = path.resolve(__dirname, '..', 'parse_excel.py')

  console.log(`[import-excel] scriptPath: ${scriptPath}`)
  console.log(`[import-excel] excelPath:  ${excelPath}`)
  console.log(`[import-excel] csvPath:    ${csvPath}`)

  const cleanup = () => {
    try { if (fs.existsSync(excelPath)) fs.unlinkSync(excelPath) } catch {}
    try { if (fs.existsSync(csvPath)) fs.unlinkSync(csvPath) } catch {}
  }

  exec(`python "${scriptPath}" "${excelPath}" "${csvPath}"`, { timeout: 120000 }, (error, stdout, stderr) => {
    console.log(`[import-excel] stdout: ${stdout}`)
    if (stderr) console.warn(`[import-excel] stderr: ${stderr}`)

    if (error || !fs.existsSync(csvPath)) {
      console.error(`[import-excel] exec error:`, error)
      cleanup()
      return res.status(500).json({ 
        error: 'Failed to parse Excel file',
        detail: stderr || (error ? error.message : 'CSV output not found')
      })
    }
    
    const results: any[] = []
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (data) => {
        if (data.table_no && data.kabupaten && data.metric) {
          results.push({
            year,
            tableNo: parseInt(data.table_no),
            no: data.no || '',
            kabupaten: data.kabupaten,
            metric: data.metric,
            value: data.value || ''
          })
        }
      })
      .on('end', async () => {
        try {
          await prisma.dashboardData.deleteMany({ where: { year } })
          await prisma.dashboardData.createMany({ data: results })
          cleanup()
          res.json({ success: true, count: results.length })
        } catch (err: any) {
          cleanup()
          res.status(500).json({ error: 'Database import failed', detail: err.message })
        }
      })
      .on('error', (err) => {
        cleanup()
        res.status(500).json({ error: 'Failed to read parsed CSV', detail: err.message })
      })
  })
})

app.get('/api/admin/export', authenticateAdmin, async (req, res) => {
  const year = parseInt(req.query.year as string)
  const where = year ? { year } : {}
  const data = await prisma.dashboardData.findMany({ where, orderBy: { id: 'asc' } })
  let csvStr = 'table_no,no,kabupaten,metric,value\n'
  data.forEach(row => {
    csvStr += `${row.tableNo},${row.no},${row.kabupaten},${row.metric},${row.value}\n`
  })
  res.setHeader('Content-Type', 'text/csv')
  res.setHeader('Content-Disposition', `attachment; filename=export_${year || 'all'}.csv`)
  res.send(csvStr)
})

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`)
})
