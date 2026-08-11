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

  // 1. Empty stat insights arrays
  content = content.replace(/const statInsights = \[\s*`.*?`,\s*`.*?`,\s*\]/g, 'const statInsights: string[] = []');
  content = content.replace(/const statInsights = \[\s*`.*?`,\s*\]/g, 'const statInsights: string[] = []');
  content = content.replace(/const menularStatInsights = \[\s*`.*?`,\s*`.*?`,\s*`.*?`,\s*\]/g, 'const menularStatInsights: string[] = []');
  content = content.replace(/const ibuStatInsights = \[\s*`.*?`,\s*`.*?`,\s*`.*?`,\s*\]/g, 'const ibuStatInsights: string[] = []');
  content = content.replace(/const pd3iStatInsights = \[\s*`.*?`,\s*`.*?`,\s*\]/g, 'const pd3iStatInsights: string[] = []');
  content = content.replace(/const vektorStatInsights = \[\s*`.*?`,\s*\]/g, 'const vektorStatInsights: string[] = []');
  content = content.replace(/const ptmStatInsights = \[\s*`.*?`,\s*`.*?`,\s*\]/g, 'const ptmStatInsights: string[] = []');
  content = content.replace(/const anakStatInsights = \[\s*`.*?`,\s*`.*?`,\s*\]/g, 'const anakStatInsights: string[] = []');
  content = content.replace(/const lansiaStatInsights = \[\s*`.*?`,\s*\]/g, 'const lansiaStatInsights: string[] = []');
  
  // Actually, a safer way to empty them is to just match `const [a-zA-Z]*StatInsights = [` and safely empty it,
  // but regexes can be dangerous. It's safer to just let the above simple regexes catch most.
  // We can just find any variable ending in `StatInsights` and set it to empty array.
  content = content.replace(/const ([a-zA-Z]*[sS]tatInsights) = \[\s*[^\]]*\s*\]/g, 'const $1: string[] = []');

  // 2. Change Bar colors
  // The user says "samakan warna setiap bar (menggunakan warna teal)"
  // I will just do string replacement for the hex codes inside <Bar and <Cell and <Scatter
  content = content.replace(/fill="#ef4444"/g, 'fill="#0FB0AA"');
  content = content.replace(/fill="#3b82f6"/g, 'fill="#0FB0AA"');
  content = content.replace(/fill="#f97316"/g, 'fill="#0FB0AA"');
  content = content.replace(/fill="#8b5cf6"/g, 'fill="#0FB0AA"');
  content = content.replace(/fill="#fca5a5"/g, 'fill="#0FB0AA"');
  content = content.replace(/fill="#c4b5fd"/g, 'fill="#0FB0AA"');
  content = content.replace(/fill="#fee2e2"/g, 'fill="#0FB0AA"');
  content = content.replace(/fill="#60a5fa"/g, 'fill="#0FB0AA"');
  content = content.replace(/fill="#bfdbfe"/g, 'fill="#0FB0AA"');
  content = content.replace(/fill="#fb923c"/g, 'fill="#0FB0AA"');

  fs.writeFileSync(filePath, content, 'utf-8');
}

console.log('Insights emptied and colors unified.');
