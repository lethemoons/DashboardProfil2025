export const KABUPATEN_LIST = [
  'Pacitan', 'Ponorogo', 'Trenggalek', 'Tulungagung', 'Blitar',
  'Kediri', 'Malang', 'Lumajang', 'Jember', 'Banyuwangi',
  'Bondowoso', 'Situbondo', 'Probolinggo', 'Pasuruan', 'Sidoarjo',
  'Mojokerto', 'Jombang', 'Nganjuk', 'Madiun', 'Magetan',
  'Ngawi', 'Bojonegoro', 'Tuban', 'Lamongan', 'Gresik',
  'Bangkalan', 'Sampang', 'Pamekasan', 'Sumenep',
  'Kota Kediri', 'Kota Blitar', 'Kota Malang', 'Kota Probolinggo',
  'Kota Pasuruan', 'Kota Mojokerto', 'Kota Madiun', 'Kota Surabaya', 'Kota Batu'
]

export const TAHUN_LIST = ['2023', '2024', '2025']

// Seeded deterministic random based on index
function seeded(idx: number, offset: number = 0): number {
  const x = Math.sin(idx * 9301 + offset * 49297 + 233) * 93477
  return x - Math.floor(x)
}

export function r(idx: number, min: number, max: number, offset = 0): number {
  return Math.round(min + seeded(idx, offset) * (max - min))
}

export function rf(idx: number, min: number, max: number, offset = 0, decimals = 1): number {
  return parseFloat((min + seeded(idx, offset) * (max - min)).toFixed(decimals))
}
