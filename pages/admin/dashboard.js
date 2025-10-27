import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import React from 'react'
import { 
  MdDashboard, 
  MdLogout, 
  MdPerson, 
  MdEdit, 
  MdDelete,
  MdAdd,
  MdSave,
  MdCancel,
  MdBusiness,
  MdPhone,
  MdEmail,
  MdLocationOn,
  MdSchool,
  MdWork,
  MdCalendarToday,
  MdAssignment,
  MdCheckCircle,
  MdCancel as MdCancelIcon,
  MdAccessTime,
  MdEventNote,
  MdFactCheck
} from 'react-icons/md'
import { FaUserTie, FaChalkboardTeacher } from 'react-icons/fa'

export default function AdminDashboard(){
  const [candidates,setCandidates]=useState([])
  const [form,setForm]=useState({})
  const [editingId,setEditingId]=useState(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [attendances, setAttendances] = useState([])
  const [attendanceForm, setAttendanceForm] = useState({
    candidate_id: '',
    date: new Date().toISOString().split('T')[0],
    status: 'present',
    note: ''
  })
  const [attendanceView, setAttendanceView] = useState('all') // 'all' or 'candidate'
  const [selectedCandidateId, setSelectedCandidateId] = useState('')
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: ''
  })
  const [filteredAttendances, setFilteredAttendances] = useState([])
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

  useEffect(()=>{ 
    load() 
    loadAttendances()
  }, [])

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

  // Attendance Functions
  async function loadAttendances(){
    try {
      const res = await fetch('/api/attendances')
      if (!res.ok) return
      const data = await res.json()
      setAttendances(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to load attendances:', error)
      setAttendances([])
    }
  }

  async function markAttendance(e){
    e.preventDefault()
    console.log('📝 Marking attendance with data:', attendanceForm)
    
    // Validate required fields
    if (!attendanceForm.candidate_id) {
      alert('Please select a candidate')
      return
    }
    if (!attendanceForm.date) {
      alert('Please select a date')
      return
    }
    
    try {
      console.log('🔄 Sending request to /api/attendances...')
      const res = await fetch('/api/attendances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attendanceForm)
      })
      
      console.log('📡 Response status:', res.status)
      console.log('📡 Response ok:', res.ok)
      
      if (res.ok) {
        const responseData = await res.json()
        console.log('✅ Attendance marked successfully:', responseData)
        setAttendanceForm({
          candidate_id: '',
          date: new Date().toISOString().split('T')[0],
          status: 'present',
          note: ''
        })
        loadAttendances()
      } else {
        const errorData = await res.json()
        console.error('❌ Failed to mark attendance:', errorData)
        alert(`Failed to mark attendance: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('❌ Network error when marking attendance:', error)
      alert('Network error: Please check if the server is running')
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-GB')
  }

  function getStatusIcon(status) {
    switch (status) {
      case 'present': return <MdCheckCircle style={{color: '#10b981'}} />
      case 'absent': return <MdCancelIcon style={{color: '#ef4444'}} />
      case 'late': return <MdAccessTime style={{color: '#f59e0b'}} />
      default: return <MdEventNote />
    }
  }

  function getStatusColor(status) {
    switch (status) {
      case 'present': return '#10b981'
      case 'absent': return '#ef4444'
      case 'late': return '#f59e0b'
      default: return '#6b7280'
    }
  }

  // Filter attendances based on selected candidate and date range
  function filterAttendances() {
    let filtered = [...attendances]
    
    // Filter by candidate if view is set to 'candidate' and a candidate is selected
    if (attendanceView === 'candidate' && selectedCandidateId) {
      filtered = filtered.filter(att => att.candidate_id == selectedCandidateId)
    }
    
    // Filter by date range if provided
    if (dateFilter.startDate) {
      filtered = filtered.filter(att => att.date >= dateFilter.startDate)
    }
    if (dateFilter.endDate) {
      filtered = filtered.filter(att => att.date <= dateFilter.endDate)
    }
    
    setFilteredAttendances(filtered)
  }

  // Update filtered attendances whenever filters change
  React.useEffect(() => {
    filterAttendances()
  }, [attendances, attendanceView, selectedCandidateId, dateFilter])

  function resetFilters() {
    setAttendanceView('all')
    setSelectedCandidateId('')
    setDateFilter({ startDate: '', endDate: '' })
  }

  function getAttendanceStats(candidateId = null) {
    const relevantAttendances = candidateId 
      ? attendances.filter(att => att.candidate_id == candidateId)
      : attendances
    
    const total = relevantAttendances.length
    const present = relevantAttendances.filter(att => att.status === 'present').length
    const absent = relevantAttendances.filter(att => att.status === 'absent').length
    const late = relevantAttendances.filter(att => att.status === 'late').length
    
    return { total, present, absent, late }
  }

  return (
    <div className="dashboard-layout">
      {/* Left Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Training Portal</h2>
          <div className="admin-info">
            <div className="admin-avatar">
              <FaUserTie size={20} />
            </div>
            <div className="admin-details">
              <h4>Admin User</h4>
              <p className="admin-role">Administrator</p>
            </div>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <MdDashboard className="nav-icon" size={20} />
            Dashboard
          </button>
          
          <button 
            className={`nav-item ${activeTab === 'attendance' ? 'active' : ''}`}
            onClick={() => setActiveTab('attendance')}
          >
            <MdFactCheck className="nav-icon" size={20} />
            Attendance
          </button>
          
          <button 
            className="nav-item logout-btn"
            onClick={logout}
          >
            <MdLogout className="nav-icon" size={20} />
            Logout
          </button>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        {activeTab === 'dashboard' && (
          <div className="dashboard-content">
            <div className="content-header">
              <h1>Candidate Management</h1>
              <p>Manage training candidates and their information</p>
            </div>

            <div className="form-section">
              <h3>{editingId ? 'Edit Candidate' : 'Add New Candidate'}</h3>
              <form onSubmit={add} className="candidate-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label><MdPerson className="label-icon" /> Name</label>
                    <input placeholder="Enter full name" value={form.name||''} onChange={e=>setForm({...form,name:e.target.value})} />
                  </div>
                  
                  <div className="form-group">
                    <label><MdWork className="label-icon" /> Position</label>
                    <input placeholder="Enter position" value={form.position||''} onChange={e=>setForm({...form,position:e.target.value})} />
                  </div>
                  
                  <div className="form-group">
                    <label><MdBusiness className="label-icon" /> Department</label>
                    <input placeholder="Enter department" value={form.department||''} onChange={e=>setForm({...form,department:e.target.value})} />
                  </div>
                  
                  <div className="form-group">
                    <label><MdCalendarToday className="label-icon" /> Training Tenure (days)</label>
                    <input placeholder="Enter training tenure" value={form.tenure_of_training||''} onChange={e=>setForm({...form,tenure_of_training:e.target.value})} />
                  </div>
                  
                  <div className="form-group">
                    <label><MdAssignment className="label-icon" /> Training Task</label>
                    <input placeholder="Enter training task" value={form.training_task_name||''} onChange={e=>setForm({...form,training_task_name:e.target.value})} />
                  </div>
                  
                  <div className="form-group">
                    <label><FaChalkboardTeacher className="label-icon" /> Trainer Name</label>
                    <input placeholder="Enter trainer name" value={form.trainer_name||''} onChange={e=>setForm({...form,trainer_name:e.target.value})} />
                  </div>
                  
                  <div className="form-group">
                    <label><MdCalendarToday className="label-icon" /> Interview Date</label>
                    <input type="date" value={form.date_picker||''} onChange={e=>{ const iso=e.target.value; setForm({...form,date_picker:iso,date_of_interview: iso? formatDateDMY(iso): ''}) }} />
                  </div>
                  
                  <div className="form-group">
                    <label><MdPhone className="label-icon" /> Mobile Number</label>
                    <input placeholder="Enter mobile number" value={form.mobile_number||''} onChange={e=>setForm({...form,mobile_number:e.target.value})} />
                  </div>
                  
                  <div className="form-group">
                    <label><MdPerson className="label-icon" /> Username</label>
                    <input placeholder="Enter username" value={form.username||''} onChange={e=>setForm({...form,username:e.target.value})} />
                  </div>
                  
                  <div className="form-group">
                    <label><MdPerson className="label-icon" /> Password</label>
                    <input type="password" placeholder="Enter password" value={form.password||''} onChange={e=>setForm({...form,password:e.target.value})} />
                  </div>
                  
                  <div className="form-group">
                    <label><MdPerson className="label-icon" /> Father's Name</label>
                    <input placeholder="Enter father's name" value={form.father_name||''} onChange={e=>setForm({...form,father_name:e.target.value})} />
                  </div>
                  
                  <div className="form-group">
                    <label><MdEmail className="label-icon" /> Email</label>
                    <input type="email" placeholder="Enter email" value={form.email||''} onChange={e=>setForm({...form,email:e.target.value})} />
                  </div>
                  
                  <div className="form-group form-group-full">
                    <label><MdLocationOn className="label-icon" /> Address</label>
                    <input placeholder="Enter address" value={form.address||''} onChange={e=>setForm({...form,address:e.target.value})} />
                  </div>
                  
                  <div className="form-group">
                    <label><MdSchool className="label-icon" /> Qualification</label>
                    <input placeholder="Enter qualification" value={form.qualification||''} onChange={e=>setForm({...form,qualification:e.target.value})} />
                  </div>
                  
                  <div className="form-group">
                    <label><MdCalendarToday className="label-icon" /> Training Date</label>
                    <input type="date" value={form.date_of_training||''} onChange={e=>setForm({...form,date_of_training:e.target.value})} />
                  </div>
                  
                  <div className="form-group">
                    <label><MdLocationOn className="label-icon" /> Training Location</label>
                    <input placeholder="Enter training location" value={form.training_location||''} onChange={e=>setForm({...form,training_location:e.target.value})} />
                  </div>
                  
                  <div className="form-group">
                    <label><MdCalendarToday className="label-icon" /> Training Period</label>
                    <input placeholder="Enter training period" value={form.training_period||''} onChange={e=>setForm({...form,training_period:e.target.value})} />
                  </div>
                  
                  <div className="form-group">
                    <label><MdEmail className="label-icon" /> Trainer Email</label>
                    <input type="email" placeholder="Enter trainer email" value={form.trainer_email||''} onChange={e=>setForm({...form,trainer_email:e.target.value})} />
                  </div>
                  
                  <div className="form-group">
                    <label><MdPhone className="label-icon" /> Trainer Mobile</label>
                    <input placeholder="Enter trainer mobile" value={form.trainer_mobile||''} onChange={e=>setForm({...form,trainer_mobile:e.target.value})} />
                  </div>
                </div>
                
                <div className="form-actions">
                  <button type="submit" className="btn-primary">
                    {editingId ? <><MdSave /> Update Candidate</> : <><MdAdd /> Add Candidate</>}
                  </button>
                  {editingId && (
                    <button type="button" className="btn-secondary" onClick={()=>{ setEditingId(null); setForm({}) }}>
                      <MdCancel /> Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="table-section">
              <h3>Candidates List</h3>
              <div className="table-container">
                <table className="candidates-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Position</th>
                      <th>Department</th>
                      <th>Training Tenure</th>
                      <th>Training Task</th>
                      <th>Trainer Name</th>
                      <th>Mobile</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
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
                          <div className="action-buttons">
                            <button className="btn-edit" onClick={()=>startEdit(c)}>
                              <MdEdit /> Edit
                            </button>
                            <button className="btn-delete" onClick={()=>del(c.id)}>
                              <MdDelete /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="attendance-content">
            <div className="content-header">
              <h1>Daily Attendance Management</h1>
              <p>Mark and manage daily attendance for training candidates</p>
            </div>

            {/* Mark Attendance Form */}
            <div className="form-section">
              <h3>Mark Attendance</h3>
              <form onSubmit={markAttendance} className="attendance-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label><MdPerson className="label-icon" /> Select Candidate</label>
                    <select 
                      value={attendanceForm.candidate_id} 
                      onChange={e=>setAttendanceForm({...attendanceForm, candidate_id: e.target.value})}
                      required
                    >
                      <option value="">Choose a candidate...</option>
                      {candidates.map(c => (
                        <option key={c.id} value={c.id}>{c.name} - {c.position}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label><MdCalendarToday className="label-icon" /> Date</label>
                    <input 
                      type="date" 
                      value={attendanceForm.date} 
                      onChange={e=>setAttendanceForm({...attendanceForm, date: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label><MdCheckCircle className="label-icon" /> Status</label>
                    <select 
                      value={attendanceForm.status} 
                      onChange={e=>setAttendanceForm({...attendanceForm, status: e.target.value})}
                      required
                    >
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                      <option value="late">Late</option>
                    </select>
                  </div>
                  
                  <div className="form-group form-group-full">
                    <label><MdEventNote className="label-icon" /> Note (Optional)</label>
                    <input 
                      type="text"
                      placeholder="Add any notes about attendance..."
                      value={attendanceForm.note} 
                      onChange={e=>setAttendanceForm({...attendanceForm, note: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="form-actions">
                  <button type="submit" className="btn-primary">
                    <MdAdd /> Mark Attendance
                  </button>
                </div>
              </form>
            </div>

            {/* Attendance Records */}
            <div className="table-section">
              <div className="attendance-header">
                <h3>Attendance Records</h3>
                <div className="attendance-controls">
                  <div className="view-toggle">
                    <label>
                      <input 
                        type="radio" 
                        name="attendanceView" 
                        value="all" 
                        checked={attendanceView === 'all'}
                        onChange={e => setAttendanceView(e.target.value)}
                      />
                      All Candidates
                    </label>
                    <label>
                      <input 
                        type="radio" 
                        name="attendanceView" 
                        value="candidate" 
                        checked={attendanceView === 'candidate'}
                        onChange={e => setAttendanceView(e.target.value)}
                      />
                      Individual Candidate
                    </label>
                  </div>
                </div>
              </div>

              {/* Filters Section */}
              <div className="filters-section">
                <div className="filter-row">
                  {attendanceView === 'candidate' && (
                    <div className="filter-group">
                      <label><MdPerson className="label-icon" /> Select Candidate</label>
                      <select 
                        value={selectedCandidateId} 
                        onChange={e => setSelectedCandidateId(e.target.value)}
                      >
                        <option value="">All Candidates</option>
                        {candidates.map(c => (
                          <option key={c.id} value={c.id}>{c.name} - {c.position}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  <div className="filter-group">
                    <label><MdCalendarToday className="label-icon" /> Start Date</label>
                    <input 
                      type="date" 
                      value={dateFilter.startDate}
                      onChange={e => setDateFilter({...dateFilter, startDate: e.target.value})}
                    />
                  </div>
                  
                  <div className="filter-group">
                    <label><MdCalendarToday className="label-icon" /> End Date</label>
                    <input 
                      type="date" 
                      value={dateFilter.endDate}
                      onChange={e => setDateFilter({...dateFilter, endDate: e.target.value})}
                    />
                  </div>
                  
                  <div className="filter-actions">
                    <button type="button" className="btn-secondary" onClick={resetFilters}>
                      <MdCancel /> Reset Filters
                    </button>
                  </div>
                </div>
              </div>

              {/* Attendance Statistics */}
              {attendanceView === 'candidate' && selectedCandidateId && (
                <div className="attendance-stats">
                  <h4>Attendance Summary for {candidates.find(c => c.id == selectedCandidateId)?.name}</h4>
                  <div className="stats-grid">
                    {(() => {
                      const stats = getAttendanceStats(selectedCandidateId)
                      return (
                        <>
                          <div className="stat-card total">
                            <div className="stat-number">{stats.total}</div>
                            <div className="stat-label">Total Days</div>
                          </div>
                          <div className="stat-card present">
                            <div className="stat-number">{stats.present}</div>
                            <div className="stat-label">Present</div>
                          </div>
                          <div className="stat-card absent">
                            <div className="stat-number">{stats.absent}</div>
                            <div className="stat-label">Absent</div>
                          </div>
                          <div className="stat-card late">
                            <div className="stat-number">{stats.late}</div>
                            <div className="stat-label">Late</div>
                          </div>
                        </>
                      )
                    })()}
                  </div>
                </div>
              )}

              <div className="table-container">
                <table className="attendance-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      {attendanceView === 'all' && <th>Candidate</th>}
                      <th>Status</th>
                      <th>Note</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAttendances.length > 0 ? filteredAttendances.map(att => (
                      <tr key={att.id}>
                        <td>{formatDate(att.date)}</td>
                        {attendanceView === 'all' && <td>{att.name || 'Unknown'}</td>}
                        <td>
                          <span className="status-badge" style={{backgroundColor: getStatusColor(att.status)}}>
                            {getStatusIcon(att.status)}
                            {att.status.charAt(0).toUpperCase() + att.status.slice(1)}
                          </span>
                        </td>
                        <td>{att.note || '-'}</td>
                        <td>
                          <div className="action-buttons">
                            <button className="btn-edit" onClick={()=>console.log('Edit attendance:', att.id)}>
                              <MdEdit /> Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={attendanceView === 'all' ? "5" : "4"} style={{textAlign: 'center', padding: '20px', color: '#6b7280'}}>
                          {attendanceView === 'candidate' && !selectedCandidateId 
                            ? 'Please select a candidate to view their attendance'
                            : 'No attendance records found for the selected criteria'
                          }
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}