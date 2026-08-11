const fs = require('fs');

const logPath = 'C:\\Users\\raafa_s40pglx\\.gemini\\antigravity-ide\\brain\\83b1085b-c1f1-4d42-9f34-4d2bb039bc39\\.system_generated\\logs\\transcript_full.jsonl';
const lines = fs.readFileSync(logPath, 'utf8').split('\n');

for (let i = lines.length - 1; i >= 0; i--) {
  if (!lines[i]) continue;
  if (lines[i].includes('TOOL_RESPONSE') && lines[i].includes('Showing lines 1 to 671') && lines[i].includes('CrosstabSection.tsx')) {
    try {
      const step = JSON.parse(lines[i]);
      const content = step.output || step.content || (step.tool_calls && step.tool_calls[0] && step.tool_calls[0].output) || (step.response && step.response.output);
      
      let outStr = '';
      if (typeof content === 'string') outStr = content;
      else if (content && typeof content === 'object') outStr = JSON.stringify(content);

      // Deep search just in case
      const searchObj = (obj) => {
        for (let key in obj) {
            if (typeof obj[key] === 'string' && obj[key].includes('1: import { useState')) {
                return obj[key];
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                let res = searchObj(obj[key]);
                if (res) return res;
            }
        }
        return null;
      }
      
      const found = searchObj(step);
      if (found) {
        const linesMatch = found.split('\n');
        let restored = [];
        let isCode = false;
        for (const line of linesMatch) {
          if (line.match(/^1: /)) isCode = true;
          if (isCode) {
            if (line.match(/^\d+: /)) {
              restored.push(line.replace(/^\d+: /, ''));
            } else if (line.match(/^The above content shows the entire/)) {
              break;
            }
          }
        }
        
        if (restored.length > 0) {
          fs.writeFileSync('d:\\dashboard_dinkes\\src\\components\\CrosstabSection.tsx', restored.join('\n'));
          console.log('Restored CrosstabSection.tsx successfully. Restored lines: ' + restored.length);
          return;
        }
      }
    } catch (e) {
      console.error(e);
    }
  }
}
console.log("Could not find the content");
