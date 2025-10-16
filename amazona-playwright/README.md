# Amazona Playwright + TypeScript Framework

Prereqs
- Node.js LTS
- Amazona app running locally at BASE_URL (default http://localhost:3000)

Setup
1) Clone Amazona and run it (per its README).
2) In this folder:
   - npm install
   - npx playwright install

Environment
- Copy .env and adjust:
  BASE_URL=http://localhost:3000
  USER_EMAIL=test@example.com
  USER_PASSWORD=Password123

Run
- All tests: npx playwright test
- UI only: npx playwright test --grep @ui
- API only: npx playwright test --grep @api
- Report: npx playwright show-report

Notes
- POM in pages/
- API tests use Playwright request fixture; utils/apiClient.ts is available for custom contexts.
- Allure results are generated via allure-playwright reporter in ./allure-results.
