import { test, expect } from '@playwright/test';
import { HomePage } from '../../src/pageObjects/HomePage';
import { ResultsPage } from '../../src/pageObjects/ResultsPage';

test.describe.configure({ mode: 'serial' });

test.describe('Redfin Search Functionality - Final Suite', () => {
  test('Search by ZIP code 22304', async ({ page }) => {
    const home = new HomePage(page);
    const results = new ResultsPage(page);

    await home.navigate();
    await home.search('22304');
    await results.validateResultsContain('22304');
  });

  test('Search by city name - Alexandria', async ({ page }) => {
    const home = new HomePage(page);
    const results = new ResultsPage(page);

    await home.navigate();
    await home.search('Alexandria, VA');
    await results.validateResultsContain('Alexandria');
  });

  test('Empty search validation - Negative', async ({ page }) => {
    const home = new HomePage(page);

    await home.navigate();
    await home.emptySearchAttempt();
    await expect(page).toHaveURL('https://www.redfin.com/');
    console.log('✅ Empty search stayed on homepage');
  });


  test('Search slowly (anti-bot simulation)', async ({ page }) => {
    const home = new HomePage(page);
    const results = new ResultsPage(page);

    await home.navigate();
    await home.searchSlowly('22304');
    await results.validateResultsContain('22304');
  });
});