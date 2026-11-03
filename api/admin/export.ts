import type { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from '../_lib/prisma'
import { setCorsHeaders, requireAdmin } from '../_lib/auth'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (!requireAdmin(req, res)) return

  const year = parseInt(req.query.year as string)
  const where = year ? { year } : {}
  const data = await prisma.dashboardData.findMany({ where, orderBy: { id: 'asc' } })
  let csvStr = 'table_no,no,kabupaten,metric,value\n'
  for (const row of data) csvStr += `${row.tableNo},${row.no},${row.kabupaten},${row.metric},${row.value}\n`
  res.setHeader('Content-Type', 'text/csv')
  res.setHeader('Content-Disposition', `attachment; filename=export_${year || 'all'}.csv`)
  res.send(csvStr)
}
