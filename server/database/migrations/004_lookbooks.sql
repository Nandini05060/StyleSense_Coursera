-- ========================================================
-- StyleSense AI — Migration 004: Personal Lookbook & Capsule Builder
-- Safe, incremental DDL additions
-- ========================================================

USE stylesense_db;

CREATE TABLE IF NOT EXISTS lookbooks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NULL,
  theme VARCHAR(100) NULL,
  cover_image_url VARCHAR(500) NULL,
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  share_token VARCHAR(64) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_lookbook_user (user_id),
  INDEX idx_lookbook_token (share_token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS lookbook_outfits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lookbook_id INT NOT NULL,
  outfit_id INT NOT NULL,
  position INT NOT NULL DEFAULT 0,
  curator_note VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lookbook_id) REFERENCES lookbooks(id) ON DELETE CASCADE,
  FOREIGN KEY (outfit_id) REFERENCES saved_outfits(id) ON DELETE CASCADE,
  UNIQUE KEY uq_lookbook_outfit (lookbook_id, outfit_id),
  INDEX idx_lookbook_outfit_lb (lookbook_id),
  INDEX idx_lookbook_outfit_of (outfit_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
