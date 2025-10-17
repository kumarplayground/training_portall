import { useState } from 'react'
import { useRouter } from 'next/router'

export default function CandidateLogin(){
  const [username,setUsername]=useState('')
  const [password,setPassword]=useState('')
  const r = useRouter()

  async function submit(e){
    e.preventDefault()
    const res = await fetch('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username,password,role:'candidate'})})
    if (res.ok) r.push('/candidate/dashboard')
    else alert('Invalid')
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2>Candidate Login</h2>
        <form onSubmit={submit}>
          <div><input placeholder="username" value={username} onChange={e=>setUsername(e.target.value)} /></div>
          <div><input type="password" placeholder="password" value={password} onChange={e=>setPassword(e.target.value)} /></div>
          <div className="auth-actions"><button type="submit">Login</button></div>
        </form>
      </div>
    </div>
  )
}
