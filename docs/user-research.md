# User Research & Empathy Analysis — StyleSense AI

## 1. User Archetypes & Target User Groups

To build an interface grounded in human-centered design principles, user research was structured around three key consumer groups:

### Archetype 1: University Student / Budget-Conscious Shopper
- **Profile**: 19–24 years old; pursuing higher education; limited disposable income; high digital literacy; active mobile shopper.
- **Goals**: Discover versatile clothing suitable for campus lectures, study groups, and informal weekend gatherings while adhering to strict price boundaries ($30–$90 per garment).
- **Needs**: Transparent pricing; clear size availability indicators; easy ways to avoid ordering items that stretch budgets.
- **Pain Points**: Browsing items only to find their size is sold out; platforms pushing $200+ jackets during student budget searches; generic recommendation carousels.
- **Expectations**: Instant feedback, mobile-optimized browsing, and explicit budget adherence.

### Archetype 2: Working Professional
- **Profile**: 26–42 years old; busy career; values time efficiency, fabric quality (wool, silk, linen), and versatile pieces transitioning from day meetings to evening dinners.
- **Goals**: Build a cohesive capsule wardrobe without spending hours scrolling through unfiltered feeds.
- **Needs**: Coordinated outfit suggestions; neutral and editorial palettes (Ivory, Charcoal, Burgundy); rapid checkout.
- **Pain Points**: Difficulties visualizing how separates (tops and bottoms) complement each other; fragmented sites requiring separate tabs for shoes and outerwear.
- **Expectations**: Clean, distraction-free editorial aesthetics; clear fabric descriptions; transparent rationale behind stylist recommendations.

### Archetype 3: Store Merchandiser / Administrator
- **Profile**: Operations manager responsible for product curation, stock monitoring, and order processing.
- **Goals**: Keep catalog active, monitor variant inventory levels, and ensure rapid order fulfillment.
- **Needs**: Single-screen summary of low-stock alerts, one-click product toggling, and clean status updating.
- **Pain Points**: Cluttered dashboards requiring multiple navigation layers to adjust single-variant quantities.
- **Expectations**: Responsive admin controls with server-side authorization enforcement.

---

## 2. Detailed User Persona: Priya Sharma

| Attribute | Profile Detail |
|---|---|
| **Name** | Priya Sharma |
| **Age** | 22 |
| **Occupation** | Senior Design Student & University Intern |
| **Location** | Urban Metro Area |
| **Tech Comfort** | High (Primary device: Smartphone & Laptop) |
| **Budget Constraint** | Strict ($25–$100 per garment; $250 max outfit) |
| **Aesthetic Preference**| Minimalist / Classic (Ivory, Charcoal, Beige) |

### Daily Scenario & User Journey
Priya is preparing for an upcoming campus portfolio presentation followed by an evening design industry mixer. She needs an outfit that balances polished professionalism with relaxed student comfort. She opens StyleSense AI on her smartphone during her commute:

1. **Questionnaire Engagement**: She selects Occasion = *College / Campus*, Aesthetic = *Minimalist*, Palette = *Ivory & Charcoal*, Size = *S*, and sets the Budget Cap to *$100*.
2. **Evaluation of Scored Matches**: StyleSense AI ranks the *Merino Wool Mockneck Sweater* at **100% Match**, accompanied by the explanation: *"Matches your minimalist style, college occasion, preferred ivory palette, and is comfortably within budget."*
3. **Coordination**: She transitions to the *Outfit Builder*, which automatically coordinates the sweater with *Pleated Wide-Leg Trousers* and *Chunky Leather Loafers*. Seeing that the total outfit cost ($264) slightly exceeds her $250 limit, she clicks **Replace** on the trousers and selects the relaxed *Wide-Leg Linen Drawstring Pants* ($72), bringing the total to $239.
4. **Checkout**: She completes the simulated purchase, receiving immediate confirmation and clear feedback that no real financial charges were processed.

---

## 3. Core Assumptions Requiring Longitudinal Validation

In accordance with academic rigor, the following assumptions underlying our design decisions are documented for future empirical study:

1. **Rubric Weighting Acceptance**: We assume users prioritize *Occasion* (30%) and *Style* (25%) over *Price* (15%) when seeking curated fashion recommendations. A live A/B test with user preference weight sliders would validate whether budget should hold a higher baseline weight for certain demographics.
2. **Textual Explanation Engagement**: We assume shoppers read and value rule-based match explanations (e.g., *"Matches your minimalist aesthetic and preferred ivory palette"*). Qualitative eye-tracking studies would measure how long shoppers interact with rationale cards before purchasing.
3. **Slot Replacement Usability**: We assume users prefer modular slot replacement modals over rebuilding an entire outfit from scratch.
