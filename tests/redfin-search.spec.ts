import { test, expect, Page } from '@playwright/test';


test.describe.configure({ mode: 'serial' });

test.describe('Redfin Search Functionality', () => {
  
  test.beforeEach(async ({ page }) => {

    await page.goto('https://www.redfin.com');
    
    await handleCookieBanner(page);
  });


  test.skip('Search by ZIP code 22304', async ({ page }) => {
    const zipCode = '22304';
    
    const searchInput = page.locator('input#search-box-input:enabled').first();
    await searchInput.waitFor({ state: 'visible', timeout: 5000 });
    await searchInput.fill(zipCode);
    
    const searchButton = page.locator('button[data-rf-test-name="searchButton"]').first();
    await searchButton.click();
    
    await page.waitForTimeout(2000);
    const searchValue = await searchInput.inputValue();
    expect(searchValue).toBe(zipCode);
    console.log(`✓ Search initiated with ZIP: ${zipCode}`);
  });


  test.skip('Search by city name - Arlington, VA', async ({ page }) => {
    const cityName = 'Arlington, VA';
    
    const searchInput = page.locator('input#search-box-input:enabled').first();
    await searchInput.waitFor({ state: 'visible', timeout: 5000 });
    await searchInput.fill(cityName);
    
    const searchButton = page.locator('button[data-rf-test-name="searchButton"]').first();
    await searchButton.click();
    
    await page.waitForTimeout(2000);
    const searchValue = await searchInput.inputValue();
    expect(searchValue).toBe(cityName);
    console.log(`✓ Search initiated with city: ${cityName}`);
  });


  test('Empty search validation - Negative test', async ({ page }) => {

    const searchInput = page.locator('input#search-box-input:enabled').first();
    await searchInput.waitFor({ state: 'visible', timeout: 5000 });
    
    await searchInput.click();
    await searchInput.clear();
    const clearedValue = await searchInput.inputValue();
    expect(clearedValue).toBe('');
    
    const searchButton = page.locator('button[data-rf-test-name="searchButton"]').first();
    await searchButton.click();
    
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    expect(currentUrl).toBe('https://www.redfin.com/');
    console.log('✓ Empty search validation passed - remained on homepage');
  });
});


async function handleCookieBanner(page: Page): Promise<void> {
  try {
    await page.waitForTimeout(2000);
    const frameLocator = page.frameLocator('iframe[title="Cookies and your choices banner"]');
    const cookieCloseBtn = frameLocator.locator('button.onetrust-close-btn-handler');
    await cookieCloseBtn.waitFor({ state: 'visible', timeout: 3000 });
    await cookieCloseBtn.click();
    await page.waitForTimeout(500);
    console.log('Cookie banner handled');
  } catch {
    console.log('Cookie banner not found - continuing test');
  }
}

test.afterEach(async ({}, testInfo) => {
  console.log(`Test completed: "${testInfo.title}" - Status: ${testInfo.status}`);
});