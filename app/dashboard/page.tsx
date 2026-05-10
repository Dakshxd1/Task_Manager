'use client'
import { motion } from 'framer-motion'
import { useStore } from '@/store'
import { formatDate, isOverdue, getProjectProgress, chartData } from '@/lib/utils'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from 'recharts'
import Link from 'next/link'

function getInitials(name: string) {
  return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
}

const AVATAR_COLORS = ['#6366F1','#10B981','#F59E0B','#EF4444','#06B6D4','#8B5CF6']
const PROJECT_ACCENTS = ['#6366F1','#22C55E','#F59E0B','#EF4444']

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'var(--bg-1)', border:'1px solid var(--border-2)', borderRadius:10, padding:'10px 14px' }}>
      <p style={{ fontSize:11.5, color:'var(--text-2)', marginBottom:6, fontWeight:600 }}>{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
          <span style={{ width:8, height:8, borderRadius:'50%', background:p.color, display:'inline-block' }} />
          <span style={{ fontSize:12, color:'var(--text-2)' }}>{p.name}:</span>
          <span style={{ fontSize:12, fontWeight:600, color:'var(--text)' }}>{p.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const { tasks, projects, members } = useStore()

  const total     = tasks.length
  const done      = tasks.filter(t => t.status === 'done').length
  const inProg    = tasks.filter(t => t.status === 'in_progress').length
  const overdue   = tasks.filter(t => isOverdue(t.due_date, t.status)).length
  const productivity = total > 0 ? Math.round(done / total * 100) : 0

  const kpis = [
    { label:'Total Tasks',  value:total,            delta:'+12%',         color:'#6366F1', bg:'rgba(99,102,241,0.1)',  icon:'▦' },
    { label:'Completed',    value:done,             delta:`${productivity}%`, color:'#22C55E', bg:'rgba(34,197,94,0.1)',   icon:'✓' },
    { label:'In Progress',  value:inProg,           delta:'Active',       color:'#F59E0B', bg:'rgba(245,158,11,0.1)', icon:'◑' },
    { label:'Overdue',      value:overdue,          delta:'Urgent',       color:'#EF4444', bg:'rgba(239,68,68,0.1)',  icon:'⚠' },
    { label:'Projects',     value:projects.length,  delta:`${projects.filter(p=>p.status==='active').length} active`, color:'#06B6D4', bg:'rgba(6,182,212,0.1)',  icon:'◫' },
    { label:'Team Size',    value:members.length,   delta:'All online',   color:'#8B5CF6', bg:'rgba(139,92,246,0.1)', icon:'◉' },
  ]

  const activeProjects = projects.filter(p => p.status === 'active')
  const recentTasks    = [...tasks].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0,6)

  const statusColor: Record<string,string> = { todo:'#475569', in_progress:'#818CF8', review:'#F59E0B', done:'#22C55E' }
  const priorityClass: Record<string,string> = { low:'p-low', medium:'p-medium', high:'p-high', critical:'p-critical' }

  return (
    <div style={{ maxWidth:1280, margin:'0 auto' }}>

      {/* ── Header ── */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
        <div>
          <h1 className="font-display" style={{ fontSize:24, letterSpacing:'-0.5px', color:'var(--text)', marginBottom:4 }}>
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'} ✦
          </h1>
          <p style={{ fontSize:13.5, color:'var(--text-3)' }}>
            {new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' })}
          </p>
        </div>
        <Link href="/dashboard/tasks">
          <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
            className="btn btn-primary" style={{ padding:'10px 18px', fontSize:13.5 }}>
            + New Task
          </motion.button>
        </Link>
      </div>

      {/* ── KPI Cards ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:12, marginBottom:20 }}>
        {kpis.map((k, i) => (
          <motion.div key={k.label}
            initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
            transition={{ delay:i*0.06, duration:0.4 }}
            whileHover={{ y:-3, transition:{ duration:0.15 } }}
            className="card" style={{ padding:'18px 16px', cursor:'default' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
              <div style={{ width:34, height:34, borderRadius:9, background:k.bg,
                display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, color:k.color }}>
                {k.icon}
              </div>
              <span style={{ fontSize:11, fontWeight:600, padding:'3px 7px', borderRadius:6, background:k.bg, color:k.color }}>
                {k.delta}
              </span>
            </div>
            <p className="font-display" style={{ fontSize:30, fontWeight:700, color:'var(--text)', lineHeight:1, marginBottom:4 }}>
              {k.value}
            </p>
            <p style={{ fontSize:12, color:'var(--text-3)' }}>{k.label}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Charts Row ── */}
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:16, marginBottom:20 }}>

        {/* Area chart */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
          className="card" style={{ padding:'20px 20px 12px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
            <div>
              <h3 className="font-display" style={{ fontSize:15, color:'var(--text)', marginBottom:3 }}>Task Velocity</h3>
              <p style={{ fontSize:12, color:'var(--text-3)' }}>Created vs Completed — Last 7 days</p>
            </div>
            <div style={{ display:'flex', gap:16 }}>
              {[{ color:'#6366F1', label:'Created' },{ color:'#22C55E', label:'Completed' }].map(l => (
                <div key={l.label} style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'var(--text-3)' }}>
                  <span style={{ width:8, height:8, borderRadius:'50%', background:l.color, display:'inline-block' }} />
                  {l.label}
                </div>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={190}>
            <AreaChart data={chartData} margin={{ top:4, right:4, bottom:0, left:-20 }}>
              <defs>
                <linearGradient id="gC" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366F1" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gD" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#22C55E" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" tick={{ fill:'#4B5A72', fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:'#4B5A72', fontSize:11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="created"   stroke="#6366F1" strokeWidth={2} fill="url(#gC)" name="Created" />
              <Area type="monotone" dataKey="completed" stroke="#22C55E" strokeWidth={2} fill="url(#gD)" name="Completed" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Bar chart + ring */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.35 }}
          className="card" style={{ padding:'20px' }}>
          <h3 className="font-display" style={{ fontSize:15, color:'var(--text)', marginBottom:3 }}>Team Output</h3>
          <p style={{ fontSize:12, color:'var(--text-3)', marginBottom:14 }}>Daily velocity score</p>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={chartData} margin={{ top:0, right:0, bottom:0, left:-28 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" tick={{ fill:'#4B5A72', fontSize:10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:'#4B5A72', fontSize:10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="velocity" name="Velocity %" radius={[4,4,0,0]}
                fill="url(#barGrad)">
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#818CF8" />
                    <stop offset="100%" stopColor="#6366F1" />
                  </linearGradient>
                </defs>
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Productivity ring */}
          <div style={{ display:'flex', alignItems:'center', gap:14, marginTop:16, paddingTop:16, borderTop:'1px solid var(--border)' }}>
            <div style={{ position:'relative', width:52, height:52, flexShrink:0 }}>
              <svg width="52" height="52" viewBox="0 0 52 52" style={{ transform:'rotate(-90deg)' }}>
                <circle cx="26" cy="26" r="22" fill="none" stroke="var(--bg-3)" strokeWidth="4" />
                <motion.circle cx="26" cy="26" r="22" fill="none" stroke="#6366F1" strokeWidth="4"
                  strokeLinecap="round"
                  initial={{ strokeDasharray:'0 138.2' }}
                  animate={{ strokeDasharray:`${138.2 * productivity / 100} 138.2` }}
                  transition={{ duration:1.2, ease:'easeOut' }} />
              </svg>
              <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <span style={{ fontSize:11, fontWeight:700, color:'var(--accent-2)' }}>{productivity}%</span>
              </div>
            </div>
            <div>
              <p style={{ fontSize:13, fontWeight:600, color:'var(--text)', marginBottom:2 }}>Productivity</p>
              <p style={{ fontSize:11.5, color:'var(--text-3)' }}>This week overall</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Bottom Row: Projects + Recent Tasks ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>

        {/* Active Projects */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 }}
          className="card" style={{ padding:'20px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
            <h3 className="font-display" style={{ fontSize:15, color:'var(--text)' }}>Active Projects</h3>
            <Link href="/dashboard/projects" style={{ fontSize:12, color:'var(--accent-2)', textDecoration:'none', fontWeight:500 }}>
              View all →
            </Link>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
            {activeProjects.slice(0,3).map((p, i) => {
              const prog = getProjectProgress(p)
              const accent = PROJECT_ACCENTS[i % PROJECT_ACCENTS.length]
              return (
                <div key={p.id}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ width:8, height:8, borderRadius:'50%', background:accent, display:'inline-block' }} />
                      <p style={{ fontSize:13.5, fontWeight:500, color:'var(--text)' }}>{p.name}</p>
                    </div>
                    <span style={{ fontSize:12, fontWeight:700, color:accent }}>{prog}%</span>
                  </div>
                  <div className="progress-track" style={{ height:5, marginBottom:6 }}>
                    <motion.div className="progress-fill"
                      initial={{ width:0 }} animate={{ width:`${prog}%` }}
                      transition={{ duration:1, delay:0.2+i*0.1 }}
                      style={{ background:`linear-gradient(90deg, ${accent}, ${accent}bb)` }} />
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:11.5, color:'var(--text-3)' }}>
                    <span>{p.completed_count||0}/{p.task_count||0} tasks</span>
                    <span>Due {formatDate(p.deadline)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Recent Tasks */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.45 }}
          className="card" style={{ padding:'20px' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
            <h3 className="font-display" style={{ fontSize:15, color:'var(--text)' }}>Recent Tasks</h3>
            <Link href="/dashboard/tasks" style={{ fontSize:12, color:'var(--accent-2)', textDecoration:'none', fontWeight:500 }}>
              View all →
            </Link>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {recentTasks.map(t => (
              <div key={t.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px',
                borderRadius:9, background:'var(--bg-2)', border:'1px solid var(--border)' }}>
                <span style={{ width:8, height:8, borderRadius:'50%', flexShrink:0, background:statusColor[t.status]||'#475569' }} />
                <p style={{ flex:1, fontSize:12.5, fontWeight:500, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {t.title}
                </p>
                <span className={`chip ${priorityClass[t.priority]}`}>{t.priority}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Team Overview ── */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.5 }}
        className="card" style={{ padding:'20px' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
          <h3 className="font-display" style={{ fontSize:15, color:'var(--text)' }}>Team Overview</h3>
          <Link href="/dashboard/team" style={{ fontSize:12, color:'var(--accent-2)', textDecoration:'none', fontWeight:500 }}>
            Manage →
          </Link>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
          {members.map((m, i) => {
            const myTasks   = tasks.filter(t => t.assigned_to === m.id)
            const myDone    = myTasks.filter(t => t.status === 'done').length
            const perf      = myTasks.length > 0 ? Math.round(myDone / myTasks.length * 100) : 0
            return (
              <div key={m.id} style={{ padding:'14px', borderRadius:12, background:'var(--bg-2)', border:'1px solid var(--border)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                  <div style={{ width:34, height:34, borderRadius:10, flexShrink:0, display:'flex', alignItems:'center',
                    justifyContent:'center', fontSize:12, fontWeight:700, color:'#fff',
                    background:AVATAR_COLORS[i % AVATAR_COLORS.length] }}>
                    {getInitials(m.full_name)}
                  </div>
                  <div style={{ minWidth:0 }}>
                    <p style={{ fontSize:12.5, fontWeight:600, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.full_name.split(' ')[0]}</p>
                    <p style={{ fontSize:11, color:'var(--text-3)', textTransform:'capitalize' }}>{m.role}</p>
                  </div>
                </div>
                <div className="progress-track" style={{ height:4, marginBottom:6 }}>
                  <motion.div className="progress-fill" initial={{ width:0 }} animate={{ width:`${perf}%` }}
                    transition={{ duration:1, delay:0.6+i*0.1 }}
                    style={{ background:AVATAR_COLORS[i % AVATAR_COLORS.length] }} />
                </div>
                <p style={{ fontSize:11, color:'var(--text-3)' }}>{myDone}/{myTasks.length} done · {perf}%</p>
              </div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}
