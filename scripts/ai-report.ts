/**
 * AI Report Analyzer — CLI entry point
 *
 * Usage:
 *   npm run ai:report
 *   npm run ai:report -- --input test-results.json --output ai-report.md
 *
 * Requires: ANTHROPIC_API_KEY environment variable
 */
import path from 'path';
import { analyzeTestReport } from '../src/ai/reportAnalyzer';

const args = process.argv.slice(2);
function arg(flag: string, fallback: string): string {
  const i = args.indexOf(flag);
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
}

const inputFile  = arg('--input',  'test-results.json');
const outputFile = arg('--output', 'ai-report.md');

const inputPath  = path.resolve(process.cwd(), inputFile);
const outputPath = path.resolve(process.cwd(), outputFile);

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('[AI Report] ERROR: ANTHROPIC_API_KEY is not set.');
  console.error('  export ANTHROPIC_API_KEY="sk-ant-..."');
  process.exit(1);
}

analyzeTestReport(inputPath, outputPath)
  .then(() => { process.exit(0); })
  .catch((err: Error) => {
    console.error('[AI Report] Fatal:', err.message);
    process.exit(1);
  });
