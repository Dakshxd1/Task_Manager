'use client'
import { motion } from 'framer-motion'
import { useStore } from '@/store'
import { toast } from 'sonner'

const GRADIENTS = [
  'linear-gradient(135deg,#6366F1,#818CF8)',
  'linear-gradient(135deg,#10B981,#34D399)',
  'linear-gradient(135deg,#F59E0B,#FCD34D)',
  'linear-gradient(135deg,#EF4444,#FB7185)',
]
const COLORS = ['#6366F1','#10B981','#F59E0B','#EF4444']

function initials(name: string) {
  return name.split(' ').map((n:string)=>n[0]).join('').toUpperCase().slice(0,2)
}

export default function TeamPage() {
  const { members, user, tasks, updateMemberRole } = useStore()

  const toggle = (id: string, role: 'admin'|'member') => {
    if (user?.role !== 'admin') { toast.error('Admin access required'); return }
    if (id === user.id) { toast.error("Can't change your own role"); return }
    updateMemberRole(id, role === 'admin' ? 'member' : 'admin')
    toast.success('Role updated')
  }

  const stats = (id: string) => {
    const mine = tasks.filter(t => t.assigned_to === id)
    const done = mine.filter(t => t.status === 'done').length
    const prog = mine.length > 0 ? Math.round(done/mine.length*100) : 0
    return { total:mine.length, done, inProg:mine.filter(t=>t.status==='in_progress').length, prog }
  }

  const teamKpis = [
    { label:'Total Members', value:members.length,                             color:'#6366F1', bg:'rgba(99,102,241,0.1)' },
    { label:'Admins',         value:members.filter(m=>m.role==='admin').length, color:'#F59E0B', bg:'rgba(245,158,11,0.1)' },
    { label:'Members',        value:members.filter(m=>m.role==='member').length,color:'#10B981', bg:'rgba(16,185,129,0.1)' },
    { label:'Tasks Assigned', value:tasks.filter(t=>t.assigned_to).length,     color:'#8B5CF6', bg:'rgba(139,92,246,0.1)' },
  ]

  return (
    <div style={{ maxWidth:960, margin:'0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom:24 }}>
        <h1 className="font-display" style={{ fontSize:24, letterSpacing:'-0.5px', color:'var(--text)', marginBottom:4 }}>Team</h1>
        <p style={{ fontSize:13.5, color:'var(--text-3)' }}>Manage members, roles, and productivity metrics</p>
      </div>

      {/* KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:24 }}>
        {teamKpis.map((k, i) => (
          <motion.div key={k.label}
            initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.06 }}
            className="card" style={{ padding:'18px 16px' }}>
            <p className="font-display" style={{ fontSize:32, fontWeight:700, color:k.color, marginBottom:4 }}>{k.value}</p>
            <p style={{ fontSize:12.5, color:'var(--text-3)' }}>{k.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Members */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
        {members.map((m, i) => {
          const s    = stats(m.id)
          const isMe = m.id === user?.id
          const grad = GRADIENTS[i % GRADIENTS.length]
          const clr  = COLORS[i % COLORS.length]

          return (
            <motion.div key={m.id}
              initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.08 }}
              className="card" style={{ padding:'22px', position:'relative', overflow:'hidden' }}>

              {/* Accent top */}
              <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:grad, opacity:0.7 }} />

              <div style={{ display:'flex', alignItems:'flex-start', gap:14, paddingTop:8 }}>
                {/* Avatar */}
                <div style={{ position:'relative', flexShrink:0 }}>
                  <div style={{ width:52, height:52, borderRadius:14, background:grad,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:16, fontWeight:700, color:'#fff',
                    boxShadow:`0 4px 16px ${clr}44` }}>
                    {initials(m.full_name)}
                  </div>
                  {/* Online dot */}
                  <div style={{ position:'absolute', bottom:-2, right:-2, width:14, height:14, borderRadius:'50%',
                    background:'#22C55E', border:'2px solid var(--bg-1)' }} />
                </div>

                {/* Info */}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                    <h3 style={{ fontSize:15, fontWeight:600, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {m.full_name}
                    </h3>
                    {isMe && (
                      <span style={{ fontSize:10.5, padding:'2px 7px', borderRadius:5, fontWeight:700,
                        background:'rgba(99,102,241,0.15)', color:'var(--accent-2)' }}>You</span>
                    )}
                  </div>
                  <p style={{ fontSize:12, color:'var(--text-3)', marginBottom:12 }}>✉ {m.email}</p>

                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontSize:12, fontWeight:700, padding:'4px 10px', borderRadius:7,
                      background: m.role==='admin' ? 'rgba(245,158,11,0.12)' : 'rgba(34,197,94,0.10)',
                      color: m.role==='admin' ? '#F59E0B' : '#22C55E' }}>
                      {m.role === 'admin' ? '★ Admin' : '◯ Member'}
                    </span>
                    {user?.role === 'admin' && !isMe && (
                      <button onClick={() => toggle(m.id, m.role)}
                        className="btn btn-ghost" style={{ padding:'5px 12px', fontSize:12, borderRadius:7 }}>
                        Make {m.role==='admin' ? 'Member' : 'Admin'}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, margin:'16px 0 14px' }}>
                {[
                  { label:'Total',  value:s.total,  color:'var(--text-2)' },
                  { label:'Done',   value:s.done,   color:'#22C55E' },
                  { label:'Active', value:s.inProg, color:'#818CF8' },
                ].map(stat => (
                  <div key={stat.label} style={{ textAlign:'center', padding:'10px 0', borderRadius:10, background:'var(--bg-2)', border:'1px solid var(--border)' }}>
                    <p className="font-display" style={{ fontSize:22, fontWeight:700, color:stat.color, lineHeight:1 }}>{stat.value}</p>
                    <p style={{ fontSize:11, color:'var(--text-3)', marginTop:3 }}>{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Progress bar */}
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'var(--text-3)', marginBottom:7 }}>
                <span>Productivity</span>
                <span style={{ fontWeight:700, color: s.prog>=60 ? '#22C55E' : '#F59E0B' }}>{s.prog}%</span>
              </div>
              <div className="progress-track" style={{ height:5 }}>
                <motion.div className="progress-fill"
                  initial={{ width:0 }} animate={{ width:`${s.prog}%` }}
                  transition={{ duration:1, delay:0.4+i*0.1 }}
                  style={{ background: s.prog>=60 ? 'linear-gradient(90deg,#22C55E,#4ADE80)' : 'linear-gradient(90deg,#F59E0B,#FCD34D)' }} />
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
