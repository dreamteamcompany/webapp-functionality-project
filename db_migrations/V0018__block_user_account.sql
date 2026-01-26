-- Блокировка тестового пользователя user
UPDATE users 
SET is_blocked = true 
WHERE username = 'user';
