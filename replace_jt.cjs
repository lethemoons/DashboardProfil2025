const fs = require('fs');
const path = require('path');

function walk(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf-8');
      let originalContent = content;
      
      // Replace + 'jt' with + ' juta'
      content = content.replace(/\+\s*'jt'/g, "+ ' juta'");
      
      // Replace + ' jt' with + ' juta'
      content = content.replace(/\+\s*' jt'/g, "+ ' juta'");
      
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf-8');
        console.log(`Updated ${fullPath}`);
      }
    }
  });
}

walk('d:/dashboard_dinkes/src');
