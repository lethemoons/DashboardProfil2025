import * as XLSX from 'xlsx'

/**
 * Port TypeScript dari backend/parse_excel.py.
 * Parsing Excel dilakukan di browser sehingga tidak butuh Python di server
 * dan tidak terkena batas ukuran upload Vercel (4.5MB).
 */

export interface ParsedRow {
  table_no: number
  no: string
  kabupaten: string
  metric: string
  value: string
}

type Cell = string | number | boolean | null | undefined

const PROVINCE_ONLY = new Set([2, 3, 4, 9, 10, 19, 21, 34, 62])
const KAB_RE = /^(KAB\.\s*|KOTA\s)/i
const PROV_RE = /^PROVINSI$/i
const FOOT_RE = /^(SUMBER|CATATAN|Sumber|Catatan)/

const isNum = (v: Cell): v is number => typeof v === 'number'
const isPresent = (v: Cell) => v !== null && v !== undefined

function cleanColName(raw: string): string {
  let name = String(raw).trim()
  const n = Number(name)
  if (name !== '' && !isNaN(n) && Number.isInteger(n)) name = String(n)
  name = name.toLowerCase()
  name = name.replace(/[^\p{L}\p{N}_\s+/]/gu, '')
  name = name.replace(/[\s/]+/g, '_')
  name = name.replace(/_+/g, '_')
  return name.replace(/^_+|_+$/g, '')
}

function isColumnNumberRow(row: Cell[]): boolean {
  const vals = row.filter(v => isPresent(v) && String(v).trim() !== '')
  if (!vals.length) return false
  if (!vals.every(v => isNum(v))) return false
  return vals.every((v, i) => Math.trunc(v as number) === i + 1)
}

function mergeHeaders(headerRows: Cell[][]): string[] {
  const ncols = Math.max(...headerRows.map(r => r.length))
  const filled = headerRows.map(row => {
    const r = [...row]
    while (r.length < ncols) r.push(null)
    let last: string | null = null
    for (let i = 0; i < ncols; i++) {
      const v = r[i]
      if (isPresent(v) && String(v).trim() && String(v).trim() !== 'nan') last = String(v).trim()
      else r[i] = last
    }
    return r
  })
  const names: string[] = []
  for (let c = 0; c < ncols; c++) {
    const parts = filled
      .map(r => r[c])
      .filter(v => isPresent(v) && String(v).trim() !== 'nan')
      .map(v => String(v).trim())
    names.push(parts.length ? cleanColName(parts.join(' ')) : `col_${c}`)
  }
  return names
}

function safeVal(v: Cell): string | number | null {
  if (!isPresent(v)) return null
  if (isNum(v)) return isFinite(v) ? v : null
  const s = String(v).trim()
  if (['#DIV/0!', '-', '', 'nan'].includes(s)) return null
  if (['#VALUE!', '#REF!', '#N/A'].includes(s.toUpperCase())) return null
  return s
}

function sheetRows(ws: XLSX.WorkSheet): Cell[][] {
  if (!ws['!ref']) return []
  const range = XLSX.utils.decode_range(ws['!ref'])
  range.s = { r: 0, c: 0 } // mulai dari A1 agar kolom B = index 1
  const rows = XLSX.utils.sheet_to_json<Cell[]>(ws, { header: 1, raw: true, defval: null, blankrows: true, range })
  // Buang baris kosong di bagian akhir (mirip openpyxl)
  return rows
}

export async function parseExcelFile(file: File): Promise<ParsedRow[]> {
  const buf = await file.arrayBuffer()
  const wb = XLSX.read(buf, { type: 'array', cellFormula: false, cellHTML: false, cellText: false })
  const out: ParsedRow[] = []

  for (let s = 1; s < 89; s++) {
    if (PROVINCE_ONLY.has(s)) continue
    const ws = wb.Sheets[String(s)]
    if (!ws) continue
    const allRows = sheetRows(ws)
    if (!allRows.length) continue

    const firstIdx = allRows.findIndex(r => r.length > 1 && isPresent(r[1]) && KAB_RE.test(String(r[1])))
    if (firstIdx < 0) continue

    let parsed: (string | number | null)[][] = []
    for (const r of allRows.slice(firstIdx)) {
      if (!r || r.length < 2) continue
      const b = isPresent(r[1]) ? String(r[1]).trim() : ''
      if (!b || !KAB_RE.test(b)) {
        if (PROV_RE.test(b)) continue
        if (FOOT_RE.test(String(r[0] ?? ''))) break
        continue
      }
      parsed.push(r.map(safeVal))
    }
    parsed = parsed.filter(row => row[1] !== null && KAB_RE.test(String(row[1])))
    if (!parsed.length) continue

    let width = 2
    for (const row of parsed) {
      for (let ci = row.length - 1; ci >= 0; ci--) {
        if (row[ci] !== null) { width = Math.max(width, ci + 1); break }
      }
    }
    parsed.forEach(row => row.splice(width))

    let headerRaw: Cell[][] = []
    for (let i = firstIdx - 1; i >= Math.max(firstIdx - 8, 0); i--) {
      const r = allRows[i] || []
      if (isColumnNumberRow(r)) continue
      const t = r.slice(0, width)
      while (t.length < width) t.push(null)
      if (t.some(isPresent)) headerRaw.push(t)
      if (headerRaw.length >= 2) break
    }
    headerRaw.reverse()
    if (!headerRaw.length) {
      const f = firstIdx > 0 ? [...allRows[firstIdx - 1]] : []
      while (f.length < width) f.push(null)
      headerRaw = [f.slice(0, width)]
    }

    let cols = mergeHeaders(headerRaw)
    while (cols.length < width) cols.push(`col_${cols.length}`)
    cols = cols.slice(0, width)
    cols[0] = 'no'
    if (cols.length > 1) cols[1] = 'kabupaten'

    for (const row of parsed) {
      const kab = String(row[1])
      const no = row[0] !== null && row[0] !== undefined ? String(row[0]) : ''
      for (let ci = 2; ci < cols.length; ci++) {
        const v = row[ci]
        if (v !== null && v !== undefined) {
          out.push({ table_no: s, no, kabupaten: kab, metric: cols[ci], value: String(v) })
        }
      }
    }
  }
  return out
}
