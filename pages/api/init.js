import { init } from '../../lib/db'

export default async function handler(req, res) {
  try {
    await init()
    res.status(200).json({ ok: true })
  } catch (error) {
    console.error('Database initialization error:', error)
    res.status(500).json({ error: 'Failed to initialize database' })
  }
}
