const fs = require('fs')
const path = require('path')

const dir = path.join(__dirname, 'src', 'pages')
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx') && !f.includes('Admin'))

for (const file of files) {
  const filePath = path.join(dir, file)
  let content = fs.readFileSync(filePath, 'utf8')
  
  if (!content.includes('useDashboardData')) continue

  // Remove the old early returns
  content = content.replace(/  if \(loading\) return <div className="p-8 text-center text-gray-500">Loading data...<\/div>\r?\n/g, '')
  content = content.replace(/  if \(error\) return <div className="p-8 text-center text-red-500">Error: {error}<\/div>\r?\n/g, '')
  
  // Also we need to fix GambaranUmum.tsx useMemo missing demografi dependency
  if (file === 'GambaranUmum.tsx') {
    content = content.replace(/, \[kab\]\)/, ', [kab, demografi])')
  } else {
    // For other files, we should also try to inject the missing dependency if they use useMemo.
    // They usually do: useMemo(() => kab === 'all' ? varName : varName.filter(...), [kab])
    content = content.replace(/useMemo\(\(\) => kab === 'all' \? ([a-zA-Z0-9_]+) : \1\.filter\(.*?\), \[kab\]\)/g, "useMemo(() => kab === 'all' ? $1 : $1.filter(d => d.kabupaten === kab), [kab, $1])")
  }

  // Find the last return ( which is the main render return
  // We can just find the first `  return (\n    <div className="flex flex-col` or similar.
  // Almost all pages have `  return (`
  const returnStr = `  if (loading) return <div className="p-8 text-center text-gray-500">Loading data...</div>\n  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>\n\n  return (`
  
  content = content.replace(/  return \(/, returnStr)

  fs.writeFileSync(filePath, content, 'utf8')
  console.log(`Fixed hooks in ${file}`)
}

console.log('Done.')
