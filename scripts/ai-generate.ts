/**
 * AI Scenario Generator — CLI entry point
 *
 * Usage:
 *   npm run ai:generate -- --story "As a user I want to filter homes by price range"
 *   npm run ai:generate -- --story "..." --output src/tests/ui/regression/filters/filters.scenarios.ts
 *
 * Requires: ANTHROPIC_API_KEY environment variable
 */
import path from 'path';
import { generateScenarios } from '../src/ai/scenarioGenerator';

const args = process.argv.slice(2);
function arg(flag: string, fallback?: string): string | undefined {
  const i = args.indexOf(flag);
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
}

const story  = arg('--story');
const output = arg('--output', 'src/tests/ui/generated/generated.scenarios.ts');
const prefix = arg('--prefix', 'SRCH');

if (!story) {
  console.error('[AI Generate] ERROR: --story is required.');
  console.error('  npm run ai:generate -- --story "As a user I want to search homes by city name"');
  process.exit(1);
}

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('[AI Generate] ERROR: ANTHROPIC_API_KEY is not set.');
  console.error('  export ANTHROPIC_API_KEY="sk-ant-..."');
  process.exit(1);
}

const outputPath = path.resolve(process.cwd(), output!);

generateScenarios({
  userStory: story,
  outputPath,
  testRailPrefix: prefix,
})
  .then(() => { process.exit(0); })
  .catch((err: Error) => {
    console.error('[AI Generate] Fatal:', err.message);
    process.exit(1);
  });
