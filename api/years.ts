import type { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from './_lib/prisma.js'
import { setCorsHeaders } from './_lib/auth.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).end()

  try {
    const years = await prisma.dashboardData.findMany({
      select: { year: true },
      distinct: ['year'],
      orderBy: { year: 'asc' },
    })
    res.json(years.map((y) => y.year))
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch years' })
  }
}
