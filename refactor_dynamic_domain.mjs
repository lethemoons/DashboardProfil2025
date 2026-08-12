import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Append getDynamicDomain to src/utils/stats.ts
const statsFile = path.join(__dirname, 'src', 'utils', 'stats.ts');
let statsContent = fs.readFileSync(statsFile, 'utf-8');

if (!statsContent.includes('getDynamicDomain')) {
  statsContent += `
/**
 * Calculates a dynamic domain max value with proportional padding.
 * @param dataMax The maximum value found in the data.
 * @param isPercentage Whether the indicator is explicitly a percentage.
 * @returns A nicely rounded maximum value with 5-10% padding.
 */
export const getDynamicDomain = (dataMax, isPercentage = false) => {
  if (dataMax == null || !isFinite(dataMax) || dataMax <= 0) return isPercentage ? 100 : 10;
  
  if (isPercentage) {
    if (dataMax <= 20) return 25;
    if (dataMax <= 45) return 50;
    if (dataMax <= 70) return 75;
    if (dataMax <= 90) return 95;
    return 100;
  }
  
  const magnitude = Math.pow(10, Math.floor(Math.log10(dataMax)));
  const padded = dataMax * 1.1; // 10% padding
  const normalized = padded / magnitude;
  
  let rounded = 10;
  if (normalized <= 1.2) rounded = 1.2;
  else if (normalized <= 1.5) rounded = 1.5;
  else if (normalized <= 2) rounded = 2;
  else if (normalized <= 2.5) rounded = 2.5;
  else if (normalized <= 3) rounded = 3;
  else if (normalized <= 4) rounded = 4;
  else if (normalized <= 5) rounded = 5;
  else if (normalized <= 6) rounded = 6;
  else if (normalized <= 8) rounded = 8;
  else rounded = 10;
  
  const result = rounded * magnitude;
  return result >= 10 ? Math.ceil(result) : Number(result.toFixed(2));
};
`;
  fs.writeFileSync(statsFile, statsContent, 'utf-8');
  console.log('Added getDynamicDomain to stats.ts');
}

// 2. Add imports and domains to charts
const pagesDir = path.join(__dirname, 'src', 'pages');
const filesToProcess = fs.readdirSync(pagesDir).map(f => path.join(pagesDir, f));
filesToProcess.push(path.join(__dirname, 'src', 'components', 'RankChart.tsx'));

for (const filePath of filesToProcess) {
  if (!filePath.endsWith('.tsx')) continue;
  let content = fs.readFileSync(filePath, 'utf-8');
  let originalContent = content;

  // Check if file even has BarChart
  if (!content.includes('<BarChart')) continue;

  // Ensure import
  if (!content.includes('getDynamicDomain')) {
    const importPath = '../utils/stats';
    if (content.includes('import { descStats')) {
      content = content.replace(/import\s*\{\s*(.*?)\s*\}\s*from\s*['"]\.\.\/utils\/stats['"]/, (match, p1) => {
        return "import { " + p1 + ", getDynamicDomain } from '../utils/stats';";
      });
    } else {
      content = content.replace(/(import .*? from '.*?';?\n)/, "$1import { getDynamicDomain } from '" + importPath + "';\n");
    }
  }

  // Inject domain
  if (filePath.endsWith('RankChart.tsx')) {
    content = content.replace(
      /<XAxis\s+type="number"\s+tick=\{\{\s*fontSize:\s*11\s*\}\}\s+tickFormatter=\{([^}]+)\}\s*\/>/g,
      '<XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={$1} domain={[0, (dataMax: any) => getDynamicDomain(dataMax, activeIndicator?.isPercentage)]} />'
    );
  } else {
    // Other files
    content = content.replace(/<XAxis\s+type="number"(\s+tick=\{.*?\})?(\s+tickFormatter=\{.*?\})?\s*\/>/g, (match, p1, p2) => {
      const t1 = p1 || '';
      const t2 = p2 || '';
      return '<XAxis type="number"' + t1 + t2 + ' domain={[0, (dataMax: any) => getDynamicDomain(dataMax, false)]} />';
    });
    content = content.replace(/<YAxis\s+type="number"(\s+tick=\{.*?\})?(\s+tickFormatter=\{.*?\})?\s*\/>/g, (match, p1, p2) => {
      const t1 = p1 || '';
      const t2 = p2 || '';
      return '<YAxis type="number"' + t1 + t2 + ' domain={[0, (dataMax: any) => getDynamicDomain(dataMax, false)]} />';
    });
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log("Updated " + path.basename(filePath));
  }
}
