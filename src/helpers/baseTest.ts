import { test as base, expect } from '@playwright/test';
import { HomePage } from '../pageObjects/HomePage';
import { ResultsPage } from '../pageObjects/ResultsPage';
import { applyAntiBotHeaders } from './antiBot';

export const test = base.extend<{
  homePage: HomePage;
  resultsPage: ResultsPage;
}>({
  homePage: async ({ page }, use) => {
    await applyAntiBotHeaders(page);
    const home = new HomePage(page);
    await use(home);
  },
  resultsPage: async ({ page }, use) => {
    const results = new ResultsPage(page);
    await use(results);
  }
});

export { expect };