import { Project, SyntaxKind } from 'ts-morph';
import path from 'path';

const project = new Project({
  tsConfigFilePath: path.join('d:/dashboard_dinkes', 'tsconfig.json'),
});

const pagesDir = path.join('d:/dashboard_dinkes', 'src', 'pages');
project.addSourceFilesAtPaths(path.join(pagesDir, '**/*.tsx'));
const componentsDir = path.join('d:/dashboard_dinkes', 'src', 'components');
project.addSourceFilesAtPaths(path.join(componentsDir, '**/*.tsx'));

let totalModified = 0;

for (const sourceFile of project.getSourceFiles()) {
  let fileModified = false;
  
  // Find recharts import
  const imports = sourceFile.getImportDeclarations();
  let rechartsImport = imports.find(imp => imp.getModuleSpecifierValue() === 'recharts');
  
  // Find Bar elements
  const barElements = sourceFile.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement)
    .filter(node => node.getTagNameNode().getText() === 'Bar');
    
  const openBarElements = sourceFile.getDescendantsOfKind(SyntaxKind.JsxOpeningElement)
    .filter(node => node.getTagNameNode().getText() === 'Bar');

  if (barElements.length > 0 || openBarElements.length > 0) {
    // Ensure LabelList is imported
    if (rechartsImport) {
      const namedImports = rechartsImport.getNamedImports();
      const hasLabelList = namedImports.some(ni => ni.getName() === 'LabelList');
      if (!hasLabelList) {
        rechartsImport.addNamedImport('LabelList');
        fileModified = true;
      }
    }

    // Process self-closing <Bar ... />
    for (const bar of barElements) {
      // Find parent BarChart
      let parent = bar.getParent();
      let isVertical = false;
      while (parent && parent.getKind() !== SyntaxKind.JsxElement) {
        parent = parent.getParent();
      }
      if (parent && parent.getKind() === SyntaxKind.JsxElement) {
        const parentTag = parent.getOpeningElement().getTagNameNode().getText();
        if (parentTag === 'BarChart') {
          const layoutAttr = parent.getOpeningElement().getAttribute('layout');
          if (layoutAttr && layoutAttr.getText().includes('vertical')) {
            isVertical = true;
          }
        }
      }

      const dataKey = bar.getAttribute('dataKey')?.getText() || '"value"';
      const position = isVertical ? '"right"' : '"top"';
      
      const attrs = bar.getAttributes().map(a => a.getText()).join(' ');
      const newJsx = `<Bar ${attrs}>\n  <LabelList dataKey=${dataKey} position=${position} formatter={(v: any) => typeof v === 'number' ? (v >= 1e6 ? (v/1e6).toLocaleString('id-ID', {minimumFractionDigits:1, maximumFractionDigits:1}) + 'jt' : v % 1 !== 0 ? v.toLocaleString('id-ID', {minimumFractionDigits: 1, maximumFractionDigits: 1}) : v.toLocaleString('id-ID')) : v} style={{ fontSize: 10, fill: '#4b5563', fontWeight: 500 }} />\n</Bar>`;
      
      bar.replaceWithText(newJsx);
      fileModified = true;
    }
    
    // Process opening <Bar> elements
    for (const openBar of openBarElements) {
      const parentElement = openBar.getParentIfKind(SyntaxKind.JsxElement);
      if (parentElement) {
        const children = parentElement.getJsxChildren();
        const hasLabelList = children.some(child => {
          if (child.getKind() === SyntaxKind.JsxSelfClosingElement) {
            return child.getTagNameNode().getText() === 'LabelList';
          }
          return false;
        });
        
        if (!hasLabelList) {
          let isVertical = false;
          let chartParent = parentElement.getParent();
          while (chartParent && chartParent.getKind() !== SyntaxKind.JsxElement) {
            chartParent = chartParent.getParent();
          }
          if (chartParent && chartParent.getKind() === SyntaxKind.JsxElement) {
            const parentTag = chartParent.getOpeningElement().getTagNameNode().getText();
            if (parentTag === 'BarChart') {
              const layoutAttr = chartParent.getOpeningElement().getAttribute('layout');
              if (layoutAttr && layoutAttr.getText().includes('vertical')) {
                isVertical = true;
              }
            }
          }

          const dataKey = openBar.getAttribute('dataKey')?.getText() || '"value"';
          const position = isVertical ? '"right"' : '"top"';
          
          const labelListStr = `\n  <LabelList dataKey=${dataKey} position=${position} formatter={(v: any) => typeof v === 'number' ? (v >= 1e6 ? (v/1e6).toLocaleString('id-ID', {minimumFractionDigits:1, maximumFractionDigits:1}) + 'jt' : v % 1 !== 0 ? v.toLocaleString('id-ID', {minimumFractionDigits: 1, maximumFractionDigits: 1}) : v.toLocaleString('id-ID')) : v} style={{ fontSize: 10, fill: '#4b5563', fontWeight: 500 }} />`;
          
          const currentChildren = children.map(c => c.getText()).join('');
          parentElement.replaceWithText(`${openBar.getText()}${currentChildren}${labelListStr}\n</Bar>`);
          fileModified = true;
        }
      }
    }
  }
  
  if (fileModified) {
    sourceFile.saveSync();
    console.log(`Updated ${sourceFile.getBaseName()}`);
    totalModified++;
  }
}

console.log(`Total modified files: ${totalModified}`);
