-- Migration script to add username column to users table

ALTER TABLE users
ADD COLUMN username VARCHAR(10) UNIQUE NOT NULL AFTER id;
