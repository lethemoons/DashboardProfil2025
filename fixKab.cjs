const fs = require('fs');
const path = require('path');
const dir = 'd:/dashboard_dinkes/src/pages';
const files = fs.readdirSync(dir);

let modifiedCount = 0;

for (const file of files) {
  if (file.endsWith('.tsx')) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Pattern to match: kab === 'all' ? variable : variable.filter(d => d.kabupaten === kab)
    const regex = /kab === 'all'\s*\?\s*([a-zA-Z0-9]+)\s*:\s*\1\.filter\(d\s*=>\s*d\.kabupaten === kab\)/g;
    
    if (regex.test(content)) {
      const newContent = content.replace(regex, (match, p1) => {
        return `kab === 'all' ? ${p1}.filter(d => d.kabupaten !== 'PROV. JAWA TIMUR') : ${p1}.filter(d => d.kabupaten === kab)`;
      });
      
      fs.writeFileSync(filePath, newContent);
      console.log('Modified:', file);
      modifiedCount++;
    }
  }
}
console.log('Total files modified:', modifiedCount);
