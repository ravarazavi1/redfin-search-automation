# AGENTS.md — Architectural Rules

This document is the constitution for this test framework.
Every file lives in a layer. Layers can only depend **downward**.
These rules are enforced by convention and code review — violating them defeats the architecture.

---

## Dependency Hierarchy

```
┌─────────────────────────────────────────┐
│  SPECS (*.ui.spec.ts)                   │  ← Orchestration only
│  SCENARIOS (*.scenarios.ts)             │  ← Pure data only
├─────────────────────────────────────────┤
│  WORKFLOWS (*.workflows.ts)             │  ← Business flows, return DTOs
│  ASSERTIONS (*.assertions.ts)          │  ← Pure validation functions
├─────────────────────────────────────────┤
│  PAGE OBJECTS (*.page.ts)               │  ← Raw UI adapters
│  HELPERS (*.ts in helpers/)             │  ← Stateless utilities
├─────────────────────────────────────────┤
│  DATA MODELS (*.data.ts)                │  ← Static constants
│  INTERFACES (*.interface.ts)            │  ← Type definitions
└─────────────────────────────────────────┘
```

---

## Rules — Non-Negotiable

| Rule | Why |
|------|-----|
| Specs CANNOT import page objects directly | Forces all interactions through workflows (reusability) |
| Specs CANNOT contain assertions | Assertions belong in *.assertions.ts files |
| Workflows MUST return DTOs (never `void`) | Enables assertions to validate output without side effects |
| Workflows CANNOT contain `expect()` calls (except invariant guards) | Assertions are decoupled from flow |
| Assertions use `expect.soft()` exclusively | Captures ALL failures in one run, not just the first |
| Scenarios CANNOT contain async code | Pure data = easily generated from spreadsheets / TestRail |
| Scenarios CANNOT import from workflows or helpers | Only interfaces and data models allowed |
| Page objects CANNOT call `expect()` | They are raw adapters — no validation logic |
| Data models contain ZERO logic | Static constants only |

---

## Layer Definitions

### Specs (`src/tests/**/*.spec.ts`)
- Loop over scenarios
- Build `PageContext` from fixture-injected `{ pages, logger }`
- Call workflows based on `scenario.workflow`
- Pass DTOs to assertion functions
- Use `test.step()` to label each phase

### Scenarios (`src/tests/**/*.scenarios.ts`)
- Export a typed array: `scenarios: SomeTestScenario[]`
- No async, no imports from workflows/helpers, no `expect()`
- Import only from `@interface/*` and `@dataModels/*`
- `workflow` field is a union string type — TypeScript enforces valid values
- `actionsData` = what to DO; `expectedResults` = what to CHECK

### Workflows (`src/lib/workflows/ui/*.workflows.ts`)
- `static async` methods that accept `PageContext`
- Orchestrate page object calls
- Return a DTO with all data the assertion needs
- May include invariant guards (`expect(response.status()).toBe(200)`) but no scenario-level assertions

### Assertions (`src/lib/workflows/ui/*.assertions.ts`)
- Pure functions: `(dto, expected) => void`
- Only `expect.soft()` — no API calls, no page interactions
- Accept the DTO from the matching workflow and the `expectedResults` from the scenario

### Page Objects (`src/lib/pageObjects/*.page.ts`)
- Raw UI adapters — wrap Playwright locators
- Return primitive values or page state (strings, booleans, numbers)
- No `expect()` calls
- Anti-bot helpers imported from `@helpers/antiBot`

### Page Registry (`src/lib/pageObjects/pageRegistry.index.ts`)
- Aggregates all page object instances
- Injected into `PageContext` via the fixture

### Fixture (`src/lib/fixtures/browser.fixture.ts`)
- Extends Playwright's `base.extend()`
- Provides `{ pages, logger, browserSetupOptions }` to every test
- `browserSetupOptions` is an `{ option: true }` fixture — overridable via `test.use()`

### Helpers (`src/lib/helpers/`)
- Stateless utility functions, no domain logic
- `antiBot.ts` — header injection, webdriver suppression, random delays
- `humanTyping.ts` — character-by-character typing simulation
- `logger.ts` — CI-aware structured logging

### Data Models (`src/lib/dataModels/`)
- Static constants only (`as const` preferred)
- Imported by scenarios (not by specs directly)

### Interfaces (`src/lib/interface/`)
- Type definitions and contracts
- `BaseTestScenario<TWorkflow, TExpectedResults, TActionsData>` is the core generic
- `PageContext` — unified parameter passed to all workflow methods
- All re-exported via `interface.index.ts`

---

## Path Aliases (tsconfig.json)

```
@fixtures/*    → src/lib/fixtures/*
@workflows/*   → src/lib/workflows/*
@pageObjects/* → src/lib/pageObjects/*
@helpers/*     → src/lib/helpers/*
@interface/*   → src/lib/interface/*
@dataModels/*  → src/lib/dataModels/*
```

---

## Adding a New Test Domain

1. Define workflow union type and expected-results/actions-data interfaces
2. Compose `export type MyTestScenario = BaseTestScenario<...>`
3. Write `my.scenarios.ts` — pure data array
4. Write `my.workflows.ts` — static methods, return DTOs
5. Write `my.assertions.ts` — `expect.soft()` validators
6. Write `my.ui.spec.ts` — loop + conditional dispatch on `scenario.workflow`
7. Add page object methods to the relevant `*.page.ts` if new interactions are needed

---

## Anti-Bot Strategy (Redfin-Specific)

Redfin's production site uses bot detection. The framework handles this at multiple levels:

- **Headers**: `applyAntiBotHeaders()` injects realistic browser fingerprints
- **Timing**: `randomDelay()` introduces human-like pauses between interactions
- **Mouse**: `moveMouseNaturally()` simulates random cursor movement
- **Typing**: `typeHumanLike()` types character-by-character with variable delay
- **Graceful degradation**: `assertSearchResults()` falls back to input-value validation when anti-bot blocks the results page — tests still surface meaningful signal

Bot-blocked tests are **not** marked as failures — they report a clear anti-bot fallback message so CI stays green while the signal is preserved.
