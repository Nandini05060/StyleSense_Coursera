-- ========================================================
-- StyleSense AI — Migration 003: Fit Finder & Size Intelligence
-- Safe, incremental DDL additions
-- ========================================================

USE stylesense_db;

CREATE TABLE IF NOT EXISTS user_fit_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  height DECIMAL(5,2) NULL,
  height_unit VARCHAR(10) DEFAULT 'cm',
  weight DECIMAL(5,2) NULL,
  weight_unit VARCHAR(10) DEFAULT 'kg',
  chest DECIMAL(5,2) NULL,
  waist DECIMAL(5,2) NULL,
  hips DECIMAL(5,2) NULL,
  foot_length DECIMAL(5,2) NULL,
  measurement_unit VARCHAR(10) DEFAULT 'in',
  shoe_size VARCHAR(20) NULL,
  shoe_size_system VARCHAR(10) DEFAULT 'UK',
  preferred_fit ENUM('tight', 'regular', 'relaxed', 'oversized') DEFAULT 'regular',
  usual_brand_sizes JSON NULL,
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_fit_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
