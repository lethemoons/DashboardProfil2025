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
    console.log(`\n--- ${page} NOT FOUND ---`);
    continue;
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  console.log(`\n--- ${page} ---`);
  
  // Find arrays like const X = [ { key: '...', label: '...' } ]
  let match;
  const regex = /const\s+([A-Za-z0-9_]+)\s*=\s*\[([\s\S]*?)\]/g;
  let found = false;
  while ((match = regex.exec(content)) !== null) {
    if (match[2].includes('key:')) {
      const firstKey = match[2].match(/key:\s*['"]([^'"]+)['"]/);
      console.log(`Array: ${match[1]}, First key: ${firstKey ? firstKey[1] : 'unknown'}`);
      found = true;
    }
  }
  if (!found) {
    console.log('No indicator arrays found!');
  }
}
