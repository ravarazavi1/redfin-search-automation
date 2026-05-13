// Stealth patches (navigator.webdriver, chrome object, headers) are applied
// at fixture level in browser.fixture.ts so they cover the first navigation.
// This module provides only runtime helpers used during page interactions.

export function randomDelay(minMs = 300, maxMs = 800): Promise<void> {
  const ms = Math.floor(Math.random() * (maxMs - minMs)) + minMs;
  return new Promise(resolve => setTimeout(resolve, ms));
}
