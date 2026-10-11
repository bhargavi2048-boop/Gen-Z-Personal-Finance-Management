# 🔒 Security Policy

## Supported Versions

Security updates and vulnerability remediation are actively maintained for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 2.0.x   | :white_check_mark: |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

---

## Reporting a Vulnerability

The **Z-Finance** development team takes the security, data privacy, and mathematical reliability of this platform seriously.

If you believe you have discovered a vulnerability or security consideration:

1. **Do not create a public issue** on GitHub.
2. Submit a private report to **Bhargavi N** with:
   - Type of issue (e.g. input sanitization, cross-site scripting, localStorage pollution, prototype injection).
   - Detailed step-by-step reproduction instructions.
   - Proof-of-concept payload or snippet.
   - Potential impact on end users.

We will acknowledge receipt within 48 hours and provide a remediation timeline.

---

## Client-Side Security & Architectural Safeguards

Z-Finance implements defense-in-depth measures against common client-side vulnerabilities:

1. **Zero External Data Exfiltration**:
   - All financial snapshots, transactions, and state remain strictly inside the user's browser `localStorage`.
   - No sensitive financial records are transmitted to third-party endpoints or untrusted CDNs.

2. **Input Sanitization & Injection Defense**:
   - All string inputs (transaction titles, goal names, notes) are sanitized through `Validators.sanitizeString()` to strip harmful HTML and script vectors before processing.
   - Numeric inputs are validated via `Validators.validateAmount()` to prevent `NaN`, negative zero, integer overflow, or invalid decimal parsing.

3. **Content Security & Safe Storage**:
   - Storage keys are namespaced under `StorageService` (`genz_finance_*`) to prevent key collision or cross-app tampering.
   - Backup snapshots are strictly validated against `FinanceExportPayload` schemas via `FinanceService.parseSnapshot()`.

---

*Policy maintained with care by Bhargavi N.*
