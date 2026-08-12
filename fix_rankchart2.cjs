const fs = require('fs');

const file = 'd:/dashboard_dinkes/src/components/RankChart.tsx';
let content = fs.readFileSync(file, 'utf-8');

// 1. Update formatValue
const oldFormatValue = `  const formatValue = (v: number) => {
    return activeIndicator.isPercentage 
      ? \`\${v.toLocaleString('id-ID', { maximumFractionDigits: 1 })}%\`
      : v.toLocaleString('id-ID');
  };`;
const newFormatValue = `  const formatValue = (v: number) => {
    if (activeIndicator?.isPercentage) {
      return \`\${v.toLocaleString('id-ID', { maximumFractionDigits: 1 })}%\`;
    }
    if (v >= 1e6) {
      return (v / 1e6).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + 'jt';
    }
    if (v % 1 !== 0) {
      return v.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    }
    return v.toLocaleString('id-ID');
  };`;
content = content.replace(oldFormatValue, newFormatValue);

// 2. Remove label prop from Bar
// We replace the entire Bar opening tag carefully to ensure we don't wipe anything else.
content = content.replace(/<Bar\s+dataKey="value"\s+radius=\{\[0,\s*6,\s*6,\s*0\]\}\s+label=\{\{[\s\S]*?\}\}\s+animationDuration=\{600\}\s*>/, '<Bar dataKey="value" radius={[0, 6, 6, 0]} animationDuration={600}>');

// 3. Fix colors
content = content.replace(/let fillColor = '#0FB0AA';/, "let fillColor = '#0F8F8B';");
content = content.replace(/fillColor = '#06B5D0'; \/\/ Hover color/, "fillColor = '#078FA5'; // Hover color");

// 4. Add LabelList inside Bar (if not present)
// We look for `</Bar>` and prepend LabelList
if (!content.includes('<LabelList dataKey="value" position="right"')) {
    content = content.replace('</Bar>', `  <LabelList dataKey="value" position="right" offset={8} formatter={(v: any) => formatValue(v)} style={{ fontSize: 11, fill: '#1f2937', fontWeight: 600, stroke: '#ffffff', strokeWidth: 2, paintOrder: 'stroke' }} />\n              </Bar>`);
}

// 5. Remove any negative letter spacing just in case it got back
content = content.replace(/,\s*letterSpacing:\s*-0\.5/g, '');

fs.writeFileSync(file, content, 'utf-8');
console.log('Fixed colors and labels in RankChart.tsx');
