import fs from 'fs';
import path from 'path';

const file = path.resolve('d:/dashboard_dinkes/src/pages/AksesMutu.tsx');
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('import RiskClusteringMap')) {
  content = content.replace(
    "import CrosstabSection from '../components/CrosstabSection'",
    "import CrosstabSection from '../components/CrosstabSection'\nimport RiskClusteringMap from '../components/RiskClusteringMap'"
  );
}

const tableTag = '<DataTable data={data} columns={[';
if (!content.includes('<RiskClusteringMap')) {
  content = content.replace(
    tableTag,
    `<RiskClusteringMap \n        data={data} \n        variables={['bor', 'gdr', 'ndr']} \n        directions={[1, 1, 1]} \n        variableLabels={['BOR (%)', 'GDR (‰)', 'NDR (‰)']} \n      />\n\n      ${tableTag}`
  );
}

fs.writeFileSync(file, content, 'utf8');
console.log('Updated AksesMutu.tsx');
