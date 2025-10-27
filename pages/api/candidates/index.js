import { getPool, init } from '../../../lib/db'
import { getUserFromReq } from '../../../lib/auth'
import bcrypt from 'bcryptjs'

export default async function handler(req, res) {
  await init()
  const pool = getPool()
  const user = getUserFromReq(req)

  try {
    if (req.method === 'GET') {
      // admin: list all; candidate: return own details
      if (!user) return res.status(401).json({ error: 'unauth' })
      if (user.role === 'admin') {
        const result = await pool.query(
          `SELECT id,name,position,department,date_of_interview,tenure_of_training,training_task_name,mobile_number,trainer_name,username,
                father_name,email,address,qualification,date_of_training,training_location,training_period,trainer_email,trainer_mobile
             FROM candidates`
        )
        res.json(result.rows)
      } else {
        // return full record for the logged-in candidate so candidate dashboard shows all fields
        const result = await pool.query(
          'SELECT id,name,position,department,date_of_interview,tenure_of_training,training_task_name,mobile_number,trainer_name,username,father_name,email,address,qualification,date_of_training,training_location,training_period,trainer_email,trainer_mobile FROM candidates WHERE id = $1', 
          [user.id]
        )
        res.json(result.rows[0])
      }
    } else if (req.method === 'POST') {
      if (!user || user.role !== 'admin') return res.status(401).json({ error: 'unauth' })
      // accept and persist additional candidate fields sent from the admin form
      const { name, position, department, date_of_interview, tenure_of_training, training_task_name, mobile_number, trainer_name, username, password,
        father_name, email, address, qualification, date_of_training, training_location, training_period, trainer_email, trainer_mobile } = req.body
      const hash = bcrypt.hashSync(password || 'changeme', 10)
      const sql = `INSERT INTO candidates (name,position,department,date_of_interview,tenure_of_training,training_task_name,mobile_number,trainer_name,username,password,father_name,email,address,qualification,date_of_training,training_location,training_period,trainer_email,trainer_mobile) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19) RETURNING id`
      const vals = [name,position,department,date_of_interview,tenure_of_training,training_task_name,mobile_number,trainer_name,username,hash,father_name,email,address,qualification,date_of_training,training_location,training_period,trainer_email,trainer_mobile]
      const result = await pool.query(sql, vals)
      res.json({ id: result.rows[0].id })
    } else {
      res.status(405).end()
    }
  } catch (error) {
    console.error('Database error:', error)
    res.status(500).json({ error: 'database error' })
  }
}
