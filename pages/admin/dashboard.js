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
    setForm({
      name: c.name || '',
      position: c.position || '',
      department: c.department || '',
      // changed to DB column name
      tenure_of_training: c.tenure_of_training || '',
      // use DB field training_task_name
      training_task_name: c.training_task_name || '',
      trainer_name: c.trainer_name || '',
      date_of_interview: c.date_of_interview || '',
      date_picker: c.date_of_interview ? parseDateDMY(c.date_of_interview) : '',
      mobile_number: c.mobile_number || '',
      username: c.username || '',
      password: '',
      father_name: c.father_name || '',
      email: c.email || '',
      address: c.address || '',
      qualification: c.qualification || '',
      date_of_training: c.date_of_training || '',
      training_location: c.training_location || '',
      training_period: c.training_period || '',
      trainer_email: c.trainer_email || '',
      trainer_mobile: c.trainer_mobile || ''
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
        
        {/* changed input name to match DB */}
        <input placeholder="Training tenure (days)" value={form.tenure_of_training||''} onChange={e=>setForm({...form,tenure_of_training:e.target.value})} />
        
        {/* new input for training task */}
        <input placeholder="Training task" value={form.training_task_name||''} onChange={e=>setForm({...form,training_task_name:e.target.value})} />
        <input placeholder="Trainer Name" value={form.trainer_name||''} onChange={e=>setForm({...form,trainer_name:e.target.value})} />
        <input type="date" placeholder="date_of_interview" value={form.date_picker||''} onChange={e=>{ const iso=e.target.value; setForm({...form,date_picker:iso,date_of_interview: iso? formatDateDMY(iso): ''}) }} />
        <input placeholder="mobile_number" value={form.mobile_number||''} onChange={e=>setForm({...form,mobile_number:e.target.value})} />
        <input placeholder="username" value={form.username||''} onChange={e=>setForm({...form,username:e.target.value})} />
        <input placeholder="password" value={form.password||''} onChange={e=>setForm({...form,password:e.target.value})} />
        <input placeholder="Father's name" value={form.father_name||''} onChange={e=>setForm({...form,father_name:e.target.value})} />
        <input placeholder="Email" value={form.email||''} onChange={e=>setForm({...form,email:e.target.value})} />
        <input placeholder="Address" value={form.address||''} onChange={e=>setForm({...form,address:e.target.value})} />
        <input placeholder="Qualification" value={form.qualification||''} onChange={e=>setForm({...form,qualification:e.target.value})} />
        <input type="date" placeholder="date_of_training" value={form.date_of_training||''} onChange={e=>setForm({...form,date_of_training:e.target.value})} />
        <input placeholder="Training Location" value={form.training_location||''} onChange={e=>setForm({...form,training_location:e.target.value})} />
        <input placeholder="Training Period" value={form.training_period||''} onChange={e=>setForm({...form,training_period:e.target.value})} />
        <input placeholder="Trainer Email" value={form.trainer_email||''} onChange={e=>setForm({...form,trainer_email:e.target.value})} />
        <input placeholder="Trainer Mobile" value={form.trainer_mobile||''} onChange={e=>setForm({...form,trainer_mobile:e.target.value})} />
        <div style={{display:'flex',gap:8}}>
          <button type="submit">{editingId? 'Save' : 'Add'}</button>
          {editingId && <button type="button" onClick={()=>{ setEditingId(null); setForm({}) }}>Cancel</button>}
        </div>
      </form>

      <h3>Candidates</h3>
      <table border="1" cellPadding="6">
        <thead><tr><th>ID</th><th>Name</th><th>Position</th><th>Dept</th><th>Training Tenure</th><th>Training Task</th><th>Trainer Name</th><th>Mobile</th><th>Actions</th></tr></thead>
        <tbody>
          {candidates.map(c=> (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.name}</td>
              <td>{c.position}</td>
              <td>{c.department}</td>
              <td>{c.tenure_of_training}</td>
              <td>{c.training_task_name}</td>
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