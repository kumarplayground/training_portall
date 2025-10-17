import { init } from '../../lib/db'

export default function handler(req, res) {
  init()
  res.status(200).json({ ok: true })
}
