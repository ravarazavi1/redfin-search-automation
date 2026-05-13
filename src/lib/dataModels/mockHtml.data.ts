/**
 * Minimal HTML fixtures that mirror Redfin's real DOM selectors.
 * Used by networkInterceptor to route() full-page responses — guarantees
 * 100% deterministic UI tests that never hit Redfin's bot detection.
 *
 * Markup is intentionally WCAG 2.1 AA compliant so the a11y layer can
 * assert zero violations. Landmarks, labels, and contrast ratios are all
 * correct — making these fixtures a regression guard for accessibility too.
 */

export interface MockPageConfig {
  zip: string;
  city: string;
  listingCount: number;
  priceRange: string;
}

const SR_ONLY_CSS = `.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border-width:0}`;

export function buildResultsPageHtml(cfg: MockPageConfig): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${cfg.zip} Homes for Sale - Redfin</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    ${SR_ONLY_CSS}
    body { font-family: sans-serif; margin: 0; background: #f5f5f5; }
    header { background: #a31621; padding: 12px 20px; display: flex; align-items: center; gap: 12px; }
    input#search-box-input { flex: 1; padding: 8px 12px; border-radius: 4px; border: none; font-size: 14px; color: #111; background: #fff; }
    input#search-box-input::placeholder { color: #555; }
    main { max-width: 960px; margin: 24px auto; padding: 0 16px; }
    h1[data-rf-test-id="h1-header"] { font-size: 24px; color: #111; margin-bottom: 8px; }
    .listing-count { color: #555; font-size: 14px; margin-bottom: 16px; }
    .listing-card { background: #fff; border: 1px solid #ccc; border-radius: 6px; padding: 16px; margin-bottom: 12px; }
    .listing-price { font-size: 18px; font-weight: bold; color: #a31621; }
    .listing-address { color: #333; margin-top: 4px; }
  </style>
</head>
<body>
  <header>
    <svg aria-hidden="true" focusable="false" width="32" height="32" viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="16" fill="#fff"/>
    </svg>
    <label for="search-box-input" class="sr-only">Search by city, address, school, agent, or ZIP</label>
    <input
      id="search-box-input"
      type="search"
      value="${cfg.zip}"
      aria-label="Search by city, address, school, agent, or ZIP"
    />
  </header>
  <main>
    <h1 data-rf-test-id="h1-header">Homes for Sale in ${cfg.city} (${cfg.zip})</h1>
    <p class="listing-count">${cfg.listingCount} homes match your search</p>
    <ul aria-label="Property listings" style="list-style:none;padding:0;margin:0;">
      <li class="listing-card">
        <p class="listing-price">${cfg.priceRange}</p>
        <p class="listing-address">123 Mock Street, ${cfg.city}</p>
      </li>
      <li class="listing-card">
        <p class="listing-price">$489,000</p>
        <p class="listing-address">456 Test Ave, ${cfg.city}</p>
      </li>
      <li class="listing-card">
        <p class="listing-price">$612,500</p>
        <p class="listing-address">789 Playwright Blvd, ${cfg.city}</p>
      </li>
    </ul>
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
    *, *::before, *::after { box-sizing: border-box; }
    ${SR_ONLY_CSS}
    body { font-family: sans-serif; margin: 0; }
    header { background: #a31621; padding: 16px 20px; display: flex; align-items: center; }
    header a { color: #fff; font-weight: bold; font-size: 20px; text-decoration: none; margin-right: auto; }
    main { background: #a31621; padding: 80px 20px; text-align: center; }
    main h1 { font-size: 36px; margin-bottom: 24px; color: #fff; }
    .search-form { display: flex; max-width: 600px; margin: 0 auto; gap: 8px; }
    input#search-box-input { flex: 1; padding: 14px 18px; border-radius: 4px; border: none; font-size: 16px; color: #111; background: #fff; }
    input#search-box-input::placeholder { color: #555; }
    button#search-btn { padding: 14px 28px; background: #fff; color: #a31621; border: 2px solid #fff; border-radius: 4px; font-size: 16px; font-weight: bold; cursor: pointer; }
    button#search-btn:hover { background: #f0f0f0; }
  </style>
</head>
<body>
  <header>
    <a href="/">Redfin</a>
  </header>
  <main>
    <h1>The #1 site real estate professionals trust</h1>
    <form class="search-form" role="search" aria-label="Property search">
      <label for="search-box-input" class="sr-only">Search by city, address, school, agent, or ZIP</label>
      <input
        id="search-box-input"
        type="search"
        placeholder="City, Address, School, Agent, ZIP"
        aria-label="Search by city, address, school, agent, or ZIP"
      />
      <button id="search-btn" type="submit" data-rf-test-name="searchButton">Search</button>
    </form>
  </main>
</body>
</html>`;
}
