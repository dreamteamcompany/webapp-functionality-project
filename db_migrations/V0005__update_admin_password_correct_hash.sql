-- Update admin password with correct bcrypt hash for 'admin123'
-- Hash verified from backend logs
UPDATE users 
SET password_hash = '$2b$12$McVz0m8XEPgHR2GAoxnV1.RAIr4v1ORpegBVhBHfw8piQ/pwzzlQe'
WHERE username = 'admin';