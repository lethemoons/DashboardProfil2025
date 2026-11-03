import type { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from '../../_lib/prisma'
import { setCorsHeaders, requireAdmin } from '../../_lib/auth'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (!requireAdmin(req, res)) return

  const id = Number(req.query.id)
  try {
    if (req.method === 'PUT') {
      const { tableNo, no, kabupaten, metric, value, year } = req.body || {}
      const updated = await prisma.dashboardData.update({
        where: { id },
        data: { tableNo: Number(tableNo), no: String(no), kabupaten, metric, value: String(value), year: Number(year) || 2025 },
      })
      return res.json(updated)
    }
    if (req.method === 'DELETE') {
      await prisma.dashboardData.delete({ where: { id } })
      return res.json({ success: true })
    }
    res.status(405).end()
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Request failed' })
  }
}
