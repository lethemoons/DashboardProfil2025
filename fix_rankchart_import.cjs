const fs = require('fs');

const file = 'd:/dashboard_dinkes/src/components/RankChart.tsx';
let content = fs.readFileSync(file, 'utf-8');

// Replace the recharts import to include LabelList
content = content.replace(/import \{\s*BarChart,\s*Bar,\s*XAxis,\s*YAxis,\s*Tooltip,\s*ResponsiveContainer,\s*Cell\s*\}\s*from\s*'recharts';/, "import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';");

fs.writeFileSync(file, content, 'utf-8');
console.log('Added LabelList import to RankChart.tsx');
