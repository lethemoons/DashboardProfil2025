const fs = require('fs');

const formatterStr = `formatter={(v: any) => typeof v === 'number' && v > 0 ? (v >= 1e6 ? (v/1e6).toLocaleString('id-ID', {minimumFractionDigits:1, maximumFractionDigits:1}) + 'jt' : v % 1 !== 0 ? v.toLocaleString('id-ID', {minimumFractionDigits: 1, maximumFractionDigits: 1}) : v.toLocaleString('id-ID')) : ''}`;
const styleStr = `style={{ fontSize: 9, fill: '#ffffff', fontWeight: 600 }}`;

['d:/dashboard_dinkes/src/pages/KesehatanAnak.tsx', 'd:/dashboard_dinkes/src/pages/KesehatanIbu.tsx'].forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  
  // Find all <Bar ... stackId="a" ...> blocks and replace the LabelList inside them
  // A regex to match <Bar ... stackId="a" ...> ... </Bar>
  content = content.replace(/(<Bar[^>]+stackId="a"[^>]*>)\s*(<LabelList[^>]+>)\s*(<\/Bar>)/g, (match, barOpen, labelList, barClose) => {
    
    // Replace position
    let newLabel = labelList.replace(/position="[^"]+"/, 'position="center"');
    
    // Remove offset if present
    newLabel = newLabel.replace(/\s*offset=\{\d+\}/, '');
    
    // Replace formatter
    newLabel = newLabel.replace(/formatter=\{[^\}]+=>[^\}]+\}\}\s*/, formatterStr + ' ');
    // Wait, the previous regex for formatter is tricky because it has nested curlies.
    // Let's just do a simpler replacement of the entire formatter prop by finding 'formatter={(v: any) => ...}'
    newLabel = newLabel.replace(/formatter=\{\(v:\s*any\)\s*=>.*?\)\s*:\s*v\}/, formatterStr);
    
    // Replace style
    newLabel = newLabel.replace(/style=\{\{.*?\}\}/, styleStr);
    
    return `${barOpen}\n              ${newLabel}\n            ${barClose}`;
  });
  
  fs.writeFileSync(file, content, 'utf-8');
  console.log('Fixed stacked bars in', file);
});
