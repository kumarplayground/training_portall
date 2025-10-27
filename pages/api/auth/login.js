import { getPool, init } from '../../../lib/db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { serialize } from 'cookie'

const SECRET = 'change_this_secret'

export default async function handler(req, res) {
  await init()
  const pool = getPool()
  const { username, password, role } = req.body
  if (!username || !password || !role) return res.status(400).json({ error: 'missing' })

  try {
    if (role === 'admin') {
      const result = await pool.query('SELECT * FROM admins WHERE username = $1', [username])
      const row = result.rows[0]
      if (!row) return res.status(401).json({ error: 'invalid' })
      if (!bcrypt.compareSync(password, row.password)) return res.status(401).json({ error: 'invalid' })
      const token = jwt.sign({ id: row.id, role: 'admin' }, SECRET, { expiresIn: '8h' })
      res.setHeader('Set-Cookie', serialize('token', token, { path: '/', httpOnly: true }))
      res.json({ ok: true })
    } else if (role === 'candidate') {
      const result = await pool.query('SELECT * FROM candidates WHERE username = $1', [username])
      const row = result.rows[0]
      if (!row) return res.status(401).json({ error: 'invalid' })
      if (!bcrypt.compareSync(password, row.password)) return res.status(401).json({ error: 'invalid' })
      const token = jwt.sign({ id: row.id, role: 'candidate' }, SECRET, { expiresIn: '8h' })
      res.setHeader('Set-Cookie', serialize('token', token, { path: '/', httpOnly: true }))
      res.json({ ok: true })
    } else {
      res.status(400).json({ error: 'bad role' })
    }
  } catch (error) {
    console.error('Database error:', error)
    res.status(500).json({ error: 'database error' })
  }
}
