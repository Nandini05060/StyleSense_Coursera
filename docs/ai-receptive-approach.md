# AI-Receptive Approach & Recommendation Architecture — StyleSense AI

## 1. Technical Nature of the AI System

StyleSense AI utilizes a **transparent, deterministic, rule-based recommendation engine** rather than an opaque deep-learning neural network or a generative third-party LLM API. 

In AI-receptive software engineering, rule-based systems offer distinct advantages for commercial decision-support systems:
- **Total Auditability**: Every decision can be traced back to explicit logical conditions.
- **High Consistency & Reliability**: Identical inputs yield identical outputs, preventing erratic recommendations.
- **Zero Hallucination**: Every recommended item is guaranteed to exist in the database with verified stock.
- **Privacy & Latency**: Processing occurs locally and in microseconds, without leaking user data to external cloud APIs.

---

## 2. Recommendation Scoring Rubric & Formula

Each candidate product is evaluated against a **100-Point Mathematical Rubric**:

$$\text{Total Score} = S_{\text{occasion}} + S_{\text{style}} + S_{\text{color}} + S_{\text{budget}} + S_{\text{category}}$$

| Criteria Dimension | Maximum Points | Exact Rule Implementation |
|---|---|---|
| **1. Occasion Match** | **30 points** | Awarded full 30 pts if the product's `occasion_tags` contains the requested occasion (e.g., `office`, `casual`, `college`, `party`, `festive`). If no occasion is specified, 30 pts are awarded neutrally. |
| **2. Style Aesthetic Match** | **25 points** | Awarded full 25 pts if the product's `style_tags` contains the requested style (e.g., `minimalist`, `streetwear`, `classic`, `chic`). Neutral 25 pts if unconstrained. |
| **3. Color Palette Match** | **20 points** | Awarded full 20 pts if any color in the product's `colors` array intersects with the user's `preferred_colors` selection. |
| **4. Budget Fit** | **15 points** | **Deterministic Step Rule**:<br>• Price $\le$ Budget Max: **+15 pts** (Full points)<br>• Price $\le$ Budget Max $\times 1.15$: **+8 pts** (Partial points for 15% stretch)<br>• Price $\le$ Budget Max $\times 1.30$: **+4 pts** (Partial points for 30% stretch)<br>• Price $>$ Budget Max $\times 1.30$: **0 pts** (Zero budget points) |
| **5. Category Focus** | **10 points** | Awarded full 10 pts if the product category matches the user's target department (or 10 pts neutrally if 'all' is chosen). |

### Mandatory Pre-Filter Pipeline:
Before scoring, the engine executes three strict exclusion gates:
1. `active == true`: Inactive products are completely omitted.
2. `total_stock > 0`: Products with zero total inventory across all variants are excluded.
3. `preferred_size`: If a user specifies a preferred size (e.g., 'S'), products without available stock in that specific size are immediately excluded.

### Deterministic Tie-Breaking Order:
When two products tie on score:
1. Recommendation Score (Descending)
2. Featured Editorial Flag (Descending)
3. Total Available Stock (Descending)
4. Primary Key ID (Ascending — stable sort invariant)

---

## 3. Automated Match Explanation Generation

The natural-language explanation attached to every recommendation is constructed directly from the scoring outcome:

```javascript
export function generateMatchExplanation(details, preferences, product) {
  const highlights = [];
  if (details.style.matched && preferences.style) highlights.push(`${preferences.style} style aesthetic`);
  if (details.occasion.matched && preferences.occasion) highlights.push(`${preferences.occasion} wardrobe`);
  if (details.color.matched && details.color.matchedColor) highlights.push(`preferred ${details.color.matchedColor} tone`);
  if (details.budget.points === 15 && preferences.budget_max) highlights.push(`within your $${preferences.budget_max} budget`);
  else if (details.budget.points === 8) highlights.push(`slight stretch above budget ($${product.price})`);

  if (highlights.length === 0) return 'Recommended based on overall catalog compatibility and popular styling.';
  return `Matches your ${highlights.join(', ')}.`;
}
```

*Example Output*: *"Matches your minimalist style aesthetic, college wardrobe, preferred ivory tone, and is within your $100 budget."*

---

## 4. Outfit Builder Coordination Engine

The modular outfit builder coordinates pieces across 5 distinct wardrobe slots:
- **Slot 1**: Top (or Dress when one-piece silhouette is selected)
- **Slot 2**: Bottom (omitted if Dress is active)
- **Slot 3**: Shoes
- **Slot 4**: Outerwear (layering piece)
- **Slot 5**: Accessory (handbag, scarf, jewelry)

### Attribute Cohesion Check:
The system tests whether all selected slot items share common style tags and occasion tags, summarizing the result into an informative harmony assessment:
```
Cohesion Assessment: "Coordinated minimalist ensemble tailored for casual settings. Current selection is comfortably within target budget."
```

---

## 5. Risks, Limitations & Human Oversight

1. **Subjective Aesthetic Nuance**: Rule-based matching cannot infer emotional or avant-garde fashion nuances that human stylists provide.
2. **Catalog Metadata Quality**: The accuracy of the recommendation engine is directly contingent on the precision of the database `style_tags`, `occasion_tags`, and `colors`.
3. **Explicit Human Agency**: The interface never imposes an outfit. The user can swap any piece via the `ReplacementModal`, modify budget constraints on the fly, or clear filters with a single click.
