import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { 
  FiUser, 
  FiBriefcase, 
  FiUsers, 
  FiCalendar, 
  FiClock, 
  FiTarget, 
  FiUserCheck, 
  FiPhone, 
  FiMail, 
  FiMapPin, 
  FiBook, 
  FiLogOut,
  FiAward,
  FiHome,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiBarChart,
  FiTrendingUp
} from 'react-icons/fi'

export default function CandidateDashboard(){
  const [data,setData]=useState(null)
  const [attendances, setAttendances] = useState([])
  const [loading, setLoading] = useState(true)
  const r = useRouter()
  
  useEffect(()=>{
    // Fetch candidate data
    fetch('/api/candidates')
      .then(r=>{ if (r.ok) return r.json(); else r.push('/candidate/login') })
      .then(d=>setData(d))
    
    // Fetch attendance data
    fetch('/api/attendances')
      .then(r=>{ if (r.ok) return r.json(); else console.error('Failed to fetch attendance') })
      .then(d=>{
        if(d) setAttendances(d)
        setLoading(false)
      })
  },[])

  async function logout(){
    await fetch('/api/auth/logout')
    r.push('/')
  }

  if (!data || loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading your dashboard...</p>
    </div>
  )

  const personalInfo = [
    { icon: <FiUser />, label: "Name", value: data.name },
    { icon: <FiMail />, label: "Email", value: data.email },
    { icon: <FiPhone />, label: "Mobile", value: data.mobile_number },
    { icon: <FiUser />, label: "Father's Name", value: data.father_name },
    { icon: <FiMapPin />, label: "Address", value: data.address },
    { icon: <FiBook />, label: "Qualification", value: data.qualification }
  ]

  const jobInfo = [
    { icon: <FiBriefcase />, label: "Position", value: data.position },
    { icon: <FiUsers />, label: "Department", value: data.department },
    { icon: <FiCalendar />, label: "Interview Date", value: data.date_of_interview }
  ]

  const trainingInfo = [
    { icon: <FiTarget />, label: "Training Task", value: data.training_task_name },
    { icon: <FiUserCheck />, label: "Trainer", value: data.trainer_name },
    { icon: <FiMail />, label: "Trainer Email", value: data.trainer_email },
    { icon: <FiPhone />, label: "Trainer Mobile", value: data.trainer_mobile },
    { icon: <FiCalendar />, label: "Training Date", value: data.date_of_training },
    { icon: <FiClock />, label: "Training Period", value: data.training_period },
    { icon: <FiClock />, label: "Training Tenure", value: data.tenure_of_training },
    { icon: <FiHome />, label: "Training Location", value: data.training_location }
  ]

  // Calculate attendance statistics
  const totalDays = attendances.length
  const presentDays = attendances.filter(a => a.status === 'present').length
  const absentDays = attendances.filter(a => a.status === 'absent').length
  const lateDays = attendances.filter(a => a.status === 'late').length
  const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0

  const getStatusIcon = (status) => {
    switch(status) {
      case 'present': return <FiCheckCircle className="status-icon present" />
      case 'absent': return <FiXCircle className="status-icon absent" />
      case 'late': return <FiAlertCircle className="status-icon late" />
      default: return <FiAlertCircle className="status-icon" />
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="candidate-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="welcome-section">
            <h1><FiAward className="header-icon" /> Welcome back, {data.name}!</h1>
            <p className="welcome-subtitle">Here's your training portal overview</p>
          </div>
          <button onClick={logout} className="logout-btn">
            <FiLogOut /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Personal Information Card */}
        <div className="info-card">
          <div className="card-header">
            <FiUser className="card-icon" />
            <h2>Personal Information</h2>
          </div>
          <div className="card-grid">
            {personalInfo.map((item, index) => (
              <div key={index} className="info-item">
                <div className="info-icon">{item.icon}</div>
                <div className="info-content">
                  <span className="info-label">{item.label}</span>
                  <span className="info-value">{item.value || 'Not specified'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Job Information Card */}
        <div className="info-card">
          <div className="card-header">
            <FiBriefcase className="card-icon" />
            <h2>Position Details</h2>
          </div>
          <div className="card-grid">
            {jobInfo.map((item, index) => (
              <div key={index} className="info-item">
                <div className="info-icon">{item.icon}</div>
                <div className="info-content">
                  <span className="info-label">{item.label}</span>
                  <span className="info-value">{item.value || 'Not specified'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Training Information Card */}
        <div className="info-card">
          <div className="card-header">
            <FiTarget className="card-icon" />
            <h2>Training Details</h2>
          </div>
          <div className="card-grid">
            {trainingInfo.map((item, index) => (
              <div key={index} className="info-item">
                <div className="info-icon">{item.icon}</div>
                <div className="info-content">
                  <span className="info-label">{item.label}</span>
                  <span className="info-value">{item.value || 'Not specified'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Attendance Statistics Card */}
        <div className="info-card">
          <div className="card-header">
            <FiBarChart className="card-icon" />
            <h2>Attendance Overview</h2>
          </div>
          
          {totalDays > 0 ? (
            <>
              {/* Attendance Stats Grid */}
              <div className="attendance-stats-grid">
                <div className="stat-item present">
                  <FiCheckCircle className="stat-icon" />
                  <div className="stat-content">
                    <span className="stat-number">{presentDays}</span>
                    <span className="stat-label">Present</span>
                  </div>
                </div>
                <div className="stat-item absent">
                  <FiXCircle className="stat-icon" />
                  <div className="stat-content">
                    <span className="stat-number">{absentDays}</span>
                    <span className="stat-label">Absent</span>
                  </div>
                </div>
                <div className="stat-item late">
                  <FiAlertCircle className="stat-icon" />
                  <div className="stat-content">
                    <span className="stat-number">{lateDays}</span>
                    <span className="stat-label">Late</span>
                  </div>
                </div>
                <div className="stat-item percentage">
                  <FiTrendingUp className="stat-icon" />
                  <div className="stat-content">
                    <span className="stat-number">{attendancePercentage}%</span>
                    <span className="stat-label">Attendance Rate</span>
                  </div>
                </div>
              </div>

              {/* Recent Attendance Records */}
              <div className="attendance-records">
                <h3><FiCalendar /> Recent Attendance</h3>
                <div className="attendance-list">
                  {attendances.slice(0, 10).map((attendance, index) => (
                    <div key={index} className="attendance-record">
                      <div className="record-date">
                        <FiCalendar />
                        <span>{formatDate(attendance.date)}</span>
                      </div>
                      <div className="record-status">
                        {getStatusIcon(attendance.status)}
                        <span className={`status-text ${attendance.status}`}>
                          {attendance.status.charAt(0).toUpperCase() + attendance.status.slice(1)}
                        </span>
                      </div>
                      {attendance.note && (
                        <div className="record-note">
                          <span>Note: {attendance.note}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {attendances.length > 10 && (
                  <div className="view-more">
                    <span>Showing recent 10 of {totalDays} records</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="no-attendance">
              <FiCalendar className="no-data-icon" />
              <p>No attendance records found</p>
              <span>Your attendance will appear here once training begins</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
