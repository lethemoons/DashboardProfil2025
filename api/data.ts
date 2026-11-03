import type { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from './_lib/prisma.js'
import { setCorsHeaders } from './_lib/auth.js'

/**
 * GET /api/data?year=2025
 * Response dikompres (dictionary-encoded) agar tidak melebihi batas 4.5MB Vercel:
 * { k: string[] (kabupaten), m: string[] (metric), r: [kIdx, tableNo, mIdx, value][] }
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).end()

  try {
    const year = parseInt(req.query.year as string) || 2025
    const data = await prisma.dashboardData.findMany({
      where: { year },
      select: { kabupaten: true, tableNo: true, metric: true, value: true },
      orderBy: { id: 'asc' },
    })

    const kIdx = new Map<string, number>()
    const mIdx = new Map<string, number>()
    const k: string[] = []
    const m: string[] = []
    const r: (string | number)[][] = []
    for (const row of data) {
      let ki = kIdx.get(row.kabupaten)
      if (ki === undefined) { ki = k.length; k.push(row.kabupaten); kIdx.set(row.kabupaten, ki) }
      let mi = mIdx.get(row.metric)
      if (mi === undefined) { mi = m.length; m.push(row.metric); mIdx.set(row.metric, mi) }
      r.push([ki, row.tableNo, mi, row.value])
    }

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')
    res.json({ k, m, r })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to fetch data' })
  }
}
