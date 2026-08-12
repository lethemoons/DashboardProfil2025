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

// 2. Remove label={{ ... }} prop from <Bar>
// We'll use a regex that matches `label={{` to `}}` inside <Bar
content = content.replace(/label=\{\{\s*position:\s*'right',\s*formatter:\s*\(v:\s*any\)\s*=>\s*formatValue\(v\),\s*fill:\s*'#[^']+',\s*fontSize:\s*\d+,\s*fontWeight:\s*\d+\s*\}\}/, '');

// 3. Update LabelList formatter
const oldLabelListFormatter = `formatter={(v: any) => typeof v === 'number' ? (v >= 1e6 ? (v/1e6).toLocaleString('id-ID', {minimumFractionDigits:1, maximumFractionDigits:1}) + 'jt' : v % 1 !== 0 ? v.toLocaleString('id-ID', {minimumFractionDigits: 1, maximumFractionDigits: 1}) : v.toLocaleString('id-ID')) : v}`;
const newLabelListFormatter = `formatter={(v: any) => formatValue(v)}`;
content = content.replace(oldLabelListFormatter, newLabelListFormatter);

// 4. Since the file was restored from git, the font size might still be 11, which is correct for single bar charts.
// Let's verify we remove letterSpacing if it's there.
content = content.replace(/,\s*letterSpacing:\s*-0\.5/g, '');

fs.writeFileSync(file, content, 'utf-8');
console.log('Fixed overlapping double labels in RankChart.tsx');
