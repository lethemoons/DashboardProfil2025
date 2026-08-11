const fs = require('fs')
const path = require('path')

const dir = path.join(__dirname, 'src', 'pages')
const files = fs.readdirSync(dir)

files.forEach(file => {
  if (file.endsWith('.tsx')) {
    const fullPath = path.join(dir, file)
    let content = fs.readFileSync(fullPath, 'utf-8')
    
    // Remove the useState for tahun
    content = content.replace(/const\s+\[tahun,\s*setTahun\]\s*=\s*useState\([^)]+\)\r?\n?/, '')
    
    // Remove tahun and onTahun props from FilterBar
    content = content.replace(/tahun=\{tahun\}\s*/, '')
    content = content.replace(/onTahun=\{setTahun\}\s*/, '')
    
    // Some specific cases like onTahun={() => { }} in SaranaKesehatan.tsx
    content = content.replace(/onTahun=\{\(\)\s*=>\s*\{\s*\}\}\s*/, '')
    
    fs.writeFileSync(fullPath, content)
  }
})
console.log('Refactoring complete')
