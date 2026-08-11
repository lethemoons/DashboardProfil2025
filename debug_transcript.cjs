const fs = require('fs');
const logPath = 'C:\\Users\\raafa_s40pglx\\.gemini\\antigravity-ide\\brain\\83b1085b-c1f1-4d42-9f34-4d2bb039bc39\\.system_generated\\logs\\transcript_full.jsonl';
const lines = fs.readFileSync(logPath, 'utf8').split('\n');
for (let i = lines.length - 20; i < lines.length; i++) {
  if (!lines[i]) continue;
  try {
    const step = JSON.parse(lines[i]);
    console.log(`Step ${step.step_index}: type=${step.type}, source=${step.source}, hasContent=${!!step.content}`);
    if (step.tool_calls) console.log(`  tool_calls: ${step.tool_calls.map(tc => tc.name).join(', ')}`);
    if (step.tool_responses) console.log(`  tool_responses: ${step.tool_responses.length}`);
    if (step.content && step.content.includes('CrosstabSection.tsx')) console.log(`  ** Contains CrosstabSection.tsx **`);
  } catch(e) {}
}
