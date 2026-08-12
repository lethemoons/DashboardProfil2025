const fs = require('fs');
const file = 'd:/dashboard_dinkes/src/components/RankChart.tsx';
let content = fs.readFileSync(file, 'utf-8');

// Replace formatValue function in RankChart.tsx
content = content.replace(
  /const formatValue = \(v: number\) => \{[\s\S]*?\};\s*/,
  `const formatValue = (v: number) => {
    if (activeIndicator?.isPercentage) {
      return \`\${v.toLocaleString('id-ID', { maximumFractionDigits: 1 })}%\`;
    }
    if (v >= 1e6) {
      return (v / 1e6).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' juta';
    }
    if (v % 1 !== 0) {
      return v.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    }
    return v.toLocaleString('id-ID');
  };\n\n  `
);

fs.writeFileSync(file, content, 'utf-8');
console.log('Fixed formatValue in RankChart.tsx');
