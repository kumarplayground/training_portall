import { open, init } from '../../../lib/db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { serialize } from 'cookie'

const SECRET = 'change_this_secret'

export default async function handler(req, res) {
  init()
  const db = open()
  const { username, password, role } = req.body
  if (!username || !password || !role) return res.status(400).json({ error: 'missing' })

  if (role === 'admin') {
    db.get('SELECT * FROM admins WHERE username = ?', [username], (err, row) => {
      if (err || !row) return res.status(401).json({ error: 'invalid' })
      if (!bcrypt.compareSync(password, row.password)) return res.status(401).json({ error: 'invalid' })
      const token = jwt.sign({ id: row.id, role: 'admin' }, SECRET, { expiresIn: '8h' })
      res.setHeader('Set-Cookie', serialize('token', token, { path: '/', httpOnly: true }))
      res.json({ ok: true })
    })
  } else if (role === 'candidate') {
    db.get('SELECT * FROM candidates WHERE username = ?', [username], (err, row) => {
      if (err || !row) return res.status(401).json({ error: 'invalid' })
      if (!bcrypt.compareSync(password, row.password)) return res.status(401).json({ error: 'invalid' })
      const token = jwt.sign({ id: row.id, role: 'candidate' }, SECRET, { expiresIn: '8h' })
      res.setHeader('Set-Cookie', serialize('token', token, { path: '/', httpOnly: true }))
      res.json({ ok: true })
    })
  } else {
    res.status(400).json({ error: 'bad role' })
  }
}
