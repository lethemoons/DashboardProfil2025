import React, { useState, useEffect } from 'react'
import {
  Activity,
  BarChart3,
  Building2,
  Users,
  Receipt,
  Baby,
  Stethoscope,
  Droplets,
  MapPin,
  Compass,
  TrendingUp,
  CheckCircle2,
  LayoutGrid,
  LayoutDashboard,
  Map,
  Calculator,
  GitCompare,
  Table,
  BarChart2,
  Filter,
  Download,
  ShieldCheck,
  Database,
  Landmark,
  Building,
  Scale,
  Hospital,
  Search,
  GraduationCap,
  BookOpen,
  Globe,
  CheckCircle,
  Layers,
  Shield,
  Clock,
  Target,
  Eye,
  FileCheck,
  ArrowRight,
  FileText,
  X,
  ExternalLink,
  ChevronRight,
  Info,
  Sparkles,
  HeartPulse,
} from 'lucide-react'

interface BerandaProps {
  onNavigate: (pageId: any, groupId?: any) => void
}

// Visual Gallery Items with curated high-resolution healthcare imagery
const GALLERY_ITEMS = [
  {
    id: 1,
    title: 'Pelayanan Kesehatan di Puskesmas',
    category: 'fasyankes',
    categoryLabel: 'Fasilitas Kesehatan',
    image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1000&q=80',
    description: 'Pelayanan terpadu di fasilitas kesehatan tingkat pertama (FKTP) Puskesmas di wilayah Jawa Timur untuk memberikan akses kesehatan menyeluruh.',
    location: 'Puskesmas Kabupaten Sidoarjo',
  },
  {
    id: 2,
    title: 'Pemeriksaan Kesehatan Ibu & Anak',
    category: 'ibu_anak',
    categoryLabel: 'Kesehatan Ibu & Anak',
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1000&q=80',
    description: 'Pemeriksaan antenatal care (K1-K6) dan pemantauan tumbuh kembang balita secara intensif di posyandu binaan.',
    location: 'Posyandu Terpadu Kota Surabaya',
  },
  {
    id: 3,
    title: 'Tenaga Medis & Pelayanan Rumah Sakit',
    category: 'medis',
    categoryLabel: 'Tenaga Medis',
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1000&q=80',
    description: 'Dedikasi dokter spesialis, perawat, dan tenaga medis profesional dalam pelayanan rujukan rumah sakit daerah di Jawa Timur.',
    location: 'RSUD Dr. Soetomo / RSUD Provinsi Jatim',
  },
  {
    id: 4,
    title: 'Program Imunisasi & Vaksinasi Nasional',
    category: 'imunisasi',
    categoryLabel: 'Imunisasi & Pencegahan',
    image: 'https://images.unsplash.com/photo-1632053002951-b3b4f5efd28c?auto=format&fit=crop&w=1000&q=80',
    description: 'Pelaksanaan Imunisasi Dasar Lengkap (IDL) dan vaksinasi lanjutan untuk memperkuat kekebalan kelompok terhadap penyakit PD3I.',
    location: 'Dinas Kesehatan Kabupaten Malang',
  },
  {
    id: 5,
    title: 'Laboratorium Kesehatan & Pengujian Sampel',
    category: 'medis',
    categoryLabel: 'Laboratorium & Diagnostik',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80',
    description: 'Fasilitas laboratorium kesehatan terakreditasi untuk pengawasan mutu air, uji klinis, dan surveilans penyakit menular.',
    location: 'Balai Besar Laboratorium Kesehatan Surabaya',
  },
  {
    id: 6,
    title: 'Layanan Tanggap Darurat & Ambulans 119',
    category: 'fasyankes',
    categoryLabel: 'Layanan Darurat',
    image: 'https://images.unsplash.com/photo-1587745416684-47953f16f02f?auto=format&fit=crop&w=1000&q=80',
    description: 'Kesiapsiagaan armada ambulans gawat darurat dan Public Safety Center (PSC 119) di seluruh penjuru Jawa Timur.',
    location: 'Sistem Penanggulangan Gawat Darurat Terpadu Jatim',
  },
]

export default function Beranda({ onNavigate }: BerandaProps) {
  // Counter animation state
  const [counts, setCounts] = useState({
    wilayah: 0,
    halaman: 0,
    modul: 0,
    indikator: 0,
    barisData: 0,
  })

  // State for Gallery Category Filter
  const [galleryFilter, setGalleryFilter] = useState<string>('all')
  // State for Lightbox Modal
  const [selectedGalleryItem, setSelectedGalleryItem] = useState<typeof GALLERY_ITEMS[0] | null>(null)
  // State for Documentation Modal
  const [showDocModal, setShowDocModal] = useState<boolean>(false)

  // Animated counters on mount
  useEffect(() => {
    const duration = 1200
    const steps = 30
    const stepTime = duration / steps
    let currentStep = 0

    const timer = setInterval(() => {
      currentStep++
      const progress = currentStep / steps
      const easeProgress = 1 - Math.pow(1 - progress, 3)

      setCounts({
        wilayah: Math.round(38 * easeProgress),
        halaman: Math.round(7 * easeProgress),
        modul: Math.round(10 * easeProgress),
        indikator: Math.round(100 * easeProgress),
        barisData: Math.round(47913 * easeProgress),
      })

      if (currentStep >= steps) {
        clearInterval(timer)
      }
    }, stepTime)

    return () => clearInterval(timer)
  }, [])

  const filteredGallery = galleryFilter === 'all'
    ? GALLERY_ITEMS
    : GALLERY_ITEMS.filter(item => item.category === galleryFilter)

  return (
    <div className="flex flex-col gap-12 max-w-7xl mx-auto pb-12">
      {/* ========================================================================= */}
      {/* SECTION 1: HERO SECTION                                                   */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden rounded-3xl bg-white border border-gray-100 shadow-sm p-6 md:p-10 lg:p-12">
        {/* Subtle background decoration */}
        <div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-40"
          style={{ background: 'radial-gradient(circle, #0FB0AA 0%, #06B5D0 50%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-20"
          style={{ background: 'radial-gradient(circle, #CBD92C 0%, #0FB0AA 60%, transparent 80%)' }}
        />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Column: Title, Subtitle, CTA */}
          <div className="lg:col-span-7 flex flex-col items-start">
            {/* Government Badge */}
            <div
              className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-5"
              style={{ background: 'rgba(15, 176, 170, 0.08)', color: '#0FB0AA', border: '1px solid rgba(15, 176, 170, 0.2)' }}
            >
              <span className="w-2 h-2 rounded-full animate-ping" style={{ background: '#0FB0AA' }} />
              Dinas Kesehatan Provinsi Jawa Timur
            </div>

            {/* Main Heading */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 leading-[1.18] mb-5">
              Dashboard Profil Kesehatan <br className="hidden sm:inline" />
              <span
                style={{
                  background: 'linear-gradient(135deg, #0FB0AA 0%, #06B5D0 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Provinsi Jawa Timur
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-8 max-w-2xl">
              Sistem dashboard interaktif untuk memantau, mengevaluasi, dan menganalisis indikator kesehatan Provinsi Jawa Timur secara komprehensif berdasarkan data resmi Dinas Kesehatan.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
              <button
                onClick={() => onNavigate('gambaran')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-semibold text-white transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #0FB0AA 0%, #0d9b96 100%)' }}
              >
                <span>Mulai Eksplorasi Dashboard</span>
                <ArrowRight size={18} strokeWidth={2.2} />
              </button>

              <button
                onClick={() => setShowDocModal(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all duration-200 cursor-pointer"
              >
                <FileText size={18} className="text-teal-600" />
                <span>Lihat Dokumentasi</span>
              </button>
            </div>

            {/* Micro Highlights strip */}
            <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap items-center gap-6 text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-teal-600" />
                <span className="font-medium text-gray-700">38 Wilayah Kabupaten/Kota</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-teal-600" />
                <span className="font-medium text-gray-700">76 Tabel Data Standar</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-teal-600" />
                <span className="font-medium text-gray-700">Tahun Data 2023–2025</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-lg border border-gray-100 group">
              <img
                src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80"
                alt="Tenaga Kesehatan Jawa Timur"
                className="w-full h-80 sm:h-96 object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent" />

              {/* In-image caption */}
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <div className="text-xs font-semibold uppercase tracking-wider text-teal-300 mb-1">
                  Pelayanan Kesehatan Terintegrasi
                </div>
                <div className="text-sm font-medium leading-snug">
                  Mewujudkan masyarakat Jawa Timur yang sehat, mandiri, dan berkeadilan melalui tata kelola data kesehatan yang akurat.
                </div>
              </div>
            </div>

            {/* Floating Glassmorphic Stat Badges */}
            <div
              className="absolute -top-4 -left-4 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-xl shadow-lg border border-gray-100 flex items-center gap-3 hidden sm:flex"
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white" style={{ background: '#0FB0AA' }}>
                <HeartPulse size={18} />
              </div>
              <div>
                <div className="text-xs font-bold text-gray-800">41+ Juta Jiwa</div>
                <div className="text-[11px] text-gray-500">Cakupan Penduduk Jatim</div>
              </div>
            </div>

            <div
              className="absolute -bottom-4 -right-4 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-xl shadow-lg border border-gray-100 flex items-center gap-3 hidden sm:flex"
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white" style={{ background: '#06B5D0' }}>
                <ShieldCheck size={18} />
              </div>
              <div>
                <div className="text-xs font-bold text-gray-800">100% Data Resmi</div>
                <div className="text-[11px] text-gray-500">Dinas Kesehatan Jatim</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: STATISTIK DASHBOARD (ANIMATED COUNTER)                         */}
      {/* ========================================================================= */}
      <section>
        <div className="text-center mb-6">
          <h2 className="text-xs font-bold tracking-wider uppercase text-teal-600 mb-1">Ringkasan Kapasitas Sistem</h2>
          <p className="text-xl font-bold text-gray-800">Statistik Utama Platform Profil Kesehatan</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
            <div className="w-10 h-10 mx-auto mb-3 rounded-xl flex items-center justify-center text-teal-600 bg-teal-50">
              <MapPin size={20} />
            </div>
            <div className="text-2xl lg:text-3xl font-extrabold text-gray-900 mb-1">{counts.wilayah}</div>
            <div className="text-xs font-semibold text-gray-700">Kabupaten/Kota</div>
            <div className="text-[11px] text-gray-400 mt-0.5">29 Kab & 9 Kota</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
            <div className="w-10 h-10 mx-auto mb-3 rounded-xl flex items-center justify-center text-cyan-600 bg-cyan-50">
              <LayoutDashboard size={20} />
            </div>
            <div className="text-2xl lg:text-3xl font-extrabold text-gray-900 mb-1">{counts.halaman}</div>
            <div className="text-xs font-semibold text-gray-700">Modul Utama</div>
            <div className="text-[11px] text-gray-400 mt-0.5">Struktur 6 Pilar Data</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
            <div className="w-10 h-10 mx-auto mb-3 rounded-xl flex items-center justify-center text-lime-600 bg-lime-50">
              <Calculator size={20} />
            </div>
            <div className="text-2xl lg:text-3xl font-extrabold text-gray-900 mb-1">{counts.modul}+</div>
            <div className="text-xs font-semibold text-gray-700">Fitur Analisis</div>
            <div className="text-[11px] text-gray-400 mt-0.5">Spasial, Korelasi & Rank</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
            <div className="w-10 h-10 mx-auto mb-3 rounded-xl flex items-center justify-center text-purple-600 bg-purple-50">
              <Activity size={20} />
            </div>
            <div className="text-2xl lg:text-3xl font-extrabold text-gray-900 mb-1">{counts.indikator}+</div>
            <div className="text-xs font-semibold text-gray-700">Indikator Kesehatan</div>
            <div className="text-[11px] text-gray-400 mt-0.5">Standar SPM & Renstra</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
            <div className="w-10 h-10 mx-auto mb-3 rounded-xl flex items-center justify-center text-orange-600 bg-orange-50">
              <Database size={20} />
            </div>
            <div className="text-2xl lg:text-3xl font-extrabold text-gray-900 mb-1">2023–2025</div>
            <div className="text-xs font-semibold text-gray-700">Tahun Data</div>
            <div className="text-[11px] text-gray-400 mt-0.5">Berkala & Terkini</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
            <div className="w-10 h-10 mx-auto mb-3 rounded-xl flex items-center justify-center text-emerald-600 bg-emerald-50">
              <Table size={20} />
            </div>
            <div className="text-2xl lg:text-3xl font-extrabold text-gray-900 mb-1">
              {counts.barisData.toLocaleString('id-ID')}
            </div>
            <div className="text-xs font-semibold text-gray-700">Titik Data Resmi</div>
            <div className="text-[11px] text-gray-400 mt-0.5">76 Tabel Terstruktur</div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3: TENTANG DASHBOARD                                              */}
      {/* ========================================================================= */}
      <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Latar Belakang */}
          <div className="lg:col-span-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold text-teal-700 bg-teal-50 mb-3">
              <Info size={14} />
              Latar Belakang
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 leading-snug">
              Transformasi Digital Tata Kelola Data Kesehatan Jawa Timur
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              Dashboard Profil Kesehatan Provinsi Jawa Timur dikembangkan oleh Dinas Kesehatan Provinsi Jawa Timur sebagai instrumen analitik kesehatan terpadu. Sistem ini mengintegrasikan seluruh indikator pelayanan kesehatan dari 38 kabupaten/kota untuk mendukung monitoring berkala, evaluasi program, serta perumusan kebijakan strategis berbasis data faktual (evidence-based policy).
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              Dengan penyajian data yang transparan, terstandarisasi, dan interaktif, platform ini menjadi jembatan informasi antara pemerintah daerah, tenaga medis, akademisi, dan masyarakat luas.
            </p>
          </div>

          {/* Tujuan Dashboard (Icon Cards) */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold text-cyan-700 bg-cyan-50 mb-3">
              <Target size={14} />
              Tujuan Utama Dashboard
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Fokus & Tujuan Strategis Pembangunan Sistem
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-100 hover:bg-white hover:shadow-sm transition-all duration-200">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-teal-600 bg-teal-100/60 mb-2.5">
                  <Activity size={18} />
                </div>
                <div className="font-semibold text-sm text-gray-800 mb-1">Monitoring Indikator Kesehatan</div>
                <div className="text-xs text-gray-500 leading-relaxed">
                  Memantau perkembangan indikator kesehatan secara berkala dan konsisten di seluruh wilayah Jawa Timur.
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-100 hover:bg-white hover:shadow-sm transition-all duration-200">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-cyan-600 bg-cyan-100/60 mb-2.5">
                  <Compass size={18} />
                </div>
                <div className="font-semibold text-sm text-gray-800 mb-1">Analisis Spasial Antar Wilayah</div>
                <div className="text-xs text-gray-500 leading-relaxed">
                  Mengidentifikasi disparitas capaian dan persebaran geografis antara 29 kabupaten dan 9 kota.
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-100 hover:bg-white hover:shadow-sm transition-all duration-200">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lime-600 bg-lime-100/60 mb-2.5">
                  <TrendingUp size={18} />
                </div>
                <div className="font-semibold text-sm text-gray-800 mb-1">Evaluasi Capaian Program</div>
                <div className="text-xs text-gray-500 leading-relaxed">
                  Mengukur ketercapaian target program Standar Pelayanan Minimal (SPM) dan Rencana Strategis Dinkes.
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50/80 border border-gray-100 hover:bg-white hover:shadow-sm transition-all duration-200">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-purple-600 bg-purple-100/60 mb-2.5">
                  <CheckCircle2 size={18} />
                </div>
                <div className="font-semibold text-sm text-gray-800 mb-1">Keputusan Berbasis Data</div>
                <div className="text-xs text-gray-500 leading-relaxed">
                  Menyediakan landasan kuantitatif yang kokoh untuk alokasi anggaran dan intervensi prioritas.
                </div>
              </div>

              <div className="sm:col-span-2 p-4 rounded-2xl bg-gray-50/80 border border-gray-100 hover:bg-white hover:shadow-sm transition-all duration-200 flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-orange-600 bg-orange-100/60">
                  <LayoutGrid size={18} />
                </div>
                <div>
                  <div className="font-semibold text-sm text-gray-800 mb-0.5">Penyajian Informasi Kesehatan Interaktif</div>
                  <div className="text-xs text-gray-500 leading-relaxed">
                    Menyajikan visualisasi data multi-format (grafik, tabel, peta, korelasi) yang intuitif dan mudah dipahami seluruh pemangku kepentingan.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 4: FITUR UNGGULAN DASHBOARD                                       */}
      {/* ========================================================================= */}
      <section>
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
          <div>
            <div className="text-xs font-bold tracking-wider uppercase text-teal-600 mb-1">Kemampuan Sistem</div>
            <h2 className="text-2xl font-bold text-gray-900">Fitur Unggulan Dashboard</h2>
            <p className="text-sm text-gray-500 mt-1">Eksplorasi data dengan berbagai alat analisis modern dan fleksibel</p>
          </div>
          <button
            onClick={() => onNavigate('gambaran')}
            className="mt-3 md:mt-0 inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors cursor-pointer"
          >
            <span>Buka Seluruh Fitur</span>
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Fitur 1 */}
          <div
            onClick={() => onNavigate('gambaran')}
            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-200 cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-teal-600 bg-teal-50 group-hover:bg-teal-600 group-hover:text-white transition-colors mb-3.5">
                <LayoutDashboard size={20} />
              </div>
              <h3 className="font-bold text-sm text-gray-800 mb-1.5 group-hover:text-teal-600 transition-colors">
                Dashboard Interaktif
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Tampilan visual komprehensif dengan metrik utama, grafik distribusi, dan rangkuman indikator.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-[11px] font-medium text-teal-600">
              <span>Buka Gambaran</span>
              <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Fitur 2 */}
          <div
            onClick={() => onNavigate('sarana')}
            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-cyan-200 transition-all duration-200 cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-cyan-600 bg-cyan-50 group-hover:bg-cyan-600 group-hover:text-white transition-colors mb-3.5">
                <Map size={20} />
              </div>
              <h3 className="font-bold text-sm text-gray-800 mb-1.5 group-hover:text-cyan-600 transition-colors">
                Choropleth Map
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Pemetaan spasial tematik 38 kabupaten/kota dengan gradasi warna berbasis nilai capaian indikator.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-[11px] font-medium text-cyan-600">
              <span>Lihat Peta Spasial</span>
              <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Fitur 3 */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-lime-200 transition-all duration-200 group flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lime-600 bg-lime-50 group-hover:bg-lime-600 group-hover:text-white transition-colors mb-3.5">
                <Calculator size={20} />
              </div>
              <h3 className="font-bold text-sm text-gray-800 mb-1.5 group-hover:text-lime-600 transition-colors">
                Statistik Deskriptif
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Kalkulasi otomatis nilai mean, median, standar deviasi, kuartil, nilai minimum, dan maksimum.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-50 text-[11px] font-medium text-gray-400">
              <span>Tersedia di Seluruh Halaman</span>
            </div>
          </div>

          {/* Fitur 4 */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all duration-200 group flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-purple-600 bg-purple-50 group-hover:bg-purple-600 group-hover:text-white transition-colors mb-3.5">
                <GitCompare size={20} />
              </div>
              <h3 className="font-bold text-sm text-gray-800 mb-1.5 group-hover:text-purple-600 transition-colors">
                Analisis Korelasi
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Scatter chart interaktif dan perhitungan koefisien korelasi Pearson r antar indikator kesehatan.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-50 text-[11px] font-medium text-gray-400">
              <span>Bivariate Scatter Plot</span>
            </div>
          </div>

          {/* Fitur 5 */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-orange-200 transition-all duration-200 group flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-orange-600 bg-orange-50 group-hover:bg-orange-600 group-hover:text-white transition-colors mb-3.5">
                <Table size={20} />
              </div>
              <h3 className="font-bold text-sm text-gray-800 mb-1.5 group-hover:text-orange-600 transition-colors">
                Crosstab Interaktif
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Tabulasi silang kategori indikator (Rendah, Sedang, Tinggi) untuk analisis matriks kinerja wilayah.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-50 text-[11px] font-medium text-gray-400">
              <span>Matrix Kuadran Wilayah</span>
            </div>
          </div>

          {/* Fitur 6 */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-teal-200 transition-all duration-200 group flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-teal-600 bg-teal-50 group-hover:bg-teal-600 group-hover:text-white transition-colors mb-3.5">
                <BarChart2 size={20} />
              </div>
              <h3 className="font-bold text-sm text-gray-800 mb-1.5 group-hover:text-teal-600 transition-colors">
                Ranking Wilayah
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Urutan peringkat tertinggi hingga terendah 38 kab/kota untuk identifikasi daerah berkinerja unggul.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-50 text-[11px] font-medium text-gray-400">
              <span>Top & Bottom 10 Kab/Kota</span>
            </div>
          </div>

          {/* Fitur 7 */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-cyan-200 transition-all duration-200 group flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-cyan-600 bg-cyan-50 group-hover:bg-cyan-600 group-hover:text-white transition-colors mb-3.5">
                <Filter size={20} />
              </div>
              <h3 className="font-bold text-sm text-gray-800 mb-1.5 group-hover:text-cyan-600 transition-colors">
                Filter Wilayah & Tahun
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Filter instan untuk memusatkan analisis pada kabupaten/kota tertentu atau periode tahun berjalan.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-50 text-[11px] font-medium text-gray-400">
              <span>Multi-Level Filtering</span>
            </div>
          </div>

          {/* Fitur 8 */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-200 group flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-emerald-600 bg-emerald-50 group-hover:bg-emerald-600 group-hover:text-white transition-colors mb-3.5">
                <Download size={20} />
              </div>
              <h3 className="font-bold text-sm text-gray-800 mb-1.5 group-hover:text-emerald-600 transition-colors">
                Export Data Tabular
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Kemudahan mengunduh dan menyalin data tabel untuk kebutuhan pelaporan internal dan analisis lanjutan.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-50 text-[11px] font-medium text-gray-400">
              <span>Format Standar CSV / Tabular</span>
            </div>
          </div>

          {/* Fitur 9 */}
          <div
            onClick={() => onNavigate('admin')}
            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200 cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-blue-600 bg-blue-50 group-hover:bg-blue-600 group-hover:text-white transition-colors mb-3.5">
                <ShieldCheck size={20} />
              </div>
              <h3 className="font-bold text-sm text-gray-800 mb-1.5 group-hover:text-blue-600 transition-colors">
                Multi-User Role
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Pemisahan hak akses antara mode Guest (publik) dan Portal Admin untuk pengelolaan data terproteksi.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-[11px] font-medium text-blue-600">
              <span>Portal Admin</span>
              <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Fitur 10 */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-200 group flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-700 bg-slate-100 group-hover:bg-slate-800 group-hover:text-white transition-colors mb-3.5">
                <Database size={20} />
              </div>
              <h3 className="font-bold text-sm text-gray-800 mb-1.5 group-hover:text-slate-900 transition-colors">
                Backend Terintegrasi
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Arsitektur REST API cepat dengan sinkronisasi database PostgreSQL untuk keandalan data tinggi.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-50 text-[11px] font-medium text-gray-400">
              <span>Direct API Sync</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 5: CAKUPAN DATA DASHBOARD (6 PILAR)                               */}
      {/* ========================================================================= */}
      <section>
        <div className="mb-8">
          <div className="text-xs font-bold tracking-wider uppercase text-teal-600 mb-1">Struktur Informasi</div>
          <h2 className="text-2xl font-bold text-gray-900">Cakupan Data Dashboard</h2>
          <p className="text-sm text-gray-500 mt-1">6 Pilar utama profil kesehatan Provinsi Jawa Timur</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Pilar 1 */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md hover:border-teal-200 transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-teal-600 bg-teal-50">
                  <Building2 size={24} />
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-teal-50 text-teal-700">Bab 2</span>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Sarana Kesehatan</h3>
              <p className="text-xs text-gray-600 leading-relaxed mb-4">
                Memuat data fasilitas kesehatan: Rumah Sakit Umum & Khusus, Puskesmas Rawat Inap/Non-Inap, Klinik, Laboratorium Medis, Unit Transfusi Darah, Posyandu, serta ketersediaan tempat tidur (BOR/ALOS).
              </p>
            </div>
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-400">Tabel 1 – Tabel 13</span>
              <button
                onClick={() => onNavigate('sarana')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-700 cursor-pointer"
              >
                <span>Jelajahi Sarana</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Pilar 2 */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md hover:border-cyan-200 transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-cyan-600 bg-cyan-50">
                  <Users size={24} />
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-cyan-50 text-cyan-700">Bab 3</span>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">SDM Kesehatan</h3>
              <p className="text-xs text-gray-600 leading-relaxed mb-4">
                Informasi ketersediaan dan rasio tenaga kesehatan: Dokter Spesialis, Dokter Umum, Dokter Gigi, Bidan, Perawat, Tenaga Kefarmasian, Ahli Gizi, dan Tenaga Kesehatan Masyarakat per 100.000 penduduk.
              </p>
            </div>
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-400">Tabel 14 – Tabel 21</span>
              <button
                onClick={() => onNavigate('sdm')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-600 hover:text-cyan-700 cursor-pointer"
              >
                <span>Jelajahi SDM</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Pilar 3 */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md hover:border-lime-200 transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lime-700 bg-lime-50">
                  <Receipt size={24} />
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-lime-50 text-lime-700">Bab 4</span>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Pembiayaan Kesehatan</h3>
              <p className="text-xs text-gray-600 leading-relaxed mb-4">
                Alokasi anggaran kesehatan bersumber dari APBD Provinsi, APBD Kab/Kota, DAK Kesehatan, Belanja Kesehatan per Kapita, serta tingkat kepesertaan Jaminan Kesehatan Nasional (JKN/BPJS Kesehatan).
              </p>
            </div>
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-400">Tabel 22 – Tabel 23</span>
              <button
                onClick={() => onNavigate('pembiayaan')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-lime-700 hover:text-lime-800 cursor-pointer"
              >
                <span>Jelajahi Pembiayaan</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Pilar 4 */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md hover:border-purple-200 transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-purple-600 bg-purple-50">
                  <Baby size={24} />
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-purple-50 text-purple-700">Bab 5</span>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Kesehatan Keluarga</h3>
              <p className="text-xs text-gray-600 leading-relaxed mb-4">
                Indikator kesehatan ibu (kematian ibu, K1/K6, persalinan fasyankes), kesehatan anak (kematian neonatal/balita, imunisasi lengkap, ASI eksklusif, stunting), serta pelayanan calon pengantin & lansia.
              </p>
            </div>
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-400">Tabel 24 – Tabel 58</span>
              <button
                onClick={() => onNavigate('ibu')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:text-purple-700 cursor-pointer"
              >
                <span>Jelajahi Kesehatan Keluarga</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Pilar 5 */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md hover:border-orange-200 transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-orange-600 bg-orange-50">
                  <Stethoscope size={24} />
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-orange-50 text-orange-700">Bab 6</span>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Pengendalian Penyakit</h3>
              <p className="text-xs text-gray-600 leading-relaxed mb-4">
                Surveilans penyakit menular langsung (Tuberkulosis, HIV/AIDS, Hepatitis B, Kusta, Diare), Penyakit yang Dapat Dicegah Dengan Imunisasi (PD3I: Difteri, Campak, Pertusis), DBD, Malaria, & PTM.
              </p>
            </div>
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-400">Tabel 59 – Tabel 81</span>
              <button
                onClick={() => onNavigate('penyakit_menular')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-600 hover:text-orange-700 cursor-pointer"
              >
                <span>Jelajahi Pengendalian Penyakit</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Pilar 6 */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md hover:border-emerald-200 transition-all duration-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-emerald-600 bg-emerald-50">
                  <Droplets size={24} />
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700">Bab 7</span>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Kesehatan Lingkungan</h3>
              <p className="text-xs text-gray-600 leading-relaxed mb-4">
                Kualitas sarana air minum yang diawasi, akses terhadap sanitasi layak dan aman, desa Stop Buang Air Besar Sembarangan (BABS / STBM 5 Pilar), Tempat Pengelolaan Pangan (TPP), dan kualitas udara.
              </p>
            </div>
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-400">Tabel 82 – Tabel 88</span>
              <button
                onClick={() => onNavigate('lingkungan')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer"
              >
                <span>Jelajahi Kesling</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 6: TARGET PENGGUNA DASHBOARD                                      */}
      {/* ========================================================================= */}
      <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-10">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="text-xs font-bold tracking-wider uppercase text-teal-600 mb-1">Pemangku Kepentingan</div>
          <h2 className="text-2xl font-bold text-gray-900">Target Pengguna Dashboard</h2>
          <p className="text-sm text-gray-500 mt-1">Dirancang untuk melayani kebutuhan analitik berbagai institusi dan khalayak</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-gray-50/70 border border-gray-100 flex items-start gap-3.5 hover:bg-white hover:shadow-sm transition-all duration-200">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-teal-600 bg-teal-100/60 shrink-0">
              <Landmark size={18} />
            </div>
            <div>
              <div className="font-bold text-sm text-gray-800 mb-0.5">Dinas Kesehatan Provinsi</div>
              <div className="text-xs text-gray-500 leading-relaxed">Monitoring SPM tingkat provinsi dan penetapan target kebijakan tahunan.</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50/70 border border-gray-100 flex items-start gap-3.5 hover:bg-white hover:shadow-sm transition-all duration-200">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-cyan-600 bg-cyan-100/60 shrink-0">
              <Building size={18} />
            </div>
            <div>
              <div className="font-bold text-sm text-gray-800 mb-0.5">Dinkes Kabupaten/Kota</div>
              <div className="text-xs text-gray-500 leading-relaxed">Evaluasi kinerja fasilitas pelayanan kesehatan di wilayah masing-masing.</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50/70 border border-gray-100 flex items-start gap-3.5 hover:bg-white hover:shadow-sm transition-all duration-200">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lime-700 bg-lime-100/60 shrink-0">
              <Scale size={18} />
            </div>
            <div>
              <div className="font-bold text-sm text-gray-800 mb-0.5">Pemerintah Daerah & Bappeda</div>
              <div className="text-xs text-gray-500 leading-relaxed">Perencanaan pembangunan daerah dan alokasi anggaran sektor kesehatan.</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50/70 border border-gray-100 flex items-start gap-3.5 hover:bg-white hover:shadow-sm transition-all duration-200">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-purple-600 bg-purple-100/60 shrink-0">
              <Hospital size={18} />
            </div>
            <div>
              <div className="font-bold text-sm text-gray-800 mb-0.5">Fasyankes & RSUD</div>
              <div className="text-xs text-gray-500 leading-relaxed">Tolok ukur mutu layanan, rujukan medis, dan peningkatan sarana kesehatan.</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50/70 border border-gray-100 flex items-start gap-3.5 hover:bg-white hover:shadow-sm transition-all duration-200">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-orange-600 bg-orange-100/60 shrink-0">
              <Search size={18} />
            </div>
            <div>
              <div className="font-bold text-sm text-gray-800 mb-0.5">Peneliti & Lembaga Riset</div>
              <div className="text-xs text-gray-500 leading-relaxed">Studi epidemiologi, analisis multivariat, dan publikasi jurnal kesehatan.</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50/70 border border-gray-100 flex items-start gap-3.5 hover:bg-white hover:shadow-sm transition-all duration-200">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-indigo-600 bg-indigo-100/60 shrink-0">
              <GraduationCap size={18} />
            </div>
            <div>
              <div className="font-bold text-sm text-gray-800 mb-0.5">Akademisi & Perguruan Tinggi</div>
              <div className="text-xs text-gray-500 leading-relaxed">Bahan ajar epidemiologi dan pengabdian masyarakat bidang kesehatan.</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50/70 border border-gray-100 flex items-start gap-3.5 hover:bg-white hover:shadow-sm transition-all duration-200">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-pink-600 bg-pink-100/60 shrink-0">
              <BookOpen size={18} />
            </div>
            <div>
              <div className="font-bold text-sm text-gray-800 mb-0.5">Mahasiswa Kesehatan</div>
              <div className="text-xs text-gray-500 leading-relaxed">Referensi data resmi untuk skripsi, tesis, dan tugas ilmiah kesehatan.</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50/70 border border-gray-100 flex items-start gap-3.5 hover:bg-white hover:shadow-sm transition-all duration-200">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-emerald-600 bg-emerald-100/60 shrink-0">
              <Globe size={18} />
            </div>
            <div>
              <div className="font-bold text-sm text-gray-800 mb-0.5">Masyarakat Umum & Media</div>
              <div className="text-xs text-gray-500 leading-relaxed">Transparansi keterbukaan informasi publik dan edukasi kesehatan.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 7: SUMBER DATA & JAMINAN MUTU                                     */}
      {/* ========================================================================= */}
      <section className="bg-gradient-to-br from-slate-900 to-teal-950 text-white rounded-3xl p-6 md:p-10 shadow-lg relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold text-teal-300 bg-teal-900/50 border border-teal-700/50 mb-3">
              <Shield size={14} />
              Otoritas & Tata Kelola Data
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">
              Sumber Data Resmi & Terintegrasi
            </h2>
            <p className="text-sm text-gray-300 leading-relaxed mb-6">
              Seluruh dataset dikompilasi secara resmi oleh Dinas Kesehatan Provinsi Jawa Timur melalui pelaporan berjenjang dari Fasilitas Pelayanan Kesehatan (Puskesmas dan Rumah Sakit) di 38 Kabupaten/Kota. Data dikurasi dengan standar pedoman Profil Kesehatan Indonesia dari Kementerian Kesehatan Republik Indonesia.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <CheckCircle size={18} className="text-teal-400 shrink-0" />
                <span className="text-xs font-medium text-gray-200">Data Resmi Pemerintah</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <Layers size={18} className="text-cyan-400 shrink-0" />
                <span className="text-xs font-medium text-gray-200">Terintegrasi 38 Wilayah</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <ShieldCheck size={18} className="text-lime-400 shrink-0" />
                <span className="text-xs font-medium text-gray-200">Terstandarisasi Kemenkes</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <TrendingUp size={18} className="text-purple-400 shrink-0" />
                <span className="text-xs font-medium text-gray-200">Siap Analisis & Komparasi</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/15">
            <div className="text-xs uppercase tracking-wider text-teal-300 font-semibold mb-2">Status Integritas Sistem</div>
            <h3 className="text-lg font-bold mb-4">Pembaruan & Keandalan Basis Data</h3>

            <div className="space-y-3.5 text-xs text-gray-200">
              <div className="flex justify-between items-center pb-2.5 border-b border-white/10">
                <span className="text-gray-300">Penerbit Resmi</span>
                <span className="font-semibold text-white">Dinas Kesehatan Provinsi Jawa Timur</span>
              </div>
              <div className="flex justify-between items-center pb-2.5 border-b border-white/10">
                <span className="text-gray-300">Struktur Data</span>
                <span className="font-semibold text-white">76 Tabel Lampiran Profil Kesehatan</span>
              </div>
              <div className="flex justify-between items-center pb-2.5 border-b border-white/10">
                <span className="text-gray-300">Cakupan Wilayah</span>
                <span className="font-semibold text-white">100% Wilayah Jatim (29 Kab, 9 Kota)</span>
              </div>
              <div className="flex justify-between items-center pb-2.5 border-b border-white/10">
                <span className="text-gray-300">Frekuensi Pembaruan</span>
                <span className="font-semibold text-white">Tahunan (Sinkronisasi Database Berkala)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Format Standardisasi</span>
                <span className="font-semibold text-teal-300">Relational Database & JSON API</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 8: GALERI VISUAL SEKTOR KESEHATAN                                 */}
      {/* ========================================================================= */}
      <section>
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6">
          <div>
            <div className="text-xs font-bold tracking-wider uppercase text-teal-600 mb-1">Dokumentasi Layanan</div>
            <h2 className="text-2xl font-bold text-gray-900">Galeri Visual Layanan Kesehatan</h2>
            <p className="text-sm text-gray-500 mt-1">Potret dedikasi fasyankes dan tenaga medis di Jawa Timur</p>
          </div>

          {/* Gallery Category Filter */}
          <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'Semua Foto' },
              { key: 'fasyankes', label: 'Fasilitas Kesehatan' },
              { key: 'ibu_anak', label: 'Ibu & Anak' },
              { key: 'medis', label: 'Tenaga Medis' },
              { key: 'imunisasi', label: 'Imunisasi' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setGalleryFilter(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${galleryFilter === tab.key
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGallery.map(item => (
            <div
              key={item.id}
              onClick={() => setSelectedGalleryItem(item)}
              className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col"
            >
              <div className="relative h-52 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md text-[11px] font-semibold text-teal-700 shadow-sm">
                  {item.categoryLabel}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <span className="text-white text-xs font-medium inline-flex items-center gap-1">
                    <span>Lihat Detail Foto</span>
                    <ExternalLink size={12} />
                  </span>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-sm text-gray-800 mb-1 group-hover:text-teal-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-2">
                    {item.description}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-gray-400 font-medium pt-2 border-t border-gray-50">
                  <MapPin size={12} className="text-teal-600" />
                  <span>{item.location}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 9: MENGAPA DASHBOARD INI PENTING (INFOGRAFIS)                      */}
      {/* ========================================================================= */}
      <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-10">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="text-xs font-bold tracking-wider uppercase text-teal-600 mb-1">Nilai Strategis</div>
          <h2 className="text-2xl font-bold text-gray-900">Mengapa Dashboard Ini Penting?</h2>
          <p className="text-sm text-gray-500 mt-1">Dampak nyata implementasi analitik data dalam pembangunan kesehatan Jawa Timur</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="p-5 rounded-2xl bg-teal-50/50 border border-teal-100 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-teal-600 bg-white shadow-sm mb-4">
              <Clock size={24} />
            </div>
            <h3 className="font-bold text-sm text-gray-900 mb-2">Monitoring Cepat & Berkala</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Mempercepat deteksi dini fluktuasi indikator kesehatan tanpa harus menunggu laporan cetak tahunan.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-cyan-50/50 border border-cyan-100 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-cyan-600 bg-white shadow-sm mb-4">
              <Target size={24} />
            </div>
            <h3 className="font-bold text-sm text-gray-900 mb-2">Evaluasi Program Akurat</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Mengukur efektivitas intervensi program kesehatan masyarakat dengan metrik target SPM yang terukur.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-lime-50/50 border border-lime-100 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-lime-700 bg-white shadow-sm mb-4">
              <MapPin size={24} />
            </div>
            <h3 className="font-bold text-sm text-gray-900 mb-2">Wilayah Prioritas</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Memudahkan pimpinan mengidentifikasi daerah yang memerlukan alokasi bantuan sumber daya dan logistik.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-purple-50/50 border border-purple-100 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-purple-600 bg-white shadow-sm mb-4">
              <Eye size={24} />
            </div>
            <h3 className="font-bold text-sm text-gray-900 mb-2">Visualisasi Intuitif</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Mengubah tabel ribuan baris menjadi infografis dan peta interaktif yang mudah dipahami semua kalangan.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-orange-50/50 border border-orange-100 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-orange-600 bg-white shadow-sm mb-4">
              <FileCheck size={24} />
            </div>
            <h3 className="font-bold text-sm text-gray-900 mb-2">Evidence-Based Policy</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Mendukung penyusunan regulasi, perencanaan anggaran, dan kebijakan kesehatan berbasis bukti nyata.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 10: CALL TO ACTION BANNER                                         */}
      {/* ========================================================================= */}
      <section className="rounded-3xl p-8 md:p-12 text-center relative overflow-hidden bg-gradient-to-r from-teal-600 via-teal-700 to-cyan-700 text-white shadow-md">
        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-white backdrop-blur-sm mb-4">
            <Sparkles size={14} />
            Eksplorasi Data Lengkap
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight mb-4">
            Siap Menjelajahi Indikator Kesehatan Jawa Timur?
          </h2>
          <p className="text-sm sm:text-base text-teal-100 leading-relaxed mb-8 max-w-xl">
            Akses seluruh data demografi, sarana kesehatan, tenaga medis, kesehatan keluarga, dan pengendalian penyakit dalam satu platform terpadu.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('gambaran')}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-bold text-teal-800 bg-white hover:bg-teal-50 transition-all duration-200 shadow-lg active:scale-95 cursor-pointer text-sm"
            >
              <span>Buka Gambaran Umum</span>
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => setShowDocModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-white bg-teal-800/60 hover:bg-teal-800/80 border border-teal-400/40 transition-all duration-200 cursor-pointer text-sm"
            >
              <FileText size={16} />
              <span>Panduan & Metodologi</span>
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 11: FOOTER TERPADU                                                */}
      {/* ========================================================================= */}
      <footer className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-8 border-b border-gray-100">
          {/* Col 1: Branding & Address */}
          <div className="lg:col-span-5 flex flex-col items-start">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg" style={{ background: '#0FB0AA' }}>
                PK
              </div>
              <div>
                <div className="font-bold text-base text-gray-900 leading-tight">Profil Kesehatan</div>
                <div className="text-xs text-gray-500">Provinsi Jawa Timur</div>
              </div>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed mb-4 max-w-sm">
              Sistem informasi dan dashboard analitik resmi Dinas Kesehatan Provinsi Jawa Timur untuk penyajian data indikator kesehatan terpadu.
            </p>

            <div className="text-xs text-gray-600 space-y-1">
              <div className="font-medium text-gray-800">Dinas Kesehatan Provinsi Jawa Timur</div>
              <div>Jl. Ahmad Yani No. 118, Wonocolo, Surabaya, Jawa Timur 60231</div>
              <div>Telepon: (031) 8280910 | Email: dinkes@jatimprov.go.id</div>
            </div>
          </div>

          {/* Col 2: Quick Links Navigation */}
          <div className="lg:col-span-4">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-800 mb-3">Navigasi Modul Dashboard</div>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <button onClick={() => onNavigate('gambaran')} className="text-left hover:text-teal-600 transition-colors py-1 cursor-pointer">
                Gambaran Umum
              </button>
              <button onClick={() => onNavigate('sarana')} className="text-left hover:text-teal-600 transition-colors py-1 cursor-pointer">
                Sarana Kesehatan
              </button>
              <button onClick={() => onNavigate('sdm')} className="text-left hover:text-teal-600 transition-colors py-1 cursor-pointer">
                SDM Kesehatan
              </button>
              <button onClick={() => onNavigate('pembiayaan')} className="text-left hover:text-teal-600 transition-colors py-1 cursor-pointer">
                Pembiayaan Kesehatan
              </button>
              <button onClick={() => onNavigate('ibu')} className="text-left hover:text-teal-600 transition-colors py-1 cursor-pointer">
                Kesehatan Ibu
              </button>
              <button onClick={() => onNavigate('anak')} className="text-left hover:text-teal-600 transition-colors py-1 cursor-pointer">
                Kesehatan Anak
              </button>
              <button onClick={() => onNavigate('penyakit_menular')} className="text-left hover:text-teal-600 transition-colors py-1 cursor-pointer">
                Pengendalian Penyakit
              </button>
              <button onClick={() => onNavigate('lingkungan')} className="text-left hover:text-teal-600 transition-colors py-1 cursor-pointer">
                Kesehatan Lingkungan
              </button>
            </div>
          </div>

          {/* Col 3: System Badges */}
          <div className="lg:col-span-3">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-800 mb-3">Spesifikasi Sistem</div>
            <div className="space-y-2 text-xs text-gray-500">
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span>Versi Dashboard</span>
                <span className="font-semibold text-gray-800">v2.5.0 Enterprise</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span>Basis Data</span>
                <span className="font-semibold text-gray-800">PostgreSQL / REST</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span>Periode Data</span>
                <span className="font-semibold text-gray-800">2023 – 2025</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Akses Pengguna</span>
                <span className="font-semibold text-teal-600">Publik (Guest) & Admin</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <div>
            Hak Cipta &copy; 2025–2026 Dinas Kesehatan Provinsi Jawa Timur. Seluruh Hak Cipta Dilindungi.
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setShowDocModal(true)} className="hover:text-teal-600 cursor-pointer">
              Dokumentasi & Metodologi
            </button>
            <span>&bull;</span>
            <button onClick={() => onNavigate('admin')} className="hover:text-teal-600 cursor-pointer">
              Portal Admin
            </button>
          </div>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* MODAL 1: LIGHTBOX PREVIEW FOTO GALERI                                     */}
      {/* ========================================================================= */}
      {selectedGalleryItem && (
        <div className="fixed inset-0 z-50 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="relative h-72 sm:h-80">
              <img
                src={selectedGalleryItem.image}
                alt={selectedGalleryItem.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedGalleryItem(null)}
                className="absolute top-4 right-4 bg-gray-900/60 hover:bg-gray-900 text-white w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
              <div className="absolute top-4 left-4 bg-teal-600 text-white px-3 py-1 rounded-md text-xs font-semibold">
                {selectedGalleryItem.categoryLabel}
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-1.5 text-xs text-teal-700 font-medium mb-1">
                <MapPin size={14} />
                <span>{selectedGalleryItem.location}</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {selectedGalleryItem.title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-6">
                {selectedGalleryItem.description}
              </p>
              <div className="flex justify-end">
                <button
                  onClick={() => setSelectedGalleryItem(null)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Tutup Pratinjau
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: DOKUMENTASI & METODOLOGI                                         */}
      {/* ========================================================================= */}
      {showDocModal && (
        <div className="fixed inset-0 z-50 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-teal-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900">Dokumentasi & Metodologi Dashboard</h3>
                  <p className="text-xs text-gray-500">Pedoman operasional data Profil Kesehatan Provinsi Jawa Timur</p>
                </div>
              </div>
              <button
                onClick={() => setShowDocModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-gray-600 leading-relaxed">
              <div>
                <h4 className="font-bold text-sm text-gray-900 mb-2 flex items-center gap-2">
                  <Layers size={16} className="text-teal-600" />
                  1. Struktur Data & Sumber Informasi
                </h4>
                <p>
                  Data yang disajikan pada dashboard ini mengacu pada dokumen resmi Lampiran Profil Kesehatan Provinsi Jawa Timur Tahun 2025 yang diterbitkan oleh Dinas Kesehatan Provinsi Jawa Timur. Struktur data mencakup 76 tabel statistik baku yang dihimpun dari laporan rutin 38 Dinas Kesehatan Kabupaten/Kota dan fasilitas pelayanan kesehatan di seluruh wilayah Jawa Timur.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-sm text-gray-900 mb-2 flex items-center gap-2">
                  <Calculator size={16} className="text-teal-600" />
                  2. Metodologi Analisis Statistik
                </h4>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>
                    <strong className="text-gray-800">Statistik Deskriptif:</strong> Menghitung nilai Rata-rata (Mean), Median, Standar Deviasi, Kuartil 1, Kuartil 3, Nilai Minimum, dan Nilai Maksimum secara otomatis per indikator terpilih.
                  </li>
                  <li>
                    <strong className="text-gray-800">Analisis Korelasi Pearson (r):</strong> Mengukur derajat asosiasi linier antara dua indikator kuantitatif dengan formula koefisien korelasi Pearson.
                  </li>
                  <li>
                    <strong className="text-gray-800">Crosstab Matrix:</strong> Mengelompokkan wilayah ke dalam kuadran kategori (Rendah, Sedang, Tinggi) berdasarkan ambang batas distribusi statistik.
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-sm text-gray-900 mb-2 flex items-center gap-2">
                  <Target size={16} className="text-teal-600" />
                  3. Standar Pelayanan Minimal (SPM) Kesehatan
                </h4>
                <p>
                  Indikator prioritas kesehatan keluarga, imunisasi anak, dan penanggulangan penyakit menular diselaraskan dengan Peraturan Menteri Kesehatan mengenai Standar Teknis Pemenuhan Mutu Pelayanan Dasar pada SPM Bidang Kesehatan.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-sm text-gray-900 mb-2 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-teal-600" />
                  4. Pembaruan & Manajemen Data Admin
                </h4>
                <p>
                  Pengguna terautentikasi (Admin) dapat melakukan pembaruan data, penyesuaian nilai metrik, dan pemeliharaan tabel secara langsung melalui Portal Admin Dashboard dengan enkripsi token JWT.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
              <span className="text-xs text-gray-400">Dinas Kesehatan Provinsi Jawa Timur &copy; 2025</span>
              <button
                onClick={() => setShowDocModal(false)}
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                Mengerti & Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
