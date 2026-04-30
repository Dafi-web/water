import { useEffect, useMemo, useState } from 'react'
import './App.css'
import companyLogo from './assets/company-logo.svg'

const companyName = 'Tsegay Brhane Water Works Contractor & Construction Materials Retailer'
const apiBase = import.meta.env.VITE_API_BASE_URL || ''

const navItems = [
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Contact', href: '#contact' },
]

const serviceGroups = [
  {
    title: 'Water Works Construction',
    items: [
      'Water supply system installation',
      'Pipeline construction and testing',
      'Borehole and well development',
      'Water distribution networks',
    ],
  },
  {
    title: 'General Construction Works',
    items: [
      'Residential and small commercial buildings',
      'Masonry, plastering, and concrete works',
      'Road and small infrastructure works',
      'Renovation and maintenance services',
    ],
  },
  {
    title: 'Construction Materials Retail',
    items: [
      'Cement supply',
      'Sand and gravel',
      'Hollow blocks and masonry units',
      'Reinforcement bars and fittings',
    ],
  },
]

function SectionTitle({ eyebrow, title, subtitle }) {
  return (
    <div className="section-title reveal in-view">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {subtitle && <p className="subtitle">{subtitle}</p>}
    </div>
  )
}

function Card({ title, items }) {
  return (
    <article className="card reveal in-view">
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
  )
}

function normalizeMediaUrl(url) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `${apiBase}${url}`
}

function PublicSite() {
  const [theme, setTheme] = useState(() => localStorage.getItem('tb-theme') || 'light')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [formMessage, setFormMessage] = useState('')
  const [posts, setPosts] = useState([])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('tb-theme', theme)
  }, [theme])

  useEffect(() => {
    const closeMenuOnResize = () => {
      if (window.innerWidth > 1020) setIsMobileMenuOpen(false)
    }

    window.addEventListener('resize', closeMenuOnResize)
    return () => window.removeEventListener('resize', closeMenuOnResize)
  }, [])

  useEffect(() => {
    async function loadPosts() {
      try {
        const response = await fetch(`${apiBase}/api/posts`)
        if (!response.ok) return
        const data = await response.json()
        setPosts(data)
      } catch {
        setPosts([])
      }
    }

    loadPosts()
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFormMessage('')

    const formData = new FormData(event.currentTarget)
    const payload = {
      name: formData.get('name'),
      phone: formData.get('phone'),
      email: formData.get('email') || '',
      projectType: formData.get('projectType'),
      message: formData.get('message'),
    }

    try {
      setIsSending(true)
      const response = await fetch(`${apiBase}/api/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('Request failed')
      }

      setFormMessage('Request sent successfully. Admin has received your request.')
      event.currentTarget.reset()
    } catch {
      setFormMessage('Failed to send request. Please try again.')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="site">
      <header className="topbar">
        <div className="brand-wrap">
          <img className="brand-logo" src={companyLogo} alt="Tsegay Brhane WWC logo" />
          <div className="brand-text">
            <strong>Tsegay Brhane WWC</strong>
            <span>Water Works and Construction</span>
          </div>
        </div>
        <div className="topbar-actions">
          <button
            className="menu-toggle"
            type="button"
            onClick={() => setIsMobileMenuOpen((v) => !v)}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-main-nav"
          >
            <span className="menu-bar" />
            <span className="menu-bar" />
            <span className="menu-bar" />
          </button>
          <nav
            id="mobile-main-nav"
            className={isMobileMenuOpen ? 'nav-links nav-open' : 'nav-links'}
            aria-label="Main navigation"
          >
            {navItems.map((item) => (
              <a key={item.label} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                {item.label}
              </a>
            ))}
            <a href="#/admin">Admin</a>
          </nav>
        </div>
        <button className="theme-toggle" onClick={() => setTheme((v) => (v === 'light' ? 'dark' : 'light'))} type="button">
          {theme === 'light' ? 'Dark' : 'Light'} mode
        </button>
      </header>

      <main>
        <section className="hero" id="about">
          <div className="hero-content">
            <p className="eyebrow">The Future Is Bright</p>
            <h1>{companyName}</h1>
            <p>
              Locally owned construction and water infrastructure company delivering reliable projects and quality
              materials across Shire, Axum, and surrounding areas in Tigray, Ethiopia.
            </p>
          </div>
          <aside className="hero-panel">
            <h3>Vision</h3>
            <p>To be a trusted leader in water works, civil construction, and construction material supply in Tigray.</p>
            <h3>Mission</h3>
            <p>Deliver high-quality services with timely, efficient, and professional execution.</p>
          </aside>
        </section>

        <section id="services" className="section">
          <SectionTitle eyebrow="Core Services" title="Integrated Construction and Supply Solutions" />
          <div className="grid cards-grid">
            {serviceGroups.map((group) => (
              <Card key={group.title} title={group.title} items={group.items} />
            ))}
          </div>
        </section>

        <section id="gallery" className="section">
          <SectionTitle
            eyebrow="Latest Media"
            title="Project Gallery"
            subtitle="Admin uploads videos and images here for clients to view."
          />
          <div className="gallery-grid">
            {posts.length === 0 ? (
              <p className="subtitle">No gallery posts yet. Admin can add posts from the admin page.</p>
            ) : (
              posts.map((post) => (
                <article className="card" key={post._id}>
                  <h3>{post.title}</h3>
                  {post.mediaType === 'video' ? (
                    <video controls className="gallery-media" src={normalizeMediaUrl(post.mediaUrl)} />
                  ) : (
                    <img className="gallery-media" src={normalizeMediaUrl(post.mediaUrl)} alt={post.title} />
                  )}
                  {post.description && <p>{post.description}</p>}
                </article>
              ))
            )}
          </div>
        </section>
      </main>

      <footer id="contact" className="footer">
        <section>
          <h2>Send your request</h2>
          <p>Admin receives requests directly in the admin dashboard.</p>
        </section>

        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>
              Full Name
              <input name="name" type="text" required placeholder="Your full name" />
            </label>
            <label>
              Phone Number
              <input name="phone" type="tel" required placeholder="Your phone" />
            </label>
            <label>
              Email (optional)
              <input name="email" type="email" placeholder="example@email.com" />
            </label>
            <label>
              Project Type
              <select name="projectType" required defaultValue="">
                <option value="" disabled>
                  Choose project type
                </option>
                <option value="water-works">Water Works</option>
                <option value="civil-construction">Civil Construction</option>
                <option value="material-supply">Material Supply</option>
              </select>
            </label>
            <label className="full-width">
              Project Details
              <textarea name="message" rows="4" required placeholder="Describe your project location and needs" />
            </label>
          </div>
          <button className="btn btn-primary form-submit" type="submit" disabled={isSending}>
            {isSending ? 'Sending...' : 'Submit Request'}
          </button>
          {formMessage && <p className="form-message">{formMessage}</p>}
        </form>

        <p className="footer-credit">
          Designed by Dawit -{' '}
          <a href="https://dafitech.org" target="_blank" rel="noreferrer">
            dafitech.org
          </a>
        </p>
      </footer>
    </div>
  )
}

function AdminPage() {
  const [adminKeyInput, setAdminKeyInput] = useState('tsegay@shire')
  const [adminKey, setAdminKey] = useState(() => localStorage.getItem('admin-key') || '')
  const [requests, setRequests] = useState([])
  const [posts, setPosts] = useState([])
  const [status, setStatus] = useState('')

  const isLoggedIn = useMemo(() => Boolean(adminKey), [adminKey])

  async function loadAdminData(currentKey) {
    const headers = { 'x-admin-key': currentKey }
    const [reqRes, postRes] = await Promise.all([
      fetch(`${apiBase}/api/admin/requests`, { headers }),
      fetch(`${apiBase}/api/admin/posts`, { headers }),
    ])

    if (!reqRes.ok || !postRes.ok) {
      throw new Error('Unauthorized or API unavailable')
    }

    setRequests(await reqRes.json())
    setPosts(await postRes.json())
  }

  useEffect(() => {
    if (!adminKey) return

    loadAdminData(adminKey).catch(() => {
      setStatus('Failed to load admin data. Check admin key.')
    })
  }, [adminKey])

  const handleLogin = async (event) => {
    event.preventDefault()

    try {
      await loadAdminData(adminKeyInput)
      localStorage.setItem('admin-key', adminKeyInput)
      setAdminKey(adminKeyInput)
      setAdminKeyInput('')
      setStatus('Admin logged in.')
    } catch {
      setStatus('Invalid admin key or server not running.')
    }
  }

  const logout = () => {
    localStorage.removeItem('admin-key')
    setAdminKey('')
    setRequests([])
    setPosts([])
    setStatus('Logged out.')
  }

  const handlePostCreate = async (event) => {
    event.preventDefault()
    setStatus('')

    const formData = new FormData(event.currentTarget)

    try {
      const response = await fetch(`${apiBase}/api/admin/posts`, {
        method: 'POST',
        headers: { 'x-admin-key': adminKey },
        body: formData,
      })

      if (!response.ok) throw new Error('Create failed')

      event.currentTarget.reset()
      await loadAdminData(adminKey)
      setStatus('Media post created successfully.')
    } catch {
      setStatus('Failed to create media post.')
    }
  }

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${apiBase}/api/admin/posts/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-key': adminKey },
      })
      if (!response.ok) throw new Error('Delete failed')
      await loadAdminData(adminKey)
    } catch {
      setStatus('Failed to delete post.')
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="admin-page">
        <h1>Admin Login</h1>
        <form className="admin-form" onSubmit={handleLogin}>
          <label>
            Admin Key
            <input
              type="password"
              value={adminKeyInput}
              onChange={(event) => setAdminKeyInput(event.target.value)}
              required
              placeholder="Enter ADMIN_KEY from server"
            />
          </label>
          <button type="submit" className="btn btn-primary">Login</button>
        </form>
        {status && <p>{status}</p>}
        <p><a href="#/">Back to website</a></p>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <div className="admin-actions">
          <a href="#/" className="btn btn-ghost">View Site</a>
          <button type="button" className="btn btn-primary" onClick={logout}>Logout</button>
        </div>
      </div>

      <section className="admin-section">
        <h2>Create Image / Video Post</h2>
        <form className="admin-form" onSubmit={handlePostCreate}>
          <label>
            Title
            <input name="title" required placeholder="Project title" />
          </label>
          <label>
            Description
            <textarea name="description" rows="3" placeholder="Short description" />
          </label>
          <label>
            Media Type
            <select name="mediaType" defaultValue="image">
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
          </label>
          <label>
            Upload File
            <input name="mediaFile" type="file" accept="image/*,video/*" />
          </label>
          <label>
            Or External URL
            <input name="mediaUrl" placeholder="https://..." />
          </label>
          <button type="submit" className="btn btn-primary">Create Post</button>
        </form>
      </section>

      <section className="admin-section">
        <h2>User Requests ({requests.length})</h2>
        <div className="admin-grid">
          {requests.map((request) => (
            <article className="card" key={request._id}>
              <h3>{request.name}</h3>
              <p><strong>Phone:</strong> {request.phone}</p>
              <p><strong>Email:</strong> {request.email || 'Not provided'}</p>
              <p><strong>Type:</strong> {request.projectType}</p>
              <p>{request.message}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="admin-section">
        <h2>Published Media ({posts.length})</h2>
        <div className="admin-grid">
          {posts.map((post) => (
            <article className="card" key={post._id}>
              <h3>{post.title}</h3>
              {post.mediaType === 'video' ? (
                <video controls className="gallery-media" src={normalizeMediaUrl(post.mediaUrl)} />
              ) : (
                <img className="gallery-media" src={normalizeMediaUrl(post.mediaUrl)} alt={post.title} />
              )}
              {post.description && <p>{post.description}</p>}
              <button type="button" className="btn btn-ghost" onClick={() => handleDelete(post._id)}>
                Delete
              </button>
            </article>
          ))}
        </div>
      </section>

      {status && <p>{status}</p>}
    </div>
  )
}

function App() {
  const currentHash = window.location.hash || '#/'
  return currentHash === '#/admin' ? <AdminPage /> : <PublicSite />
}

export default App
