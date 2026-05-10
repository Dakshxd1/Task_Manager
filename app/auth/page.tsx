'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/store'
import { toast } from 'sonner'
import { signUp } from '@/services/auth.service'

const STATS = [
  { value: '2,400+', label: 'Teams worldwide' },
  { value: '98%',   label: 'Customer satisfaction' },
  { value: '12M+',  label: 'Tasks completed' },
]

const FEATURES = [
  { icon: '⚡', title: 'Lightning fast', desc: 'Real-time sync across your entire team instantly' },
  { icon: '🎯', title: 'Smart priorities', desc: 'AI-powered task prioritization and scheduling' },
  { icon: '📊', title: 'Deep analytics', desc: 'Visual insights into team performance' },
  { icon: '🔐', title: 'Enterprise secure', desc: 'Row-level security and audit logs by default' },
]

const TESTIMONIALS = [
  { name: 'Sarah K.', role: 'Engineering Lead, Stripe', avatar: 'SK', text: 'TaskFlow replaced Jira and Notion for us. Cleaner, faster, and our engineers actually use it.' },
  { name: 'Marcus T.', role: 'Product Manager, Linear', avatar: 'MT', text: 'The kanban experience is unmatched. Drag and drop feels like magic. My team ships 30% faster.' },
  { name: 'Priya R.', role: 'CTO, Series A startup', avatar: 'PR', text: 'Finally a project tool designed for makers, not managers. Absolutely love the dark aesthetic.' },
]

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [tIdx, setTIdx] = useState(0)
  const { login } = useStore()
  const router = useRouter()

  useEffect(() => {
    const t = setInterval(() => setTIdx(i => (i + 1) % TESTIMONIALS.length), 4500)
    return () => clearInterval(t)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) { toast.error('Enter your email'); return }
    if (!password) { toast.error('Enter your password'); return }
    if (mode === 'signup' && !name) { toast.error('Enter your full name'); return }
    setLoading(true)
    try {
      // ── SIGNUP: create account in Supabase first ──
      if (mode === 'signup') {
        const { error } = await signUp(email, password, name)
        if (error) {
          toast.error(error.message)
          setLoading(false)
          return
        }
        toast.success('Account created! Signing you in...')
      }

      // ── LOGIN: sign in with Supabase Auth ──
      const ok = await login(email, password)
      if (!ok) {
        toast.error('Invalid email or password')
        setLoading(false)
        return
      }
      toast.success('Welcome to TaskFlow!')
      router.push('/dashboard')
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Demo login is disabled — demo accounts don't exist in real Supabase DB
  // To test, sign up a real account then run: UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com'
  const handleDemo = async (demoEmail: string, role: string) => {
    toast.error(`Demo accounts are disabled. Please sign up with a real email.`)
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ─── LEFT — Brand Panel ─── */}
      <div className="hidden lg:flex" style={{
        width: '52%', flexDirection: 'column',
        background: 'var(--bg-1)', borderRight: '1px solid var(--border)',
        padding: '48px', position: 'relative', overflow: 'hidden',
      }}>
        {/* Grid texture */}
        <div className="grid-bg" style={{ position: 'absolute', inset: 0, opacity: 0.6 }} />
        {/* Glow blobs */}
        <div style={{ position:'absolute', top:'15%', left:'10%', width:400, height:400, borderRadius:'50%',
          background:'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:'20%', right:'5%', width:300, height:300, borderRadius:'50%',
          background:'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)', pointerEvents:'none' }} />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Logo */}
          <div className="anim-l" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 64 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 18,
              background: 'linear-gradient(135deg, #6366F1, #818CF8)',
              boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
            }}>⚡</div>
            <span className="font-display" style={{ fontSize: 22, color: 'var(--text)', letterSpacing: '-0.5px' }}>TaskFlow</span>
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
              padding: '3px 8px', borderRadius: 6, marginLeft: 4,
              background: 'rgba(99,102,241,0.15)', color: 'var(--accent-2)',
              border: '1px solid rgba(99,102,241,0.25)',
            }}>v2.0</span>
          </div>

          {/* Headline */}
          <div className="anim-l d-1" style={{ marginBottom: 40 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
              color: 'var(--accent-2)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ display:'inline-block', width:24, height:1, background:'var(--accent)' }} />
              The team OS for modern builders
            </p>
            <h1 className="font-display" style={{ fontSize: 46, lineHeight: 1.08, letterSpacing: '-1.5px', color: 'var(--text)', marginBottom: 16 }}>
              Ship faster<br />
              <span style={{
                background: 'linear-gradient(135deg, #F0F6FF, #818CF8, #A78BFA)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>with your team</span>
            </h1>
            <p style={{ fontSize: 15, lineHeight: 1.65, color: 'var(--text-2)', maxWidth: 380 }}>
              Projects, tasks, and team collaboration — unified in one cinematic workspace. Built for teams who care about craft.
            </p>
          </div>

          {/* Feature list */}
          <div className="anim-l d-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 40 }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{
                padding: '16px', borderRadius: 12,
                background: 'var(--bg-2)', border: '1px solid var(--border)',
                display: 'flex', gap: 12, alignItems: 'flex-start',
              }}>
                <span style={{ fontSize: 20, lineHeight: 1 }}>{f.icon}</span>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>{f.title}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.5 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="anim-l d-3" style={{ display: 'flex', gap: 32, marginBottom: 40 }}>
            {STATS.map(s => (
              <div key={s.label}>
                <p className="font-display" style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent-2)', marginBottom: 2 }}>{s.value}</p>
                <p style={{ fontSize: 12, color: 'var(--text-3)' }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div className="anim-l d-4" style={{ marginTop: 'auto' }}>
            <div style={{ padding: '20px', borderRadius: 14, background: 'var(--bg-2)', border: '1px solid var(--border)' }}>
              <AnimatePresence mode="wait">
                <motion.div key={tIdx}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}>
                  <p style={{ fontSize: 13.5, lineHeight: 1.65, color: 'var(--text-2)', fontStyle: 'italic', marginBottom: 16 }}>
                    &ldquo;{TESTIMONIALS[tIdx].text}&rdquo;
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700, color: '#fff',
                    }}>{TESTIMONIALS[tIdx].avatar}</div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{TESTIMONIALS[tIdx].name}</p>
                      <p style={{ fontSize: 11.5, color: 'var(--text-3)' }}>{TESTIMONIALS[tIdx].role}</p>
                    </div>
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: 5 }}>
                      {TESTIMONIALS.map((_, i) => (
                        <button key={i} onClick={() => setTIdx(i)} style={{
                          width: i === tIdx ? 18 : 6, height: 6, borderRadius: 3,
                          background: i === tIdx ? 'var(--accent)' : 'var(--bg-3)',
                          border: 'none', cursor: 'pointer', transition: 'all 0.3s',
                        }} />
                      ))}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* ─── RIGHT — Auth Form ─── */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '48px 32px', position: 'relative',
      }}>
        {/* Mobile logo */}
        <div className="lg:hidden" style={{
          position: 'absolute', top: 28, left: 28,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{ width:32, height:32, borderRadius:9, background:'linear-gradient(135deg,#6366F1,#818CF8)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15 }}>⚡</div>
          <span className="font-display" style={{ fontSize: 18, color: 'var(--text)' }}>TaskFlow</span>
        </div>

        <div className="anim-r" style={{ width: '100%', maxWidth: 400 }}>
          {/* Card */}
          <div style={{
            background: 'var(--bg-1)', border: '1px solid var(--border-2)',
            borderRadius: 18, padding: '36px',
            boxShadow: '0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03)',
          }}>
            {/* Tab switcher */}
            <div style={{
              display: 'flex', padding: 4, borderRadius: 12, marginBottom: 28,
              background: 'var(--bg)', gap: 4,
            }}>
              {(['login', 'signup'] as const).map(tab => (
                <button key={tab} onClick={() => setMode(tab)} style={{
                  flex: 1, padding: '9px 0', borderRadius: 9, border: 'none',
                  fontFamily: 'Inter, sans-serif', fontSize: 13.5, fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.2s',
                  background: mode === tab ? 'linear-gradient(135deg,#6366F1,#818CF8)' : 'transparent',
                  color: mode === tab ? '#fff' : 'var(--text-3)',
                  boxShadow: mode === tab ? '0 2px 12px rgba(99,102,241,0.4)' : 'none',
                }}>
                  {tab === 'login' ? 'Sign In' : 'Sign Up'}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={mode}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.18 }}>

                {/* Heading */}
                <div style={{ marginBottom: 24 }}>
                  <h2 className="font-display" style={{ fontSize: 26, letterSpacing: '-0.5px', color: 'var(--text)', marginBottom: 6 }}>
                    {mode === 'login' ? 'Welcome back' : 'Create account'}
                  </h2>
                  <p style={{ fontSize: 13.5, color: 'var(--text-2)', lineHeight: 1.5 }}>
                    {mode === 'login'
                      ? 'Sign in to your workspace to continue'
                      : 'Get started with TaskFlow for free today'}
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                  {mode === 'signup' && (
                    <div style={{ marginBottom: 14 }}>
                      <label style={{ display:'block', fontSize:11.5, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:7 }}>
                        Full Name
                      </label>
                      <div style={{ position: 'relative' }}>
                        <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', fontSize:14, color:'var(--text-3)' }}>👤</span>
                        <input type="text" value={name} onChange={e => setName(e.target.value)}
                          placeholder="Alex Rivera" className="tf-input tf-input-icon" />
                      </div>
                    </div>
                  )}

                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display:'block', fontSize:11.5, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--text-3)', marginBottom:7 }}>
                      Email Address
                    </label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', fontSize:14, color:'var(--text-3)' }}>✉</span>
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                        placeholder={mode === 'login' ? 'you@email.com' : 'you@company.com'}
                        required className="tf-input tf-input-icon" />
                    </div>
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:7 }}>
                      <label style={{ fontSize:11.5, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--text-3)' }}>
                        Password
                      </label>
                      {mode === 'login' && (
                        <button type="button" style={{ fontSize:12, color:'var(--accent-2)', background:'none', border:'none', cursor:'pointer', fontWeight:500 }}>
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', fontSize:14, color:'var(--text-3)' }}>🔒</span>
                      <input type={showPass ? 'text' : 'password'} value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••••" required
                        className="tf-input tf-input-icon"
                        style={{ paddingRight: 44 }} />
                      <button type="button" onClick={() => setShowPass(!showPass)} style={{
                        position:'absolute', right:14, top:'50%', transform:'translateY(-50%)',
                        background:'none', border:'none', cursor:'pointer', fontSize:14, color:'var(--text-3)',
                      }}>{showPass ? '🙈' : '👁'}</button>
                    </div>
                    {mode === 'signup' && (
                      <p style={{ fontSize:11.5, color:'var(--text-3)', marginTop:6 }}>
                        Minimum 6 characters
                      </p>
                    )}
                  </div>

                  <button type="submit" disabled={loading} className="btn btn-primary" style={{ width:'100%', padding:'13px 20px', fontSize:14, marginBottom:4 }}>
                    {loading ? (
                      <span style={{ display:'inline-block', width:16, height:16, border:'2px solid rgba(255,255,255,0.3)', borderTop:'2px solid white', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
                    ) : (
                      <>{mode === 'login' ? 'Sign In to Workspace' : 'Create Free Account'} →</>
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div style={{ display:'flex', alignItems:'center', gap:12, margin:'20px 0' }}>
                  <div style={{ flex:1, height:1, background:'var(--border)' }} />
                  <span style={{ fontSize:11.5, color:'var(--text-3)', whiteSpace:'nowrap' }}>or try a demo account</span>
                  <div style={{ flex:1, height:1, background:'var(--border)' }} />
                </div>

                {/* Demo buttons */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                  {[
                    { label:'Admin Demo', email:'alex@taskflow.io', role:'Admin', emoji:'👑', color:'#818CF8', bg:'rgba(99,102,241,0.1)', border:'rgba(99,102,241,0.2)' },
                    { label:'Member Demo', email:'sam@taskflow.io', role:'Member', emoji:'👤', color:'#22C55E', bg:'rgba(34,197,94,0.08)', border:'rgba(34,197,94,0.2)' },
                  ].map(a => (
                    <button key={a.email} onClick={() => handleDemo(a.email, a.role)} style={{
                      display:'flex', alignItems:'center', gap:10, padding:'11px 14px',
                      borderRadius:10, border:`1px solid ${a.border}`,
                      background: a.bg, cursor:'pointer',
                      transition:'all 0.15s',
                      opacity: 0.5,
                    }}
                    onMouseEnter={e => (e.currentTarget.style.transform='translateY(-1px)')}
                    onMouseLeave={e => (e.currentTarget.style.transform='none')}>
                      <span style={{ fontSize:18 }}>{a.emoji}</span>
                      <div style={{ textAlign:'left' }}>
                        <p style={{ fontSize:12.5, fontWeight:600, color:'var(--text)', margin:0 }}>{a.label}</p>
                        <p style={{ fontSize:11, color:a.color, margin:0 }}>Disabled</p>
                      </div>
                    </button>
                  ))}
                </div>

              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <p style={{ textAlign:'center', fontSize:11.5, color:'var(--text-3)', marginTop:20 }}>
            🔒 Secured with 256-bit encryption · No credit card required
          </p>
        </div>
      </div>
    </div>
  )
}