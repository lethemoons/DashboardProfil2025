import type { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from '../_lib/prisma'
import { setCorsHeaders, requireAdmin } from '../_lib/auth'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (!requireAdmin(req, res)) return

  try {
    if (req.method === 'GET') {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 50
      const search = (req.query.search as string) || ''
      const year = parseInt(req.query.year as string) || 2025
      const where = {
        year,
        OR: [
          { kabupaten: { contains: search, mode: 'insensitive' as const } },
          { metric: { contains: search, mode: 'insensitive' as const } },
        ],
      }
      const [total, data] = await Promise.all([
        prisma.dashboardData.count({ where }),
        prisma.dashboardData.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { id: 'desc' } }),
      ])
      return res.json({ data, total, page, limit })
    }

    if (req.method === 'POST') {
      const { tableNo, no, kabupaten, metric, value, year } = req.body || {}
      const newData = await prisma.dashboardData.create({
        data: { tableNo: Number(tableNo), no: String(no), kabupaten, metric, value: String(value), year: Number(year) || 2025 },
      })
      return res.json(newData)
    }

    res.status(405).end()
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Request failed' })
  }
}
