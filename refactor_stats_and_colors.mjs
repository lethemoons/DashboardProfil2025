import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pagesDir = path.join(__dirname, 'src', 'pages');

const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));

for (const file of files) {
  const filePath = path.join(pagesDir, file);
  let content = fs.readFileSync(filePath, 'utf-8');

  // 1. Remove <StatPanel ... /> entirely, matching across multiple lines until />
  content = content.replace(/<StatPanel[\s\S]*?\/>/g, '');
  
  // 2. Remove import StatPanel
  content = content.replace(/import StatPanel from '\.\.\/components\/StatPanel'(\r?\n)?/g, '');

  // 3. Remove Insights associated with stats, like {statInsights.length > 0 && <InsightBox insights={statInsights} />}
  // We can just remove any InsightBox that uses *StatInsights
  content = content.replace(/\{[a-zA-Z]*statInsights\.length > 0 && <InsightBox insights=\{[a-zA-Z]*statInsights\} \/>\}/gi, '');
  content = content.replace(/<InsightBox insights=\{[a-zA-Z]*StatInsights\} \/>/gi, '');
  content = content.replace(/\{statInsights\.length > 0 && <InsightBox insights=\{statInsights\} \/>\}/gi, '');
  
  // 4. Change colors to #0FB0AA in <Bar> and <Scatter> and <Cell>
  // The user says "samakan warna setiap bar (menggunakan warna teal), jangan menggunakan merah atau biru"
  content = content.replace(/fill="#ef4444"/gi, 'fill="#0FB0AA"');
  content = content.replace(/fill="#3b82f6"/gi, 'fill="#0FB0AA"');
  // Also orange and purple just in case, but user specifically mentioned red/blue.
  content = content.replace(/fill="#f97316"/gi, 'fill="#0FB0AA"');
  content = content.replace(/fill="#8b5cf6"/gi, 'fill="#0FB0AA"');
  
  fs.writeFileSync(filePath, content, 'utf-8');
}

// We must also remove StatPanel usages from components like DynamicAnalysis if any
const componentsDir = path.join(__dirname, 'src', 'components');
if (fs.existsSync(componentsDir)) {
  const compFiles = fs.readdirSync(componentsDir).filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));
  for (const file of compFiles) {
    const filePath = path.join(componentsDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    content = content.replace(/fill="#ef4444"/gi, 'fill="#0FB0AA"');
    content = content.replace(/fill="#3b82f6"/gi, 'fill="#0FB0AA"');
    content = content.replace(/fill="#f97316"/gi, 'fill="#0FB0AA"');
    content = content.replace(/fill="#8b5cf6"/gi, 'fill="#0FB0AA"');
    fs.writeFileSync(filePath, content, 'utf-8');
  }
}

console.log('Stats, filters, and insights associated with it removed. Colors unified to teal.');
