import { getPool, init } from '../../../lib/db'
import { getUserFromReq } from '../../../lib/auth'

export default async function handler(req, res){
  await init()
  const pool = getPool()
  const user = getUserFromReq(req)

  try {
    if(req.method === 'GET'){
      if(!user) return res.status(401).json({ error: 'unauth' })
      if(user.role === 'admin'){
        const result = await pool.query('SELECT a.id,a.candidate_id,a.date,a.status,a.note,c.name FROM attendances a LEFT JOIN candidates c ON c.id = a.candidate_id ORDER BY a.date DESC')
        res.json(result.rows)
      } else {
        // return attendances for this candidate
        const result = await pool.query('SELECT id,candidate_id,date,status,note FROM attendances WHERE candidate_id = $1 ORDER BY date DESC', [user.id])
        res.json(result.rows)
      }
    } else if(req.method === 'POST'){
      if(!user || user.role !== 'admin') return res.status(401).json({ error: 'unauth' })
      const { candidate_id, date, status, note } = req.body
      const result = await pool.query('INSERT INTO attendances (candidate_id,date,status,note) VALUES ($1,$2,$3,$4) RETURNING id', [candidate_id,date,status,note])
      res.json({ id: result.rows[0].id })
    } else {
      res.status(405).end()
    }
  } catch (error) {
    console.error('Database error:', error)
    res.status(500).json({ error: 'database error' })
  }
}
