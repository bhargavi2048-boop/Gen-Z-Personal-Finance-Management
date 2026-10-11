# 🚀 Z-Finance | Premium Gen Z Personal Finance Web Application

> **A real-world, algorithmic personal finance dashboard built for Gen Z users managing a ₹10,000 budget over a 30-day cycle.**

[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6_Strict-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF.svg)](https://vitejs.dev/)
[![ESLint](https://img.shields.io/badge/ESLint-0_Errors_0_Warnings-success.svg)](https://eslint.org/)

---

## 🌟 Executive Overview

**Z-Finance** bridges the gap between basic retroactive expense loggers and predictive fintech platforms. Specifically calibrated for the financial reality of college students and early-career Gen Z adults managing a limited monthly budget of **₹10,000 across 30 days**, every tap, swipe, and committed auto-debit triggers an interconnected cascade across the user's:

- **Genuinely Available Discretionary Balance** (Free money after setting aside fixed commitments and savings goals)
- **Dynamic Daily Spending Allowance** (Recalculated every single day based on remaining funds and runway)
- **Financial Health & Risk Score (0–100)** (An algorithmic assessment across 5 transparent pillars)
- **30-Day Cash Flow Forecast** (Simulating Optimistic, Expected, and High-Spend stress curves)
- **Decision Sandbox** (Testing *“Can I afford this ₹2,000 purchase?”* with before-and-after delta analysis before swiping)

---

## 📸 Key Features & Architecture

### 1. Financial Overview Dashboard
- **Capital Separation**: Visualizes ₹10,000 baseline, total spent, committed upcoming dues, and stashed savings.
- **Dynamic Daily Allowance**: Computes recommended daily runway dynamically:  
  $$\text{Daily Allowance} = \frac{\text{Cash in Hand} - \text{Committed Bills} - \text{Savings Locked}}{\text{Remaining Days}}$$
- **Radial Health Gauge**: 0–100 score with risk classification (*Low, Moderate, High, Critical*).
- **Interactive 30-Day Curves**: Recharts Area chart displaying historical actuals and future projections overlaid with scheduled auto-debits.
- **Category Donut Chart**: Real-time spending distribution with progress bars showing limit utilization.

### 2. Transaction Ledger (Expense & Income)
- Record, edit, and delete daily UPI, Card, NetBanking, and Cash transactions.
- Categories: *Food & Dining, Transport & Metro, Education, Shopping, Entertainment, Bills & Utilities, Health & Wellness, Personal Care*.
- Real-time instant recalculation across all tabs without page reload.
- Full text search, filter by type (Inflow/Outflow), category, payment method, and multi-parameter sorting.

### 3. Budget Planner & Fixed Commitments
- **3-Way Capital Segmentation**: Clearly differentiates **Spent Money**, **Committed Money** (reserved auto-debits), and **Genuinely Available Money**.
- Inline editable category spending limits with automatic amber (70%) and danger (90%) thresholds.
- Scheduled commitments calendar for Wi-Fi splits, student OTTs, mobile recharges, and room expenses.
- One-click *“Settle Now”* action converts commitments into ledger transactions without double-counting.

### 4. Savings Goals & Milestones
- Track aspirational targets (e.g. *Sony ANC Headphones*, *Emergency Safety Buffer*).
- Progress bars, remaining contributions, and automated completion date estimation.
- **Interactive Contribution & Withdrawal**: Validated against real liquid funds.
- **Milestone Celebration**: Triggers confetti animation on 100% goal achievement.

### 5. Subscription Management & Cancel Simulator
- Track recurring student plans (Spotify Student ₹59, JioFiber ₹499, YouTube Premium ₹79, Gym Pass ₹600).
- **“Simulate Cancel” Sandbox Toggle**: Instantly see how cutting a subscription frees up monthly money and boosts daily allowance (e.g., *+₹14/day*).

### 6. Interactive Financial Decision Simulator
Dedicated sandbox allowing users to model hypothetical financial choices:
- *“Can I afford a ₹2,000 shopping purchase today?”*
- *“What happens if I save ₹1,000 this week?”*
- *“What if my monthly subscriptions increase by ₹350?”*
- *“What if I earn an extra ₹2,000 freelance design stipend?”*
- *“What happens if an emergency costs ₹3,000?”*
- **Custom Decision Builder**: Input any custom amount, nature, and category.
- **Side-by-Side Impact Analysis**:
  - Available Balance Before vs After ($\Delta$)
  - Daily Allowance Before vs After ($\Delta / \text{day}$)
  - Health Score Shift ($\Delta \text{ points}$)
  - Month-End Projected Balance
  - Transparent trade-offs and personalized advice
- **Zero-Risk**: Test without modifying actual records, or click **“Apply to Real Budget”** to commit.

### 7. Unexpected Expense Simulator
- Instant access emergency shock tester.
- Presets: *Phone screen repair (₹2,500), Urgent doctor visit (₹1,200), Airport cab (₹950), Replacement charger (₹1,800)*.
- Stress-tests budget resilience and warns of overdraft risks.

### 8. Contextual AI Financial Insights Engine
Rule-based engine monitoring live data:
- *Food burn rate pacing alerts* with projected exhaustion day.
- *Subscription burden percentages* and trim recommendations.
- *Daily allowance compression warnings*.
- *Why this appears*: Displays transparent data evidence for every recommendation.

### 9. Timeline Scrubber & Simulation Controls
- Interactive **Day 1 to 30 Scrubber Slider**: Fast-forward or rewind timeline to observe how calculations adapt dynamically.
- Data export/import (JSON) for complete portable persistence.
- Reset to pre-loaded realistic Gen Z demo data.
- Light and dark theme switcher.

---

## 📐 Mathematical Integrity & Accounting Model

To eliminate common fintech edge cases, calculations are governed by strict identities:

$$\text{Cash in Hand} = \text{Initial Budget} + \sum \text{Income} - \sum \text{Expenses}_{\le \text{Current Day}}$$

$$\text{Genuinely Available} = \text{Cash in Hand} - \sum \text{Unpaid Future Commitments} - \sum \text{Savings Locked}$$

$$\text{Daily Allowance} = \max\left(0, \left\lfloor \frac{\text{Genuinely Available}}{\max(1, \text{Total Days} - \text{Current Day} + 1)} \right\rfloor\right)$$

- **No Double-Counting**: Commitments marked paid or linked to existing completed expenses are automatically excluded from future committed reservations.
- **Indian Rupee Formatting**: Formatted with standard Indian groupings (e.g. `₹10,000`, `₹1,50,000`).
- **Deficit Protection**: If expenses exceed capital, daily allowance safely clamps to `₹0/day` and triggers critical warning states.

---

## 🛠️ Tech Stack & Dependencies

- **Frontend**: React 18 with TypeScript (Strict mode enabled)
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS 3.4 with custom fintech palette & glassmorphism
- **Visualizations**: Recharts (Responsive Area and Donut Pie charts)
- **Icons**: Lucide React
- **Celebration Effects**: Canvas Confetti
- **Linting**: ESLint 8 (Zero errors, zero warnings configured)

---

## 🚀 Installation & Running Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` (v9 or higher)

### Step 1: Extract or Clone the Project
```bash
cd genz-finance-app
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Run the Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:3000` or the port displayed in your terminal.

### Step 4: Build for Production
```bash
npm run build
```
Creates an optimized static bundle in the `dist/` folder ready for deployment on Vercel, Netlify, or GitHub Pages.

### Step 5: Run Code Quality Checks
```bash
npm run lint
```
Verifies strict TypeScript and ESLint rules with 0 errors and 0 warnings.

### Step 6: Run Automated Verification Tests
```bash
npm test
```
Executes the mathematical invariant test suite verifying available balances, zero double-counting, health score tiers, and forecast curves.

---

## 🏛️ Comprehensive Architecture & Design Patterns

A full, detailed technical breakdown is available in [ARCHITECTURE.md](file:///C:/Users/BHARGAVI/.gemini/antigravity/scratch/genz-finance-app/ARCHITECTURE.md), covering:
- **Layered Clean Architecture** (Presentation, Custom Hooks, State/Context, Pure Engine, Services, Persistence).
- **Uni-directional Data Flow** with strict mathematical invariant proofs.
- **Dynamic Code-Splitting** with `React.lazy()` and `Suspense` for optimal First Contentful Paint.
- **WCAG 2.1 AA Accessibility Matrix** (Keyboard `Escape` listeners, `<label htmlFor>` / `<input id>` associations, screen-reader live regions).
- **Innovative Gen Z Fintech Modules**:
  - `ImpulseVibeCheck`: Opportunity-cost & freelance labor-hours converter for impulse purchases.
  - `Smart Sub-Killer`: Annualized ROI & SIP wealth compounding simulator.

---

## 📁 Project Structure

```
genz-finance-app/
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── .eslintrc.cjs
├── .editorconfig
├── .prettierrc
├── .gitignore
├── .env.example
├── LICENSE                          # MIT License
├── CONTRIBUTING.md                  # Development guidelines & contribution workflow
├── CHANGELOG.md                     # Semantic versioning release history
├── SECURITY.md                      # Security policy & responsible disclosure
├── README.md
├── ARCHITECTURE.md                  # Comprehensive technical architecture blueprint
├── scripts/
│   └── verifyCalculations.js        # Standalone math verification test suite
└── src/
    ├── main.tsx
    ├── App.tsx                      # Code-split application root with ErrorBoundary
    ├── index.css
    ├── types/
    │   └── index.ts                 # Strict TypeScript domain interfaces
    ├── constants/
    │   └── initialData.ts           # Realistic Gen Z seed data (Day 12 of 30)
    ├── engine/
    │   ├── financialEngine.ts       # Single source of truth financial calculations
    │   └── __tests__/
    │       └── financialEngine.test.ts # Mathematical invariant unit tests
    ├── context/
    │   └── FinanceContext.tsx       # State provider with hash routing & toast bus
    ├── services/
    │   ├── storageService.ts        # LocalStorage persistence abstraction
    │   └── financeService.ts        # Export/import and payload validation
    ├── hooks/
    │   ├── useFinance.ts            # Domain state hook
    │   ├── useDebounce.ts           # Search debounce hook
    │   ├── useLocalStorage.ts       # Synchronized storage hook
    │   └── useKeyboardShortcut.ts   # Accessible keyboard event hook
    ├── utils/
    │   ├── currency.ts              # Indian currency formatting & paise conversion
    │   ├── date.ts                  # Day pacing and date offsets
    │   ├── validators.ts            # Input sanitization and validators
    │   └── confetti.ts              # Milestone celebration effect
    └── components/
        ├── common/
        │   ├── Header.tsx           # Sticky top bar with day scrubber
        │   ├── Sidebar.tsx          # Responsive navigation & hash deep-linking
        │   ├── Toast.tsx            # Accessible ARIA status notification
        │   ├── ErrorBoundary.tsx    # Crash resilience boundary
        │   └── OnboardingModal.tsx  # 3-step introductory walkthrough tour
        ├── dashboard/
        │   ├── OverviewDashboard.tsx# Command center
        │   ├── FinancialHealthCard.tsx # Radial gauge & educational disclaimer
        │   ├── CashFlowChart.tsx    # 30-day projection curves
        │   └── CategoryDistribution.tsx # Recharts Donut & limit progress bars
        ├── transactions/
        │   └── TransactionManager.tsx # Ledger with debounced search & clear filters
        ├── budget/
        │   └── BudgetPlanner.tsx    # 3-bucket allocation & commitments list
        ├── savings/
        │   └── SavingsGoalsView.tsx # Goals & deposit/withdraw modals
        ├── subscriptions/
        │   └── SubscriptionManager.tsx # Recurring dues & Smart Sub-Killer simulator
        ├── simulator/
        │   ├── DecisionSimulatorView.tsx # 5 verbatim prompt question sandbox
        │   └── UnexpectedExpenseModal.tsx # 4 verbatim emergency shock presets
        ├── innovations/
        │   └── ImpulseVibeCheck.tsx # Opportunity cost & labor hours calculator
        ├── insights/
        │   └── FinancialInsightsView.tsx # Contextual rule-based recommendation engine
        └── settings/
            └── SettingsView.tsx     # Parameters, JSON backup & timeline scrubber
```

---

## 👩‍💻 Authorship & Personal Branding

**Built with care by Bhargavi N**  
*Senior AI Engineer & Full-Stack Architect*

