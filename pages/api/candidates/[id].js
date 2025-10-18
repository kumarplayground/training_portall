import { open, init } from '../../../lib/db'
import { getUserFromReq } from '../../../lib/auth'
import bcrypt from 'bcryptjs'

export default function handler(req, res) {
  init()
  const db = open()
  const user = getUserFromReq(req)
  const { id } = req.query

  if (!user) return res.status(401).json({ error: 'unauth' })

  if (req.method === 'GET') {
    // admin can get any, candidate only own
    if (user.role === 'candidate' && user.id != id) return res.status(403).json({ error: 'forbidden' })
    db.get('SELECT id,name,position,department,date_of_interview,tenure_of_training,training_task_name,mobile_number,trainer_name,username,father_name,email,address,qualification,date_of_training,training_location,training_period,trainer_email,trainer_mobile FROM candidates WHERE id = ?', [id], (err, row) => {
      if (err) return res.status(500).json({ error: 'db' })
      res.json(row)
    })
  } else if (req.method === 'PUT') {
    if (user.role !== 'admin') return res.status(403).json({ error: 'forbidden' })
    const { name, position, department, date_of_interview, tenure_of_training, training_task_name, mobile_number, trainer_name, username, password,
      father_name, email, address, qualification, date_of_training, training_location, training_period, trainer_email, trainer_mobile } = req.body
    // build update query to set additional fields as well
    let sql = 'UPDATE candidates SET name=?,position=?,department=?,date_of_interview=?,tenure_of_training=?,training_task_name=?,mobile_number=?,trainer_name=?,username=?,father_name=?,email=?,address=?,qualification=?,date_of_training=?,training_location=?,training_period=?,trainer_email=?,trainer_mobile=?'
    const params = [name,position,department,date_of_interview,tenure_of_training,training_task_name,mobile_number,trainer_name,username,father_name,email,address,qualification,date_of_training,training_location,training_period,trainer_email,trainer_mobile]
    if (password) {
      const hash = bcrypt.hashSync(password, 10)
      sql += ', password=?'
      params.push(hash)
    }
    sql += ' WHERE id=?'
    params.push(id)
    db.run(sql, params, function(err){
      if (err) return res.status(500).json({ error: 'db' })
      res.json({ changed: this.changes })
    })
  } else if (req.method === 'DELETE') {
    if (user.role !== 'admin') return res.status(403).json({ error: 'forbidden' })
    db.run('DELETE FROM candidates WHERE id = ?', [id], function(err){
      if (err) return res.status(500).json({ error: 'db' })
      res.json({ deleted: this.changes })
    })
  } else {
    res.status(405).end()
  }
}
