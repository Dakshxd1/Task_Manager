'use client'
import { supabase } from '@/lib/supabase'
import { signIn, signOut } from '@/services/auth.service'
import { getProjects, createProject, updateProject as updateProjectDB, deleteProject as deleteProjectDB } from '@/services/projects.service'
import { getMembers, updateMemberRole as updateRoleDB } from '@/services/members.service'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/store'
import { formatRelative } from '@/lib/utils'

const NAV = [
  { href: '/dashboard',          label: 'Dashboard', icon: '▦', exact: true  },
  { href: '/dashboard/projects', label: 'Projects',  icon: '◫', exact: false },
  { href: '/dashboard/tasks',    label: 'Tasks',     icon: '✓', exact: false },
  { href: '/dashboard/team',     label: 'Team',      icon: '◉', exact: false },
]

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, logout, notifications, markAllRead, markRead, tasks, projects } = useStore()

  const [mobileOpen,  setMobileOpen]  = useState(false)
  const [notifOpen,   setNotifOpen]   = useState(false)
  const [cmdOpen,     setCmdOpen]     = useState(false)
  const [cmdQ,        setCmdQ]        = useState('')

  const unread = notifications.filter(n => !n.is_read).length

  useEffect(() => {
    const { loadData } = useStore.getState() as any
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      if (!session) router.push('/auth')
      else loadData()
    })
  }, [])

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setCmdOpen(o => !o); setCmdQ('') }
      if (e.key === 'Escape') { setCmdOpen(false); setNotifOpen(false) }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])

  if (!isAuthenticated || !user) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)' }}>
      <div style={{ width:36, height:36, border:'2px solid var(--accent)', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
    </div>
  )

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + '/')

  const cmdResults = cmdQ.trim() ? [
    ...tasks.filter(t => t.title.toLowerCase().includes(cmdQ.toLowerCase())).slice(0,3)
      .map(t => ({ icon:'✓', label:t.title, sub:t.status, href:'/dashboard/tasks' })),
    ...projects.filter(p => p.name.toLowerCase().includes(cmdQ.toLowerCase())).slice(0,2)
      .map(p => ({ icon:'◫', label:p.name, sub:p.status, href:'/dashboard/projects' })),
  ] : NAV.map(n => ({ icon:n.icon, label:n.label, sub:'Navigate', href:n.href }))

  const SidebarContent = () => (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', padding:'20px 12px' }}>
      {/* Logo */}
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'0 8px', marginBottom:28 }}>
        <div style={{ width:34, height:34, borderRadius:10, background:'linear-gradient(135deg,#6366F1,#818CF8)',
          display:'flex', alignItems:'center', justifyContent:'center', fontSize:16,
          boxShadow:'0 4px 14px rgba(99,102,241,0.4)', flexShrink:0 }}>⚡</div>
        <div>
          <p className="font-display" style={{ fontSize:17, color:'var(--text)', letterSpacing:'-0.3px', lineHeight:1.1 }}>TaskFlow</p>
          <p style={{ fontSize:11, color:'var(--text-3)', textTransform:'capitalize' }}>{user.role} workspace</p>
        </div>
      </div>

      {/* Search shortcut */}
      <button onClick={() => { setCmdOpen(true); setMobileOpen(false) }} style={{
        display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:9, marginBottom:20,
        background:'var(--bg-2)', border:'1px solid var(--border)', cursor:'pointer', width:'100%',
        color:'var(--text-3)', fontSize:13,
      }}>
        <span>🔍</span>
        <span style={{ flex:1, textAlign:'left' }}>Search...</span>
        <span style={{ fontSize:11, padding:'2px 6px', borderRadius:5, background:'var(--bg-3)', border:'1px solid var(--border)', fontFamily:'monospace' }}>⌘K</span>
      </button>

      {/* Nav */}
      <nav style={{ flex:1 }}>
        <p style={{ fontSize:10.5, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase',
          color:'var(--text-3)', padding:'0 12px', marginBottom:6 }}>Menu</p>
        {NAV.map(item => {
          const active = isActive(item.href, item.exact)
          return (
            <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
              <div className={`nav-link ${active ? 'active' : ''}`} style={{ marginBottom:2 }}>
                <span style={{ fontSize:15, width:20, textAlign:'center' }}>{item.icon}</span>
                <span>{item.label}</span>
                <div className="dot" />
              </div>
            </Link>
          )
        })}
      </nav>

      {/* User card */}
      <div style={{ padding:'14px', borderRadius:12, background:'var(--bg-2)', border:'1px solid var(--border)', marginTop:16 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,#6366F1,#8B5CF6)',
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'#fff', flexShrink:0 }}>
            {getInitials(user.full_name)}
          </div>
          <div style={{ minWidth:0 }}>
            <p style={{ fontSize:13, fontWeight:600, color:'var(--text)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{user.full_name}</p>
            <div style={{ display:'flex', alignItems:'center', gap:5 }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:'#22C55E' }} />
              <p style={{ fontSize:11, color:'var(--text-3)', textTransform:'capitalize' }}>{user.role} · Online</p>
            </div>
          </div>
        </div>
        <button onClick={() => { logout(); router.push('/auth') }} className="btn btn-ghost"
          style={{ width:'100%', padding:'8px 12px', fontSize:12.5, borderRadius:8 }}>
          Sign Out →
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden', background:'var(--bg)' }}>

      {/* ─── DESKTOP SIDEBAR ─── */}
      <aside className="sidebar hidden lg:flex" style={{
        flexDirection:'column', height:'100%',
        background:'var(--bg-1)', borderRight:'1px solid var(--border)',
        overflowY:'auto',
      }}>
        <SidebarContent />
      </aside>

      {/* ─── MOBILE SIDEBAR DRAWER ─── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              onClick={() => setMobileOpen(false)}
              style={{ position:'fixed', inset:0, zIndex:40, background:'rgba(0,0,0,0.7)', backdropFilter:'blur(4px)' }} />
            <motion.aside initial={{ x:-240 }} animate={{ x:0 }} exit={{ x:-240 }}
              transition={{ type:'spring', stiffness:300, damping:30 }}
              style={{ position:'fixed', top:0, left:0, bottom:0, width:232, zIndex:50,
                background:'var(--bg-1)', borderRight:'1px solid var(--border)', overflowY:'auto' }}>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ─── MAIN AREA ─── */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0, height:'100%', overflow:'hidden' }}>

        {/* Topbar */}
        <header style={{
          display:'flex', alignItems:'center', gap:12, padding:'0 20px', height:56, flexShrink:0,
          background:'rgba(8,12,18,0.8)', backdropFilter:'blur(20px)',
          borderBottom:'1px solid var(--border)',
        }}>
          {/* Mobile menu button */}
          <button className="lg:hidden" onClick={() => setMobileOpen(true)} style={{
            width:34, height:34, borderRadius:8, background:'var(--bg-2)', border:'1px solid var(--border)',
            color:'var(--text-2)', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer',
          }}>☰</button>

          {/* Breadcrumb */}
          <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:13 }}>
            <span style={{ color:'var(--accent-2)', fontWeight:500 }}>TaskFlow</span>
            <span style={{ color:'var(--text-3)' }}>/</span>
            <span style={{ color:'var(--text)', fontWeight:600 }}>
              {NAV.find(n => isActive(n.href, n.exact))?.label || 'Dashboard'}
            </span>
          </div>

          {/* Right side */}
          <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:8 }}>
            {/* Search */}
            <button onClick={() => setCmdOpen(true)} style={{
              display:'flex', alignItems:'center', gap:8, padding:'6px 12px', borderRadius:8,
              background:'var(--bg-2)', border:'1px solid var(--border)', cursor:'pointer',
              fontSize:12.5, color:'var(--text-3)',
            }}>
              <span>🔍</span><span className="hidden sm:inline">Search</span>
              <span style={{ fontFamily:'monospace', fontSize:11, padding:'1px 5px', borderRadius:4, background:'var(--bg-3)', border:'1px solid var(--border)' }}>⌘K</span>
            </button>

            {/* Notifications */}
            <div style={{ position:'relative' }}>
              <button onClick={() => setNotifOpen(!notifOpen)} style={{
                width:36, height:36, borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center',
                background: notifOpen ? 'rgba(99,102,241,0.12)' : 'var(--bg-2)',
                border: notifOpen ? '1px solid rgba(99,102,241,0.3)' : '1px solid var(--border)',
                cursor:'pointer', fontSize:15, position:'relative',
              }}>
                🔔
                {unread > 0 && (
                  <span style={{ position:'absolute', top:-3, right:-3, width:16, height:16, borderRadius:'50%',
                    background:'#EF4444', border:'2px solid var(--bg)', color:'#fff',
                    fontSize:9, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    {unread}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <motion.div initial={{ opacity:0, y:8, scale:0.95 }} animate={{ opacity:1, y:0, scale:1 }}
                    exit={{ opacity:0, y:8, scale:0.95 }} transition={{ duration:0.15 }}
                    style={{ position:'absolute', right:0, top:44, width:320, borderRadius:14, overflow:'hidden', zIndex:50,
                      background:'var(--bg-1)', border:'1px solid var(--border-2)', boxShadow:'0 20px 60px rgba(0,0,0,0.6)' }}
                    onMouseLeave={() => setNotifOpen(false)}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', borderBottom:'1px solid var(--border)' }}>
                      <p style={{ fontSize:13.5, fontWeight:600, color:'var(--text)' }}>Notifications</p>
                      <button onClick={markAllRead} style={{ fontSize:11.5, color:'var(--accent-2)', background:'none', border:'none', cursor:'pointer', fontWeight:500 }}>
                        Mark all read
                      </button>
                    </div>
                    <div style={{ maxHeight:280, overflowY:'auto' }}>
                      {notifications.map(n => (
                        <div key={n.id} onClick={() => markRead(n.id)} style={{
                          padding:'12px 16px', cursor:'pointer', borderBottom:'1px solid var(--border)',
                          opacity: n.is_read ? 0.5 : 1, transition:'background 0.1s',
                          display:'flex', gap:10,
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background='rgba(255,255,255,0.02)')}
                        onMouseLeave={e => (e.currentTarget.style.background='transparent')}>
                          {!n.is_read && <div style={{ width:6, height:6, borderRadius:'50%', background:'var(--accent)', marginTop:5, flexShrink:0 }} />}
                          <div style={{ marginLeft: n.is_read ? 16 : 0 }}>
                            <p style={{ fontSize:12.5, fontWeight:600, color:'var(--text)', marginBottom:3 }}>{n.title}</p>
                            <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.4 }}>{n.message}</p>
                            <p style={{ fontSize:11, color:'var(--text-3)', marginTop:4 }}>{formatRelative(n.created_at)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Avatar */}
            <div style={{ width:34, height:34, borderRadius:9,
              background:'linear-gradient(135deg,#6366F1,#818CF8)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:12, fontWeight:700, color:'#fff', flexShrink:0 }}>
              {getInitials(user.full_name)}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex:1, overflowY:'auto', overflowX:'hidden', padding:'24px' }}>
          {children}
        </main>
      </div>

      {/* ─── CMD MENU ─── */}
      <AnimatePresence>
        {cmdOpen && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ position:'fixed', inset:0, zIndex:100, display:'flex', alignItems:'flex-start', justifyContent:'center',
              paddingTop:80, background:'rgba(0,0,0,0.75)', backdropFilter:'blur(8px)' }}
            onClick={e => e.target === e.currentTarget && setCmdOpen(false)}>
            <motion.div initial={{ opacity:0, scale:0.93, y:-16 }} animate={{ opacity:1, scale:1, y:0 }}
              exit={{ opacity:0, scale:0.93 }} transition={{ type:'spring', stiffness:400, damping:30 }}
              style={{ width:'100%', maxWidth:480, borderRadius:16, overflow:'hidden',
                background:'var(--bg-1)', border:'1px solid var(--border-2)', boxShadow:'0 32px 80px rgba(0,0,0,0.8)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 16px', borderBottom:'1px solid var(--border)' }}>
                <span style={{ color:'var(--text-3)' }}>🔍</span>
                <input autoFocus value={cmdQ} onChange={e => setCmdQ(e.target.value)}
                  placeholder="Search tasks, projects, navigate..."
                  style={{ flex:1, background:'none', border:'none', outline:'none',
                    fontFamily:'Inter,sans-serif', fontSize:14, color:'var(--text)' }} />
                <span style={{ fontSize:11, padding:'2px 7px', borderRadius:5, background:'var(--bg-2)', border:'1px solid var(--border)', fontFamily:'monospace', color:'var(--text-3)' }}>ESC</span>
              </div>
              <div style={{ padding:8, maxHeight:280, overflowY:'auto' }}>
                {cmdResults.length === 0 ? (
                  <p style={{ textAlign:'center', padding:'24px 0', fontSize:13.5, color:'var(--text-3)' }}>No results</p>
                ) : (
                  <>
                    <p style={{ padding:'6px 12px', fontSize:10.5, fontWeight:700, letterSpacing:'0.09em', textTransform:'uppercase', color:'var(--text-3)' }}>
                      {cmdQ ? 'Results' : 'Quick Navigate'}
                    </p>
                    {cmdResults.map((r, i) => (
                      <button key={i} onClick={() => { router.push(r.href); setCmdOpen(false) }}
                        style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:9, width:'100%',
                          background:'none', border:'none', cursor:'pointer', transition:'background 0.1s', textAlign:'left' }}
                        onMouseEnter={e => (e.currentTarget.style.background='rgba(99,102,241,0.1)')}
                        onMouseLeave={e => (e.currentTarget.style.background='none')}>
                        <span style={{ fontSize:15, color:'var(--text-3)', width:22 }}>{r.icon}</span>
                        <div style={{ flex:1 }}>
                          <p style={{ fontSize:13.5, fontWeight:500, color:'var(--text)' }}>{r.label}</p>
                          <p style={{ fontSize:11.5, color:'var(--text-3)', textTransform:'capitalize' }}>{r.sub}</p>
                        </div>
                        <span style={{ fontSize:11.5, color:'var(--text-3)' }}>↵</span>
                      </button>
                    ))}
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
