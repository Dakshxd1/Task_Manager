'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/store'
import { formatDate, isOverdue } from '@/lib/utils'
import { toast } from 'sonner'
import { TaskStatus, TaskPriority } from '@/types'

const STATUSES: TaskStatus[] = ['todo','in_progress','review','done']
const PRIORITIES: TaskPriority[] = ['low','medium','high','critical']

const STATUS_CFG: Record<TaskStatus,{ label:string; color:string; bg:string; border:string }> = {
  todo:        { label:'Todo',        color:'#64748B', bg:'rgba(100,116,139,0.08)', border:'rgba(100,116,139,0.18)' },
  in_progress: { label:'In Progress', color:'#818CF8', bg:'rgba(99,102,241,0.08)', border:'rgba(99,102,241,0.22)' },
  review:      { label:'Review',      color:'#F59E0B', bg:'rgba(245,158,11,0.08)', border:'rgba(245,158,11,0.22)' },
  done:        { label:'Done',        color:'#22C55E', bg:'rgba(34,197,94,0.08)',  border:'rgba(34,197,94,0.22)' },
}

const PRI_CFG: Record<TaskPriority,{ label:string; color:string; bg:string }> = {
  low:      { label:'Low',      color:'#06B6D4', bg:'rgba(6,182,212,0.12)' },
  medium:   { label:'Medium',   color:'#F59E0B', bg:'rgba(245,158,11,0.12)' },
  high:     { label:'High',     color:'#F97316', bg:'rgba(249,115,22,0.12)' },
  critical: { label:'Critical', color:'#EF4444', bg:'rgba(239,68,68,0.12)' },
}

export default function TasksPage() {
  const { tasks, projects, members, user, addTask, updateTask, deleteTask } = useStore()
  const [view,       setView]       = useState<'kanban'|'list'>('kanban')
  const [search,     setSearch]     = useState('')
  const [priFilter,  setPriFilter]  = useState<TaskPriority|'all'>('all')
  const [showModal,  setShowModal]  = useState(false)
  const [editId,     setEditId]     = useState<string|null>(null)
  const [dragOver,   setDragOver]   = useState<TaskStatus|null>(null)
  const [form, setForm] = useState({
    title:'', description:'', priority:'medium' as TaskPriority,
    status:'todo' as TaskStatus, project_id:'', assigned_to:'', due_date:''
  })

  const filtered = tasks.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) &&
    (priFilter === 'all' || t.priority === priFilter)
  )

  const openCreate = () => {
    setEditId(null)
    setForm({ title:'', description:'', priority:'medium', status:'todo', project_id:'', assigned_to:'', due_date:'' })
    setShowModal(true)
  }

  const openEdit = (id: string) => {
    const t = tasks.find(x => x.id === id)!
    setForm({ title:t.title, description:t.description||'', priority:t.priority,
      status:t.status, project_id:t.project_id||'', assigned_to:t.assigned_to||'', due_date:t.due_date||'' })
    setEditId(id); setShowModal(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) return
    if (editId) { updateTask(editId, form); toast.success('Task updated!') }
    else { addTask({ ...form, created_by: user!.id }); toast.success('Task created!') }
    setShowModal(false)
  }

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData('taskId')
    if (taskId) { updateTask(taskId, { status }); toast.success(`Moved to ${STATUS_CFG[status].label}`) }
    setDragOver(null)
  }

  return (
    <div style={{ maxWidth:1280, margin:'0 auto' }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
        <div>
          <h1 className="font-display" style={{ fontSize:24, letterSpacing:'-0.5px', color:'var(--text)', marginBottom:4 }}>Tasks</h1>
          <p style={{ fontSize:13.5, color:'var(--text-3)' }}>{tasks.length} total tasks</p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          {/* View toggle */}
          <div style={{ display:'flex', padding:4, borderRadius:10, gap:4, background:'var(--bg-2)', border:'1px solid var(--border)' }}>
            {(['kanban','list'] as const).map(v => (
              <button key={v} onClick={() => setView(v)} style={{
                width:34, height:34, borderRadius:7, border:'none', cursor:'pointer', fontSize:13,
                background: view===v ? 'var(--accent)' : 'transparent',
                color: view===v ? '#fff' : 'var(--text-3)',
                transition:'all 0.15s',
              }}>
                {v === 'kanban' ? '⊞' : '☰'}
              </button>
            ))}
          </div>
          <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
            onClick={openCreate} className="btn btn-primary" style={{ padding:'10px 18px', fontSize:13.5 }}>
            + New Task
          </motion.button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:12, marginBottom:20, flexWrap:'wrap', alignItems:'center' }}>
        <div style={{ position:'relative', flex:'1', maxWidth:300 }}>
          <span style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', fontSize:14, color:'var(--text-3)' }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks..."
            className="tf-input" style={{ paddingLeft:40, paddingTop:9, paddingBottom:9 }} />
        </div>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {(['all',...PRIORITIES] as const).map(p => {
            const active = priFilter === p
            const cfg = p !== 'all' ? PRI_CFG[p as TaskPriority] : null
            return (
              <button key={p} onClick={() => setPriFilter(p)} style={{
                padding:'7px 14px', borderRadius:8, border:'none', cursor:'pointer',
                fontSize:12.5, fontWeight:600, transition:'all 0.15s',
                background: active ? (cfg?.bg || 'rgba(99,102,241,0.12)') : 'var(--bg-2)',
                color: active ? (cfg?.color || 'var(--accent-2)') : 'var(--text-3)',
                outline: active ? `1px solid ${cfg?.color || 'var(--accent)'}44` : '1px solid var(--border)',
              }}>
                {p === 'all' ? 'All' : PRI_CFG[p as TaskPriority].label}
              </button>
            )
          })}
        </div>
      </div>

      {/* KANBAN BOARD */}
      {view === 'kanban' && (
        <div style={{ display:'flex', gap:14, overflowX:'auto', paddingBottom:8, alignItems:'flex-start' }}>
          {STATUSES.map(status => {
            const cfg = STATUS_CFG[status]
            const colTasks = filtered.filter(t => t.status === status)
            const isDrop = dragOver === status
            return (
              <div key={status}
                onDragOver={e => { e.preventDefault(); setDragOver(status) }}
                onDragLeave={() => setDragOver(null)}
                onDrop={e => handleDrop(e, status)}
                className="kanban-col"
                style={{
                  background: isDrop ? cfg.bg : `${cfg.bg}55`,
                  border: `1px solid ${isDrop ? cfg.color+'55' : cfg.border}`,
                  boxShadow: isDrop ? `0 0 0 2px ${cfg.color}25` : 'none',
                  transition: 'all 0.15s',
                }}>
                {/* Column header */}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ width:8, height:8, borderRadius:'50%', background:cfg.color, display:'inline-block' }} />
                    <span style={{ fontSize:13, fontWeight:700, color:cfg.color }}>{cfg.label}</span>
                  </div>
                  <span style={{ fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:6,
                    background:`${cfg.color}20`, color:cfg.color }}>
                    {colTasks.length}
                  </span>
                </div>

                {/* Task cards */}
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  <AnimatePresence>
                    {colTasks.map(task => {
                      const pri = PRI_CFG[task.priority]
                      const overdue = isOverdue(task.due_date, task.status)
                      return (
                        <motion.div key={task.id}
                          layout
                          initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, scale:0.95 }}
                          draggable onDragStart={e => e.dataTransfer.setData('taskId', task.id)}
                          className="task-card" onClick={() => openEdit(task.id)}
                          style={{ position:'relative', borderLeft:`3px solid ${pri.color}` }}
                          whileHover={{ y:-1 }}>

                          {/* Delete btn */}
                          <button
                            onClick={e => { e.stopPropagation(); deleteTask(task.id); toast.success('Deleted') }}
                            style={{ position:'absolute', top:8, right:8, width:20, height:20,
                              borderRadius:5, border:'none', cursor:'pointer', fontSize:10, fontWeight:700,
                              background:'rgba(239,68,68,0.12)', color:'#EF4444',
                              display:'none', alignItems:'center', justifyContent:'center' }}
                            className="task-delete-btn">✕</button>

                          <p style={{ fontSize:13, fontWeight:500, color:'var(--text)', lineHeight:1.45, marginBottom:8, paddingRight:20 }}>
                            {task.title}
                          </p>

                          {task.description && (
                            <p style={{ fontSize:11.5, color:'var(--text-3)', lineHeight:1.5, marginBottom:8,
                              overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
                              {task.description}
                            </p>
                          )}

                          <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
                            <span className="chip" style={{ background:pri.bg, color:pri.color }}>{pri.label}</span>
                            {overdue && <span className="chip" style={{ background:'rgba(239,68,68,0.12)', color:'#EF4444' }}>Overdue</span>}
                          </div>

                          {(task.assignee || task.due_date) && (
                            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
                              marginTop:10, paddingTop:10, borderTop:'1px solid var(--border)' }}>
                              {task.assignee ? (
                                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                                  <div style={{ width:20, height:20, borderRadius:6, background:'var(--accent)',
                                    display:'flex', alignItems:'center', justifyContent:'center',
                                    fontSize:9, fontWeight:700, color:'#fff' }}>
                                    {task.assignee.full_name[0]}
                                  </div>
                                  <span style={{ fontSize:11.5, color:'var(--text-3)' }}>{task.assignee.full_name.split(' ')[0]}</span>
                                </div>
                              ) : <div />}
                              {task.due_date && (
                                <span style={{ fontSize:11, color: overdue ? '#EF4444' : 'var(--text-3)' }}>
                                  📅 {formatDate(task.due_date)}
                                </span>
                              )}
                            </div>
                          )}
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>

                  {colTasks.length === 0 && (
                    <div style={{ padding:'24px 0', textAlign:'center', opacity:0.4 }}>
                      <p style={{ fontSize:22, marginBottom:4 }}>⊡</p>
                      <p style={{ fontSize:11.5, color:cfg.color }}>Drop tasks here</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* LIST VIEW */}
      {view === 'list' && (
        <div style={{ borderRadius:14, overflow:'hidden', border:'1px solid var(--border)', background:'var(--bg-1)' }}>
          {/* Header row */}
          <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr 40px',
            gap:0, padding:'11px 16px', background:'var(--bg-2)', borderBottom:'1px solid var(--border)' }}>
            {['Task','Status','Priority','Assignee','Due Date',''].map((h,i) => (
              <div key={i} style={{ fontSize:10.5, fontWeight:700, letterSpacing:'0.09em', textTransform:'uppercase', color:'var(--text-3)', padding:'0 8px' }}>{h}</div>
            ))}
          </div>
          <AnimatePresence>
            {filtered.map((task, i) => {
              const pri    = PRI_CFG[task.priority]
              const st     = STATUS_CFG[task.status]
              const overdue = isOverdue(task.due_date, task.status)
              return (
                <motion.div key={task.id}
                  initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                  transition={{ delay:i*0.02 }}
                  style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr 40px',
                    gap:0, padding:'11px 16px', borderBottom:'1px solid var(--border)',
                    cursor:'pointer', transition:'background 0.1s', alignItems:'center' }}
                  onClick={() => openEdit(task.id)}
                  onMouseEnter={e => (e.currentTarget.style.background='rgba(255,255,255,0.018)')}
                  onMouseLeave={e => (e.currentTarget.style.background='transparent')}>
                  <div style={{ padding:'0 8px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ width:3, height:32, borderRadius:2, background:pri.color, display:'inline-block', flexShrink:0 }} />
                      <div>
                        <p style={{ fontSize:13, fontWeight:500, color:'var(--text)' }}>{task.title}</p>
                        {task.description && <p style={{ fontSize:11.5, color:'var(--text-3)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:240 }}>{task.description}</p>}
                      </div>
                    </div>
                  </div>
                  <div style={{ padding:'0 8px' }}>
                    <span className="chip" style={{ background:st.bg, color:st.color }}>{st.label}</span>
                  </div>
                  <div style={{ padding:'0 8px' }}>
                    <span className="chip" style={{ background:pri.bg, color:pri.color }}>{pri.label}</span>
                  </div>
                  <div style={{ padding:'0 8px', display:'flex', alignItems:'center', gap:6 }}>
                    {task.assignee ? (
                      <>
                        <div style={{ width:22, height:22, borderRadius:7, background:'var(--accent)',
                          display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:700, color:'#fff' }}>
                          {task.assignee.full_name[0]}
                        </div>
                        <span style={{ fontSize:12.5, color:'var(--text-2)' }}>{task.assignee.full_name.split(' ')[0]}</span>
                      </>
                    ) : <span style={{ fontSize:12.5, color:'var(--text-3)' }}>—</span>}
                  </div>
                  <div style={{ padding:'0 8px' }}>
                    <span style={{ fontSize:12, color: overdue ? '#EF4444' : 'var(--text-3)' }}>
                      {formatDate(task.due_date)}
                    </span>
                  </div>
                  <div style={{ display:'flex', justifyContent:'center' }}>
                    <button onClick={e => { e.stopPropagation(); deleteTask(task.id); toast.success('Deleted') }}
                      style={{ width:24, height:24, borderRadius:6, border:'none', cursor:'pointer', fontSize:11,
                        background:'rgba(239,68,68,0.1)', color:'#EF4444', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      ✕
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {filtered.length === 0 && (
            <div style={{ textAlign:'center', padding:'60px 0', color:'var(--text-3)' }}>
              <div style={{ fontSize:36, marginBottom:10 }}>◻</div>
              <p style={{ fontSize:15, fontWeight:600, color:'var(--text-2)' }}>No tasks found</p>
            </div>
          )}
        </div>
      )}

      {/* TASK MODAL */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'center', justifyContent:'center',
              padding:16, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(8px)' }}
            onClick={e => e.target===e.currentTarget && setShowModal(false)}>
            <motion.div initial={{ opacity:0, scale:0.92, y:20 }} animate={{ opacity:1, scale:1, y:0 }}
              exit={{ opacity:0, scale:0.92 }}
              style={{ width:'100%', maxWidth:480, borderRadius:18, padding:32,
                background:'var(--bg-1)', border:'1px solid var(--border-2)',
                boxShadow:'0 40px 100px rgba(0,0,0,0.7)', maxHeight:'90vh', overflowY:'auto' }}>
              <h2 className="font-display" style={{ fontSize:20, color:'var(--text)', marginBottom:24 }}>
                {editId ? 'Edit Task' : 'New Task'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom:14 }}>
                  <label style={{ display:'block', fontSize:11, fontWeight:700, letterSpacing:'0.09em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:7 }}>Title *</label>
                  <input value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))}
                    placeholder="What needs to be done?" required className="tf-input" />
                </div>
                <div style={{ marginBottom:14 }}>
                  <label style={{ display:'block', fontSize:11, fontWeight:700, letterSpacing:'0.09em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:7 }}>Description</label>
                  <textarea value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))}
                    placeholder="Add details or context..." rows={3} className="tf-input" style={{ resize:'none' }} />
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
                  <div>
                    <label style={{ display:'block', fontSize:11, fontWeight:700, letterSpacing:'0.09em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:7 }}>Status</label>
                    <select value={form.status} onChange={e => setForm(f=>({...f,status:e.target.value as TaskStatus}))} className="tf-input" style={{ paddingTop:9, paddingBottom:9 }}>
                      {STATUSES.map(s => <option key={s} value={s}>{STATUS_CFG[s].label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display:'block', fontSize:11, fontWeight:700, letterSpacing:'0.09em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:7 }}>Priority</label>
                    <select value={form.priority} onChange={e => setForm(f=>({...f,priority:e.target.value as TaskPriority}))} className="tf-input" style={{ paddingTop:9, paddingBottom:9 }}>
                      {PRIORITIES.map(p => <option key={p} value={p}>{PRI_CFG[p].label}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:14 }}>
                  <div>
                    <label style={{ display:'block', fontSize:11, fontWeight:700, letterSpacing:'0.09em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:7 }}>Project</label>
                    <select value={form.project_id} onChange={e => setForm(f=>({...f,project_id:e.target.value}))} className="tf-input" style={{ paddingTop:9, paddingBottom:9 }}>
                      <option value="">No project</option>
                      {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display:'block', fontSize:11, fontWeight:700, letterSpacing:'0.09em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:7 }}>Assignee</label>
                    <select value={form.assigned_to} onChange={e => setForm(f=>({...f,assigned_to:e.target.value}))} className="tf-input" style={{ paddingTop:9, paddingBottom:9 }}>
                      <option value="">Unassigned</option>
                      {members.map(m => <option key={m.id} value={m.id}>{m.full_name}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ marginBottom:24 }}>
                  <label style={{ display:'block', fontSize:11, fontWeight:700, letterSpacing:'0.09em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:7 }}>Due Date</label>
                  <input type="date" value={form.due_date} onChange={e => setForm(f=>({...f,due_date:e.target.value}))} className="tf-input" style={{ paddingTop:9, paddingBottom:9 }} />
                </div>
                <div style={{ display:'flex', gap:10 }}>
                  <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost" style={{ flex:1 }}>Cancel</button>
                  <button type="submit" className="btn btn-primary" style={{ flex:1 }}>
                    {editId ? 'Save Changes →' : 'Create Task →'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
