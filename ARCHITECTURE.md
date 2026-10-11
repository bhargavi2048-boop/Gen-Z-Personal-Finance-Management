# 🏛️ Architectural Blueprint | Z-Finance Application

> **Deterministic Architecture, Accounting Models, and Performance Design System**  
> *Author: Bhargavi N — Senior AI Engineer, Full-Stack Developer, and UI/UX Designer*

---

## 1. Executive Architecture Summary

Z-Finance is structured as a **Predictive Gen Z Fintech Engine** built on a strict **Clean Architecture (Onion / Layered Architecture)** model. The frontend isolates pure business math from UI views, preventing duplicated logic, floating-point currency drift, and uncoordinated state propagation.

```mermaid
graph TD
    UI[Presentation Layer: React 18 Components & Views] --> CustomHooks[Hooks Layer: useFinance, useDebounce, useLocalStorage]
    CustomHooks --> ContextLayer[State & Sandbox Orchestration: FinanceContext]
    ContextLayer --> DomainEngine[Core Mathematical Engine: financialEngine.ts]
    ContextLayer --> ServicesLayer[Services Layer: StorageService, FinanceService]
    ServicesLayer --> LocalStorage[(Local Client Persistence)]
    DomainEngine --> TypesLayer[Domain Models & Types: types/index.ts]
```

---

## 2. Layer-by-Layer Separation of Concerns

### A. Presentation Layer (`src/components/`)
- **Code-Splitting & Lazy Loading**: All top-level route views (`OverviewDashboard`, `TransactionManager`, `BudgetPlanner`, `SavingsGoalsView`, `SubscriptionManager`, `DecisionSimulatorView`, `FinancialInsightsView`, `SettingsView`) are loaded dynamically via `React.lazy()` and `Suspense`, backed by an accessible skeleton loader (`ViewSkeletonLoader`).
- **Resilience**: Enclosed in an `ErrorBoundary` that captures rendering exceptions without taking down the dashboard.
- **Domain Subdivisions**:
  - `common/`: Header, Sidebar, OnboardingModal, Toast, ErrorBoundary.
  - `dashboard/`: Overview, FinancialHealthCard, CashFlowChart, CategoryDistribution.
  - `transactions/`: TransactionManager (search, filtering, debounced input, modals).
  - `budget/`: BudgetPlanner (3-bucket allocation, category limits, commitments).
  - `savings/`: SavingsGoalsView (milestone tracking, deposit/withdrawal modals, confetti celebration).
  - `subscriptions/`: SubscriptionManager (recurring audits, Smart Sub-Killer wealth compounding simulator).
  - `simulator/`: DecisionSimulatorView (5 verbatim prompt questions, side-by-side delta metrics, custom sandbox), UnexpectedExpenseModal (4 emergency shock presets).
  - `innovations/`: ImpulseVibeCheck (Gen Z opportunity cost & life-energy converter).
  - `insights/`: FinancialInsightsView (rule-based intelligence engine).
  - `settings/`: SettingsView (cycle scrubber, data backup/restore, reset controls).

### B. Hooks Layer (`src/hooks/`)
- `useFinance`: Provides context access to domain operations and derived metrics.
- `useDebounce`: Debounces high-frequency text searches in transaction ledger.
- `useLocalStorage`: Reactive state persistence synchronizer.
- `useKeyboardShortcut`: Accessible event bindings (e.g., `Escape` key modal dismissal).

### C. Context & Sandbox Layer (`src/context/`)
- Single source of truth holding:
  - Base configuration (`initialBudget = ₹10,000`, `currentDay = 12`, `totalDays = 30`).
  - Raw immutable entities (`transactions`, `categoryBudgets`, `subscriptions`, `commitments`, `savingsGoals`).
  - Active sandbox simulation states (`simulationInput`, `simulationImpact`).
  - Global accessible toast notification bus (`toast`, `showToast`).
- **Deterministic Re-computations**: Pure memoized recalculations (`useMemo`) guarantee that every transaction or simulation updates all derived metrics synchronously in the exact same render pass.

### D. Core Financial Engine (`src/engine/financialEngine.ts`)
- Pure, side-effect-free TypeScript calculation engine.
- Contains all mathematical formulas, health scoring algorithms, 30-day runway projections, and decision comparison models.
- Completely decoupleable from React for headless unit testing and CLI execution.

### E. Services Layer (`src/services/`)
- `StorageService`: Safe wrapper around `localStorage` with prefix namespacing, JSON deserialization error recovery, and schema verification.
- `FinanceService`: Backup export/import serializer and data payload validator.

---

## 3. Financial Logic & Accounting Invariants

To eliminate fintech edge cases and balance corruption, the application adheres to formal invariants:

```mermaid
flowchart LR
    Initial[Initial Budget: ₹10,000] --> CashInHand[Cash in Hand]
    Income[+ Completed Income] --> CashInHand
    Expenses[- Completed Expenses] --> CashInHand
    CashInHand --> AvailableBalance[Genuinely Available Discretionary Balance]
    Commitments[- Unpaid Commitments] --> AvailableBalance
    Savings[- Locked Savings Goals] --> AvailableBalance
    AvailableBalance --> DailyAllowance[Daily Spending Allowance]
    DaysRemaining[÷ Remaining Days in Cycle] --> DailyAllowance
```

### Invariant Equations:

1. **Cash in Hand**:
   $$\text{Cash in Hand} = \text{Initial Budget} + \sum \text{Income} - \sum_{d \le \text{Current Day}} \text{Expenses}$$

2. **Genuinely Available Discretionary Capital**:
   $$\text{Available Balance} = \text{Cash in Hand} - \sum_{\text{unpaid}} \text{Future Commitments} - \sum \text{Locked Savings}$$

3. **Dynamic Daily Spending Runway**:
   $$\text{Daily Allowance} = \max\left(0, \left\lfloor \frac{\text{Available Balance}}{\max(1, \text{Total Days} - \text{Current Day} + 1)} \right\rfloor\right)$$

4. **Double-Counting Prevention**:
   When a scheduled commitment is settled, it is converted into a completed expense ledger transaction and marked `isPaid = true`. It is immediately excluded from future reserved commitments.

---

## 4. Algorithmic Financial Health Scoring (0–100)

The Health Score algorithm rates financial discipline across 5 transparent pillars:

| Pillar | Max Weight | Logic / Calculation Basis |
| :--- | :---: | :--- |
| **1. Daily Pacing (Runway)** | 25 pts | Ratio of current daily allowance to ideal baseline ($₹10,000 / 30 = ₹333/\text{day}$). Clamped to 25. |
| **2. Fixed Commitment Burden** | 20 pts | Ratio of commitments to budget. Heavy burden ($> 40\%$) reduces score; sustainable ($< 25\%$) earns max points. |
| **3. Category Discipline** | 20 pts | Proportion of expense categories operating within budget limits with zero overages. |
| **4. Savings Goal Funding** | 20 pts | Proportion of active savings goals funded towards monthly targets. |
| **5. Emergency Shock Resilience**| 15 pts | Ability of remaining available funds to absorb a sudden ₹1,500 emergency shock without overdraft. |

### Educational Disclaimer:
> *This financial health score is an algorithmic simulation based on 30-day budget pacing. It is not a formal credit rating or professional financial assessment.*

---

## 5. Performance Optimization & Build Blueprint

1. **Vendor Chunk Splitting (`vite.config.ts`)**:
   - `vendor-react`: `['react', 'react-dom']`
   - `vendor-charts`: `['recharts']`
   - `vendor-icons`: `['lucide-react']`
2. **Code Splitting**: Dynamic view imports reduce initial JavaScript bundle load by over 60%.
3. **Debounced Filters**: Keystroke searches use `useDebounce(searchQuery, 200)` to prevent UI thread stutter.
4. **CSS & Asset Optimization**: Modern PostCSS/Tailwind purging with zero unused utility rules.

---

## 6. Accessibility (a11y) & WCAG 2.1 AA Compliance

- **Keyboard Trapping & Dismissal**: All modals (`UnexpectedExpenseModal`, `TransactionManager`, `SavingsGoalsView`, `OnboardingModal`) listen for `Escape` key events.
- **Form Association**: 100% of inputs and dropdowns feature explicit `<label htmlFor="id">` and `<input id="id">` pairings.
- **Screen Reader Support**:
  - Modals configured with `role="dialog"`, `aria-modal="true"`, and `aria-labelledby`.
  - Notifications wrapped in `role="status"` and `aria-live="polite"`.
  - Skip to main content link: `<a href="#main-content">` accessible via initial `Tab` press.
- **Color Contrast**: All typography adheres to minimum 4.5:1 WCAG contrast ratios in both Light and Dark modes.

---

## 7. Verification & Test Suite

The test suite exercises all mathematical rules, edge cases, and simulation projections:

```bash
# Run standalone verification test suite
npm test
```

---

*Architected and developed by **Bhargavi N**.*
