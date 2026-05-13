import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';

export interface HealedLocator {
  originalSelector: string;
  healedSelector: string;
  confidence: 'high' | 'medium' | 'low';
  reasoning: string;
}

const SYSTEM_PROMPT = `You are an expert Playwright test automation engineer specializing in self-healing locators.
Given a screenshot of a web page and a broken CSS/XPath/text selector, your job is to:
1. Analyze the screenshot to understand the current DOM structure
2. Find the best alternative locator for the intended element
3. Return a JSON object with exactly these fields:
   - healedSelector: the new Playwright locator string (e.g. 'role=button[name="Search"]' or '#search-input')
   - confidence: "high" | "medium" | "low"
   - reasoning: 1-2 sentences explaining what changed and why this selector is better

Selector preference order (most to least resilient):
1. data-testid / data-rf-test-id attributes
2. ARIA role + accessible name: page.getByRole('button', { name: '...' })
3. Stable id attributes
4. CSS class only if the class is BEM-style and stable
5. XPath as a last resort

Return ONLY valid JSON — no markdown, no prose.`;

export class LocatorHealer {
  private readonly client: Anthropic;

  constructor() {
    this.client = new Anthropic();
  }

  /**
   * Sends a screenshot Buffer + broken selector to Claude Vision.
   * Returns a healed selector string and reasoning.
   */
  async heal(screenshotBuffer: Buffer, brokenSelector: string): Promise<HealedLocator> {
    const base64 = screenshotBuffer.toString('base64');

    console.log(`\n[Locator Healer] Broken selector: "${brokenSelector}"`);
    console.log('[Locator Healer] Sending screenshot to Claude Vision...\n');

    const response = await this.client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 512,
      thinking: { type: 'adaptive' },
      system: [
        {
          type: 'text',
          text: SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/png',
                data: base64,
              },
            },
            {
              type: 'text',
              text: `The following selector is broken (element not found): "${brokenSelector}"\n\nAnalyze the screenshot and return the healed selector as JSON.`,
            },
          ],
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('Claude returned no text block for locator healing');
    }

    let parsed: { healedSelector: string; confidence: string; reasoning: string };
    try {
      parsed = JSON.parse(textBlock.text.trim());
    } catch {
      throw new Error(`Claude returned non-JSON response: ${textBlock.text}`);
    }

    const result: HealedLocator = {
      originalSelector: brokenSelector,
      healedSelector: parsed.healedSelector,
      confidence: (parsed.confidence as HealedLocator['confidence']) ?? 'medium',
      reasoning: parsed.reasoning,
    };

    console.log(`[Locator Healer] Healed selector: "${result.healedSelector}" (${result.confidence} confidence)`);
    console.log(`[Locator Healer] Reasoning: ${result.reasoning}`);

    return result;
  }

  /**
   * Convenience: takes a screenshot file path instead of a Buffer.
   */
  async healFromFile(screenshotPath: string, brokenSelector: string): Promise<HealedLocator> {
    const buffer = fs.readFileSync(screenshotPath);
    return this.heal(buffer, brokenSelector);
  }
}
