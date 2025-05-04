-- Disable foreign key checks to allow truncation
SET FOREIGN_KEY_CHECKS = 0;

-- Clear data from tables in order to avoid foreign key constraint errors
DELETE FROM transactions;
DELETE FROM portfolios;
DELETE FROM wallets;
DELETE FROM users;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;
