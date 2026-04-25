import { useEffect, useState } from 'react'
import emailjs from '@emailjs/browser'
import './App.css'
import companyLogo from './assets/company-logo.svg'

const companyName = 'Tsegay Brhane Water Works Contractor & Construction Materials Retailer'

const navItems = [
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Customers', href: '#customers' },
  { label: 'Resources', href: '#resources' },
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
      'Potable water system implementation',
      'Irrigation and drainage infrastructure',
      'Dam construction and water management',
      'River and riverside development',
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
      'Reinforcement bars (rebar)',
      'Pipes and fittings (PVC, GI, and others)',
      'Hardware and essential building materials',
    ],
  },
]

const targetCustomers = [
  'Government institutions',
  'NGOs and development partners',
  'Private contractors and construction firms',
  'Individual house builders',
  'Commercial and business clients',
]

const advantages = [
  'Deep local market expertise in Tigray',
  'Integrated construction and material supply services',
  'Agile, responsive client support',
  'Cost-effective and competitive pricing',
  'Strong quality and reliability standards',
]

const resources = [
  'Construction tools, power tools, and water works equipment',
  'Transport and logistics support with trucks and pickups',
  'Experienced engineers, supervisors, skilled labor, and support workers',
]

const objectives = [
  'Expand operations in Tigray and nearby regions',
  'Participate actively in government infrastructure projects',
  'Build a leading reputation in water works',
  'Enhance construction material supply capacity',
  'Strengthen quality and customer satisfaction',
]

const growthStrategies = [
  'Expand branch network in key towns and districts',
  'Invest in modern construction and water works equipment',
  'Upgrade contractor licensing and certifications',
  'Provide workforce development and safety training',
  'Diversify material inventory and supplier partnerships',
  'Prioritize sustainable, community-focused projects',
]

function SectionTitle({ eyebrow, title, subtitle }) {
  return (
    <div className="section-title reveal">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {subtitle && <p className="subtitle">{subtitle}</p>}
    </div>
  )
}

function Card({ title, items }) {
  return (
    <article className="card reveal">
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
  )
}

function InfoList({ title, items }) {
  return (
    <article className="info-list reveal">
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
  )
}

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('tb-theme') || 'light')
  const [formMessage, setFormMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('tb-theme', theme)
  }, [theme])

  useEffect(() => {
    const revealItems = document.querySelectorAll('.reveal')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view')
          }
        })
      },
      { threshold: 0.2 }
    )

    revealItems.forEach((item) => observer.observe(item))

    return () => observer.disconnect()
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFormMessage('')

    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

    if (!serviceId || !templateId || !publicKey) {
      setFormMessage('Email setup is incomplete. Please configure EmailJS environment values.')
      return
    }

    const formData = new FormData(event.currentTarget)
    const templateParams = {
      from_name: formData.get('name'),
      phone: formData.get('phone'),
      from_email: formData.get('email') || 'Not provided',
      project_type: formData.get('projectType'),
      message: formData.get('message'),
      company_name: companyName,
      submitted_at: new Date().toLocaleString(),
    }

    try {
      setIsSending(true)
      await emailjs.send(serviceId, templateId, templateParams, { publicKey })
      setFormMessage('Thank you! Your request has been sent successfully. We will contact you soon.')
      event.currentTarget.reset()
    } catch (error) {
      setFormMessage('Failed to send request. Please try again or contact us by phone.')
    } finally {
      setIsSending(false)
    }
  }

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'light' ? 'dark' : 'light'))
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((current) => !current)
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
            onClick={toggleMobileMenu}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-main-nav"
          >
            Menu
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
          </nav>
        </div>
        <button className="theme-toggle" onClick={toggleTheme} type="button">
          {theme === 'light' ? 'Dark' : 'Light'} mode
        </button>
      </header>

      <main>
        <section className="hero reveal" id="about">
          <div className="hero-content">
            <p className="eyebrow">The Future Is Bright</p>
            <h1>{companyName}</h1>
            <p>
              Locally owned construction and water infrastructure company delivering
              reliable projects and quality materials across Shire, Axum, and
              surrounding areas in Tigray, Ethiopia.
            </p>
            <div className="hero-actions">
              <a className="btn btn-primary" href="#contact">
                Contact Us
              </a>
              <a className="btn btn-ghost" href="#services">
                View Services
              </a>
            </div>
          </div>
          <aside className="hero-panel">
            <h3>Vision</h3>
            <p>
              To be a trusted leader in water works, civil construction, and
              construction material supply in Tigray.
            </p>
            <h3>Mission</h3>
            <p>
              Deliver high-quality infrastructure services and dependable material
              supply with timely, efficient, and professional execution.
            </p>
          </aside>
        </section>

        <section className="logo-strip reveal" aria-label="Company quality highlights">
          <span>Licensed Contractor</span>
          <span>Water Infrastructure Specialists</span>
          <span>Regional Coverage: Shire and Axum</span>
          <span>Public and Private Projects</span>
        </section>

        <section id="services" className="section">
          <SectionTitle
            eyebrow="Core Services"
            title="Integrated Construction and Supply Solutions"
            subtitle="We provide end-to-end delivery from water systems and civil works to consistent material supply."
          />
          <div className="grid cards-grid">
            {serviceGroups.map((group) => (
              <Card key={group.title} title={group.title} items={group.items} />
            ))}
          </div>
        </section>

        <section id="customers" className="section section-alt">
          <SectionTitle
            eyebrow="Target Customers"
            title="Serving Public and Private Sectors"
            subtitle="Our services are tailored for institutions, development partners, businesses, and households."
          />
          <div className="grid two-col">
            <InfoList title="Who We Serve" items={targetCustomers} />
            <InfoList title="Competitive Advantage" items={advantages} />
          </div>
        </section>

        <section id="resources" className="section">
          <SectionTitle
            eyebrow="Capability"
            title="Strong Team, Tools, and Growth Roadmap"
            subtitle="Our operational resources and strategic goals position us for larger projects and long-term impact."
          />
          <div className="grid three-col">
            <InfoList title="Equipment and Resources" items={resources} />
            <InfoList title="Business Objectives" items={objectives} />
            <InfoList title="Future Growth Strategy" items={growthStrategies} />
          </div>
        </section>
      </main>

      <footer id="contact" className="footer reveal">
        <section>
          <h2>Let us build with you</h2>
          <p>
            Ready to collaborate on water infrastructure, civil works, or material
            supply in Tigray.
          </p>
        </section>

        <section className="contact-grid">
          <article>
            <h3>Office Locations</h3>
            <p>Branch 1: Shire, Tigray, Ethiopia</p>
            <p>Branch 2: Axum, Tigray, Ethiopia</p>
          </article>
          <article>
            <h3>Phone</h3>
            <p>+251 937 020005</p>
            <p>+251 962 577336</p>
          </article>
          <article>
            <h3>Direct Chat</h3>
            <a className="social-btn whatsapp" href="https://wa.me/251937020005" target="_blank" rel="noreferrer">
              WhatsApp
            </a>
            <a className="social-btn telegram" href="https://t.me/TsegayBrhaneWWC" target="_blank" rel="noreferrer">
              Telegram
            </a>
          </article>
        </section>

        <form className="contact-form" onSubmit={handleSubmit}>
          <h3>Send us your project request</h3>
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
              <textarea
                name="message"
                rows="4"
                required
                placeholder="Describe your project location, scope, and timeline"
              />
            </label>
          </div>
          <button className="btn btn-primary form-submit" type="submit" disabled={isSending}>
            {isSending ? 'Sending...' : 'Submit Request'}
          </button>
          {formMessage && <p className="form-message">{formMessage}</p>}
        </form>
      </footer>
    </div>
  )
}

export default App
