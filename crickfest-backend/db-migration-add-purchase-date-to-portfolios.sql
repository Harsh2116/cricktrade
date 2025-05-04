-- Migration to add purchase_date column to portfolios table for tracking stock purchase timestamps

ALTER TABLE portfolios
ADD COLUMN purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER purchase_price;
