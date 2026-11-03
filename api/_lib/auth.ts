import jwt from 'jsonwebtoken'
import type { VercelRequest, VercelResponse } from '@vercel/node'

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_for_demo'

/** Tambahkan CORS headers ke response */
export function setCorsHeaders(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type')
}

/** Verifikasi token JWT dan pastikan role admin.
 *  Return true jika valid, false + kirim 401 jika tidak. */
export function requireAdmin(req: VercelRequest, res: VercelResponse): boolean {
  const auth = req.headers.authorization
  if (!auth) {
    res.status(401).json({ error: 'No token provided' })
    return false
  }
  const token = auth.split(' ')[1]
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    if (decoded.role !== 'admin') throw new Error('Not admin')
    return true
  } catch {
    res.status(401).json({ error: 'Invalid token' })
    return false
  }
}

/** Buat JWT token */
export function signToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' })
}
