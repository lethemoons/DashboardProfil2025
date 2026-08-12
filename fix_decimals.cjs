const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let originalContent = content;

  // 1. Replace hardcoded "96.4%" -> "96,4%" in value/sub/title attributes and JSX text
  // We can just replace \d+\.\d+% globally in the file (safe for text)
  content = content.replace(/(\d+)\.(\d+)(%)/g, "$1,$2$3");

  // Also replace in sub="Penderita mendapat pelayanan 96.5%"
  // Actually the above regex catches "96.5%" in any string/text.
  
  // 2. Replace \.toFixed(\d+) with toLocaleString('id-ID', ...)
  // But skip src/data/kabupaten.ts because it's used for data generation logic (parseFloat)
  if (!filePath.endsWith('kabupaten.ts')) {
    content = content.replace(/\.toFixed\((\d+)\)/g, (match, digits) => {
      return `.toLocaleString('id-ID', { minimumFractionDigits: ${digits}, maximumFractionDigits: ${digits} })`;
    });
  }

  // 3. Fix any hardcoded dot decimals in KPICard value="34.5"
  content = content.replace(/(value|sub)="([^"]+)"/g, (match, attr, val) => {
    let newVal = val.replace(/(\d+)\.(\d+)/g, "$1,$2");
    return `${attr}="${newVal}"`;
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log('Fixed decimals in:', filePath);
  }
}

function walkDir(dir) {
  fs.readdirSync(dir).forEach(f => {
    let p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      walkDir(p);
    } else if (p.endsWith('.tsx') || p.endsWith('.ts')) {
      processFile(p);
    }
  });
}

walkDir(path.join('d:/dashboard_dinkes', 'src'));
