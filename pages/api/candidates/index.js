import { open, init } from '../../../lib/db'
import { getUserFromReq } from '../../../lib/auth'
import bcrypt from 'bcryptjs'

export default function handler(req, res) {
  init()
  const db = open()
  const user = getUserFromReq(req)

  if (req.method === 'GET') {
    // admin: list all; candidate: return own details
    if (!user) return res.status(401).json({ error: 'unauth' })
    if (user.role === 'admin') {
      db.all(
        `SELECT id,name,position,department,date_of_interview,tenure_of_training,training_task_name,mobile_number,trainer_name,username,
              father_name,email,address,qualification,date_of_training,training_location,training_period,trainer_email,trainer_mobile
           FROM candidates`,
        [],
        (err, rows) => {
          if (err) return res.status(500).json({ error: 'db' })
          res.json(rows)
        }
      )
    } else {
      // return full record for the logged-in candidate so candidate dashboard shows all fields
      db.get('SELECT id,name,position,department,date_of_interview,tenure_of_training,training_task_name,mobile_number,trainer_name,username,father_name,email,address,qualification,date_of_training,training_location,training_period,trainer_email,trainer_mobile FROM candidates WHERE id = ?', [user.id], (err, row) => {
        if (err) return res.status(500).json({ error: 'db' })
        res.json(row)
      })
    }
  } else if (req.method === 'POST') {
    if (!user || user.role !== 'admin') return res.status(401).json({ error: 'unauth' })
    // accept and persist additional candidate fields sent from the admin form
    const { name, position, department, date_of_interview, tenure_of_training, training_task_name, mobile_number, trainer_name, username, password,
      father_name, email, address, qualification, date_of_training, training_location, training_period, trainer_email, trainer_mobile } = req.body
    const hash = bcrypt.hashSync(password || 'changeme', 10)
    const sql = `INSERT INTO candidates (name,position,department,date_of_interview,tenure_of_training,training_task_name,mobile_number,trainer_name,username,password,father_name,email,address,qualification,date_of_training,training_location,training_period,trainer_email,trainer_mobile) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    const vals = [name,position,department,date_of_interview,tenure_of_training,training_task_name,mobile_number,trainer_name,username,hash,father_name,email,address,qualification,date_of_training,training_location,training_period,trainer_email,trainer_mobile]
    db.run(sql, vals, function(err){
      if (err) return res.status(500).json({ error: 'db' })
      res.json({ id: this.lastID })
    })
  } else {
    res.status(405).end()
  }
}
