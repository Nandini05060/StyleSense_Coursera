# AI-Assisted Software Development — StyleSense AI

## 1. Role of AI Assistance in Requirements Analysis

During the requirements elicitation phase, the AI assistant (Google Antigravity) collaborated with the developer to refine the academic mini-project specifications:
- **De-Blackboxing the Recommendation System**: Rather than integrating an opaque third-party generative text API that could hallucinate non-existent items or prices, the AI assistant proposed a mathematically sound, auditable 100-point deterministic rubric (Occasion 30%, Style 25%, Color 20%, Budget 15%, Category 10%).
- **Addressing Choice Overload**: The assistant mapped the customer problem space into structured workflows: faceted catalog browsing, conversational style preference quizzes, and modular outfit slot coordination.
- **Specifying Safe Shopping Semantics**: Emphasized the critical necessity of database transactions, stock decrements, and historical order snapshots (preserving purchase-time price, title, and variant details).

---

## 2. AI Collaboration in UI/UX & Code Generation

The AI assistant assisted in structuring the full-stack architecture:
1. **Design System & Editorial Palette**: Co-created the Tailwind CSS configuration using Ivory (`#F7F3ED`), Charcoal (`#252321`), and Burgundy (`#793B48`), pairing Google Fonts `Playfair Display` (serif) with `Plus Jakarta Sans` (sans-serif) for high-end editorial aesthetics.
2. **Component Modularity**: Generated reusable UI components (`Button`, `Input`, `Badge`, `Modal`, `EmptyState`, `Skeleton`) with strict focus states and keyboard accessibility.
3. **Robust Dual-Database Adapter**: Designed the `db.js` layer with parameterized SQL queries for MySQL 8.0 alongside a high-fidelity in-memory relational simulation. This allowed development, testing, and UI validation to progress seamlessly even when local MySQL service credentials were being configured.

---

## 3. AI Assistance in Test Suite Engineering

The AI assistant helped construct 31 automated test cases across backend and frontend boundaries:
- **Recommendation Scoring Tests**: Validated that exact matches receive 100 points, partial matches receive proportional scores, out-of-budget products get partial/zero scores, and zero-stock items are excluded.
- **Security & Authorization Tests**: Verified bcrypt password hashing, duplicate email registration rejection, role-based admin endpoint protection (`403 Forbidden`), and cross-user order privacy checks.
- **Transactional Commerce Tests**: Simulated concurrent checkout scenarios, asserting that inventory decrements correctly, totals recalculate based strictly on server database values, and cart items clear upon confirmation.

---

## 4. Human Review, Diagnostics & Corrections

During development, active human inspection and critical engineering interventions took place:

### Example 1: Operator Precedence Bug in Database Query Parser
- **Issue Discovered**: In `server/src/config/db.js`, the query evaluator contained an operator precedence bug:
  ```javascript
  // Incorrect:
  if (lower.startsWith('select') && lower.includes('where p.id =') || lower.includes('where id ='))
  ```
  Because `&&` took precedence over `||`, any SQL query containing `WHERE id = ?` (such as `SELECT id, name, email, role FROM users WHERE id = ?`) mistakenly triggered the product handler rather than the user lookup, causing admin authentication checks to fail with `403`.
- **Human Correction**: Refactored the memory store parser to strictly evaluate table names first (`lower.includes('from users')` vs. `lower.includes('from products')`) before evaluating ID parameters. Re-running the test suite immediately produced 25/25 passing tests.

### Example 2: Ambiguous Query in Frontend Testing
- **Issue Discovered**: The Vitest frontend test `Test 27` failed with `TestingLibraryElementError: Found multiple elements with the text: /StyleSense/i` because "StyleSense" appeared simultaneously in the announcement bar, the logo, the banner, and the footer.
- **Human Correction**: Updated the assertion from `getByText` to `getAllByText`, ensuring that multiple occurrences of brand copy across the editorial page structure are correctly recognized.

### Example 3: Port Conflict Management
- **Issue Discovered**: Starting the backend server initially encountered `EADDRINUSE: address already in use :::5000` due to a prior project node process.
- **Human Intervention**: Proactively queried TCP connections via PowerShell, identified PID `14040`, safely terminated the orphaned process, and launched the StyleSense backend cleanly.
