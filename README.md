Redfin Search Automation Test Suite
Author: Rava Razavi
Framework: Playwright with TypeScript
Duration: 2-3 hours implementation
This repository contains automated tests for the Redfin real estate website's search functionality, demonstrating modern test automation practices and real-world problem-solving.


🔧 Dependencies

To run this automation framework, you’ll need:
	•	Node.js (v16 or higher) – JavaScript runtime
	•	npm or yarn – Package manager
	•	Playwright – Web automation framework
	•	TypeScript – Type-safe development

⸻

📚 Required Libraries
	•	@playwright/test – Core Playwright runner
	•	typescript – TypeScript compiler
	•	@types/node – Node.js typings

    

✅ What This Does

This test suite covers Redfin’s search bar functionality.
	•	Positive Test 1: Search by ZIP code (22304)
	•	Positive Test 2: Search by city (Arlington, VA)
	•	Negative Test: Try searching with an empty field

The last one passes fully. The first two are skipped in this version because Redfin seems to block automated searches right after submission — likely due to bot protection or security rules.


🧪 How to Run
npm install           
npx playwright install    
npm test            


💡 Notes
	•	The search bar and button are properly located and interacted with
	•	The cookie banner is handled automatically
	•	The empty search test confirms no navigation happens (as expected)
	•	The ZIP/city tests go through all the right steps, but Redfin stops the browser from continuing after search — which is expected on live prod sites


📦 File Structure
/tests
  └─ redfin-search.spec.ts   ← test cases
/playwright.config.ts        ← config
/package.json                ← dependencies


# redfin-search-automation
Automated UI tests for Redfin search functionality using Playwright
