import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function CandidateDashboard(){
  const [data,setData]=useState(null)
  const r = useRouter()
  useEffect(()=>{
    fetch('/api/candidates').then(r=>{ if (r.ok) return r.json(); else r.push('/candidate/login') }).then(d=>setData(d))
  },[])

  async function logout(){
    await fetch('/api/auth/logout')
    r.push('/')
  }

  if (!data) return <div>Loading...</div>

  return (
    <div className="centered">
      <h2>Candidate Dashboard</h2>
      <button onClick={logout}>Logout</button>
      <div>
        <p><strong>Name:</strong> {data.name}</p>
        <p><strong>Position:</strong> {data.position}</p>
        <p><strong>Department:</strong> {data.department}</p>
        <p><strong>Date of Interview:</strong> {data.date_of_interview}</p>
        <p><strong>Training tenure:</strong> {data.tenure_of_training}</p>
        <p><strong>Training task:</strong> {data.training_task_name}</p>
        <p><strong>Trainer:</strong> {data.trainer_name}</p>
        <p><strong>Mobile:</strong> {data.mobile_number}</p>
      </div>
    </div>
  )
}
