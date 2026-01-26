-- Обновление хеша пароля для пользователя user
-- Используем хеш от пароля admin123 для тестирования
UPDATE users 
SET password_hash = '$2b$12$McVz0m8XEPgHR2GAoxnV1.RAIr4v1ORpegBVhBHfw8piQ/pwzzlQe'
WHERE username = 'user';
