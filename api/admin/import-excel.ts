import type { VercelRequest, VercelResponse } from '@vercel/node'
import { setCorsHeaders, requireAdmin } from '../_lib/auth'

export const config = { api: { bodyParser: false } }

/** Parser Excel aslinya berbasis Python (backend/parse_excel.py) yang tidak tersedia di Vercel Node runtime. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (!requireAdmin(req, res)) return
  res.status(501).json({
    error: 'Import Excel belum didukung di versi online',
    detail: 'Konversi Excel ke CSV secara lokal (python backend/parse_excel.py file.xlsx out.csv), lalu unggah file CSV-nya.',
  })
}
