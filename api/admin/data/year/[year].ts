import type { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from '../../../_lib/prisma.js'
import { setCorsHeaders, requireAdmin } from '../../../_lib/auth.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (!requireAdmin(req, res)) return
  if (req.method !== 'DELETE') return res.status(405).end()

  try {
    await prisma.dashboardData.deleteMany({ where: { year: parseInt(req.query.year as string) } })
    res.json({ success: true })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Failed to delete data for year' })
  }
}
