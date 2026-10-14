/**
 * Curated fashion dataset for StyleSense AI
 * 52+ Products across 6 categories:
 * - Tops (10)
 * - Bottoms (9)
 * - Dresses (8)
 * - Outerwear (8)
 * - Shoes (9)
 * - Accessories (8)
 * Varied styles: minimalist, streetwear, classic, chic
 * Varied occasions: casual, college, office, party, festive
 * Palette: ivory, charcoal, burgundy, beige, black, cream, olive, camel, navy, white
 */

export const categoriesData = [
  {
    name: 'Tops',
    slug: 'tops',
    description: 'Refined shirts, blouses, knitwear, and everyday essentials.',
    image_url: 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Bottoms',
    slug: 'bottoms',
    description: 'Tailored trousers, relaxed denim, and pleated skirts.',
    image_url: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Dresses',
    slug: 'dresses',
    description: 'Flowing midi silhouettes, slip dresses, and structured evening wear.',
    image_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Outerwear',
    slug: 'outerwear',
    description: 'Wool overcoats, tailored trench coats, and sharp blazers.',
    image_url: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Shoes',
    slug: 'shoes',
    description: 'Leather loafers, minimalist boots, and contemporary footwear.',
    image_url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Accessories',
    slug: 'accessories',
    description: 'Leather bags, wool scarves, belts, and understated jewelry.',
    image_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80'
  }
];

export const productsData = [
  // --- TOPS ---
  {
    name: 'Merino Wool Mockneck Sweater',
    slug: 'merino-wool-mockneck-sweater',
    categorySlug: 'tops',
    price: 89.00,
    description: 'Spun from ultra-fine Australian merino wool. Designed with a clean mockneck collar and ribbed cuffs for effortless layering in crisp weather.',
    image_url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80',
    secondary_image_url: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80',
    style_tags: ['minimalist', 'classic'],
    occasion_tags: ['office', 'casual', 'college'],
    colors: ['ivory', 'charcoal', 'burgundy'],
    featured: true,
    variants: [
      { size: 'XS', color: 'Ivory', stock_quantity: 8 },
      { size: 'S', color: 'Ivory', stock_quantity: 14 },
      { size: 'M', color: 'Ivory', stock_quantity: 20 },
      { size: 'L', color: 'Ivory', stock_quantity: 12 },
      { size: 'S', color: 'Charcoal', stock_quantity: 10 },
      { size: 'M', color: 'Charcoal', stock_quantity: 15 },
      { size: 'L', color: 'Charcoal', stock_quantity: 8 },
      { size: 'M', color: 'Burgundy', stock_quantity: 11 }
    ]
  },
  {
    name: 'Crisp Poplin Oversized Shirt',
    slug: 'crisp-poplin-oversized-shirt',
    categorySlug: 'tops',
    price: 68.00,
    description: 'Woven from 100% organic long-staple cotton poplin. Features dropped shoulders, clean mother-of-pearl buttons, and a curved hem.',
    image_url: 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=800&q=80',
    secondary_image_url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80',
    style_tags: ['minimalist', 'chic'],
    occasion_tags: ['office', 'college', 'casual'],
    colors: ['white', 'ivory', 'navy'],
    featured: true,
    variants: [
      { size: 'S', color: 'White', stock_quantity: 18 },
      { size: 'M', color: 'White', stock_quantity: 24 },
      { size: 'L', color: 'White', stock_quantity: 16 },
      { size: 'S', color: 'Ivory', stock_quantity: 12 },
      { size: 'M', color: 'Ivory', stock_quantity: 15 }
    ]
  },
  {
    name: 'Heavyweight Boxy Crewneck T-Shirt',
    slug: 'heavyweight-boxy-crewneck-tshirt',
    categorySlug: 'tops',
    price: 38.00,
    description: '280 GSM combed cotton structured tee with relaxed drop-shoulder cut. Durable rib collar holds its shape wash after wash.',
    image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    secondary_image_url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80',
    style_tags: ['streetwear', 'minimalist'],
    occasion_tags: ['college', 'casual'],
    colors: ['charcoal', 'white', 'beige'],
    featured: false,
    variants: [
      { size: 'S', color: 'Charcoal', stock_quantity: 25 },
      { size: 'M', color: 'Charcoal', stock_quantity: 30 },
      { size: 'L', color: 'Charcoal', stock_quantity: 20 },
      { size: 'XL', color: 'Charcoal', stock_quantity: 14 },
      { size: 'M', color: 'White', stock_quantity: 22 },
      { size: 'L', color: 'White', stock_quantity: 18 }
    ]
  },
  {
    name: 'Silk-Blend Georgette Camisole',
    slug: 'silk-blend-georgette-camisole',
    categorySlug: 'tops',
    price: 74.00,
    description: 'Delicate silk blend with subtle luster and adjustable spaghetti straps. Drapes smoothly under tailored blazers or with party trousers.',
    image_url: 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?auto=format&fit=crop&w=800&q=80',
    secondary_image_url: 'https://images.unsplash.com/photo-1618244972963-dbee1a7edc95?auto=format&fit=crop&w=800&q=80',
    style_tags: ['chic', 'classic'],
    occasion_tags: ['party', 'festive', 'office'],
    colors: ['burgundy', 'ivory', 'black'],
    featured: false,
    variants: [
      { size: 'XS', color: 'Burgundy', stock_quantity: 6 },
      { size: 'S', color: 'Burgundy', stock_quantity: 12 },
      { size: 'M', color: 'Burgundy', stock_quantity: 10 },
      { size: 'S', color: 'Ivory', stock_quantity: 8 },
      { size: 'M', color: 'Ivory', stock_quantity: 14 }
    ]
  },
  {
    name: 'Ribbed Cashmere Polo Top',
    slug: 'ribbed-cashmere-polo-top',
    categorySlug: 'tops',
    price: 110.00,
    description: 'Feather-soft cashmere knit with an open collar detail. Combines relaxed luxury with quiet elegance for modern workwear.',
    image_url: 'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?auto=format&fit=crop&w=800&q=80',
    secondary_image_url: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80',
    style_tags: ['minimalist', 'classic'],
    occasion_tags: ['office', 'casual'],
    colors: ['beige', 'ivory', 'charcoal'],
    featured: true,
    variants: [
      { size: 'S', color: 'Beige', stock_quantity: 7 },
      { size: 'M', color: 'Beige', stock_quantity: 12 },
      { size: 'L', color: 'Beige', stock_quantity: 9 },
      { size: 'M', color: 'Ivory', stock_quantity: 11 }
    ]
  },
  {
    name: 'Graphic Archive Hoodie',
    slug: 'graphic-archive-hoodie',
    categorySlug: 'tops',
    price: 82.00,
    description: 'Dense 450 GSM French terry hoodie with vintage wash, double-layer hood, and architectural typographic embroidery on the back.',
    image_url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
    secondary_image_url: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80',
    style_tags: ['streetwear'],
    occasion_tags: ['college', 'casual'],
    colors: ['charcoal', 'olive', 'black'],
    featured: false,
    variants: [
      { size: 'S', color: 'Charcoal', stock_quantity: 15 },
      { size: 'M', color: 'Charcoal', stock_quantity: 20 },
      { size: 'L', color: 'Charcoal', stock_quantity: 18 },
      { size: 'XL', color: 'Charcoal', stock_quantity: 10 }
    ]
  },
  {
    name: 'Satin Tie-Neck Blouse',
    slug: 'satin-tie-neck-blouse',
    categorySlug: 'tops',
    price: 92.00,
    description: 'Lustrous satin with a versatile pussy-bow necktie that can be worn draped loose or tied in an architectural bow.',
    image_url: 'https://images.unsplash.com/photo-1604176354204-9268737828e4?auto=format&fit=crop&w=800&q=80',
    secondary_image_url: 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?auto=format&fit=crop&w=800&q=80',
    style_tags: ['chic', 'classic'],
    occasion_tags: ['office', 'festive', 'party'],
    colors: ['burgundy', 'cream', 'black'],
    featured: false,
    variants: [
      { size: 'XS', color: 'Burgundy', stock_quantity: 5 },
      { size: 'S', color: 'Burgundy', stock_quantity: 10 },
      { size: 'M', color: 'Burgundy', stock_quantity: 12 },
      { size: 'L', color: 'Burgundy', stock_quantity: 6 }
    ]
  },
  {
    name: 'Relaxed Linen Camp Collar Shirt',
    slug: 'relaxed-linen-camp-collar-shirt',
    categorySlug: 'tops',
    price: 64.00,
    description: 'Pure French flax linen garment-washed for a supple hand. Breathable silhouette with notched collar and patch chest pocket.',
    image_url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
    secondary_image_url: 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=800&q=80',
    style_tags: ['minimalist', 'casual'],
    occasion_tags: ['casual', 'college'],
    colors: ['ivory', 'olive', 'beige'],
    featured: false,
    variants: [
      { size: 'S', color: 'Ivory', stock_quantity: 14 },
      { size: 'M', color: 'Ivory', stock_quantity: 18 },
      { size: 'L', color: 'Ivory', stock_quantity: 12 }
    ]
  },
  {
    name: 'Structured Asymmetric Knit Top',
    slug: 'structured-asymmetric-knit-top',
    categorySlug: 'tops',
    price: 78.00,
    description: 'Sculptural one-shoulder knit crafted in dense viscose ribbing. Flattering architectural lines designed for gallery openings and dinner parties.',
    image_url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80',
    secondary_image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    style_tags: ['chic', 'minimalist'],
    occasion_tags: ['party', 'festive'],
    colors: ['charcoal', 'burgundy', 'black'],
    featured: false,
    variants: [
      { size: 'S', color: 'Charcoal', stock_quantity: 8 },
      { size: 'M', color: 'Charcoal', stock_quantity: 12 },
      { size: 'L', color: 'Charcoal', stock_quantity: 7 }
    ]
  },
  {
    name: 'Brushed Cotton Utility Overshirt',
    slug: 'brushed-cotton-utility-overshirt',
    categorySlug: 'tops',
    price: 76.00,
    description: 'Midweight brushed twill overshirt with twin gusset pockets and horn buttons. Works seamlessly as a light jacket or layered button-up.',
    image_url: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=80',
    secondary_image_url: 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=800&q=80',
    style_tags: ['streetwear', 'classic'],
    occasion_tags: ['college', 'casual'],
    colors: ['olive', 'charcoal', 'beige'],
    featured: false,
    variants: [
      { size: 'S', color: 'Olive', stock_quantity: 10 },
      { size: 'M', color: 'Olive', stock_quantity: 15 },
      { size: 'L', color: 'Olive', stock_quantity: 14 }
    ]
  },

  // --- BOTTOMS ---
  {
    name: 'Pleated Wide-Leg Trousers',
    slug: 'pleated-wide-leg-trousers',
    categorySlug: 'bottoms',
    price: 115.00,
    description: 'Impeccably tailored trousers in a fluid wool-viscose blend. High-waisted with double front pleats and side slash pockets.',
    image_url: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&w=800&q=80',
    secondary_image_url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
    style_tags: ['minimalist', 'classic'],
    occasion_tags: ['office', 'party', 'casual'],
    colors: ['charcoal', 'ivory', 'burgundy'],
    featured: true,
    variants: [
      { size: 'XS', color: 'Charcoal', stock_quantity: 6 },
      { size: 'S', color: 'Charcoal', stock_quantity: 14 },
      { size: 'M', color: 'Charcoal', stock_quantity: 18 },
      { size: 'L', color: 'Charcoal', stock_quantity: 10 },
      { size: 'S', color: 'Ivory', stock_quantity: 9 },
      { size: 'M', color: 'Ivory', stock_quantity: 12 }
    ]
  },
  {
    name: 'Straight-Leg Raw Denim Jeans',
    slug: 'straight-leg-raw-denim-jeans',
    categorySlug: 'bottoms',
    price: 95.00,
    description: 'Constructed from 13.5 oz Japanese selvedge denim. Mid-rise with straight legs that soften with wear into a custom fit.',
    image_url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80',
    secondary_image_url: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&w=800&q=80',
    style_tags: ['streetwear', 'classic'],
    occasion_tags: ['college', 'casual'],
    colors: ['navy', 'black'],
    featured: false,
    variants: [
      { size: 'S', color: 'Navy', stock_quantity: 16 },
      { size: 'M', color: 'Navy', stock_quantity: 22 },
      { size: 'L', color: 'Navy', stock_quantity: 15 }
    ]
  },
  {
    name: 'Bias-Cut Silk Midi Skirt',
    slug: 'bias-cut-silk-midi-skirt',
    categorySlug: 'bottoms',
    price: 105.00,
    description: 'Cut on the bias for a graceful liquid drape that skims the hips. Concealed elasticated waistband for invisible comfort.',
    image_url: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=800&q=80',
    secondary_image_url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
    style_tags: ['chic', 'minimalist'],
    occasion_tags: ['party', 'festive', 'office'],
    colors: ['burgundy', 'ivory', 'black'],
    featured: true,
    variants: [
      { size: 'XS', color: 'Burgundy', stock_quantity: 5 },
      { size: 'S', color: 'Burgundy', stock_quantity: 11 },
      { size: 'M', color: 'Burgundy', stock_quantity: 14 },
      { size: 'L', color: 'Burgundy', stock_quantity: 8 },
      { size: 'M', color: 'Ivory', stock_quantity: 10 }
    ]
  },
  {
    name: 'Relaxed Cargo Parachute Pants',
    slug: 'relaxed-cargo-parachute-pants',
    categorySlug: 'bottoms',
    price: 88.00,
    description: 'Cotton-nylon blend with toggle hems, deep bellows pockets, and an elasticated waistband with utility cords.',
    image_url: 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=800&q=80',
    secondary_image_url: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&w=800&q=80',
    style_tags: ['streetwear'],
    occasion_tags: ['college', 'casual'],
    colors: ['charcoal', 'olive', 'black'],
    featured: false,
    variants: [
      { size: 'S', color: 'Charcoal', stock_quantity: 12 },
      { size: 'M', color: 'Charcoal', stock_quantity: 18 },
      { size: 'L', color: 'Charcoal', stock_quantity: 14 }
    ]
  },
  {
    name: 'Tailored Ankle Cigarette Pants',
    slug: 'tailored-ankle-cigarette-pants',
    categorySlug: 'bottoms',
    price: 92.00,
    description: 'Sharp pressed creases and tapered cropped hem. Woven in stretch compact twill for structure without stiffness.',
    image_url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=80',
    secondary_image_url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
    style_tags: ['classic', 'chic'],
    occasion_tags: ['office', 'casual'],
    colors: ['black', 'beige', 'navy'],
    featured: false,
    variants: [
      { size: 'S', color: 'Black', stock_quantity: 15 },
      { size: 'M', color: 'Black', stock_quantity: 19 },
      { size: 'L', color: 'Black', stock_quantity: 11 }
    ]
  },
  {
    name: 'Pleated Tennis Mini Skirt',
    slug: 'pleated-tennis-mini-skirt',
    categorySlug: 'bottoms',
    price: 52.00,
    description: 'Crisp uniform knife pleats with built-in undershorts. Designed for effortless university style and casual weekends.',
    image_url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=800&q=80',
    secondary_image_url: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=800&q=80',
    style_tags: ['streetwear', 'chic'],
    occasion_tags: ['college', 'casual'],
    colors: ['ivory', 'charcoal', 'navy'],
    featured: false,
    variants: [
      { size: 'XS', color: 'Ivory', stock_quantity: 8 },
      { size: 'S', color: 'Ivory', stock_quantity: 14 },
      { size: 'M', color: 'Ivory', stock_quantity: 10 }
    ]
  },
  {
    name: 'Wide-Leg Linen Drawstring Pants',
    slug: 'wide-leg-linen-drawstring-pants',
    categorySlug: 'bottoms',
    price: 72.00,
    description: 'Airy pure linen trousers with a natural drawstring waist and relaxed palazzo cut. Perfect for warm-weather minimalism.',
    image_url: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&w=800&q=80',
    secondary_image_url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
    style_tags: ['minimalist'],
    occasion_tags: ['casual', 'college'],
    colors: ['beige', 'ivory', 'white'],
    featured: false,
    variants: [
      { size: 'S', color: 'Beige', stock_quantity: 11 },
      { size: 'M', color: 'Beige', stock_quantity: 15 },
      { size: 'L', color: 'Beige', stock_quantity: 9 }
    ]
  },
  {
    name: 'Structured Flared Split-Hem Trousers',
    slug: 'structured-flared-split-hem-trousers',
    categorySlug: 'bottoms',
    price: 98.00,
    description: 'Slim through the thigh with an ankle flare highlighted by front split seams that spotlight designer shoes.',
    image_url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
    secondary_image_url: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&w=800&q=80',
    style_tags: ['chic', 'streetwear'],
    occasion_tags: ['party', 'office'],
    colors: ['charcoal', 'burgundy'],
    featured: false,
    variants: [
      { size: 'S', color: 'Charcoal', stock_quantity: 10 },
      { size: 'M', color: 'Charcoal', stock_quantity: 13 },
      { size: 'L', color: 'Charcoal', stock_quantity: 7 }
    ]
  },
  {
    name: 'Wool-Blend Bermuda Shorts',
    slug: 'wool-blend-bermuda-shorts',
    categorySlug: 'bottoms',
    price: 68.00,
    description: 'Tailored knee-length Bermuda shorts with double pleats and welt pockets. A modern collegiate take on classic tailoring.',
    image_url: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=800&q=80',
    secondary_image_url: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&w=800&q=80',
    style_tags: ['classic', 'minimalist'],
    occasion_tags: ['college', 'office', 'casual'],
    colors: ['charcoal', 'beige'],
    featured: false,
    variants: [
      { size: 'S', color: 'Charcoal', stock_quantity: 8 },
      { size: 'M', color: 'Charcoal', stock_quantity: 11 },
      { size: 'L', color: 'Charcoal', stock_quantity: 6 }
    ]
  },

  // --- DRESSES ---
  {
    name: 'Burgundy Silk-Satin Slip Dress',
    slug: 'burgundy-silk-satin-slip-dress',
    categorySlug: 'dresses',
    price: 135.00,
    description: 'Heavyweight silk-satin cut on the bias in our signature burgundy shade. Cowl neckline and delicate crossover back straps.',
    image_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80',
    secondary_image_url: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80',
    style_tags: ['chic', 'minimalist'],
    occasion_tags: ['party', 'festive'],
    colors: ['burgundy', 'black', 'ivory'],
    featured: true,
    variants: [
      { size: 'XS', color: 'Burgundy', stock_quantity: 5 },
      { size: 'S', color: 'Burgundy', stock_quantity: 12 },
      { size: 'M', color: 'Burgundy', stock_quantity: 14 },
      { size: 'L', color: 'Burgundy', stock_quantity: 6 },
      { size: 'S', color: 'Black', stock_quantity: 8 },
      { size: 'M', color: 'Black', stock_quantity: 10 }
    ]
  },
  {
    name: 'Tailored Blazer Dress with Belt',
    slug: 'tailored-blazer-dress-with-belt',
    categorySlug: 'dresses',
    price: 155.00,
    description: 'Double-breasted blazer silhouette with notched lapels and matching self-tie belt with horn buckle. Sharp power dressing refined.',
    image_url: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80',
    secondary_image_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80',
    style_tags: ['classic', 'chic'],
    occasion_tags: ['office', 'party', 'festive'],
    colors: ['charcoal', 'ivory'],
    featured: true,
    variants: [
      { size: 'S', color: 'Charcoal', stock_quantity: 9 },
      { size: 'M', color: 'Charcoal', stock_quantity: 14 },
      { size: 'L', color: 'Charcoal', stock_quantity: 8 },
      { size: 'S', color: 'Ivory', stock_quantity: 7 },
      { size: 'M', color: 'Ivory', stock_quantity: 10 }
    ]
  },
  {
    name: 'Ribbed Knit Column Midi Dress',
    slug: 'ribbed-knit-column-midi-dress',
    categorySlug: 'dresses',
    price: 98.00,
    description: 'Form-fitting column midi in rich Ottoman rib-knit. Crewneck with side slit allowing fluid movement throughout the day.',
    image_url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
    secondary_image_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80',
    style_tags: ['minimalist', 'chic'],
    occasion_tags: ['office', 'casual', 'college'],
    colors: ['ivory', 'charcoal', 'burgundy'],
    featured: false,
    variants: [
      { size: 'XS', color: 'Ivory', stock_quantity: 6 },
      { size: 'S', color: 'Ivory', stock_quantity: 12 },
      { size: 'M', color: 'Ivory', stock_quantity: 15 },
      { size: 'L', color: 'Ivory', stock_quantity: 8 }
    ]
  },
  {
    name: 'Pleated Poplin Shirt Dress',
    slug: 'pleated-poplin-shirt-dress',
    categorySlug: 'dresses',
    price: 110.00,
    description: 'Architectural pleated back panel turns this classic cotton shirt dress into an editorial statement piece.',
    image_url: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80',
    secondary_image_url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
    style_tags: ['minimalist', 'classic'],
    occasion_tags: ['office', 'college', 'casual'],
    colors: ['white', 'ivory', 'navy'],
    featured: false,
    variants: [
      { size: 'S', color: 'White', stock_quantity: 10 },
      { size: 'M', color: 'White', stock_quantity: 14 },
      { size: 'L', color: 'White', stock_quantity: 8 }
    ]
  },
  {
    name: 'Asymmetric Ruched Velvet Evening Gown',
    slug: 'asymmetric-ruched-velvet-evening-gown',
    categorySlug: 'dresses',
    price: 185.00,
    description: 'Plush stretch velvet in midnight charcoal with side ruching that cascades into a graceful floor-sweeping hemline.',
    image_url: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80',
    secondary_image_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80',
    style_tags: ['chic'],
    occasion_tags: ['party', 'festive'],
    colors: ['charcoal', 'burgundy'],
    featured: true,
    variants: [
      { size: 'XS', color: 'Charcoal', stock_quantity: 4 },
      { size: 'S', color: 'Charcoal', stock_quantity: 7 },
      { size: 'M', color: 'Charcoal', stock_quantity: 9 },
      { size: 'L', color: 'Charcoal', stock_quantity: 5 }
    ]
  },
  {
    name: 'Tiered Linen Sundress',
    slug: 'tiered-linen-sundress',
    categorySlug: 'dresses',
    price: 85.00,
    description: 'Gathered tiered skirts with delicate ties at shoulders. Light and breathable pure linen made for warm campus strolls.',
    image_url: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80',
    secondary_image_url: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80',
    style_tags: ['minimalist', 'casual'],
    occasion_tags: ['college', 'casual'],
    colors: ['beige', 'ivory'],
    featured: false,
    variants: [
      { size: 'S', color: 'Beige', stock_quantity: 11 },
      { size: 'M', color: 'Beige', stock_quantity: 16 },
      { size: 'L', color: 'Beige', stock_quantity: 9 }
    ]
  },
  {
    name: 'Hooded Sweatshirt Mini Dress',
    slug: 'hooded-sweatshirt-mini-dress',
    categorySlug: 'dresses',
    price: 75.00,
    description: 'Thick organic fleece in a relaxed tunic silhouette. Kangaroo pocket, raw edges, and thumb loops at the cuffs.',
    image_url: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80',
    secondary_image_url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
    style_tags: ['streetwear'],
    occasion_tags: ['college', 'casual'],
    colors: ['charcoal', 'olive'],
    featured: false,
    variants: [
      { size: 'S', color: 'Charcoal', stock_quantity: 12 },
      { size: 'M', color: 'Charcoal', stock_quantity: 15 },
      { size: 'L', color: 'Charcoal', stock_quantity: 8 }
    ]
  },
  {
    name: 'Jacquard Metallic Cocktail Dress',
    slug: 'jacquard-metallic-cocktail-dress',
    categorySlug: 'dresses',
    price: 165.00,
    description: 'Shimmering metallic jacquard woven with tonal floral abstractions. Boat neckline, sculpted waist, and concealed back zip.',
    image_url: 'https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?auto=format&fit=crop&w=800&q=80',
    secondary_image_url: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80',
    style_tags: ['chic', 'classic'],
    occasion_tags: ['festive', 'party'],
    colors: ['burgundy', 'charcoal'],
    featured: false,
    variants: [
      { size: 'XS', color: 'Burgundy', stock_quantity: 4 },
      { size: 'S', color: 'Burgundy', stock_quantity: 8 },
      { size: 'M', color: 'Burgundy', stock_quantity: 10 }
    ]
  },

  // --- OUTERWEAR ---
  {
    name: 'Double-Faced Wool Belted Overcoat',
    slug: 'double-faced-wool-belted-overcoat',
    categorySlug: 'outerwear',
    price: 260.00,
    description: 'Hand-finished double-faced wool coat without lining for uncompromised softness and lightweight warmth. Features storm flaps and sash belt.',
    image_url: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
    secondary_image_url: 'https://images.unsplash.com/photo-1539533018447-63fcce667883?auto=format&fit=crop&w=800&q=80',
    style_tags: ['minimalist', 'classic'],
    occasion_tags: ['office', 'casual', 'festive'],
    colors: ['camel', 'charcoal', 'ivory'],
    featured: true,
    variants: [
      { size: 'XS', color: 'Camel', stock_quantity: 4 },
      { size: 'S', color: 'Camel', stock_quantity: 8 },
      { size: 'M', color: 'Camel', stock_quantity: 12 },
      { size: 'L', color: 'Camel', stock_quantity: 6 },
      { size: 'S', color: 'Charcoal', stock_quantity: 7 },
      { size: 'M', color: 'Charcoal', stock_quantity: 10 }
    ]
  },
  {
    name: 'Oversized Tailored Wool Blazer',
    slug: 'oversized-tailored-wool-blazer',
    categorySlug: 'outerwear',
    price: 175.00,
    description: 'Sculpted shoulders with a relaxed boxy cut. Lined in cupro with felt undercollar, flap pockets, and double back vents.',
    image_url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80',
    secondary_image_url: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
    style_tags: ['minimalist', 'chic'],
    occasion_tags: ['office', 'college', 'party'],
    colors: ['charcoal', 'burgundy', 'ivory'],
    featured: true,
    variants: [
      { size: 'S', color: 'Charcoal', stock_quantity: 10 },
      { size: 'M', color: 'Charcoal', stock_quantity: 15 },
      { size: 'L', color: 'Charcoal', stock_quantity: 9 },
      { size: 'S', color: 'Burgundy', stock_quantity: 6 },
      { size: 'M', color: 'Burgundy', stock_quantity: 8 }
    ]
  },
  {
    name: 'Classic Trench Coat with Storm Flap',
    slug: 'classic-trench-coat-with-storm-flap',
    categorySlug: 'outerwear',
    price: 210.00,
    description: 'Water-repellent cotton gabardine trench coat. Epaulettes, storm flap, horn buckles, and custom check lining.',
    image_url: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
    secondary_image_url: 'https://images.unsplash.com/photo-1539533018447-63fcce667883?auto=format&fit=crop&w=800&q=80',
    style_tags: ['classic'],
    occasion_tags: ['office', 'college', 'casual'],
    colors: ['beige', 'charcoal'],
    featured: false,
    variants: [
      { size: 'S', color: 'Beige', stock_quantity: 8 },
      { size: 'M', color: 'Beige', stock_quantity: 12 },
      { size: 'L', color: 'Beige', stock_quantity: 7 }
    ]
  },
  {
    name: 'Cropped Leather Biker Jacket',
    slug: 'cropped-leather-biker-jacket',
    categorySlug: 'outerwear',
    price: 245.00,
    description: 'Full-grain lambskin leather with silver-tone hardware, asymmetrical zipper closure, and quilted shoulder padding.',
    image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80',
    secondary_image_url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80',
    style_tags: ['streetwear', 'chic'],
    occasion_tags: ['party', 'college', 'casual'],
    colors: ['black', 'burgundy'],
    featured: false,
    variants: [
      { size: 'S', color: 'Black', stock_quantity: 6 },
      { size: 'M', color: 'Black', stock_quantity: 9 },
      { size: 'L', color: 'Black', stock_quantity: 5 }
    ]
  },
  {
    name: 'Padded Utility Bomber Jacket',
    slug: 'padded-utility-bomber-jacket',
    categorySlug: 'outerwear',
    price: 130.00,
    description: 'Satin nylon shell insulated with recycled down-alternative fibers. Heavy brass zipper, utility arm pocket, and knit trims.',
    image_url: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=800&q=80',
    secondary_image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80',
    style_tags: ['streetwear'],
    occasion_tags: ['college', 'casual'],
    colors: ['olive', 'charcoal', 'black'],
    featured: false,
    variants: [
      { size: 'S', color: 'Olive', stock_quantity: 11 },
      { size: 'M', color: 'Olive', stock_quantity: 16 },
      { size: 'L', color: 'Olive', stock_quantity: 12 }
    ]
  },
  {
    name: 'Bouclé Tweed Cropped Cardigan Jacket',
    slug: 'boucle-tweed-cropped-cardigan-jacket',
    categorySlug: 'outerwear',
    price: 145.00,
    description: 'Woven French bouclé with braided trim and crest-embossed golden buttons. Sophisticated styling for events and office meetings.',
    image_url: 'https://images.unsplash.com/photo-1539533018447-63fcce667883?auto=format&fit=crop&w=800&q=80',
    secondary_image_url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80',
    style_tags: ['chic', 'classic'],
    occasion_tags: ['office', 'festive', 'party'],
    colors: ['ivory', 'burgundy'],
    featured: false,
    variants: [
      { size: 'XS', color: 'Ivory', stock_quantity: 4 },
      { size: 'S', color: 'Ivory', stock_quantity: 8 },
      { size: 'M', color: 'Ivory', stock_quantity: 10 }
    ]
  },
  {
    name: 'Longline Quilted Puffer Coat',
    slug: 'longline-quilted-puffer-coat',
    categorySlug: 'outerwear',
    price: 195.00,
    description: 'Floor-skimming diamond-quilted coat designed for freezing winter days. Features fleece-lined pockets and magnetic closures.',
    image_url: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
    secondary_image_url: 'https://images.unsplash.com/photo-1539533018447-63fcce667883?auto=format&fit=crop&w=800&q=80',
    style_tags: ['minimalist', 'streetwear'],
    occasion_tags: ['college', 'casual'],
    colors: ['charcoal', 'beige'],
    featured: false,
    variants: [
      { size: 'S', color: 'Charcoal', stock_quantity: 7 },
      { size: 'M', color: 'Charcoal', stock_quantity: 12 },
      { size: 'L', color: 'Charcoal', stock_quantity: 9 }
    ]
  },
  {
    name: 'Cashmere Duster Cardigan',
    slug: 'cashmere-duster-cardigan',
    categorySlug: 'outerwear',
    price: 160.00,
    description: 'Sublime fine-gauge cashmere that falls smoothly to mid-calf. An indispensable lightweight layer for transitional seasons.',
    image_url: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80',
    secondary_image_url: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
    style_tags: ['minimalist', 'classic'],
    occasion_tags: ['office', 'casual'],
    colors: ['ivory', 'charcoal', 'beige'],
    featured: false,
    variants: [
      { size: 'S', color: 'Ivory', stock_quantity: 8 },
      { size: 'M', color: 'Ivory', stock_quantity: 12 },
      { size: 'L', color: 'Ivory', stock_quantity: 7 }
    ]
  },

  // --- SHOES ---
  {
    name: 'Chunky Leather Penny Loafers',
    slug: 'chunky-leather-penny-loafers',
    categorySlug: 'shoes',
    price: 140.00,
    description: 'Polished calfskin loafers sitting on a sturdy lightweight lug sole. Modern collegiate silhouette finished with classic saddle detail.',
    image_url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80',
    secondary_image_url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80',
    style_tags: ['classic', 'streetwear', 'chic'],
    occasion_tags: ['college', 'office', 'casual'],
    colors: ['charcoal', 'burgundy', 'black'],
    featured: true,
    variants: [
      { size: 'S', color: 'Charcoal', stock_quantity: 8 }, // S = US 6-7
      { size: 'M', color: 'Charcoal', stock_quantity: 14 }, // M = US 8-9
      { size: 'L', color: 'Charcoal', stock_quantity: 10 }, // L = US 10-11
      { size: 'M', color: 'Burgundy', stock_quantity: 9 }
    ]
  },
  {
    name: 'Pointed-Toe Leather Ankle Boots',
    slug: 'pointed-toe-leather-ankle-boots',
    categorySlug: 'shoes',
    price: 165.00,
    description: 'Sculpted kitten heel boots in smooth Italian leather. Pointed toe and close-fitting shaft designed to slip under wide trousers.',
    image_url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80',
    secondary_image_url: 'https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?auto=format&fit=crop&w=800&q=80',
    style_tags: ['chic', 'minimalist'],
    occasion_tags: ['office', 'party', 'festive'],
    colors: ['black', 'burgundy'],
    featured: true,
    variants: [
      { size: 'S', color: 'Burgundy', stock_quantity: 7 },
      { size: 'M', color: 'Burgundy', stock_quantity: 11 },
      { size: 'L', color: 'Burgundy', stock_quantity: 6 },
      { size: 'M', color: 'Black', stock_quantity: 12 }
    ]
  },
  {
    name: 'Minimalist Clean Leather Sneakers',
    slug: 'minimalist-clean-leather-sneakers',
    categorySlug: 'shoes',
    price: 110.00,
    description: 'Low-top cupsole sneaker handmade from butter-soft white Nappa leather. Subtle debossed gold logo on heel tab.',
    image_url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80',
    secondary_image_url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80',
    style_tags: ['minimalist', 'streetwear', 'classic'],
    occasion_tags: ['college', 'casual', 'office'],
    colors: ['white', 'ivory'],
    featured: false,
    variants: [
      { size: 'S', color: 'White', stock_quantity: 12 },
      { size: 'M', color: 'White', stock_quantity: 18 },
      { size: 'L', color: 'White', stock_quantity: 14 }
    ]
  },
  {
    name: 'Burgundy Velvet Strappy Heels',
    slug: 'burgundy-velvet-strappy-heels',
    categorySlug: 'shoes',
    price: 125.00,
    description: 'Delicate criss-cross ankle straps in rich burgundy velvet atop an 85mm stiletto heel. Padded footbed for dance floor comfort.',
    image_url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80',
    secondary_image_url: 'https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?auto=format&fit=crop&w=800&q=80',
    style_tags: ['chic'],
    occasion_tags: ['party', 'festive'],
    colors: ['burgundy', 'black'],
    featured: false,
    variants: [
      { size: 'XS', color: 'Burgundy', stock_quantity: 4 },
      { size: 'S', color: 'Burgundy', stock_quantity: 8 },
      { size: 'M', color: 'Burgundy', stock_quantity: 10 }
    ]
  },
  {
    name: 'Suede Chelsea Boots with Pull Tab',
    slug: 'suede-chelsea-boots-with-pull-tab',
    categorySlug: 'shoes',
    price: 150.00,
    description: 'Weather-treated calf suede in warm taupe. Flexible elastic side gores and Goodyear-welted rubber soles.',
    image_url: 'https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?auto=format&fit=crop&w=800&q=80',
    secondary_image_url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80',
    style_tags: ['classic', 'minimalist'],
    occasion_tags: ['casual', 'college', 'office'],
    colors: ['beige', 'charcoal'],
    featured: false,
    variants: [
      { size: 'S', color: 'Beige', stock_quantity: 6 },
      { size: 'M', color: 'Beige', stock_quantity: 12 },
      { size: 'L', color: 'Beige', stock_quantity: 8 }
    ]
  },
  {
    name: 'Architectural Mary Jane Block Heels',
    slug: 'architectural-mary-jane-block-heels',
    categorySlug: 'shoes',
    price: 135.00,
    description: 'Double instep straps with sculptural flared block heel in glossy patent leather. Seamlessly connects vintage charm to high fashion.',
    image_url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80',
    secondary_image_url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80',
    style_tags: ['chic', 'classic'],
    occasion_tags: ['office', 'festive', 'college'],
    colors: ['charcoal', 'burgundy', 'ivory'],
    featured: false,
    variants: [
      { size: 'S', color: 'Charcoal', stock_quantity: 7 },
      { size: 'M', color: 'Charcoal', stock_quantity: 11 },
      { size: 'L', color: 'Charcoal', stock_quantity: 6 }
    ]
  },
  {
    name: 'Lug-Sole Combat Boots',
    slug: 'lug-sole-combat-boots',
    categorySlug: 'shoes',
    price: 160.00,
    description: 'Brushed leather lace-up combat boots with inside zip entry and deep tread. Engineered for comfort and tough-luxe styling.',
    image_url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80',
    secondary_image_url: 'https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?auto=format&fit=crop&w=800&q=80',
    style_tags: ['streetwear'],
    occasion_tags: ['college', 'casual'],
    colors: ['charcoal', 'black'],
    featured: false,
    variants: [
      { size: 'S', color: 'Charcoal', stock_quantity: 9 },
      { size: 'M', color: 'Charcoal', stock_quantity: 13 },
      { size: 'L', color: 'Charcoal', stock_quantity: 8 }
    ]
  },
  {
    name: 'Woven Raffia Mules',
    slug: 'woven-raffia-mules',
    categorySlug: 'shoes',
    price: 78.00,
    description: 'Artisanal hand-woven natural raffia slip-on flats with square toe and cushioned leather insole.',
    image_url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80',
    secondary_image_url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80',
    style_tags: ['minimalist'],
    occasion_tags: ['casual'],
    colors: ['beige', 'ivory'],
    featured: false,
    variants: [
      { size: 'S', color: 'Beige', stock_quantity: 8 },
      { size: 'M', color: 'Beige', stock_quantity: 11 },
      { size: 'L', color: 'Beige', stock_quantity: 5 }
    ]
  },
  {
    name: 'Slingback Leather Kitten Heels',
    slug: 'slingback-leather-kitten-heels',
    categorySlug: 'shoes',
    price: 120.00,
    description: 'Elasticated slingback strap with 50mm flared heel. A sharp, feminine silhouette that pairs effortlessly with tailored pants.',
    image_url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80',
    secondary_image_url: 'https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?auto=format&fit=crop&w=800&q=80',
    style_tags: ['classic', 'chic'],
    occasion_tags: ['office', 'festive'],
    colors: ['ivory', 'burgundy', 'charcoal'],
    variants: [
      { size: 'S', color: 'Ivory', stock_quantity: 6 },
      { size: 'M', color: 'Ivory', stock_quantity: 10 },
      { size: 'L', color: 'Ivory', stock_quantity: 7 }
    ]
  },

  // --- ACCESSORIES ---
  {
    name: 'Structured Leather Shoulder Bag',
    slug: 'structured-leather-shoulder-bag',
    categorySlug: 'accessories',
    price: 175.00,
    description: 'Sculptural curved flap bag crafted from smooth box-calf leather with understated brushed gold hardware.',
    image_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
    secondary_image_url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
    style_tags: ['minimalist', 'chic', 'classic'],
    occasion_tags: ['office', 'party', 'casual'],
    colors: ['burgundy', 'charcoal', 'ivory'],
    featured: true,
    variants: [
      { size: 'One Size', color: 'Burgundy', stock_quantity: 12 },
      { size: 'One Size', color: 'Charcoal', stock_quantity: 15 },
      { size: 'One Size', color: 'Ivory', stock_quantity: 9 }
    ]
  },
  {
    name: 'Brushed Cashmere Fringe Scarf',
    slug: 'brushed-cashmere-fringe-scarf',
    categorySlug: 'accessories',
    price: 85.00,
    description: 'Sumptuously dense Scottish cashmere woven with a ripple finish and traditional pin-fringed edges.',
    image_url: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=800&q=80',
    secondary_image_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
    style_tags: ['minimalist', 'classic'],
    occasion_tags: ['office', 'college', 'casual'],
    colors: ['camel', 'ivory', 'burgundy'],
    featured: false,
    variants: [
      { size: 'One Size', color: 'Camel', stock_quantity: 14 },
      { size: 'One Size', color: 'Ivory', stock_quantity: 16 },
      { size: 'One Size', color: 'Burgundy', stock_quantity: 10 }
    ]
  },
  {
    name: 'Sleek Leather Belt with Golden Buckle',
    slug: 'sleek-leather-belt-with-golden-buckle',
    categorySlug: 'accessories',
    price: 45.00,
    description: 'Vegetable-tanned saddle leather strap accented by an organic, pebble-shaped brass buckle.',
    image_url: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=800&q=80',
    secondary_image_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
    style_tags: ['classic', 'minimalist'],
    occasion_tags: ['office', 'college', 'casual'],
    colors: ['charcoal', 'burgundy'],
    featured: false,
    variants: [
      { size: 'S', color: 'Charcoal', stock_quantity: 15 },
      { size: 'M', color: 'Charcoal', stock_quantity: 20 },
      { size: 'L', color: 'Charcoal', stock_quantity: 14 },
      { size: 'M', color: 'Burgundy', stock_quantity: 12 }
    ]
  },
  {
    name: 'Architectural Pearl Drop Earrings',
    slug: 'architectural-pearl-drop-earrings',
    categorySlug: 'accessories',
    price: 65.00,
    description: 'Baroque freshwater pearls suspended from hand-cast 18k gold vermeil sculptural hoops.',
    image_url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
    secondary_image_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
    style_tags: ['chic', 'classic'],
    occasion_tags: ['festive', 'party', 'office'],
    colors: ['ivory', 'gold'],
    featured: true,
    variants: [
      { size: 'One Size', color: 'Gold', stock_quantity: 18 }
    ]
  },
  {
    name: 'Canvas Utility Weekender Tote',
    slug: 'canvas-utility-weekender-tote',
    categorySlug: 'accessories',
    price: 75.00,
    description: '24 oz heavy cotton canvas with bridle leather handles, zippered main compartment, and padded laptop sleeve.',
    image_url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
    secondary_image_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
    style_tags: ['streetwear', 'minimalist'],
    occasion_tags: ['college', 'casual'],
    colors: ['ivory', 'charcoal', 'olive'],
    featured: false,
    variants: [
      { size: 'One Size', color: 'Ivory', stock_quantity: 15 },
      { size: 'One Size', color: 'Charcoal', stock_quantity: 12 }
    ]
  },
  {
    name: 'Acetate Cat-Eye Sunglasses',
    slug: 'acetate-cat-eye-sunglasses',
    categorySlug: 'accessories',
    price: 95.00,
    description: 'Thick beveled Italian acetate frame with category 3 UV400 protective charcoal lenses.',
    image_url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80',
    secondary_image_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
    style_tags: ['chic', 'streetwear'],
    occasion_tags: ['casual', 'college', 'party'],
    colors: ['charcoal', 'burgundy'],
    featured: false,
    variants: [
      { size: 'One Size', color: 'Charcoal', stock_quantity: 14 },
      { size: 'One Size', color: 'Burgundy', stock_quantity: 8 }
    ]
  },
  {
    name: 'Chunky Wool Beanie',
    slug: 'chunky-wool-beanie',
    categorySlug: 'accessories',
    price: 35.00,
    description: 'Rib-knit from pure merino wool with wide folded cuff for thermal insulation and streetwear silhouette.',
    image_url: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?auto=format&fit=crop&w=800&q=80',
    secondary_image_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
    style_tags: ['streetwear', 'minimalist'],
    occasion_tags: ['college', 'casual'],
    colors: ['charcoal', 'ivory', 'burgundy'],
    featured: false,
    variants: [
      { size: 'One Size', color: 'Charcoal', stock_quantity: 20 },
      { size: 'One Size', color: 'Ivory', stock_quantity: 15 },
      { size: 'One Size', color: 'Burgundy', stock_quantity: 12 }
    ]
  },
  {
    name: 'Hammered Brass Chunky Cuff',
    slug: 'hammered-brass-chunky-cuff',
    categorySlug: 'accessories',
    price: 55.00,
    description: 'Solid brass cuff bangle with artisanal light-catching hammered texture and open back for flexible sizing.',
    image_url: 'https://images.unsplash.com/photo-1611591475876-0f8c37c2250c?auto=format&fit=crop&w=800&q=80',
    secondary_image_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
    style_tags: ['chic', 'minimalist'],
    occasion_tags: ['party', 'festive', 'office'],
    colors: ['gold'],
    featured: false,
    variants: [
      { size: 'One Size', color: 'Gold', stock_quantity: 16 }
    ]
  }
];
