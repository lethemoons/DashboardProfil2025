import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pagesDir = path.join(__dirname, 'src', 'pages');
const targetPages = [
  'GambaranUmum.tsx',
  'AksesMutu.tsx',
  'SDMKesehatan.tsx',
  'KesehatanIbu.tsx',
  'KesehatanAnak.tsx',
  'UsiaProduktifLansia.tsx',
  'PenyakitMenular.tsx',
  'PD3I.tsx',
  'TularVektor.tsx',
  'PenyakitTidakMenular.tsx',
  'KesehatanLingkungan.tsx'
];

for (const page of targetPages) {
  const filePath = path.join(pagesDir, page);
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping \${page} - not found`);
    continue;
  }
  
  let content = fs.readFileSync(filePath, 'utf-8');
  let originalContent = content;

  // 1. Add import
  if (!content.includes('ChoroplethMap')) {
    content = content.replace(/(import .*? from '.*?';?\n)/, "$1import ChoroplethMap from '../components/ChoroplethMap';\n");
  }

  // 2. Find indicator array and default from RankChart
  let indicatorArray = '';
  let defaultIndicator = '';
  const rankChartMatch = content.match(/<RankChart[^>]*indicators=\{([a-zA-Z0-9_]+)\}[^>]*defaultIndicator=["']([^"']+)["'][^>]*\/>/);
  if (rankChartMatch) {
    indicatorArray = rankChartMatch[1];
    defaultIndicator = rankChartMatch[2];
  } else {
    // If no RankChart, try to find another indicator array like ALL_FASILITAS or indicatorOptions
    const allFasilitasMatch = content.match(/const\s+(ALL_[A-Z_]+|INDICATOR_OPTIONS|indicators)\s*=\s*\[/);
    if (allFasilitasMatch) {
      indicatorArray = allFasilitasMatch[1];
      const firstKeyMatch = content.match(/key:\s*['"]([^'"]+)['"]/);
      if (firstKeyMatch) defaultIndicator = firstKeyMatch[1];
    }
  }
  
  if (!indicatorArray || !defaultIndicator) {
    console.log(`Could not find indicator array or default for \${page}. Using fallback.`);
    indicatorArray = 'indicatorOptions'; // fallback, may cause error
    defaultIndicator = 'fallback_key';
  }

  // Find the component function to insert useState
  const functionMatch = content.match(/export default function [a-zA-Z0-9_]+\(\)\s*\{/);
  if (functionMatch && !content.includes('const [mapIndicator, setMapIndicator]')) {
    const insertPos = functionMatch.index + functionMatch[0].length;
    content = content.slice(0, insertPos) +
      `\n  const [mapIndicator, setMapIndicator] = useState('${defaultIndicator}');` +
      content.slice(insertPos);
  }

  // 3. Inject Map JSX right after KPI Cards
  // Usually the KPI cards end with `</KPICard>\n      </div>` or `/>\n      </div>`
  // We'll look for `<div className="grid grid-cols-...` and find its matching closing div.
  // A simpler regex: find the block of KPICards.
  const mapJsx = `

      {/* CHOROPLETH MAP SECTION */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm mt-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <h3 className="font-semibold text-gray-800" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Peta Sebaran Provinsi Jawa Timur</h3>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs text-gray-500 font-medium">Indikator:</span>
            <select 
              value={mapIndicator} 
              onChange={e => setMapIndicator(e.target.value)}
              className="text-xs font-medium border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#0F8F8B] bg-gray-50 text-gray-700 max-w-[200px] truncate"
            >
              {\${indicatorArray}.map(opt => (
                <option key={opt.key} value={opt.key}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
        
        <ChoroplethMap 
          data={data} 
          indicatorKey={mapIndicator} 
          indicatorLabel={\${indicatorArray}.find(o => o.key === mapIndicator)?.label || ''} 
        />
      </div>`;

  if (!content.includes('CHOROPLETH MAP SECTION')) {
    // Inject right before RankChart, or if no RankChart, before CrosstabSection or StatPanel
    if (content.includes('<RankChart')) {
      content = content.replace(/(<RankChart)/, mapJsx.trim() + '\n\n      $1');
    } else if (content.includes('<StatPanel')) {
      content = content.replace(/(<StatPanel)/, mapJsx.trim() + '\n\n      $1');
    } else {
      console.log(`Could not find anchor for map in \${page}`);
    }
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated \${page}`);
  }
}
