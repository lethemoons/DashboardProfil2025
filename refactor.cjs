const fs = require('fs')
const path = require('path')

const dir = path.join(__dirname, 'src', 'pages')
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx') && f !== 'GambaranUmum.tsx')

for (const file of files) {
  const filePath = path.join(dir, file)
  let content = fs.readFileSync(filePath, 'utf8')
  
  if (!content.includes('../data/mockData')) continue

  // Find the mock data variables being imported (e.g., import { saranaKesehatan, sdmKesehatan } from '../data/mockData')
  const importMatch = content.match(/import\s+{\s*([^}]+)\s*}\s+from\s+['"]\.\.\/data\/mockData['"]/)
  if (!importMatch) continue
  
  const rawVars = importMatch[1].split(',').map(v => v.trim())
  const dataVars = rawVars.filter(v => v !== 'descStats' && v !== 'pearsonR')
  
  // Replace imports
  content = content.replace(
    /import\s+{\s*[^}]+\s*}\s+from\s+['"]\.\.\/data\/mockData['"]\r?\n(import\s+{\s*descStats.*)?/,
    `import { useDashboardData } from '../hooks/useDashboardData'\nimport { descStats, pearsonR } from '../utils/stats'\n`
  )
  
  // Clean up duplicate stats import if any
  content = content.replace(/import\s+{\s*descStats.*from\s+['"]\.\.\/data\/mockData['"]\r?\n/, '')

  // Inject the hook
  const componentMatch = content.match(/export\s+default\s+function\s+([a-zA-Z0-9_]+)\s*\(\)\s*{/)
  if (componentMatch) {
    const compName = componentMatch[1]
    const hookVars = dataVars.join(', ')
    // Since all variables are present in the unified `data` array (KabRow[]), we can just assign `data` to the first expected variable.
    // E.g., if page expects `saranaKesehatan`, we do: const { data: saranaKesehatan, loading, error } = useDashboardData()
    // If it expects multiple (which shouldn't happen based on the dashboard structure, but just in case), we just alias the first one and the rest point to it.
    let hookStr = `  const { data: ${dataVars[0]}, loading, error } = useDashboardData()\n`
    if (dataVars.length > 1) {
      for (let i = 1; i < dataVars.length; i++) {
        hookStr += `  const ${dataVars[i]} = ${dataVars[0]}\n`
      }
    }
    hookStr += `  if (loading) return <div className="p-8 text-center text-gray-500">Loading data...</div>\n  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>\n`
    
    content = content.replace(
      /export\s+default\s+function\s+[a-zA-Z0-9_]+\s*\(\)\s*{/,
      `export default function ${compName}() {\n${hookStr}`
    )
  }

  fs.writeFileSync(filePath, content, 'utf8')
  console.log(`Refactored ${file}`)
}

console.log('Done.')
