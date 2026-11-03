import type { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from '../_lib/prisma'
import { setCorsHeaders, requireAdmin } from '../_lib/auth'

export const config = { maxDuration: 60 }

/**
 * POST /api/admin/import-rows
 * Body: { year, reset, rows: [table_no, no, kabupaten, metric, value][] }
 * Dipanggil per-chunk dari browser setelah Excel di-parse di sisi klien.
 * reset=true (chunk pertama) menghapus data tahun tersebut terlebih dahulu.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (!requireAdmin(req, res)) return
  if (req.method !== 'POST') return res.status(405).end()

  try {
    const { year: y, reset, rows } = req.body || {}
    const year = parseInt(y) || 2025
    if (!Array.isArray(rows)) return res.status(400).json({ error: 'rows harus array' })

    const data = rows
      .filter((r: any[]) => r[0] && r[2] && r[3])
      .map((r: any[]) => ({ year, tableNo: Number(r[0]), no: String(r[1] ?? ''), kabupaten: String(r[2]), metric: String(r[3]), value: String(r[4] ?? '') }))

    if (reset) await prisma.dashboardData.deleteMany({ where: { year } })
    await prisma.dashboardData.createMany({ data })
    res.json({ success: true, count: data.length })
  } catch (e: any) {
    console.error(e)
    res.status(500).json({ error: 'Database import failed', detail: e.message })
  }
}
