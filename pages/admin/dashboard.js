import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function AdminDashboard(){
  const [candidates,setCandidates]=useState([])
  const [form,setForm]=useState({})
  const [editingId,setEditingId]=useState(null)
  const r = useRouter()

  function formatDateDMY(iso){
    // iso expected 'YYYY-MM-DD' or similar
    if(!iso) return ''
    const parts = iso.split('-')
    if(parts.length!==3) return iso
    return `${parts[2]}/${parts[1]}/${parts[0]}`
  }

  function parseDateDMY(dmy){
    // convert DD/MM/YYYY to ISO YYYY-MM-DD for date input
    if(!dmy) return ''
    const parts = dmy.split('/')
    if(parts.length!==3) return dmy
    const dd = parts[0].padStart(2,'0')
    const mm = parts[1].padStart(2,'0')
    const yyyy = parts[2]
    return `${yyyy}-${mm}-${dd}`
  }

  function startEdit(c){
    // populate form with candidate data and set editing id
    setForm({
      name: c.name || '',
      position: c.position || '',
      department: c.department || '',
      days_of_training: c.days_of_training || '',
      trainer_name: c.trainer_name || '',
      date_of_interview: c.date_of_interview || '',
      date_picker: c.date_of_interview ? parseDateDMY(c.date_of_interview) : '',
      mobile_number: c.mobile_number || '',
      username: c.username || '',
      password: ''
    })
    setEditingId(c.id)
    // scroll to top of form
    if(typeof window !== 'undefined') window.scrollTo({top:0,behavior:'smooth'})
  }

  async function load(){
    const res = await fetch('/api/candidates')
    if (!res.ok) return r.push('/admin/login')
    const data = await res.json()
    if (Array.isArray(data)) setCandidates(data)
    else if (data && typeof data === 'object') setCandidates([data])
    else setCandidates([])
  }

  useEffect(()=>{ load() }, [])

  async function add(e){
    e.preventDefault()
    // ensure date is in DD/MM/YYYY format when sending
    const payload = {...form}
    if(form.date_picker){ payload.date_of_interview = formatDateDMY(form.date_picker) }

    if(editingId){
      // update existing
      // do not send empty password fields
      const body = { ...payload }
      if(!body.password) delete body.password
      await fetch('/api/candidates/'+editingId,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
      setEditingId(null)
    } else {
      await fetch('/api/candidates',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)})
    }

    setForm({})
    load()
  }

  async function del(id){
    if (!confirm('Delete?')) return
    await fetch('/api/candidates/'+id,{method:'DELETE'})
    load()
  }

  

  async function logout(){
    await fetch('/api/auth/logout')
    r.push('/')
  }

  return (
    <div className="centered">
      <h2>Admin Dashboard</h2>
      <button onClick={logout}>Logout</button>
      <h3>Add Candidate</h3>
      <form onSubmit={add}>
        <input placeholder="name" value={form.name||''} onChange={e=>setForm({...form,name:e.target.value})} />
        <input placeholder="position" value={form.position||''} onChange={e=>setForm({...form,position:e.target.value})} />
        <input placeholder="department" value={form.department||''} onChange={e=>setForm({...form,department:e.target.value})} />
        <input placeholder="Days of Training" value={form.days_of_training||''} onChange={e=>setForm({...form,days_of_training:e.target.value})} />
        <input placeholder="Trainer Name" value={form.trainer_name||''} onChange={e=>setForm({...form,trainer_name:e.target.value})} />
        <input type="date" placeholder="date_of_interview" value={form.date_picker||''} onChange={e=>{ const iso=e.target.value; setForm({...form,date_picker:iso,date_of_interview: iso? formatDateDMY(iso): ''}) }} />
        <input placeholder="mobile_number" value={form.mobile_number||''} onChange={e=>setForm({...form,mobile_number:e.target.value})} />
        <input placeholder="username" value={form.username||''} onChange={e=>setForm({...form,username:e.target.value})} />
        <input placeholder="password" value={form.password||''} onChange={e=>setForm({...form,password:e.target.value})} />
        <div style={{display:'flex',gap:8}}>
          <button type="submit">{editingId? 'Save' : 'Add'}</button>
          {editingId && <button type="button" onClick={()=>{ setEditingId(null); setForm({}) }}>Cancel</button>}
        </div>
      </form>

      <h3>Candidates</h3>
      <table border="1" cellPadding="6">
        <thead><tr><th>ID</th><th>Name</th><th>Position</th><th>Dept</th><th>Days of Training</th><th>Trainer Name</th><th>Mobile</th><th>Actions</th></tr></thead>
        <tbody>
          {candidates.map(c=> (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.name}</td>
              <td>{c.position}</td>
              <td>{c.department}</td>
              <td>{c.days_of_training}</td>
              <td>{c.trainer_name}</td>
              <td>{c.mobile_number}</td>
              <td>
                <button onClick={()=>startEdit(c)}>Edit</button>
                <button onClick={()=>del(c.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    
    </div>
  )
}