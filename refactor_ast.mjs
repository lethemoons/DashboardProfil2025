import { Project, SyntaxKind } from 'ts-morph';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const project = new Project({
  tsConfigFilePath: path.join(__dirname, 'tsconfig.json'),
});

const pagesDir = path.join(__dirname, 'src', 'pages');
project.addSourceFilesAtPaths(path.join(pagesDir, '**/*.tsx'));
project.addSourceFilesAtPaths(path.join(pagesDir, '**/*.ts'));

function removeNodes(sourceFile) {
  let removed = true;
  while (removed) {
    removed = false;
    
    // Find all JSX self closing elements
    const selfClosing = sourceFile.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement);
    for (const node of selfClosing) {
      const tagName = node.getTagNameNode().getText();
      if (tagName === 'StatPanel') {
        node.replaceWithText('');
        removed = true;
        break;
      }
      if (tagName === 'InsightBox') {
        const insightsProp = node.getAttribute('insights');
        if (insightsProp && insightsProp.getText().includes('StatInsights')) {
          node.replaceWithText('');
          removed = true;
          break;
        }
        if (insightsProp && insightsProp.getText().includes('statInsights')) {
          node.replaceWithText('');
          removed = true;
          break;
        }
      }
    }
    if (removed) continue;

    // Check for normal JSX elements for StatPanel
    const jsxElements = sourceFile.getDescendantsOfKind(SyntaxKind.JsxElement);
    for (const node of jsxElements) {
      const tagName = node.getOpeningElement().getTagNameNode().getText();
      if (tagName === 'StatPanel') {
        node.replaceWithText('');
        removed = true;
        break;
      }
    }
    if (removed) continue;

    // Check for {statInsights.length > 0 && <InsightBox ... />}
    const binaryExprs = sourceFile.getDescendantsOfKind(SyntaxKind.JsxExpression);
    for (const expr of binaryExprs) {
      const text = expr.getText();
      if (text.includes('statInsights.length > 0') || text.includes('StatInsights.length > 0')) {
        expr.replaceWithText('');
        removed = true;
        break;
      }
    }
  }
}

for (const sourceFile of project.getSourceFiles()) {
  removeNodes(sourceFile);

  // Remove import StatPanel
  const imports = sourceFile.getImportDeclarations();
  for (const imp of imports) {
    if (imp.getModuleSpecifierValue().includes('StatPanel')) {
      imp.remove();
    }
  }

  // Convert colors
  let text = sourceFile.getFullText();
  const colorsToReplace = [
    '#ef4444', '#3b82f6', '#f97316', '#8b5cf6', 
    '#fca5a5', '#c4b5fd', '#fee2e2', '#60a5fa', '#bfdbfe'
  ];
  for (const color of colorsToReplace) {
    text = text.replace(new RegExp(`fill="${color}"`, 'gi'), 'fill="#0FB0AA"');
    text = text.replace(new RegExp(`fill='${color}'`, 'gi'), 'fill="#0FB0AA"');
  }

  sourceFile.replaceWithText(text);
  sourceFile.saveSync();
}

console.log('AST refactoring complete!');
