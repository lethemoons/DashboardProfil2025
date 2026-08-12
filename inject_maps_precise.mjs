import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pagesDir = path.join(__dirname, 'src', 'pages');

const configs = [
  {
    file: 'GambaranUmum.tsx',
    array: 'INDICATOR_OPTIONS',
    defaultVal: 'jumlah_penduduk_desa_+_kelurahan'
  },
  {
    file: 'AksesMutu.tsx',
    array: 'RS_OPTIONS',
    defaultVal: 'bor'
  },
  {
    file: 'SDMKesehatan.tsx',
    array: 'indicators',
    defaultVal: 'indicators[0]',
    isStringArray: true
  },
  {
    file: 'KesehatanIbu.tsx',
    array: 'IBU_OPTIONS',
    defaultVal: 'k1_pct'
  },
  {
    file: 'KesehatanAnak.tsx',
    array: 'ANAK_OPTIONS',
    defaultVal: 'gizi_kurang_pct'
  },
  {
    file: 'UsiaProduktifLansia.tsx',
    array: 'OPTIONS',
    defaultVal: 'produktif_laki'
  },
  {
    file: 'PenyakitMenular.tsx',
    array: 'OPTIONS',
    defaultVal: 'tbc_kasus'
  },
  {
    file: 'PD3I.tsx',
    array: 'PD3I_OPTIONS',
    defaultVal: 'difteri_kasus'
  },
  {
    file: 'TularVektor.tsx',
    array: 'OPTIONS',
    defaultVal: 'dbd_kasus'
  },
  {
    file: 'PenyakitTidakMenular.tsx',
    array: 'PTM_OPTIONS',
    defaultVal: 'hipertensi_laki'
  },
  {
    file: 'KesehatanLingkungan.tsx',
    array: 'KESLING_OPTIONS',
    defaultVal: 'air_minum_memenuhi_syarat_pct'
  }
];

for (const cfg of configs) {
  const filePath = path.join(pagesDir, cfg.file);
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, 'utf-8');
  let originalContent = content;

  // 1. Add import
  if (!content.includes('ChoroplethMap')) {
    content = content.replace(/(import .*? from '.*?';?\\n|import .*? from '.*?';?\r?\n)/, "$1import ChoroplethMap from '../components/ChoroplethMap';\n");
  }

  // 2. Add useState
  const functionMatch = content.match(/export default function [a-zA-Z0-9_]+\(\)\s*\{/);
  if (functionMatch && !content.includes('const [mapIndicator, setMapIndicator]')) {
    const insertPos = functionMatch.index + functionMatch[0].length;
    let defVal = "'" + cfg.defaultVal + "'";
    if (cfg.isStringArray) defVal = 'indicators[0] || ""';
    
    content = content.slice(0, insertPos) +
      '\n  const [mapIndicator, setMapIndicator] = useState(' + defVal + ');' +
      content.slice(insertPos);
  }

  // 3. Prepare JSX
  let optionsJsx = '';
  let labelLookup = '';
  
  if (cfg.isStringArray) {
    optionsJsx = "              {indicators.map(ind => <option key={ind} value={ind}>{ind.replace(/_/g, ' ').replace(/\\b\\w/g, l => l.toUpperCase())}</option>)}";
    labelLookup = "mapIndicator ? mapIndicator.replace(/_/g, ' ').replace(/\\b\\w/g, l => l.toUpperCase()) : ''";
  } else {
    optionsJsx = "              {" + cfg.array + ".map(opt => (\n" +
                 "                <option key={opt.key} value={opt.key}>{opt.label}</option>\n" +
                 "              ))}";
    labelLookup = cfg.array + ".find(o => o.key === mapIndicator)?.label || ''";
  }

  const mapJsx = `

      {/* CHOROPLETH MAP SECTION */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm mt-2 mb-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <h3 className="font-semibold text-gray-800" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Peta Sebaran Provinsi Jawa Timur</h3>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs text-gray-500 font-medium">Indikator:</span>
            <select 
              value={mapIndicator} 
              onChange={e => setMapIndicator(e.target.value)}
              className="text-xs font-medium border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[#0F8F8B] bg-gray-50 text-gray-700 max-w-[200px] truncate"
            >
` + optionsJsx + `
            </select>
          </div>
        </div>
        
        <ChoroplethMap 
          data={data} 
          indicatorKey={mapIndicator} 
          indicatorLabel={` + labelLookup + `} 
        />
      </div>`;

  // 4. Inject right after the KPI grid
  if (!content.includes('CHOROPLETH MAP SECTION')) {
    content = content.replace(/(<\/KPICard>\s*<\/div>)/, "$1" + mapJsx);
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log("Updated " + cfg.file);
  }
}
