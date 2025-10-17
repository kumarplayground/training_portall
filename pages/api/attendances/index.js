import { open, init } from '../../../lib/db'
import { getUserFromReq } from '../../../lib/auth'

export default function handler(req, res){
  init()
  const db = open()
  const user = getUserFromReq(req)

  if(req.method === 'GET'){
    if(!user) return res.status(401).json({ error: 'unauth' })
    if(user.role === 'admin'){
      db.all('SELECT a.id,a.candidate_id,a.date,a.status,a.note,c.name FROM attendances a LEFT JOIN candidates c ON c.id = a.candidate_id ORDER BY a.date DESC', [], (err, rows) => {
        if(err) return res.status(500).json({ error: 'db' })
        res.json(rows)
      })
    } else {
      // return attendances for this candidate
      db.all('SELECT id,candidate_id,date,status,note FROM attendances WHERE candidate_id = ? ORDER BY date DESC', [user.id], (err, rows) => {
        if(err) return res.status(500).json({ error: 'db' })
        res.json(rows)
      })
    }
  } else if(req.method === 'POST'){
    if(!user || user.role !== 'admin') return res.status(401).json({ error: 'unauth' })
    const { candidate_id, date, status, note } = req.body
    db.run('INSERT INTO attendances (candidate_id,date,status,note) VALUES (?,?,?,?)', [candidate_id,date,status,note], function(err){
      if(err) return res.status(500).json({ error: 'db' })
      res.json({ id: this.lastID })
    })
  } else {
    res.status(405).end()
  }
}
