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

  // 1. Remove InsightBox rendering blocks for statInsights
  // This matches {xxxStatInsights.length > 0 && <InsightBox insights={xxxStatInsights} />}
  content = content.replace(/\{[a-zA-Z]*[sS]tatInsights\.length > 0 && <InsightBox insights=\{[a-zA-Z]*[sS]tatInsights\} \/>\}/g, '');
  content = content.replace(/\{[a-zA-Z]*[sS]tatInsights\.length > 0 &&\s*<InsightBox insights=\{[a-zA-Z]*[sS]tatInsights\}\s*\/>\s*\}/g, '');
  
  // What if it's just <InsightBox insights={statInsights} /> without the && check?
  content = content.replace(/<InsightBox insights=\{[a-zA-Z]*[sS]tatInsights\}\s*\/>/g, '');

  // 2. Change Bar colors
  content = content.replace(/fill="#ef4444"/gi, 'fill="#0FB0AA"');
  content = content.replace(/fill="#3b82f6"/gi, 'fill="#0FB0AA"');
  content = content.replace(/fill="#f97316"/gi, 'fill="#0FB0AA"');
  content = content.replace(/fill="#8b5cf6"/gi, 'fill="#0FB0AA"');
  content = content.replace(/fill="#fca5a5"/gi, 'fill="#0FB0AA"');
  content = content.replace(/fill="#c4b5fd"/gi, 'fill="#0FB0AA"');
  content = content.replace(/fill="#fee2e2"/gi, 'fill="#0FB0AA"');
  content = content.replace(/fill="#60a5fa"/gi, 'fill="#0FB0AA"');
  content = content.replace(/fill="#bfdbfe"/gi, 'fill="#0FB0AA"');
  content = content.replace(/fill="#fb923c"/gi, 'fill="#0FB0AA"');

  // One more color found in KesehatanIbu:
  content = content.replace(/fill="#fbbf24"/gi, 'fill="#0FB0AA"'); // yellow

  fs.writeFileSync(filePath, content, 'utf-8');
}

// Components dir
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

console.log('Insights removed and colors unified.');
