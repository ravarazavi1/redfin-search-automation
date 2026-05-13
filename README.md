# Redfin Search Automation — Enterprise Playwright Framework

[![Playwright Tests](https://github.com/ravarazavi1/redfin-search-automation/actions/workflows/playwright.yml/badge.svg)](https://github.com/ravarazavi1/redfin-search-automation/actions/workflows/playwright.yml)

**Author:** Rava Razavi  
**Stack:** Playwright · TypeScript · Claude AI (Anthropic SDK)  
**Purpose:** Portfolio showcase — senior SDET practices at scale

A production-grade test automation framework built around Redfin's real estate search. Three distinct test layers, strict layered architecture, and Claude AI integration for intelligent test analysis, scenario generation, and self-healing locators.

---

## Architecture Overview

```
SPEC FILES
  └─ SCENARIOS          (typed data-driven test cases)
       └─ WORKFLOWS     (orchestration + DTO return)
            └─ ASSERTIONS        (pure validation, expect.soft())
            └─ PAGE OBJECTS      (UI layer)  /  ENDPOINT OBJECTS  (API layer)
                 └─ HELPERS      (antiBot, humanTyping, networkInterceptor, locatorHealer)
                      └─ DATA MODELS  /  INTERFACES
```

All dependencies flow **downward only**. Specs never touch page objects directly; workflows never import test fixtures. Each layer is independently testable and replaceable.

---

## Three Test Layers

### Layer 1 — Network Mocked UI (`npm run test:mocked`)

Uses Playwright's `page.route()` to intercept Redfin navigation and serve fixture HTML — **zero live network traffic, zero bot detection risk**. Demonstrates deterministic testing of real page-object logic (selectors, inputs, navigation assertions) in complete isolation.

```
src/lib/helpers/networkInterceptor.ts    ← installs route() handlers
src/lib/dataModels/mockHtml.data.ts      ← fixture HTML per ZIP code
src/tests/ui/mocked/search/             ← 4 tests, ~16s total
```

### Layer 2 — Geocoding API (`npm run test:api`)

Real HTTP testing against the OpenStreetMap Nominatim API — validating that ZIP codes resolve to the correct city and state. This is exactly the pre-condition a real estate platform validates before a search. No auth required.

```
src/lib/endpointObjects/censusApi.endpoints.ts   ← GeocodingApiEndpoints
src/lib/workflows/api/housingData.workflows.ts   ← LocationDataWorkflows
src/tests/api/regression/housing/               ← 5 tests incl. negative
```

### Accessibility Audit (`npm run test:a11y`)

axe-core WCAG 2.1 AA audit against the mocked pages. Because the fixtures are fully controlled HTML, violations are deterministic — any regression in the markup immediately shows up as a failing test. Asserts **zero violations** across all pages, including landmark structure, form labels, and color contrast.

```
src/lib/workflows/ui/a11y.workflows.ts        ← AxeBuilder wrapper → A11yResultDto
src/lib/workflows/ui/a11yAssertions.assertions.ts  ← zeroCritical, maxViolations, ruleIds
src/tests/ui/a11y/search/                     ← 5 tests: homepage + 3 ZIP pages + form controls
```

### Layer 3 — Live UI Regression (`npm run test:web`)

Full end-to-end suite against Redfin's production site. Handles Cloudfront WAF and Akamai bot detection via stealth patches, human-like typing, and graceful fallback assertions. When blocked, tests validate input retention rather than hard-failing.

```
src/lib/pageObjects/                     ← HomePage, ResultsPage
src/lib/helpers/antiBot.ts               ← navigator patches, random delays
src/lib/helpers/humanTyping.ts           ← variable-speed keystroke simulation
src/tests/ui/regression/search/         ← 7 tests: direct URL + search-box flows
```

---

## AI Integration (Layer 3+)

All three tools use **Claude Opus 4.7** with `thinking: { type: 'adaptive' }` and streaming. Requires `ANTHROPIC_API_KEY`.

### AI Report Analyzer
Reads `test-results.json` and streams a Markdown report: executive summary, failure root-cause analysis, anti-bot notes, and prioritized next actions.

```bash
ANTHROPIC_API_KEY=sk-ant-... npm run ai:report
# → writes ai-report.md
```

### AI Scenario Generator
Takes a user story and outputs a fully typed, framework-compliant `*.scenarios.ts` file — correct imports, TestRail IDs, tags, and scenario variants.

```bash
ANTHROPIC_API_KEY=sk-ant-... npm run ai:generate \
  --story "As a user I want to filter homes by price range" \
  --output src/tests/ui/regression/filters/filters.scenarios.ts
```

### AI Self-Healing Locators
Accepts a Playwright screenshot `Buffer` and a broken CSS selector. Sends both to Claude Vision, returns a healed selector with confidence rating and reasoning.

```typescript
import { LocatorHealer } from '@helpers/locatorHealer';

const healer = new LocatorHealer();
const screenshot = await page.screenshot();
const result = await healer.heal(screenshot, '#old-broken-input');
// result.healedSelector → '[data-rf-test-id="search-input"]'
// result.confidence    → 'high'
// result.reasoning     → 'The element was renamed from #old-broken-input...'
```

---

## Project Structure

```
redfin-search-automation/
├── src/
│   ├── ai/
│   │   ├── reportAnalyzer.ts          # AI test report analysis
│   │   └── scenarioGenerator.ts       # AI scenario file generation
│   └── lib/
│       ├── dataModels/
│       │   ├── censusQueries.data.ts  # ZIP codes for API tests
│       │   ├── mockHtml.data.ts       # Fixture HTML for network mocking
│       │   └── searchQueries.data.ts  # ZIP codes, cities, direct URLs
│       ├── endpointObjects/
│       │   ├── baseRequest.ts         # HTTP base class
│       │   ├── censusApi.endpoints.ts # Nominatim geocoding endpoints
│       │   └── apiServices.index.ts   # API registry
│       ├── fixtures/
│       │   ├── api.fixture.ts         # API test fixture (ApiRegistry + Logger)
│       │   └── browser.fixture.ts     # UI fixture (PageRegistry + stealth setup)
│       ├── helpers/
│       │   ├── antiBot.ts             # navigator patches, random delays
│       │   ├── humanTyping.ts         # variable-speed keystroke simulation
│       │   ├── locatorHealer.ts       # Claude Vision self-healing locators
│       │   ├── logger.ts              # Structured test logger
│       │   └── networkInterceptor.ts  # page.route() intercept helpers
│       ├── interface/
│       │   ├── apiContext.interface.ts
│       │   ├── housingResult.interface.ts  # LocationResultDto
│       │   ├── pageContext.interface.ts
│       │   ├── searchResult.interface.ts
│       │   ├── testScenario.interface.ts   # BaseTestScenario<T, E, A>
│       │   └── interface.index.ts
│       ├── pageObjects/
│       │   ├── homePage.page.ts
│       │   ├── resultsPage.page.ts
│       │   └── pageRegistry.index.ts
│       └── workflows/
│           ├── api/
│           │   ├── housingAssertions.assertions.ts
│           │   └── housingData.workflows.ts
│           └── ui/
│               ├── mockedSearch.workflows.ts
│               ├── search.workflows.ts
│               └── searchAssertions.assertions.ts
├── scripts/
│   ├── ai-generate.ts         # CLI: AI scenario generator
│   ├── ai-report.ts           # CLI: AI report analyzer
│   └── bootstrap-storage.ts   # Captures storageState.json
└── src/tests/
    ├── api/regression/housing/
    │   ├── housing.api.spec.ts
    │   └── housing.scenarios.ts
    └── ui/
        ├── mocked/search/
        │   ├── mockedSearch.ui.spec.ts
        │   └── mockedSearch.scenarios.ts
        └── regression/search/
            ├── search.ui.spec.ts
            └── search.scenarios.ts
```

---

## Setup

```bash
npm install
npx playwright install --with-deps
```

---

## Running Tests

| Command | What it runs |
|---|---|
| `npm run test:mocked` | Layer 1 — Network mocked UI (4 tests, ~16s) |
| `npm run test:api` | Layer 2 — Geocoding API (5 tests, ~2s) |
| `npm run test:a11y` | Accessibility audit — WCAG 2.1 AA via axe-core (5 tests) |
| `npm run test:web` | Layer 3 — Live Redfin UI, Chromium (7 tests) |
| `npm run test:all` | All layers together (21 tests) |
| `npm run test:firefox` | Live UI on Firefox |
| `npm run test:webkit` | Live UI on Safari/WebKit |
| `npm run report` | Open Playwright HTML report |

---

## AI Commands

```bash
# Analyze the last test run and generate ai-report.md
ANTHROPIC_API_KEY=sk-ant-... npm run ai:report

# Generate a scenarios file from a user story
ANTHROPIC_API_KEY=sk-ant-... npm run ai:generate \
  --story "As a buyer I want to search homes by school district" \
  --output src/tests/ui/regression/schools/schools.scenarios.ts
```

---

## Key Design Decisions

**`BaseTestScenario<TWorkflow, TExpectedResults, TActionsData>`** — Generic type parameter ensures every scenario is fully typed. Adding a new workflow variant is a compile-time change, not a runtime surprise.

**DTOs everywhere** — Workflows return typed data objects, never `void`. Assertions are pure functions that accept DTOs. This separates "what happened" from "what should have happened" and makes both independently testable.

**`expect.soft()` throughout** — All assertion files use soft expects. A test captures every failure in one run instead of stopping at the first, giving the developer a complete picture.

**`page.route()` as first-class citizen** — The mocked UI layer isn't a workaround; it's a deliberate architectural choice. It lets us write deterministic tests for page-object logic without coupling them to Redfin's live availability.

**Graceful anti-bot fallback** — When Redfin's WAF blocks a request, `blockedByAntiBot: true` is set on the DTO and the assertion function pivots to validating input retention. Tests pass with a warning rather than failing with a timeout. The mocked layer is the solution for confident CI assertions.

---

## Anti-Bot Strategy

Redfin uses CloudFront WAF + Akamai for bot detection. The framework applies stealth at the fixture level (before the first navigation):

- `navigator.webdriver` overridden to `undefined` via `addInitScript`
- `window.chrome` runtime object injected
- `permissions.query` patched for notifications
- Headers: `referer: google.com`, `sec-ch-ua` Chrome hints, `accept-language`
- Random mouse movement + variable-speed typing between keystrokes
- Real Chrome binary via `channel: 'chrome'`

For CI pipelines where IP-level detection is unavoidable, `test:mocked` is the recommended target.
