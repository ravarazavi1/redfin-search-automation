/**
 * Minimal HTML fixtures that mirror Redfin's real DOM selectors.
 * Used by networkInterceptor to route() full-page responses — guarantees
 * 100% deterministic UI tests that never hit Redfin's bot detection.
 */

export interface MockPageConfig {
  zip: string;
  city: string;
  listingCount: number;
  priceRange: string;
}

export function buildResultsPageHtml(cfg: MockPageConfig): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${cfg.zip} Homes for Sale - Redfin</title>
  <style>
    body { font-family: sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
    .header-bar { background: #d92228; padding: 12px 20px; display: flex; align-items: center; gap: 12px; }
    input#search-box-input { flex: 1; padding: 8px 12px; border-radius: 4px; border: none; font-size: 14px; }
    main { max-width: 960px; margin: 24px auto; }
    h1[data-rf-test-id="h1-header"] { font-size: 24px; color: #333; margin-bottom: 8px; }
    .listing-count { color: #666; font-size: 14px; margin-bottom: 16px; }
    .listing-card { background: #fff; border: 1px solid #ddd; border-radius: 6px; padding: 16px; margin-bottom: 12px; }
    .listing-price { font-size: 18px; font-weight: bold; color: #d92228; }
    .listing-address { color: #444; margin-top: 4px; }
  </style>
</head>
<body>
  <div class="header-bar">
    <svg width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#fff"/></svg>
    <input id="search-box-input" type="text" value="${cfg.zip}" aria-label="City, Address, School, Agent, ZIP" />
  </div>
  <main>
    <h1 data-rf-test-id="h1-header">Homes for Sale in ${cfg.city} (${cfg.zip})</h1>
    <p class="listing-count">${cfg.listingCount} homes match your search</p>
    <div class="listing-card">
      <div class="listing-price">${cfg.priceRange}</div>
      <div class="listing-address">123 Mock Street, ${cfg.city}</div>
    </div>
    <div class="listing-card">
      <div class="listing-price">$489,000</div>
      <div class="listing-address">456 Test Ave, ${cfg.city}</div>
    </div>
    <div class="listing-card">
      <div class="listing-price">$612,500</div>
      <div class="listing-address">789 Playwright Blvd, ${cfg.city}</div>
    </div>
  </main>
</body>
</html>`;
}

export const MockPages: Record<string, MockPageConfig> = {
  '22304': { zip: '22304', city: 'Alexandria, VA', listingCount: 47, priceRange: '$425,000' },
  '22201': { zip: '22201', city: 'Arlington, VA',  listingCount: 31, priceRange: '$575,000' },
  '98101': { zip: '98101', city: 'Seattle, WA',    listingCount: 23, priceRange: '$699,000' },
  '20814': { zip: '20814', city: 'Bethesda, MD',   listingCount: 18, priceRange: '$850,000' },
};

export function buildHomepageHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Redfin | Real Estate, Homes for Sale &amp; Rent</title>
  <style>
    body { font-family: sans-serif; margin: 0; }
    .hero { background: linear-gradient(135deg, #d92228 0%, #b01c22 100%); padding: 80px 20px; text-align: center; color: #fff; }
    .hero h1 { font-size: 36px; margin-bottom: 24px; }
    .search-form { display: flex; max-width: 600px; margin: 0 auto; gap: 8px; }
    input#search-box-input { flex: 1; padding: 14px 18px; border-radius: 4px; border: none; font-size: 16px; }
    button#search-btn { padding: 14px 28px; background: #fff; color: #d92228; border: none; border-radius: 4px; font-size: 16px; font-weight: bold; cursor: pointer; }
  </style>
</head>
<body>
  <div class="hero">
    <h1>The #1 site real estate professionals trust*</h1>
    <div class="search-form">
      <input id="search-box-input" type="text" placeholder="City, Address, School, Agent, ZIP" aria-label="Search" />
      <button id="search-btn" data-rf-test-name="searchButton">Search</button>
    </div>
  </div>
</body>
</html>`;
}
