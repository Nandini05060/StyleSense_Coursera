import { query, memoryStore } from '../config/db.js';

/**
 * Helper to fetch all products with full category and variant relations
 */
async function fetchFullProductsList() {
  if (memoryStore.products && memoryStore.products.length > 0) {
    return memoryStore.products.map(p => {
      const cat = memoryStore.categories.find(c => c.id === p.category_id);
      const variants = memoryStore.product_variants.filter(v => v.product_id === p.id);
      const totalStock = variants.reduce((s, v) => s + (v.stock_quantity || 0), 0);
      return {
        ...p,
        category_name: cat ? cat.name : 'Fashion',
        category_slug: cat ? cat.slug : 'tops',
        variants,
        total_stock: totalStock,
      };
    });
  }

  // MySQL query
  const prods = await query(`
    SELECT p.*, c.name as category_name, c.slug as category_slug
    FROM products p
    JOIN categories c ON p.category_id = c.id
    ORDER BY p.id ASC
  `);

  const variants = await query('SELECT * FROM product_variants');

  return prods.map(p => {
    const pVariants = variants.filter(v => v.product_id === p.id);
    const totalStock = pVariants.reduce((s, v) => s + (v.stock_quantity || 0), 0);
    return {
      ...p,
      style_tags: typeof p.style_tags === 'string' ? JSON.parse(p.style_tags) : p.style_tags,
      occasion_tags: typeof p.occasion_tags === 'string' ? JSON.parse(p.occasion_tags) : p.occasion_tags,
      colors: typeof p.colors === 'string' ? JSON.parse(p.colors) : p.colors,
      variants: pVariants,
      total_stock: totalStock,
    };
  });
}

/**
 * List products with search, multi-filter, sorting and pagination
 */
export async function getProducts(req, res, next) {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      size,
      color,
      occasion,
      style,
      sort = 'featured',
      page = 1,
      limit = 12,
      includeInactive = false
    } = req.query;

    let products = await fetchFullProductsList();

    // 1. Filter active (unless admin requested inactive)
    if (!includeInactive) {
      products = products.filter(p => p.active);
    }

    // 2. Search query (matches name, description, tags)
    if (search && search.trim()) {
      const term = search.trim().toLowerCase();
      products = products.filter(p => {
        const nameMatch = p.name.toLowerCase().includes(term);
        const descMatch = (p.description || '').toLowerCase().includes(term);
        const catMatch = (p.category_name || '').toLowerCase().includes(term);
        const styleMatch = (p.style_tags || []).some(s => s.toLowerCase().includes(term));
        const occasionMatch = (p.occasion_tags || []).some(o => o.toLowerCase().includes(term));
        return nameMatch || descMatch || catMatch || styleMatch || occasionMatch;
      });
    }

    // 3. Category filter
    if (category && category !== 'all') {
      const catSlug = category.toLowerCase();
      products = products.filter(p =>
        (p.category_slug || '').toLowerCase() === catSlug ||
        (p.category_name || '').toLowerCase() === catSlug
      );
    }

    // 4. Price range filter
    if (minPrice && !isNaN(minPrice)) {
      products = products.filter(p => parseFloat(p.price) >= parseFloat(minPrice));
    }
    if (maxPrice && !isNaN(maxPrice)) {
      products = products.filter(p => parseFloat(p.price) <= parseFloat(maxPrice));
    }

    // 5. Size filter (product must have in-stock variant with that size)
    if (size && size !== 'all') {
      products = products.filter(p =>
        p.variants.some(v => String(v.size).toUpperCase() === String(size).toUpperCase() && v.stock_quantity > 0)
      );
    }

    // 6. Color filter
    if (color && color !== 'all') {
      const cLower = color.toLowerCase();
      products = products.filter(p =>
        (p.colors || []).some(c => c.toLowerCase() === cLower) ||
        p.variants.some(v => v.color.toLowerCase() === cLower && v.stock_quantity > 0)
      );
    }

    // 7. Occasion filter
    if (occasion && occasion !== 'all') {
      const occLower = occasion.toLowerCase();
      products = products.filter(p =>
        (p.occasion_tags || []).some(o => o.toLowerCase() === occLower)
      );
    }

    // 8. Style filter
    if (style && style !== 'all') {
      const stLower = style.toLowerCase();
      products = products.filter(p =>
        (p.style_tags || []).some(s => s.toLowerCase() === stLower)
      );
    }

    // 9. Sorting
    switch (sort) {
      case 'price-asc':
        products.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case 'price-desc':
        products.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case 'newest':
        products.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        break;
      case 'featured':
      default:
        products.sort((a, b) => {
          const aFeat = a.featured ? 1 : 0;
          const bFeat = b.featured ? 1 : 0;
          if (bFeat !== aFeat) return bFeat - aFeat;
          return a.id - b.id;
        });
        break;
    }

    // 10. Pagination
    const totalCount = products.length;
    const pageNum = Math.max(1, parseInt(page, 10));
    const pageSize = Math.max(1, parseInt(limit, 10));
    const totalPages = Math.ceil(totalCount / pageSize);
    const paginated = products.slice((pageNum - 1) * pageSize, pageNum * pageSize);

    return res.status(200).json({
      success: true,
      data: paginated,
      meta: {
        total: totalCount,
        page: pageNum,
        limit: pageSize,
        totalPages,
        hasMore: pageNum < totalPages
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get product by ID or Slug with variant options and related items
 */
export async function getProductById(req, res, next) {
  try {
    const { id } = req.params;
    const allProducts = await fetchFullProductsList();

    const product = allProducts.find(p => String(p.id) === String(id) || p.slug === id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    // Find related items in same category or overlapping style
    const related = allProducts
      .filter(p => p.id !== product.id && p.active && (
        p.category_id === product.category_id ||
        (p.style_tags || []).some(s => (product.style_tags || []).includes(s))
      ))
      .slice(0, 4);

    return res.status(200).json({
      success: true,
      data: {
        ...product,
        related
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get categories with active product count
 */
export async function getCategories(req, res, next) {
  try {
    let categories;
    let products;

    if (memoryStore.categories) {
      categories = memoryStore.categories;
      products = memoryStore.products;
    } else {
      categories = await query('SELECT * FROM categories ORDER BY id ASC');
      products = await query('SELECT category_id, active FROM products');
    }

    const categoriesWithCount = categories.map(cat => {
      const count = products.filter(p => p.category_id === cat.id && p.active).length;
      return {
        ...cat,
        productCount: count
      };
    });

    return res.status(200).json({
      success: true,
      data: categoriesWithCount
    });
  } catch (error) {
    next(error);
  }
}
