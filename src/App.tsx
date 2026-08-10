import { useState } from 'react'
import Beranda from './pages/Beranda'
import GambaranUmum from './pages/GambaranUmum'
import SaranaKesehatan from './pages/SaranaKesehatan'
import AksesMutu from './pages/AksesMutu'
import UKBM from './pages/UKBM'
import SDMKesehatan from './pages/SDMKesehatan'
import PembiayaanKesehatan from './pages/PembiayaanKesehatan'
import KesehatanIbu from './pages/KesehatanIbu'
import KesehatanAnak from './pages/KesehatanAnak'
import UsiaProduktifLansia from './pages/UsiaProduktifLansia'
import PenyakitMenular from './pages/PenyakitMenular'
import PD3I from './pages/PD3I'
import TularVektor from './pages/TularVektor'
import KesehatanLingkungan from './pages/KesehatanLingkungan'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import { Home, LayoutDashboard, Building2, Users, Receipt, Baby, Stethoscope, Droplets, ChevronDown, ChevronRight, ChevronLeft, Settings } from 'lucide-react'

type PageId =
  | 'beranda'
  | 'gambaran'
  | 'sarana' | 'akses_mutu' | 'ukbm'
  | 'sdm'
  | 'pembiayaan'
  | 'ibu' | 'anak' | 'usia_produktif'
  | 'penyakit_menular' | 'pd3i' | 'tular_vektor'
  | 'lingkungan'
  | 'admin'

interface NavItem {
  id: PageId
  label: string
  icon: React.ElementType
  children?: { id: PageId; label: string }[]
}

const NAV: NavItem[] = [
  { id: 'beranda', label: 'Beranda', icon: Home },
  { id: 'gambaran', label: 'Gambaran Umum', icon: LayoutDashboard },
  {
    id: 'sarana', label: 'Sarana Kesehatan', icon: Building2,
    children: [
      { id: 'sarana', label: '2.1 Sarana Kesehatan' },
      { id: 'akses_mutu', label: '2.2 Akses & Mutu Pelayanan' },
      { id: 'ukbm', label: '2.3 UKBM' },
    ],
  },
  { id: 'sdm', label: 'SDM Kesehatan', icon: Users },
  { id: 'pembiayaan', label: 'Pembiayaan Kesehatan', icon: Receipt },
  {
    id: 'ibu', label: 'Kesehatan Keluarga', icon: Baby,
    children: [
      { id: 'ibu', label: '5.1 Kesehatan Ibu' },
      { id: 'anak', label: '5.2 Kesehatan Anak' },
      { id: 'usia_produktif', label: '5.3 Usia Produktif & Lansia' },
    ],
  },
  {
    id: 'penyakit_menular', label: 'Pengendalian Penyakit', icon: Stethoscope,
    children: [
      { id: 'penyakit_menular', label: '6.1 Penyakit Menular Langsung' },
      { id: 'pd3i', label: '6.2 PD3I' },
      { id: 'tular_vektor', label: '6.3 Tular Vektor & Zoonotik' },
    ],
  },
  { id: 'lingkungan', label: 'Kesehatan Lingkungan', icon: Droplets },
  { id: 'admin', label: 'Admin Dashboard', icon: Settings },
]

const SECTION_LABELS: Partial<Record<PageId, string>> = {
  beranda: 'Beranda',
  gambaran: 'Gambaran Umum',
  sarana: 'Sarana Kesehatan',
  akses_mutu: 'Akses & Mutu Pelayanan Kesehatan',
  ukbm: 'Upaya Kesehatan Bersumberdaya Masyarakat',
  sdm: 'SDM Kesehatan',
  pembiayaan: 'Pembiayaan Kesehatan',
  ibu: 'Kesehatan Ibu',
  anak: 'Kesehatan Anak',
  usia_produktif: 'Usia Produktif & Lanjut Usia',
  penyakit_menular: 'Penyakit Menular Langsung',
  pd3i: 'Penyakit yang Dapat Dicegah Dengan Imunisasi',
  tular_vektor: 'Penyakit Tular Vektor & Zoonotik',
  lingkungan: 'Kesehatan Lingkungan',
  admin: 'Admin Dashboard',
}

const PARENT_SECTION: Partial<Record<PageId, string>> = {
  akses_mutu: 'Sarana Kesehatan',
  ukbm: 'Sarana Kesehatan',
  ibu: 'Kesehatan Keluarga',
  anak: 'Kesehatan Keluarga',
  usia_produktif: 'Kesehatan Keluarga',
  penyakit_menular: 'Pengendalian Penyakit',
  pd3i: 'Pengendalian Penyakit',
  tular_vektor: 'Pengendalian Penyakit',
}

// Which nav group is active for a given page
const PAGE_TO_NAV_GROUP: Record<PageId, PageId> = {
  beranda: 'beranda',
  gambaran: 'gambaran',
  sarana: 'sarana', akses_mutu: 'sarana', ukbm: 'sarana',
  sdm: 'sdm',
  pembiayaan: 'pembiayaan',
  ibu: 'ibu', anak: 'ibu', usia_produktif: 'ibu',
  penyakit_menular: 'penyakit_menular', pd3i: 'penyakit_menular', tular_vektor: 'penyakit_menular',
  lingkungan: 'lingkungan',
  admin: 'admin'
}

export default function App() {
  const [page, setPage] = useState<PageId>('beranda')
  const [expanded, setExpanded] = useState<Set<PageId>>(new Set(['sarana', 'ibu', 'penyakit_menular']))
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const navigate = (id: PageId, groupId?: PageId) => {
    setPage(id)
    if (groupId && groupId !== id) {
      setExpanded(prev => new Set([...prev, groupId]))
    }
  }

  const toggleExpand = (id: PageId) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const activeGroup = PAGE_TO_NAV_GROUP[page]

  // --- Admin Routing Logic ---
  if (page === 'admin') {
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')

    if (token && role === 'admin') {
      return <AdminDashboard onLogout={() => {
        localStorage.removeItem('token')
        localStorage.removeItem('role')
        setPage('gambaran')
      }} />
    } else {
      return <AdminLogin onLogin={() => setPage('admin')} />
    }
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--color-bg)' }}>
      {/* Sidebar */}
      <aside
        className="flex flex-col shrink-0 overflow-hidden transition-all duration-300"
        style={{ width: sidebarOpen ? 280 : 62, background: 'var(--color-surface)', borderRight: '1px solid var(--color-border)', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', zIndex: 100 }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-6 border-b shrink-0" style={{ borderColor: 'var(--color-border)', background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent2) 100%)', color: 'white' }}>
          {sidebarOpen ? (
            <div className="min-w-0">
              <div className="font-bold text-xl leading-tight mb-1">Profil Kesehatan</div>
              <div className="text-[13px] font-medium" style={{ opacity: 0.9 }}>Jawa Timur 2025</div>
            </div>
          ) : (
            <div className="w-full text-center font-bold text-xl">PK</div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {NAV.map(item => {
            const isGroupActive = activeGroup === item.id
            const isExpanded = expanded.has(item.id)
            return (
              <div key={item.id + item.label}>
                <button
                  onClick={() => {
                    if (item.children) {
                      toggleExpand(item.id)
                      if (!sidebarOpen) setSidebarOpen(true)
                      // Navigate to first child or self
                      navigate(item.children[0].id, item.id)
                    } else {
                      navigate(item.id)
                    }
                  }}
                  className="w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all duration-200"
                  style={{
                    background: isGroupActive ? '#f0fdfa' : 'transparent',
                    color: isGroupActive ? 'var(--color-primary)' : 'var(--color-text-main)',
                    fontWeight: 500,
                  }}
                  onMouseEnter={e => { if (!isGroupActive) { (e.currentTarget as HTMLButtonElement).style.background = '#f0fdfa'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-primary)'; } }}
                  onMouseLeave={e => { if (!isGroupActive) { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-main)'; } }}
                >
                  <span className="shrink-0 w-6 flex items-center justify-center" style={{ color: isGroupActive ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
                    <item.icon size={20} strokeWidth={2} />
                  </span>
                  {sidebarOpen && (
                    <>
                      <span className="text-[15px] flex-1 leading-tight text-left">{item.label}</span>
                      {item.children && (
                        <span style={{ color: 'var(--color-text-muted)' }} className="flex items-center">
                          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </span>
                      )}
                    </>
                  )}
                </button>

                {sidebarOpen && item.children && isExpanded && (
                  <div className="mt-1 mb-2 ml-4 pl-4" style={{ borderLeft: '1px solid var(--color-border)' }}>
                    {item.children.map(child => (
                      <button
                        key={child.id}
                        onClick={() => navigate(child.id, item.id)}
                        className="w-full text-left block rounded-lg px-3 py-1.5 mb-1 transition-all duration-200"
                        style={{
                          fontSize: 13,
                          fontWeight: 500,
                          color: page === child.id ? 'var(--color-primary)' : 'var(--color-text-muted)',
                          background: page === child.id ? '#f0fdfa' : 'transparent',
                        }}
                        onMouseEnter={e => { if (page !== child.id) { (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-primary)'; (e.currentTarget as HTMLButtonElement).style.background = '#f0fdfa'; } }}
                        onMouseLeave={e => { if (page !== child.id) { (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-muted)'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; } }}
                      >
                        {child.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* Collapse toggle */}
        <div className="px-4 py-4 border-t shrink-0" style={{ borderColor: 'var(--color-border)' }}>
          <button
            onClick={() => setSidebarOpen(v => !v)}
            className="w-full flex items-center justify-center gap-2 rounded-xl px-3 py-2 transition-colors text-sm font-medium"
            style={{ color: 'var(--color-text-muted)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-primary)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-muted)'; }}
          >
            <span className="shrink-0 flex items-center justify-center">{sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}</span>
            {sidebarOpen && <span>Collapse Sidebar</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b px-6 py-4 flex items-center justify-between shrink-0" style={{ borderColor: 'var(--color-border)', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', zIndex: 90 }}>
          <div>
            {PARENT_SECTION[page] && (
              <div className="text-[13px] font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>{PARENT_SECTION[page]}</div>
            )}
            <h1 className="text-xl font-bold" style={{ color: 'var(--color-text-main)' }}>
              {SECTION_LABELS[page]}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: '#F0FAF9', color: '#0FB0AA' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#0FB0AA' }} />
              38 Kabupaten/Kota · Profil Kesehatan 2025
            </div>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: '#0FB0AA' }}>G</div>
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 overflow-y-auto p-5">
          {page === 'beranda' && <Beranda onNavigate={navigate} />}
          {page === 'gambaran' && <GambaranUmum />}
          {page === 'sarana' && <SaranaKesehatan />}
          {page === 'akses_mutu' && <AksesMutu />}
          {page === 'ukbm' && <UKBM />}
          {page === 'sdm' && <SDMKesehatan />}
          {page === 'pembiayaan' && <PembiayaanKesehatan />}
          {page === 'ibu' && <KesehatanIbu />}
          {page === 'anak' && <KesehatanAnak />}
          {page === 'usia_produktif' && <UsiaProduktifLansia />}
          {page === 'penyakit_menular' && <PenyakitMenular />}
          {page === 'pd3i' && <PD3I />}
          {page === 'tular_vektor' && <TularVektor />}
          {page === 'lingkungan' && <KesehatanLingkungan />}
        </main>

        {page !== 'beranda' && (
          <footer className="bg-white border-t border-gray-100 px-6 py-2 flex items-center justify-between text-xs text-gray-400 shrink-0">
            <span>Dinas Kesehatan Provinsi Jawa Timur · Data Profil Kesehatan 2025</span>
            <span>47.913 baris data · 76 tabel</span>
          </footer>
        )}
      </div>
    </div>
  )
}
