import jwt from 'jsonwebtoken'
import { parse } from 'cookie'

const SECRET = 'change_this_secret'

export function getUserFromReq(req) {
  const cookies = req.headers.cookie ? parse(req.headers.cookie) : {}
  const token = cookies.token
  if (!token) return null
  try {
    return jwt.verify(token, SECRET)
  } catch (e) {
    return null
  }
}
