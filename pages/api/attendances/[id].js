import { open, init } from '../../../lib/db'
import { getUserFromReq } from '../../../lib/auth'

export default function handler(req, res){
  init()
  const db = open()
  const user = getUserFromReq(req)

  if(req.method === 'DELETE'){
    if(!user || user.role !== 'admin') return res.status(401).json({ error: 'unauth' })
    const id = req.query.id
    db.run('DELETE FROM attendances WHERE id = ?', [id], function(err){
      if(err) return res.status(500).json({ error: 'db' })
      res.json({ ok: true })
    })
  } else {
    res.status(405).end()
  }
}
