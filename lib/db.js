const { Pool } = require('pg')
const bcrypt = require('bcryptjs')

// PostgreSQL connection configuration for Render.com
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DATABASE_USER || 'training_portal_user'}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_HOST || 'dpg-d3vj25muk2gs73ekknlg-a.oregon-postgres.render.com'}:${process.env.DATABASE_PORT || 5432}/${process.env.DATABASE_NAME || 'training_portal'}`,
  ssl: {
    rejectUnauthorized: false // Required for Render.com hosted PostgreSQL
  }
})

function getPool() {
  return pool
}

async function init() {
  const client = await pool.connect()
  
  try {
    // Create tables if they don't exist
    await client.query(`CREATE TABLE IF NOT EXISTS admins (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE,
      password TEXT
    )`)

    await client.query(`CREATE TABLE IF NOT EXISTS candidates (
      id SERIAL PRIMARY KEY,
      name TEXT,
      position TEXT,
      department TEXT,
      date_of_interview TEXT,
      tenure_of_training TEXT,
      training_task_name TEXT,
      mobile_number TEXT,
      trainer_name TEXT,
      username TEXT UNIQUE,
      password TEXT,
      father_name TEXT,
      email TEXT,
      address TEXT,
      qualification TEXT,
      date_of_training TEXT,
      training_location TEXT,
      training_period TEXT,
      trainer_email TEXT,
      trainer_mobile TEXT
    )`)

    await client.query(`CREATE TABLE IF NOT EXISTS attendances (
      id SERIAL PRIMARY KEY,
      candidate_id INTEGER,
      date TEXT,
      status TEXT,
      note TEXT,
      FOREIGN KEY(candidate_id) REFERENCES candidates(id)
    )`)

    // Seed admin user if it doesn't exist
    const adminResult = await client.query('SELECT * FROM admins WHERE username = $1', ['admin'])
    if (adminResult.rows.length === 0) {
      const hash = bcrypt.hashSync('admin123', 10)
      await client.query('INSERT INTO admins (username, password) VALUES ($1, $2)', ['admin', hash])
    }

  } catch (error) {
    console.error('Database initialization error:', error)
    throw error
  } finally {
    client.release()
  }
}

module.exports = { getPool, init }
