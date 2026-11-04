// Beri warna berbeda untuk tiap seri <Bar> dalam grouped/stacked BarChart.
// Usage: node fix_group_colors.mjs [--dry]
import fs from 'fs'
import path from 'path'

const DRY = process.argv.includes('--dry')
const PALETTE = ['#0F8F8B', '#F59E0B', '#8B5CF6', '#078FA5', '#EF4444', '#EC4899', '#64748B']
const BASE = '"#0F8F8B"'
const dir = 'src'

function walk(d) {
  return fs.readdirSync(d, { withFileTypes: true }).flatMap(e =>
    e.isDirectory() ? walk(path.join(d, e.name)) : e.name.endsWith('.tsx') ? [path.join(d, e.name)] : [])
}

let total = 0
for (const file of walk(dir)) {
  let src = fs.readFileSync(file, 'utf8')
  let out = ''
  let pos = 0
  let changed = 0
  const re = /<BarChart[\s>]/g
  let m
  while ((m = re.exec(src))) {
    const start = m.index
    const end = src.indexOf('</BarChart>', start)
    if (end < 0) break
    let block = src.slice(start, end)
    // posisi tiap <Bar (bukan <BarChart)
    const idx = [...block.matchAll(/<Bar(?=[\s\n])/g)].map(x => x.index)
    if (idx.length >= 2) {
      let nb = ''
      let p = 0
      idx.forEach((bi, i) => {
        const segEnd = i + 1 < idx.length ? idx[i + 1] : block.length
        let seg = block.slice(bi, segEnd)
        // warna yang sudah ditentukan di <Bar fill="...">?
        const head = seg.split(/let color|<Cell|\n\s*\n/)[0]
        const existing = head.match(/\sfill=["']([^"']+)["']/)
        let color = existing ? existing[1] : PALETTE[i % PALETTE.length]
        if (existing && existing[1].toUpperCase() === '#0F8F8B' && i > 0) {
          color = PALETTE[i % PALETTE.length]
          seg = seg.replace(existing[0], ` fill="${color}"`)
        } else if (!existing) {
          seg = seg.replace(/^<Bar/, `<Bar fill="${color}"`)
        }
        seg = seg.split(`let color = ${BASE};`).join(`let color = "${color}";`)
        nb += block.slice(p, bi) + seg
        p = segEnd
      })
      nb += block.slice(p)
      if (nb !== block) { changed++; block = nb }
    }
    out += src.slice(pos, start) + block
    pos = end
    re.lastIndex = end
  }
  out += src.slice(pos)
  if (changed) {
    total += changed
    console.log(`${file}: ${changed} chart(s)`)
    if (!DRY) fs.writeFileSync(file, out)
  }
}
console.log(`Total: ${total} grouped chart(s) ${DRY ? '(dry run)' : 'updated'}`)
