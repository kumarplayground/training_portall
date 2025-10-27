import { getPool, init } from '../../../lib/db'
import { getUserFromReq } from '../../../lib/auth'

export default async function handler(req, res){
  await init()
  const pool = getPool()
  const user = getUserFromReq(req)

  try {
    if(req.method === 'DELETE'){
      if(!user || user.role !== 'admin') return res.status(401).json({ error: 'unauth' })
      const id = req.query.id
      await pool.query('DELETE FROM attendances WHERE id = $1', [id])
      res.json({ ok: true })
    } else {
      res.status(405).end()
    }
  } catch (error) {
    console.error('Database error:', error)
    res.status(500).json({ error: 'database error' })
  }
}
