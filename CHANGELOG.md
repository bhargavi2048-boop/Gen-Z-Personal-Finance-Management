# Changelog

All notable changes to the **Z-Finance** application are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.0.0] - 2026-10-11

### Added
- **6-Tier Clean Architecture**: Isolated `src/services/` (`StorageService`, `FinanceService`), `src/hooks/` (`useDebounce`, `useLocalStorage`, `useKeyboardShortcut`), and `src/utils/`.
- **Gen Z Impulse Vibe-Check**: Opportunity cost and freelance labor-hour calculator for impulse purchases.
- **Smart Sub-Killer Compounding Simulator**: Visualizes 3-year and 10-year compounding index fund/SIP wealth accumulation from cancelled subscriptions.
- **Crash Resilience**: Integrated `ErrorBoundary` catching unhandled runtime exceptions with single-click reload.
- **Floating Toast Notification Bus**: Global accessible notification banner featuring `role="status"` and `aria-live="polite"`.
- **Comprehensive Documentation**: Added `ARCHITECTURE.md`, `LICENSE`, `CONTRIBUTING.md`, and this `CHANGELOG.md`.
- **Automated Verification Test Suite**: Unit tests validating balance identities, runway math, and 5 financial health pillars.

### Changed
- **Dynamic View Code-Splitting**: Replaced synchronous imports with `React.lazy()` and `Suspense` across all 8 views, backed by `ViewSkeletonLoader`.
- **Vendor Chunk Optimization**: Configured Rollup `manualChunks` in `vite.config.ts` separating Recharts, Lucide icons, and React runtime.
- **Debounced Ledger Search**: Search input queries in `TransactionManager` debounced at 200ms.
- **Verbatim Prompt Alignment**: All 4 emergency shock presets and 5 decision simulator questions mapped word-for-word.
- **Educational Credit Score Disclaimer**: Added visible educational notice on `FinancialHealthCard`.

### Fixed
- **WCAG 2.1 AA Compliance**: Enforced `Escape` key modal dismissal, `<nav aria-label="...">` landmark, and 100% `<label htmlFor>` / `<input id>` associations.
- **Empty State Quick Recovery**: Added "Reset All Filters" button in `TransactionManager`.

---

## [1.0.0] - 2026-10-11

### Added
- Initial release of Gen Z Personal Finance Web Application with ₹10,000 / 30-day budget engine.
- Overview Dashboard, Ledger, Budget Planner, Savings Goals, and Subscriptions manager.
- Recharts Cash Flow Area charts and Category Donut charts.
- Dark and Light theme toggle.

*Authored with care by Bhargavi N.*
