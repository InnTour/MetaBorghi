-- ============================================================
-- MetaBorghi — Migration V2: Cover Images + Analytics
-- ============================================================

SET NAMES utf8mb4;

-- Cover image per tutte le entità principali
ALTER TABLE `boroughs`       ADD COLUMN IF NOT EXISTS `cover_image` VARCHAR(500) DEFAULT NULL;
ALTER TABLE `companies`      ADD COLUMN IF NOT EXISTS `cover_image` VARCHAR(500) DEFAULT NULL;
ALTER TABLE `experiences`    ADD COLUMN IF NOT EXISTS `cover_image` VARCHAR(500) DEFAULT NULL;
ALTER TABLE `craft_products` ADD COLUMN IF NOT EXISTS `cover_image` VARCHAR(500) DEFAULT NULL;
ALTER TABLE `food_products`  ADD COLUMN IF NOT EXISTS `cover_image` VARCHAR(500) DEFAULT NULL;
ALTER TABLE `accommodations` ADD COLUMN IF NOT EXISTS `cover_image` VARCHAR(500) DEFAULT NULL;
ALTER TABLE `restaurants`    ADD COLUMN IF NOT EXISTS `cover_image` VARCHAR(500) DEFAULT NULL;

-- ------------------------------------------------------------
-- ANALYTICS — Tracciamento visualizzazioni e KPI
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `page_views` (
  `id`            BIGINT AUTO_INCREMENT PRIMARY KEY,
  `entity_type`   VARCHAR(50)   NOT NULL COMMENT 'borough, company, experience, craft, food, accommodation, restaurant',
  `entity_id`     VARCHAR(100)  NOT NULL,
  `page_url`      TEXT          DEFAULT NULL,
  `referrer`      TEXT          DEFAULT NULL,
  `user_agent`    TEXT          DEFAULT NULL,
  `ip_hash`       VARCHAR(64)   DEFAULT NULL COMMENT 'SHA-256 hash for unique visitors',
  `session_id`    VARCHAR(100)  DEFAULT NULL,
  `viewed_at`     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_entity` (`entity_type`, `entity_id`),
  INDEX `idx_viewed_at` (`viewed_at`),
  INDEX `idx_session` (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `daily_stats` (
  `id`            INT AUTO_INCREMENT PRIMARY KEY,
  `stat_date`     DATE          NOT NULL,
  `entity_type`   VARCHAR(50)   NOT NULL,
  `entity_id`     VARCHAR(100)  NOT NULL,
  `views_count`   INT           DEFAULT 0,
  `unique_views`  INT           DEFAULT 0,
  UNIQUE KEY `uq_daily` (`stat_date`, `entity_type`, `entity_id`),
  INDEX `idx_date` (`stat_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
