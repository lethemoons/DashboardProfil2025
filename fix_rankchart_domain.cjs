const fs = require('fs');
const file = 'd:/dashboard_dinkes/src/components/RankChart.tsx';
let content = fs.readFileSync(file, 'utf-8');

if (!content.includes('getDynamicDomain')) {
  // Add import
  content = content.replace(
    /import DataTable from '.\/DataTable';/,
    "import DataTable from './DataTable';\nimport { getDynamicDomain } from '../utils/stats';"
  );
}

// Replace XAxis
content = content.replace(
  /<XAxis type="number" hide \/>/,
  '<XAxis type="number" hide domain={[0, (dataMax: any) => getDynamicDomain(dataMax, activeIndicator?.isPercentage)]} />'
);

fs.writeFileSync(file, content, 'utf-8');
console.log('Fixed RankChart.tsx');
