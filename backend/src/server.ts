import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import multer from 'multer'
import csv from 'csv-parser'
import fs from 'fs'

const app = express()
const prisma = new PrismaClient()
const PORT = 3000
const JWT_SECRET = 'supersecret_for_demo'

app.use(cors())
app.use(express.json())

const upload = multer({ dest: 'uploads/' })

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
    const data = await prisma.dashboardData.findMany()
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data' })
  }
})

// --- Admin CRUD Routes ---
app.get('/api/admin/data', authenticateAdmin, async (req, res) => {
  const { page = 1, limit = 50, search = '' } = req.query
  const skip = (Number(page) - 1) * Number(limit)
  
  const where = search ? {
    OR: [
      { kabupaten: { contains: String(search) } },
      { metric: { contains: String(search) } }
    ]
  } : {}

  const [data, total] = await Promise.all([
    prisma.dashboardData.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { id: 'desc' }
    }),
    prisma.dashboardData.count({ where })
  ])
  
  res.json({ data, total, page: Number(page), limit: Number(limit) })
})

app.post('/api/admin/data', authenticateAdmin, async (req, res) => {
  const { tableNo, no, kabupaten, metric, value } = req.body
  try {
    const newData = await prisma.dashboardData.create({
      data: { tableNo: Number(tableNo), no: String(no), kabupaten, metric, value: String(value) }
    })
    res.json(newData)
  } catch (err) {
    res.status(500).json({ error: 'Failed to create data' })
  }
})

app.put('/api/admin/data/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params
  const { tableNo, no, kabupaten, metric, value } = req.body
  try {
    const updated = await prisma.dashboardData.update({
      where: { id: Number(id) },
      data: { tableNo: Number(tableNo), no: String(no), kabupaten, metric, value: String(value) }
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

// --- Admin Import/Export ---
app.post('/api/admin/import', authenticateAdmin, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
  
  const results: any[] = []
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => {
      if (data.table_no && data.kabupaten && data.metric) {
        results.push({
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
        await prisma.dashboardData.createMany({ data: results })
        fs.unlinkSync(req.file!.path)
        res.json({ success: true, count: results.length })
      } catch (err) {
        res.status(500).json({ error: 'Database import failed' })
      }
    })
})

app.get('/api/admin/export', authenticateAdmin, async (req, res) => {
  const data = await prisma.dashboardData.findMany()
  let csvStr = 'table_no,no,kabupaten,metric,value\n'
  data.forEach(row => {
    csvStr += `${row.tableNo},${row.no},${row.kabupaten},${row.metric},${row.value}\n`
  })
  res.setHeader('Content-Type', 'text/csv')
  res.setHeader('Content-Disposition', 'attachment; filename=export.csv')
  res.send(csvStr)
})

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`)
})
