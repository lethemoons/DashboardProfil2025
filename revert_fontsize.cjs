const fs = require('fs');
const path = require('path');

function walk(d) {
  fs.readdirSync(d).forEach(f => {
    let p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.tsx') || p.endsWith('.ts')) {
      let c = fs.readFileSync(p, 'utf-8');
      
      // Revert fontSize: 8, letterSpacing: -0.5 back to fontSize: 11
      let c2 = c.replace(/style=\{\{\s*fontSize:\s*8,\s*letterSpacing:\s*-0.5,/g, 'style={{ fontSize: 11,');
      
      // Also, I previously changed fontSize: 11 to 9, and then 9 to 8. 
      // Are there any fontSize: 9 left that should be 11? 
      // Only in PembiayaanKesehatan.tsx which I manually set to 9. Let's ignore it by skipping it or being careful.
      if (p.includes('PembiayaanKesehatan.tsx')) {
         // do nothing for PembiayaanKesehatan.tsx since we just tailored it perfectly
         return;
      }
      
      let result = c2;
      
      // Now find all grouped bar charts (BarChart or ComposedChart with >1 <Bar)
      // and set their LabelList fontSize to 8
      result = result.replace(/<(?:BarChart|ComposedChart)[\s\S]*?<\/(?:BarChart|ComposedChart)>/g, (chartBlock) => {
         let barCount = (chartBlock.match(/<Bar\s/g) || []).length;
         
         // If it's a stacked bar chart, it might have multiple Bars but with stackId
         // The user said "selain grouped bar chart". Grouped bar charts don't have stackId.
         // Let's count how many Bars DO NOT have stackId.
         let unstackedBarCount = 0;
         let barMatches = chartBlock.match(/<Bar\s[^>]*>/g) || [];
         for (let bm of barMatches) {
            if (!bm.includes('stackId=')) {
               unstackedBarCount++;
            }
         }
         
         // If there are multiple unstacked bars, it's a grouped bar chart!
         if (unstackedBarCount > 1) {
            // Apply fontSize: 8, letterSpacing: -0.5 to LabelLists inside this grouped bar chart
            return chartBlock.replace(/style=\{\{\s*fontSize:\s*11,/g, 'style={{ fontSize: 8, letterSpacing: -0.5,');
         }
         return chartBlock;
      });

      if (c !== result) {
         fs.writeFileSync(p, result, 'utf-8');
         console.log('Reverted and fixed:', p);
      }
    }
  });
}
walk('d:/dashboard_dinkes/src');
