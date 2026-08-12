const fs = require('fs');

const content = fs.readFileSync('data cakupan ibu.csv', 'utf8');
const lines = content.trim().split('\n');
const data = {};

for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  const values = [];
  let inQuotes = false;
  let current = '';
  for (let char of line) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());
  
  if (values.length < 2) continue;
  let kab = values[0];
  if(!kab) continue;
  
  // Normalize kabupaten name to match frontend logic
  if (kab.startsWith('KAB. ')) {
    kab = kab.replace('KAB. ', '').split(' ').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
  } else if (kab.startsWith('KOTA ')) {
    kab = 'Kota ' + kab.replace('KOTA ', '').split(' ').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
  }
  
  const parseVal = (val) => {
    if (!val) return 0;
    const num = parseFloat(val.replace(/,/g, ''));
    return isNaN(num) ? 0 : num;
  };
  
  data[kab] = {
    anak_lahir_hidup: parseVal(values[7]),
    jumlah_hb0: parseVal(values[19]),
    hb0_pct: parseVal(values[20]),
    jumlah_bcg: parseVal(values[21]),
    bcg_pct: parseVal(values[22]),
    jumlah_campak_rubela: parseVal(values[23]),
    campak_rubela_pct: parseVal(values[24]),
    jumlah_imunisasi_dasar_lengkap: parseVal(values[25]),
    imunisasi_dasar_lengkap_pct: parseVal(values[26]),
    jumlah_dpt_hb_hib3: parseVal(values[27]),
    dpt_hb_hib3_pct: parseVal(values[28]),
    jumlah_polio4: parseVal(values[29]),
    polio4_pct: parseVal(values[30])
  };
}

if (!fs.existsSync('src/data')) {
    fs.mkdirSync('src/data', { recursive: true });
}
fs.writeFileSync('src/data/anakCsvData.ts', 'export const ANAK_CSV_DATA: Record<string, any> = ' + JSON.stringify(data, null, 2) + ';\n');
console.log('Successfully generated src/data/anakCsvData.ts');
