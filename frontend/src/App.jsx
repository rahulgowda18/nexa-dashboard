import { useEffect, useMemo, useState } from 'react'
import {
  Activity, BarChart3, Bell, BriefcaseBusiness, ChevronDown,
  Edit3, LayoutDashboard, Menu, Moon, MoreHorizontal, Plus,
  Search, Settings, Sun, Trash2, TrendingUp, UserRound, Users, X
} from 'lucide-react'

// const API = import.meta.env.VITE_API_URL || 'http://15.207.110.91/api'
const API = '/api'

const emptyForm = {
  name: '', email: '', role: '', department: 'Engineering',
  status: 'Active', performance: 75, join_date: ''
}

function App() {
  const [employees, setEmployees] = useState([])
  const [page, setPage] = useState('Dashboard')
  const [dark, setDark] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('All')
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  async function loadEmployees() {
    try {
      setLoading(true)
      const res = await fetch(`${API}/employees`)
      if (!res.ok) throw new Error('API error')
      setEmployees(await res.json())
    } catch {
      setMessage('Could not connect to the Flask API.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadEmployees() }, [])

  useEffect(() => {
    if (!message) return
    const t = setTimeout(() => setMessage(''), 3000)
    return () => clearTimeout(t)
  }, [message])

  const departments = ['All', ...new Set(employees.map(e => e.department))]
  const filtered = useMemo(() => employees.filter(e => {
    const q = search.toLowerCase()
    const matchesSearch = [e.name, e.email, e.role, e.department]
      .some(v => String(v).toLowerCase().includes(q))
    return matchesSearch && (department === 'All' || e.department === department)
  }), [employees, search, department])

  const active = employees.filter(e => e.status === 'Active').length
  const average = employees.length
    ? Math.round(employees.reduce((sum, e) => sum + Number(e.performance || 0), 0) / employees.length)
    : 0

  function openCreate() {
    setForm(emptyForm)
    setModal('create')
  }

  function openEdit(employee) {
    setForm(employee)
    setModal('edit')
  }

  async function saveEmployee(e) {
    e.preventDefault()
    const url = modal === 'edit' ? `${API}/employees/${form.id}` : `${API}/employees`
    const method = modal === 'edit' ? 'PUT' : 'POST'
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Request failed')
      setModal(null)
      setMessage(modal === 'edit' ? 'Employee updated successfully.' : 'Employee added successfully.')
      loadEmployees()
    } catch (err) {
      setMessage(err.message)
    }
  }

  async function removeEmployee(id) {
    if (!confirm('Delete this employee?')) return
    try {
      const res = await fetch(`${API}/employees/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      setMessage('Employee deleted.')
      loadEmployees()
    } catch {
      setMessage('Could not delete employee.')
    }
  }

  return (
    <div className={dark ? 'app dark' : 'app light'}>
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="brand">
          <div className="brand-mark">N</div>
          <div><strong>NEXA</strong><span>People OS</span></div>
          <button className="mobile-close" onClick={() => setSidebarOpen(false)}><X size={18}/></button>
        </div>

        <div className="nav-label">Workspace</div>
        <nav>
          {[
            [LayoutDashboard, 'Dashboard'],
            [Users, 'Employees'],
            [BarChart3, 'Analytics'],
            [Settings, 'Settings']
          ].map(([Icon, label]) => (
            <button key={label} className={page === label ? 'nav-item active' : 'nav-item'}
              onClick={() => { setPage(label); setSidebarOpen(false) }}>
              <Icon size={19}/><span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="upgrade">
            <div className="upgrade-icon"><TrendingUp size={18}/></div>
            <div><strong>Pro workspace</strong><span>All systems operational</span></div>
          </div>
          <div className="user-mini">
            <div className="avatar">RG</div>
            <div><strong>Rahul Gowda</strong><span>Administrator</span></div>
            <MoreHorizontal size={18}/>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <button className="menu-btn" onClick={() => setSidebarOpen(true)}><Menu size={22}/></button>
          <div className="crumb">Workspace <span>/</span> {page}</div>
          <div className="top-actions">
            <button className="icon-btn" onClick={() => setDark(!dark)} title="Toggle theme">
              {dark ? <Sun size={19}/> : <Moon size={19}/>}
            </button>
            <button className="icon-btn notification"><Bell size={19}/><i/></button>
            <div className="avatar">RG</div>
          </div>
        </header>

        <div className="content">
          {page === 'Dashboard' && (
            <>
              <section className="hero">
                <div>
                  <div className="eyebrow"><Activity size={14}/> LIVE WORKSPACE</div>
                  <h1>Good afternoon, Rahul <span>✦</span></h1>
                  <p>Here's what's happening across your organization today.</p>
                </div>
                <button className="primary" onClick={openCreate}><Plus size={18}/> Add employee</button>
              </section>

              <section className="stats">
                <Stat icon={Users} label="Total employees" value={employees.length} change="+12.5%" />
                <Stat icon={Activity} label="Active employees" value={active} change="+8.2%" />
                <Stat icon={BriefcaseBusiness} label="Departments" value={Math.max(0, departments.length - 1)} change="+2.4%" />
                <Stat icon={TrendingUp} label="Avg. performance" value={`${average}%`} change="+5.7%" />
              </section>

              <section className="grid-2">
                <div className="card chart-card">
                  <div className="card-head">
                    <div><h2>Team performance</h2><p>Average performance score</p></div>
                    <button className="select-like">Last 6 months <ChevronDown size={15}/></button>
                  </div>
                  <PerformanceChart />
                </div>

                <div className="card">
                  <div className="card-head">
                    <div><h2>Department mix</h2><p>Current workforce distribution</p></div>
                  </div>
                  <DepartmentChart employees={employees}/>
                </div>
              </section>

              <EmployeeTable
                employees={filtered.slice(0, 5)}
                search={search}
                setSearch={setSearch}
                department={department}
                setDepartment={setDepartment}
                departments={departments}
                onEdit={openEdit}
                onDelete={removeEmployee}
                onViewAll={() => setPage('Employees')}
              />
            </>
          )}

          {page === 'Employees' && (
            <>
              <section className="hero compact">
                <div><div className="eyebrow"><Users size={14}/> PEOPLE</div><h1>Employees</h1><p>Manage your organization's people and performance.</p></div>
                <button className="primary" onClick={openCreate}><Plus size={18}/> Add employee</button>
              </section>
              <EmployeeTable
                employees={filtered}
                search={search}
                setSearch={setSearch}
                department={department}
                setDepartment={setDepartment}
                departments={departments}
                onEdit={openEdit}
                onDelete={removeEmployee}
              />
            </>
          )}

          {page === 'Analytics' && <Analytics employees={employees}/>}
          {page === 'Settings' && <SettingsPage dark={dark} setDark={setDark}/>}
          {loading && <div className="loading">Loading workspace…</div>}
        </div>
      </main>

      {message && <div className="toast">{message}</div>}

      {modal && (
        <div className="modal-backdrop" onMouseDown={() => setModal(null)}>
          <div className="modal" onMouseDown={e => e.stopPropagation()}>
            <div className="modal-head">
              <div><div className="eyebrow">EMPLOYEE</div><h2>{modal === 'edit' ? 'Edit employee' : 'Add employee'}</h2></div>
              <button className="icon-btn" onClick={() => setModal(null)}><X size={18}/></button>
            </div>
            <form onSubmit={saveEmployee}>
              <div className="form-grid">
                <label>Full name<input required value={form.name} onChange={e => setForm({...form, name:e.target.value})}/></label>
                <label>Email<input required type="email" value={form.email} onChange={e => setForm({...form, email:e.target.value})}/></label>
                <label>Role<input required value={form.role} onChange={e => setForm({...form, role:e.target.value})}/></label>
                <label>Department<select value={form.department} onChange={e => setForm({...form, department:e.target.value})}>
                  {['Engineering','Quality','Design','People','Marketing','Finance'].map(x => <option key={x}>{x}</option>)}
                </select></label>
                <label>Status<select value={form.status} onChange={e => setForm({...form, status:e.target.value})}>
                  {['Active','On Leave','Inactive'].map(x => <option key={x}>{x}</option>)}
                </select></label>
                <label>Performance<input type="number" min="0" max="100" value={form.performance} onChange={e => setForm({...form, performance:e.target.value})}/></label>
                <label>Join date<input type="date" value={form.join_date || ''} onChange={e => setForm({...form, join_date:e.target.value})}/></label>
              </div>
              <div className="modal-actions"><button type="button" className="secondary" onClick={() => setModal(null)}>Cancel</button><button className="primary" type="submit">Save employee</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function Stat({icon:Icon, label, value, change}) {
  return <div className="card stat"><div className="stat-icon"><Icon size={20}/></div><div><p>{label}</p><h2>{value}</h2><span className="positive">{change} <small>vs last month</small></span></div><div className="stat-spark">╱╲╱╱╲</div></div>
}

function PerformanceChart() {
  const points = "0,150 60,132 120,142 180,105 240,116 300,78 360,90 420,50 480,62 540,28 600,42"
  return <div className="line-chart">
    <div className="y-axis"><span>100</span><span>75</span><span>50</span><span>25</span><span>0</span></div>
    <svg viewBox="0 0 600 180" preserveAspectRatio="none">
      <defs><linearGradient id="fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopOpacity=".28"/><stop offset="100%" stopOpacity="0"/></linearGradient></defs>
      <path d={`M ${points.replaceAll(' ', ' L ')}`} fill="none" stroke="currentColor" strokeWidth="3"/>
      <path d={`M 0,180 L ${points.replaceAll(' ', ' L ')} L 600,180 Z`} fill="url(#fill)" stroke="none"/>
    </svg>
    <div className="x-axis"><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span></div>
  </div>
}

function DepartmentChart({employees}) {
  const counts = employees.reduce((a,e) => ({...a,[e.department]:(a[e.department]||0)+1}), {})
  const data = Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,4)
  const total = employees.length || 1
  return <div className="dept-chart">
    <div className="donut" style={{'--p': `${Math.round((data[0]?.[1]||0)/total*100)}%`}}><div><strong>{employees.length}</strong><span>Total</span></div></div>
    <div className="legend">{data.map(([name,count],i)=><div key={name}><i className={`dot d${i}`}/><span>{name}</span><strong>{Math.round(count/total*100)}%</strong></div>)}</div>
  </div>
}

function EmployeeTable({employees, search, setSearch, department, setDepartment, departments, onEdit, onDelete, onViewAll}) {
  return <section className="card table-card">
    <div className="card-head table-title"><div><h2>Recent employees</h2><p>People currently in your workspace</p></div>{onViewAll && <button className="text-btn" onClick={onViewAll}>View all →</button>}</div>
    <div className="filters">
      <div className="search"><Search size={17}/><input placeholder="Search employees…" value={search} onChange={e=>setSearch(e.target.value)}/></div>
      <select value={department} onChange={e=>setDepartment(e.target.value)}>{departments.map(x=><option key={x}>{x}</option>)}</select>
    </div>
    <div className="table-wrap">
      <table><thead><tr><th>Employee</th><th>Role</th><th>Department</th><th>Performance</th><th>Status</th><th></th></tr></thead>
      <tbody>{employees.map(e=><tr key={e.id}>
        <td><div className="person"><div className="avatar">{e.name.split(' ').map(x=>x[0]).join('').slice(0,2)}</div><div><strong>{e.name}</strong><span>{e.email}</span></div></div></td>
        <td>{e.role}</td><td>{e.department}</td><td><div className="perf"><div><span style={{width:`${e.performance}%`}}/></div><strong>{e.performance}%</strong></div></td>
        <td><span className={`status ${e.status.toLowerCase().replace(' ','-')}`}><i/>{e.status}</span></td>
        <td><div className="row-actions"><button onClick={()=>onEdit(e)} title="Edit"><Edit3 size={15}/></button><button onClick={()=>onDelete(e.id)} title="Delete"><Trash2 size={15}/></button></div></td>
      </tr>)}</tbody></table>
      {!employees.length && <div className="empty">No employees found.</div>}
    </div>
  </section>
}

function Analytics({employees}) {
  const avg = employees.length ? Math.round(employees.reduce((a,e)=>a+Number(e.performance),0)/employees.length) : 0
  return <><section className="hero compact"><div><div className="eyebrow"><BarChart3 size={14}/> INSIGHTS</div><h1>Analytics</h1><p>Understand workforce performance at a glance.</p></div></section>
    <div className="stats"><Stat icon={Users} label="Headcount" value={employees.length} change="+12.5%"/><Stat icon={TrendingUp} label="Average score" value={`${avg}%`} change="+5.7%"/><Stat icon={Activity} label="Active rate" value={`${employees.length ? Math.round(employees.filter(e=>e.status==='Active').length/employees.length*100):0}%`} change="+3.1%"/><Stat icon={BriefcaseBusiness} label="Departments" value={new Set(employees.map(e=>e.department)).size} change="+2.4%"/></div>
    <div className="grid-2"><div className="card chart-card"><div className="card-head"><div><h2>Performance trend</h2><p>Organization-wide score</p></div></div><PerformanceChart/></div><div className="card"><div className="card-head"><div><h2>Department mix</h2><p>Workforce by department</p></div></div><DepartmentChart employees={employees}/></div></div>
  </>
}

function SettingsPage({dark,setDark}) {
  return <><section className="hero compact"><div><div className="eyebrow"><Settings size={14}/> CONFIGURATION</div><h1>Settings</h1><p>Manage your NEXA workspace preferences.</p></div></section>
    <div className="card settings-card"><div><h2>Appearance</h2><p>Choose how NEXA looks on your device.</p></div><button className="theme-toggle" onClick={()=>setDark(!dark)}>{dark?<Moon size={17}/>:<Sun size={17}/>} {dark?'Dark mode':'Light mode'}</button></div>
    <div className="card settings-card"><div><h2>Workspace</h2><p>NEXA People OS · Employee management environment</p></div><span className="status active"><i/>Operational</span></div>
  </>
}

export default App
