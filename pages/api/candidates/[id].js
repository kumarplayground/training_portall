import { getPool, init } from '../../../lib/db'
import { getUserFromReq } from '../../../lib/auth'
import bcrypt from 'bcryptjs'

export default async function handler(req, res) {
  await init()
  const pool = getPool()
  const user = getUserFromReq(req)
  const { id } = req.query

  if (!user) return res.status(401).json({ error: 'unauth' })

  try {
    if (req.method === 'GET') {
      // admin can get any, candidate only own
      if (user.role === 'candidate' && user.id != id) return res.status(403).json({ error: 'forbidden' })
      const result = await pool.query(
        'SELECT id,name,position,department,date_of_interview,tenure_of_training,training_task_name,mobile_number,trainer_name,username,father_name,email,address,qualification,date_of_training,training_location,training_period,trainer_email,trainer_mobile FROM candidates WHERE id = $1', 
        [id]
      )
      res.json(result.rows[0])
    } else if (req.method === 'PUT') {
      if (user.role !== 'admin') return res.status(403).json({ error: 'forbidden' })
      const { name, position, department, date_of_interview, tenure_of_training, training_task_name, mobile_number, trainer_name, username, password,
        father_name, email, address, qualification, date_of_training, training_location, training_period, trainer_email, trainer_mobile } = req.body
      // build update query to set additional fields as well
      let sql = 'UPDATE candidates SET name=$1,position=$2,department=$3,date_of_interview=$4,tenure_of_training=$5,training_task_name=$6,mobile_number=$7,trainer_name=$8,username=$9,father_name=$10,email=$11,address=$12,qualification=$13,date_of_training=$14,training_location=$15,training_period=$16,trainer_email=$17,trainer_mobile=$18'
      const params = [name,position,department,date_of_interview,tenure_of_training,training_task_name,mobile_number,trainer_name,username,father_name,email,address,qualification,date_of_training,training_location,training_period,trainer_email,trainer_mobile]
      if (password) {
        const hash = bcrypt.hashSync(password, 10)
        sql += ', password=$19 WHERE id=$20'
        params.push(hash, id)
      } else {
        sql += ' WHERE id=$19'
        params.push(id)
      }
      const result = await pool.query(sql, params)
      res.json({ changed: result.rowCount })
    } else if (req.method === 'DELETE') {
      if (user.role !== 'admin') return res.status(403).json({ error: 'forbidden' })
      const result = await pool.query('DELETE FROM candidates WHERE id = $1', [id])
      res.json({ deleted: result.rowCount })
    } else {
      res.status(405).end()
    }
  } catch (error) {
    console.error('Database error:', error)
    res.status(500).json({ error: 'database error' })
  }
}
