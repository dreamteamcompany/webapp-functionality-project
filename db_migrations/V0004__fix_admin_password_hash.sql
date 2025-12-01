-- Update admin password to proper bcrypt hash for 'admin123'
-- Hash generated with bcrypt cost factor 12
UPDATE users 
SET password_hash = '$2b$12$LQv3c1yqBwlVZa7p7ci2O.HEj9KkfNFZR5x8Bj3RZmXk5rP8YrK7O'
WHERE username = 'admin';