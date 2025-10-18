const path = require('path')
const fs = require('fs')
const sqlite3 = require('sqlite3')
const bcrypt = require('bcryptjs')

const DB_PATH = path.join(process.cwd(), 'hrportal.db')

function open() {
  const dir = path.dirname(DB_PATH)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  return new sqlite3.Database(DB_PATH)
}

function init() {
  const db = open()
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT
    )`)

    db.run(`CREATE TABLE IF NOT EXISTS candidates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      position TEXT,
      department TEXT,
      date_of_interview TEXT,
      tenure_of_training TEXT,
      training_task_name TEXT,
      mobile_number TEXT,
      trainer_name TEXT,
      username TEXT UNIQUE,
      password TEXT
    )`)

    db.run(`CREATE TABLE IF NOT EXISTS attendances (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      candidate_id INTEGER,
      date TEXT,
      status TEXT,
      note TEXT,
      FOREIGN KEY(candidate_id) REFERENCES candidates(id)
    )`)

    // seed admin
    db.get('SELECT * FROM admins WHERE username = ?', ['admin'], (err, row) => {
      if (!row) {
        const hash = bcrypt.hashSync('admin123', 10)
        db.run('INSERT INTO admins (username, password) VALUES (?,?)', ['admin', hash])
      }
    })
  })

  // add columns if missing (safe, idempotent)
  function addColumnIfMissing(table, colName, colDef) {
    db.all(`PRAGMA table_info(${table})`, [], (err, rows) => {
      if (err) return
      const cols = rows.map(r => r.name)
      if (!cols.includes(colName)) {
        db.run(`ALTER TABLE ${table} ADD COLUMN ${colDef}`)
      }
    })
  }

  // new fields you requested
  addColumnIfMissing('candidates', 'father_name', 'father_name TEXT')
  addColumnIfMissing('candidates', 'email', 'email TEXT')
  addColumnIfMissing('candidates', 'address', 'address TEXT')
  addColumnIfMissing('candidates', 'qualification', 'qualification TEXT')
  addColumnIfMissing('candidates', 'date_of_training', 'date_of_training TEXT')
  addColumnIfMissing('candidates', 'training_location', 'training_location TEXT')
  addColumnIfMissing('candidates', 'training_period', 'training_period TEXT')
  addColumnIfMissing('candidates', 'trainer_email', 'trainer_email TEXT')
  addColumnIfMissing('candidates', 'trainer_mobile', 'trainer_mobile TEXT')

  return db
}

module.exports = { open, init }
