# StyleSense AI — Your Wardrobe. Your Style. Smarter Choices.
*A Unique Digital Wardrobe Intelligence Platform & AI-Receptive Fashion Styling System*

[![Tests](https://img.shields.io/badge/Tests-50%20Passed-emerald.svg)](#testing)
[![Architecture](https://img.shields.io/badge/Architecture-Full--Stack%20Client--Server-blue.svg)](#architecture)
[![Design](https://img.shields.io/badge/Palette-Ivory%20%7C%20Charcoal%20%7C%20Burgundy-burgundy.svg)](#design-system)

StyleSense AI is an individual academic mini-project for **AI-Receptive Software Development**. Originally conceived as a full-stack fashion e-commerce application, StyleSense AI has evolved into a distinctive **Digital Wardrobe Intelligence Platform**.

Its core differentiator: **The platform recommends ways to utilize existing clothing before encouraging users to buy new items.**

---

## 🌟 Core Features

### 1. My Digital Wardrobe (`/wardrobe`)
- **Full Garment Management**: Authenticated users can catalog tops, bottoms, dresses, outerwear, shoes, and accessories.
- **Garment Metadata**: Color, style aesthetic, occasion, size, brand, purchase price, wears count, and favorite flag.
- **Safe Image Uploads & URLs**: Multi-tier image support with validated MIME types (JPEG, PNG, WEBP, AVIF up to 5MB) and manual URL entry fallback.
- **Interactive Closet Grid**: Filter by department, color, occasion, or favorites; sort by wears, investment price, or date added.
- **Usage Incrementer**: One-click `+ Log Wear` recording wear dates, occasions, and notes in `wardrobe_wear_logs`.

### 2. Occasion-to-Outfit Planner (`/outfit-planner`)
- **8 Dedicated Occasions**: *College, Office, Interview, Casual Outing, Party, Festive Event, Formal Event, and Travel*.
- **Deterministic Compatibility Engine**:
  - Silhouette template category verification
  - Occasion alignment (+25 pts)
  - Style harmony (+15 pts)
  - Color palette coherence (+10 pts)
  - Favorite bias & utility (+5 pts)
- **Styling Source Modes**:
  - `100% Wardrobe`: Curates strictly from pieces you already own.
  - `Wardrobe + Store`: Blends owned closet pieces with catalog products within your strictly enforced budget.
- **Deterministic Explanations**: Transparent rationale explaining why pieces were selected.
- **Slot Replacement & Customization**: Interactive item swap allowing users to override any slot.
- **Saved Outfit Collections**: Save and revisit curated ensembles with one click.

### 3. Smart Buy-or-Reuse Advisor
- **Integrated into Product Detail (`/product/:id`) and Style Studio (`/style-studio`)**:
- Automatically compares candidate catalog garments against your actual digital wardrobe:
  - *"Create a similar look with your wardrobe"* (identifies garments you own that fulfill the same silhouette).
  - *"Complements your existing wardrobe"* (demonstrates how the piece pairs with your existing tops, bottoms, and jackets).
  - *"Adds a new category to your wardrobe"* (flags valid capsule expansion).
  - *"Limited wardrobe data"* (encourages adding more closet items).
- Empowers users with thoughtful choice without shaming or blocking commerce.

### 4. Cost-per-Wear Tracker
- **Formula**: $\text{Cost per Wear} = \frac{\text{Purchase Price}}{\text{Recorded Wears}}$.
- Handled safely with complete division-by-zero protection (unworn items explicitly labeled as `Unworn`).
- **Highest Utility Pieces**: Top 5 most worn garments ranked by total wear count.
- **Underused Items Identification**: Clearly documented rule identifying garments owned $\ge 30$ days with $\le 2$ logged wears, or items never worn.
- **Category & Color Distributions**: Visual analytics of closet composition.

### 5. Wardrobe Gap Finder
- Analyzes category, occasion, and color coverage in your actual wardrobe.
- Discovers missing capsule essentials (e.g., tailored blazers for interview prep, neutral foundation tops, or weather outerwear).
- Explains the exact wardrobe records that triggered the suggestion.
- Allows one-click suggestion dismissal (persisted in database) or opening matching catalog products.

### 6. Personal Style Profile
- Visual style profile inside Style Studio and Account pages.
- Manages preferred aesthetics, signature colors, core categories, frequent occasions, and budget limits.
- Clear explanation of algorithmic impact without collecting sensitive attributes or inferring physical characteristics.

### 7. Unified Navigation & Editorial Aesthetic
- **Editorial Palette**: Ivory (`#F7F3ED`), Charcoal (`#252321`), Burgundy (`#793B48`), and Warm White (`#FFFFFF`).
- **Updated Global Navigation**: *Discover, Shop, Style Studio, My Wardrobe, Outfit Planner, Wishlist, Cart, and Account*.

---

## 👥 Demo Accounts

Pre-seeded with salted bcrypt hashes for immediate evaluation:

| Role | Email | Password | Persona & Default State |
|---|---|---|---|
| **Student** | `student@stylesense.ai` | `Student@123` | Priya Sharma: 12 seeded wardrobe pieces, wear logs, and saved outfits |
| **Professional** | `professional@stylesense.ai` | `Professional@123` | Nandini Verma: Tailored wardrobe, office style profile |
| **Administrator** | `admin@stylesense.ai` | `Admin@123` | Full admin management over catalog and order fulfillments |

*One-click demo login buttons are available on `/login`.*

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite 5, Tailwind CSS, React Router v6, Lucide React icons.
- **Backend**: Node.js, Express.js 4, Multer (safe file uploads), JWT, bcryptjs, cookie-parser.
- **Database**: MySQL 8.0 normalized schema with transactional rollback support and zero-config in-memory relational store fallback.
- **Testing**: Vitest, React Testing Library, Supertest, jsdom.

---

## 🗄️ Database Architecture & Migrations

- `server/database/schema.sql`: Initial schema (users, preferences, categories, products, variants, wishlists, carts, orders, order_items).
- `server/database/migrations/002_wardrobe.sql`: Incremental migration adding:
  - `wardrobe_items`: User clothing pieces with size, color, style, occasion, purchase_price, wears_count, is_favorite.
  - `saved_outfits`: Named outfit combinations.
  - `saved_outfit_items`: Slot mapping (top, bottom, outerwear, shoes, accessory) linking wardrobe items or store variants.
  - `wardrobe_wear_logs`: Wear events recording date, occasion, and notes.
  - `dismissed_gap_suggestions`: Persisted user dismissals for wardrobe gaps.
  - `user_style_profiles`: Extended personal style attributes.

---

## 🧪 Testing Suite (50 Automated Tests)

Run all tests across the monorepo:
```bash
npm test
```

### Breakdown:
- **Server Tests (40 passing)**:
  - `tests/recommendation.test.js`: 8 unit tests for 100-pt scoring rubric and explanations.
  - `tests/api.test.js`: 17 integration tests for auth, carts, orders, inventory locking, and admin permissions.
  - `tests/wardrobe.test.js`: 15 comprehensive tests covering all 15 backend requirements (CRUD, ownership checks, division-by-zero CPW safety, deterministic planner ranking, budget compliance, gap analysis, and advisor comparisons).
- **Client Tests (10 passing)**:
  - `src/test/frontend.test.jsx`: 6 component tests for App navigation, preference quiz, empty states, and error handling.
  - `src/test/wardrobe.test.jsx`: 4 component tests for Wardrobe rendering, Outfit Planner occasion mode toggles, empty state handling, and image error fallbacks.

---

## 🚀 Running the Platform Locally

1. **Clone repository and install dependencies**:
   ```bash
   npm install
   ```

2. **Start Backend Server** (Port 5000):
   ```bash
   npm run dev --workspace=server
   ```

3. **Start Frontend Server** (Port 5173):
   ```bash
   npm run dev --workspace=client
   ```

4. **Access the application**:
   - Web App: `http://localhost:5173`
   - API Health Check: `http://localhost:5000/api/health`
