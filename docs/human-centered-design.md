# Human-Centered Design & UI/UX Architecture — StyleSense AI

## 1. Foundational Design Principles

StyleSense AI is designed around five core Human-Centered Design (HCD) principles tailored for modern fashion retail:

1. **Editorial Luxury over Dashboard Clutter**: High-end fashion shopping is an emotive, visual experience. We avoid sterile, generic software tables in customer flows, favoring generous whitespace, elegant serif typography (`Playfair Display`), clean sans-serif body copy (`Plus Jakarta Sans`), and large-format photography.
2. **Cognitive Transparency & Agency**: The user is never subjected to opaque algorithmic decisions. Every recommendation percentage corresponds directly to an auditable 100-point rubric, and users retain complete control to override, tweak, or reset preferences at any moment.
3. **Continuous Contextual Feedback**: Every user interaction produces immediate, visible feedback. Adding to cart triggers smooth toast notifications; stock shortages present clear warnings; destructive actions require confirmation; and network operations display loading skeletons.
4. **Resilient Error Recovery & Graceful Fallbacks**: Missing metadata does not crash the system, and broken or unresolvable image URLs trigger graceful local fallbacks without visual collapse.
5. **Universal Accessibility (WCAG 2.1 AA Compliant)**: Semantic HTML5 elements (`<nav>`, `<main>`, `<header>`, `<footer>`), explicit form label bindings, keyboard navigation (`Escape` key modal dismissal, `Tab` cycling), focus rings, and high color contrast across the Ivory/Charcoal/Burgundy palette.

---

## 2. Visual Palette & Design System Tokens

```
Ivory:          #F7F3ED  (Warm background providing editorial warmth)
Charcoal:       #252321  (Deep typographic contrast and structural accents)
Burgundy:       #793B48  (Signature accent for AI stylist highlights and buttons)
Warm White:     #FFFFFF  (Clean card surfaces and modal dialogues)
Muted Taupe:    #8C867F  (Secondary metadata, subtotals, and subtle borders)
Taupe Light:    #E8E2D9  (Dividers, card outlines, and skeleton pulses)
```

---

## 3. Site Architecture & Navigation Map

```
StyleSense AI Navigation Hierarchy
│
├── [ / ] — Home (Editorial hero, departments, AI Stylist callout, featured edit)
│
├── [ /shop ] — Shop All (Faceted search, occasion, style, size, color, price filter)
│
├── [ /product/:id ] — Product Detail (Gallery, color/size selection, live stock counters)
│
├── [ /style-studio ] — Style Studio (Interactive preference quiz, 100-pt scored recommendations)
│
├── [ /outfit-builder ] — Modular Outfit Builder (5 slots, real-time budget, item replacement)
│
├── [ /wishlist ] — Saved Wishlist (Personal archive, move to bag)
│
├── [ /cart ] — Shopping Bag (Variant recap, live stock check, free shipping meter, total)
│
├── [ /checkout ] — Simulated Checkout (Delivery form, sandbox test card, atomic transacted order)
│
├── [ /account ] — Member Dashboard (Profile, saved style preferences, order history & snapshots)
│
├── [ /login & /register ] — Authentication (Password visibility toggles, one-click demo logins)
│
└── [ /admin ] — Administrator Portal (Server-verified operations, catalog & variant stock controls)
```

---

## 4. Key User Journeys

### Journey 1: The Personal Stylist Consultation
1. User lands on `/` and clicks **Consult AI Stylist** or navigates to `/style-studio`.
2. User completes the 6-step questionnaire (Occasion, Style, Palette, Size, Budget, Category Focus).
3. The recommendation engine evaluates active catalog products, filtering out out-of-stock sizes and computing scores.
4. User reviews ranked items featuring **Match Badges** (e.g., `100% Match`) and natural-language explanations.
5. User clicks **Quick Bag** on a product card or opens details to select specific variants.

### Journey 2: Modular Outfit Coordination & Checkout
1. User opens `/outfit-builder`.
2. The engine displays 5 coordinated pieces (Top, Bottom, Footwear, Outerwear, Accessory).
3. The user notes that the ensemble total ($264) slightly exceeds their $250 budget.
4. User clicks **Replace** on the bottom slot, opens the `ReplacementModal`, and chooses an alternative pair of trousers ($72).
5. The total updates immediately to $239 (within budget).
6. User clicks **Add Complete Look**, adding all pieces to the cart in a single click.
7. User proceeds to `/checkout`, fills delivery address, places the simulated order, and views the confirmation reference with historical snapshot items.

---

## 5. Accessibility Decisions & User State Architecture

- **Keyboard Dialog Dismissal**: Modals bind an `Escape` key event listener and automatically lock body scroll (`overflow: hidden`) to maintain focus context.
- **Form Error Association**: Every input binds an `id` to an associated `<label>`, ensuring screen readers announce the exact field purpose and required status.
- **Stock Transparency**: Instead of allowing users to order out-of-stock items, variant buttons dynamically show sold-out indicators with `line-through` and `cursor-not-allowed` styles.
- **Academic Simulation Transparency**: Checkout and Admin portals display clear banners explaining that payments are simulated in academic demonstration mode.
