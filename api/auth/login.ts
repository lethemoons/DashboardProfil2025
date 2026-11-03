import type { VercelRequest, VercelResponse } from '@vercel/node'
import bcrypt from 'bcryptjs'
import { prisma } from '../_lib/prisma'
import { setCorsHeaders, signToken } from '../_lib/auth'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res)
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).end()

  try {
    const { username, password } = req.body || {}
    const user = await prisma.user.findUnique({ where: { username } })
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })
    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' })
    const token = signToken({ id: user.id, username: user.username, role: user.role })
    res.json({ token, role: user.role })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Login failed' })
  }
}
