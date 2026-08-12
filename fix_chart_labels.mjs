const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let originalContent = content;

  // 1. Update LabelList styles for better contrast and size
  content = content.replace(/style=\{\{\s*fontSize:\s*10,\s*fill:\s*['"]#4b5563['"],\s*fontWeight:\s*500\s*\}\}/g, 
    "style={{ fontSize: 11, fill: '#1f2937', fontWeight: 600, stroke: '#ffffff', strokeWidth: 2, paintOrder: 'stroke' }}");

  // 2. Add offset={8} to LabelList if it doesn't have it
  content = content.replace(/<LabelList([^>]*?)(\/?)>/g, (match, p1, p2) => {
    if (!p1.includes('offset=')) {
      return `<LabelList${p1} offset={8}${p2}>`;
    }
    return match;
  });

  // 3. Fix margins in Charts to prevent clipping
  // BarChart, ComposedChart, LineChart, AreaChart, PieChart
  const chartTags = ['BarChart', 'ComposedChart', 'LineChart', 'AreaChart', 'PieChart'];
  
  chartTags.forEach(tag => {
    const regex = new RegExp(`<${tag}([^>]*?)>`, 'g');
    content = content.replace(regex, (match, attrs) => {
      let isVertical = attrs.includes('layout="vertical"');
      
      // Extract margin if exists
      let marginMatch = attrs.match(/margin=\{\{(.*?)\}\}/);
      let newMarginStr = "";
      if (marginMatch) {
        let marginInner = marginMatch[1];
        // Parse margin parts manually
        let top = marginInner.match(/top:\s*(\d+)/);
        let right = marginInner.match(/right:\s*(\d+)/);
        let bottom = marginInner.match(/bottom:\s*(\d+)/);
        let left = marginInner.match(/left:\s*(-?\d+|[A-Za-z]+)/); // Can be a variable
        
        let mObj = {};
        if (top) mObj.top = parseInt(top[1]);
        if (right) mObj.right = parseInt(right[1]);
        if (bottom) mObj.bottom = parseInt(bottom[1]);
        if (left) mObj.left = left[1]; // Keep as string if it's a variable or number
        
        if (isVertical) {
          mObj.right = Math.max(mObj.right || 0, 70); // need more right margin for horizontal bars
          mObj.top = Math.max(mObj.top || 0, 20); // some top margin for the highest bar label
        } else {
          mObj.top = Math.max(mObj.top || 0, 40); // need top margin for vertical bars / lines
          mObj.right = Math.max(mObj.right || 0, 30);
        }
        
        if (tag === 'PieChart') {
           mObj.top = 30; mObj.bottom = 30; mObj.left = 30; mObj.right = 30;
        }

        // Reconstruct margin string
        let parts = [];
        if (mObj.top !== undefined) parts.push(`top: ${mObj.top}`);
        if (mObj.right !== undefined) parts.push(`right: ${mObj.right}`);
        if (mObj.bottom !== undefined) parts.push(`bottom: ${mObj.bottom}`);
        if (mObj.left !== undefined) parts.push(`left: ${mObj.left}`);
        
        newMarginStr = `margin={{ ${parts.join(', ')} }}`;
        attrs = attrs.replace(marginMatch[0], newMarginStr);
      } else {
        // Add margin if it doesn't exist
        if (isVertical) {
           attrs += ` margin={{ top: 20, right: 70, bottom: 20, left: 20 }}`;
        } else {
           attrs += ` margin={{ top: 40, right: 30, bottom: 20, left: 20 }}`;
        }
      }
      
      return `<${tag}${attrs}>`;
    });
  });

  // 4. Update Pie chart labels for better readability
  // Add stroke for readability over lines/slices and adjust font
  content = content.replace(/label=\{.*?\}\s*labelLine=\{true\}/g, (match) => {
      // The current label is an inline function returning a template literal.
      // We will enhance the Pie label to use a custom SVG text with white stroke
      return `label={({ cx, cy, midAngle, innerRadius, outerRadius, value, name }) => {
        const RADIAN = Math.PI / 180;
        const radius = outerRadius + 20;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);
        const align = x > cx ? 'start' : 'end';
        const valStr = typeof value === 'number' && value >= 1e6 ? (value/1e6).toLocaleString('id-ID', {minimumFractionDigits:1, maximumFractionDigits:1}) + 'jt' : value.toLocaleString('id-ID');
        return (
          <text x={x} y={y} fill="#1f2937" textAnchor={align} dominantBaseline="central" fontSize={11} fontWeight={600} stroke="#ffffff" strokeWidth={3} paintOrder="stroke">
            {name} ({valStr})
          </text>
        );
      }} labelLine={true}`;
  });

  // Re-fix the Pie label if it used the default Recharts boolean label before my previous script
  // (Wait, my previous script changed Pie labels to an inline function, so the above regex should catch it.)

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log('Updated layout/styles in:', filePath);
  }
}

function walkDir(dir) {
  fs.readdirSync(dir).forEach(f => {
    let p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      walkDir(p);
    } else if (p.endsWith('.tsx') || p.endsWith('.ts')) {
      processFile(p);
    }
  });
}

walkDir(path.join('d:/dashboard_dinkes', 'src'));
