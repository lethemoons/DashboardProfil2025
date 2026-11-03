import type { VercelRequest, VercelResponse } from '@vercel/node'
import formidable from 'formidable'
import fs from 'fs'
import { parse } from 'csv-parse/sync'
import { prisma } from '../_lib/prisma'
import { setCorsHeaders, requireAdmin } from '../_lib/auth'

export const config = { api: { bodyParser: false }, maxDuration: 60 }

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (!requireAdmin(req, res)) return
  if (req.method !== 'POST') return res.status(405).end()

  try {
    const form = formidable({ maxFileSize: 4 * 1024 * 1024 })
    const [fields, files] = await form.parse(req)
    const file = Array.isArray(files.file) ? files.file[0] : (files.file as any)
    if (!file) return res.status(400).json({ error: 'No file uploaded' })
    const yearField = Array.isArray(fields.year) ? fields.year[0] : fields.year
    const year = parseInt(String(yearField)) || 2025

    const rows: any[] = parse(fs.readFileSync(file.filepath), { columns: true, skip_empty_lines: true, bom: true })
    const results = rows
      .filter(d => d.table_no && d.kabupaten && d.metric)
      .map(d => ({ year, tableNo: parseInt(d.table_no), no: d.no || '', kabupaten: d.kabupaten, metric: d.metric, value: d.value || '' }))

    await prisma.$transaction([
      prisma.dashboardData.deleteMany({ where: { year } }),
      prisma.dashboardData.createMany({ data: results }),
    ])
    res.json({ success: true, count: results.length })
  } catch (e: any) {
    console.error(e)
    res.status(500).json({ error: 'Database import failed', detail: e.message })
  }
}
