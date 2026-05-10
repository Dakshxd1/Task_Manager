'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/store'
import { formatDate, getProjectProgress } from '@/lib/utils'
import { toast } from 'sonner'
import { ProjectStatus } from '@/types'

const STATUS_CFG: Record<ProjectStatus, { label:string; color:string; bg:string }> = {
  active:    { label:'Active',    color:'#22C55E', bg:'rgba(34,197,94,0.10)' },
  on_hold:   { label:'On Hold',  color:'#F59E0B', bg:'rgba(245,158,11,0.10)' },
  completed: { label:'Completed',color:'#818CF8', bg:'rgba(99,102,241,0.10)' },
  archived:  { label:'Archived', color:'#4B5A72', bg:'rgba(75,90,114,0.10)' },
}
const STATUS_OPTS: ProjectStatus[] = ['active','on_hold','completed','archived']
const ACCENTS = ['#6366F1','#22C55E','#F59E0B','#EF4444','#06B6D4','#8B5CF6']

export default function ProjectsPage() {
  const { projects, addProject, updateProject, deleteProject, user } = useStore()
  const [search,    setSearch]    = useState('')
  const [filter,    setFilter]    = useState<ProjectStatus|'all'>('all')
  const [showModal, setShowModal] = useState(false)
  const [openMenu,  setOpenMenu]  = useState<string|null>(null)
  const [form, setForm] = useState({ name:'', description:'', deadline:'', status:'active' as ProjectStatus })

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) &&
    (filter === 'all' || p.status === filter)
  )

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    addProject({ ...form, owner_id: user!.id })
    toast.success('Project created!')
    setShowModal(false)
    setForm({ name:'', description:'', deadline:'', status:'active' })
  }

  return (
    <div style={{ maxWidth:1280, margin:'0 auto' }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
        <div>
          <h1 className="font-display" style={{ fontSize:24, letterSpacing:'-0.5px', color:'var(--text)', marginBottom:4 }}>Projects</h1>
          <p style={{ fontSize:13.5, color:'var(--text-3)' }}>{projects.length} total · {projects.filter(p=>p.status==='active').length} active</p>
        </div>
        {user?.role === 'admin' && (
          <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
            onClick={() => setShowModal(true)} className="btn btn-primary" style={{ padding:'10px 18px', fontSize:13.5 }}>
            + New Project
          </motion.button>
        )}
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:12, marginBottom:20, flexWrap:'wrap', alignItems:'center' }}>
        <div style={{ position:'relative', flex:'1', maxWidth:320 }}>
          <span style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', fontSize:14, color:'var(--text-3)' }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects..."
            className="tf-input" style={{ paddingLeft:40, paddingTop:9, paddingBottom:9 }} />
        </div>
        <div style={{ display:'flex', gap:6 }}>
          {(['all',...STATUS_OPTS] as const).map(s => {
            const active = filter === s
            const cfg = s !== 'all' ? STATUS_CFG[s as ProjectStatus] : null
            return (
              <button key={s} onClick={() => setFilter(s)} style={{
                padding:'7px 14px', borderRadius:8, border:'none', cursor:'pointer',
                fontSize:12.5, fontWeight:600, transition:'all 0.15s',
                background: active ? (cfg?.bg || 'rgba(99,102,241,0.12)') : 'var(--bg-2)',
                color: active ? (cfg?.color || 'var(--accent-2)') : 'var(--text-3)',
                outline: active ? `1px solid ${cfg?.color || 'var(--accent)'}44` : '1px solid var(--border)',
              }}>
                {s === 'all' ? 'All' : STATUS_CFG[s as ProjectStatus].label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:14 }}>
        <AnimatePresence>
          {filtered.map((p, i) => {
            const prog   = getProjectProgress(p)
            const cfg    = STATUS_CFG[p.status]
            const accent = ACCENTS[i % ACCENTS.length]
            return (
              <motion.div key={p.id}
                initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, scale:0.95 }}
                transition={{ delay:i*0.05 }}
                className="card" style={{ padding:'20px', position:'relative', overflow:'hidden' }}>

                {/* Top accent line */}
                <div style={{ position:'absolute', top:0, left:0, right:0, height:3, borderRadius:'14px 14px 0 0',
                  background:`linear-gradient(90deg, ${accent}, transparent)` }} />

                {/* Header */}
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:16, paddingTop:6 }}>
                  <div style={{ width:40, height:40, borderRadius:11, display:'flex', alignItems:'center',
                    justifyContent:'center', fontSize:18, background:`${accent}18`, border:`1px solid ${accent}33` }}>
                    ◫
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span className="badge" style={{ background:cfg.bg, color:cfg.color }}>
                      <span style={{ width:5, height:5, borderRadius:'50%', background:cfg.color, display:'inline-block' }} />
                      {cfg.label}
                    </span>
                    {user?.role === 'admin' && (
                      <div style={{ position:'relative' }}>
                        <button onClick={() => setOpenMenu(openMenu===p.id ? null : p.id)}
                          style={{ width:28, height:28, borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center',
                            background:'var(--bg-2)', border:'1px solid var(--border)', cursor:'pointer', fontSize:15, color:'var(--text-3)' }}>
                          ⋯
                        </button>
                        <AnimatePresence>
                          {openMenu===p.id && (
                            <motion.div initial={{ opacity:0, scale:0.9, y:4 }} animate={{ opacity:1, scale:1, y:0 }}
                              exit={{ opacity:0, scale:0.9 }}
                              style={{ position:'absolute', right:0, top:34, zIndex:20, width:170, borderRadius:12, overflow:'hidden',
                                background:'var(--bg-1)', border:'1px solid var(--border-2)', boxShadow:'0 12px 40px rgba(0,0,0,0.5)' }}>
                              <div style={{ padding:'6px' }}>
                                <p style={{ padding:'6px 10px', fontSize:10.5, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--text-3)' }}>
                                  Change Status
                                </p>
                                {STATUS_OPTS.map(s => (
                                  <button key={s} onClick={() => { updateProject(p.id,{status:s}); setOpenMenu(null); toast.success('Updated') }}
                                    style={{ display:'flex', alignItems:'center', gap:8, width:'100%', padding:'8px 10px',
                                      borderRadius:8, border:'none', cursor:'pointer', fontSize:12.5, transition:'background 0.1s',
                                      background: p.status===s ? STATUS_CFG[s].bg : 'transparent',
                                      color: p.status===s ? STATUS_CFG[s].color : 'var(--text-2)' }}
                                    onMouseEnter={e => { if (p.status!==s) e.currentTarget.style.background='rgba(255,255,255,0.04)' }}
                                    onMouseLeave={e => { if (p.status!==s) e.currentTarget.style.background='transparent' }}>
                                    <span style={{ width:6, height:6, borderRadius:'50%', background:STATUS_CFG[s].color, display:'inline-block' }} />
                                    {STATUS_CFG[s].label}
                                  </button>
                                ))}
                              </div>
                              <div style={{ borderTop:'1px solid var(--border)', padding:'4px 6px' }}>
                                <button onClick={() => { deleteProject(p.id); setOpenMenu(null); toast.success('Deleted') }}
                                  style={{ display:'flex', alignItems:'center', gap:8, width:'100%', padding:'8px 10px',
                                    borderRadius:8, border:'none', cursor:'pointer', fontSize:12.5,
                                    color:'#EF4444', background:'rgba(239,68,68,0.06)' }}>
                                  🗑 Delete project
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                </div>

                <h3 className="font-display" style={{ fontSize:15, fontWeight:700, color:'var(--text)', marginBottom:6 }}>{p.name}</h3>
                {p.description && (
                  <p style={{ fontSize:12.5, color:'var(--text-2)', marginBottom:16, lineHeight:1.55,
                    overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
                    {p.description}
                  </p>
                )}

                {/* Progress */}
                <div style={{ marginBottom:14 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:7, color:'var(--text-3)' }}>
                    <span>{p.completed_count||0} / {p.task_count||0} tasks</span>
                    <span style={{ fontWeight:700, color:accent }}>{prog}%</span>
                  </div>
                  <div className="progress-track" style={{ height:5 }}>
                    <motion.div className="progress-fill" initial={{ width:0 }} animate={{ width:`${prog}%` }}
                      transition={{ duration:1, delay:0.1+i*0.05 }}
                      style={{ background:`linear-gradient(90deg, ${accent}, ${accent}cc)` }} />
                  </div>
                </div>

                {/* Footer */}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', fontSize:12, color:'var(--text-3)' }}>
                  <span>📅 {formatDate(p.deadline)}</span>
                  <span>{prog >= 100 ? '✅ Done' : prog >= 50 ? '📈 On track' : '🔄 Active'}</span>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div style={{ gridColumn:'1/-1', textAlign:'center', padding:'80px 0', color:'var(--text-3)' }}>
            <div style={{ fontSize:48, marginBottom:12 }}>◫</div>
            <p style={{ fontSize:16, fontWeight:600, color:'var(--text-2)', marginBottom:6 }}>No projects found</p>
            <p style={{ fontSize:13 }}>Try adjusting your filters or create a new project</p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'center', justifyContent:'center',
              padding:16, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(8px)' }}
            onClick={e => e.target===e.currentTarget && setShowModal(false)}>
            <motion.div initial={{ opacity:0, scale:0.92, y:20 }} animate={{ opacity:1, scale:1, y:0 }}
              exit={{ opacity:0, scale:0.92 }}
              style={{ width:'100%', maxWidth:440, borderRadius:18, padding:32,
                background:'var(--bg-1)', border:'1px solid var(--border-2)',
                boxShadow:'0 32px 80px rgba(0,0,0,0.7)' }}>
              <h2 className="font-display" style={{ fontSize:20, color:'var(--text)', marginBottom:24 }}>New Project</h2>
              <form onSubmit={handleCreate}>
                <div style={{ marginBottom:14 }}>
                  <label style={{ display:'block', fontSize:11, fontWeight:700, letterSpacing:'0.09em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:7 }}>Project Name *</label>
                  <input value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))}
                    placeholder="e.g. Mobile App Redesign" required className="tf-input" />
                </div>
                <div style={{ marginBottom:14 }}>
                  <label style={{ display:'block', fontSize:11, fontWeight:700, letterSpacing:'0.09em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:7 }}>Description</label>
                  <textarea value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))}
                    placeholder="What's this project about?" rows={3}
                    className="tf-input" style={{ resize:'none' }} />
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:24 }}>
                  <div>
                    <label style={{ display:'block', fontSize:11, fontWeight:700, letterSpacing:'0.09em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:7 }}>Status</label>
                    <select value={form.status} onChange={e => setForm(f=>({...f,status:e.target.value as ProjectStatus}))} className="tf-input" style={{ paddingTop:9, paddingBottom:9 }}>
                      {STATUS_OPTS.map(s => <option key={s} value={s}>{STATUS_CFG[s].label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display:'block', fontSize:11, fontWeight:700, letterSpacing:'0.09em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:7 }}>Deadline</label>
                    <input type="date" value={form.deadline} onChange={e => setForm(f=>({...f,deadline:e.target.value}))} className="tf-input" style={{ paddingTop:9, paddingBottom:9 }} />
                  </div>
                </div>
                <div style={{ display:'flex', gap:10 }}>
                  <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost" style={{ flex:1 }}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ flex:1 }}>Create Project →</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
