-- ========================================================
-- StyleSense AI — Migration 002: Digital Wardrobe & Outfit Intelligence
-- Safe, incremental DDL additions
-- ========================================================

USE stylesense_db;

-- 1. Wardrobe Items
CREATE TABLE IF NOT EXISTS wardrobe_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(200) NOT NULL,
  category ENUM('tops', 'bottoms', 'dresses', 'outerwear', 'shoes', 'accessories') NOT NULL,
  color VARCHAR(60) NOT NULL,
  style VARCHAR(60) NOT NULL,
  occasion VARCHAR(60) NOT NULL,
  size VARCHAR(20) NOT NULL,
  brand VARCHAR(100) NULL,
  purchase_price DECIMAL(10,2) NULL,
  wears_count INT NOT NULL DEFAULT 0,
  is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
  image_url VARCHAR(500) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_wardrobe_user (user_id),
  INDEX idx_wardrobe_cat (category),
  INDEX idx_wardrobe_fav (is_favorite)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Saved Outfits
CREATE TABLE IF NOT EXISTS saved_outfits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(150) NOT NULL,
  occasion VARCHAR(60) NOT NULL,
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_saved_outfits_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Saved Outfit Items (Slots: top, bottom, dress, outerwear, shoes, accessory)
CREATE TABLE IF NOT EXISTS saved_outfit_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  outfit_id INT NOT NULL,
  item_type ENUM('wardrobe', 'store_product') NOT NULL DEFAULT 'wardrobe',
  wardrobe_item_id INT NULL,
  product_id INT NULL,
  variant_id INT NULL,
  slot_name VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (outfit_id) REFERENCES saved_outfits(id) ON DELETE CASCADE,
  FOREIGN KEY (wardrobe_item_id) REFERENCES wardrobe_items(id) ON DELETE SET NULL,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  INDEX idx_outfit_slot (outfit_id, slot_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Wardrobe Wear Logs
CREATE TABLE IF NOT EXISTS wardrobe_wear_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  wardrobe_item_id INT NOT NULL,
  user_id INT NOT NULL,
  worn_date DATE NOT NULL,
  occasion_worn VARCHAR(60) NULL,
  notes VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (wardrobe_item_id) REFERENCES wardrobe_items(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_wear_item (wardrobe_item_id),
  INDEX idx_wear_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Dismissed Gap Suggestions
CREATE TABLE IF NOT EXISTS dismissed_gap_suggestions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  gap_key VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uq_user_gap (user_id, gap_key),
  INDEX idx_gap_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. User Extended Style Profile
CREATE TABLE IF NOT EXISTS user_style_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  preferred_aesthetics JSON NOT NULL,
  preferred_colors JSON NOT NULL,
  favorite_categories JSON NOT NULL,
  preferred_occasions JSON NOT NULL,
  budget_min DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  budget_max DECIMAL(10,2) NOT NULL DEFAULT 500.00,
  lifestyle_tags JSON NULL,
  notes TEXT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_profile_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
