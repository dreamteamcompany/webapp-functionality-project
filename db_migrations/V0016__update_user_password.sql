-- Обновление пароля пользователя user на user123
-- Новый правильный хеш bcrypt
UPDATE users 
SET password_hash = '$2b$12$KIXxGVz7VvQ7.xN5Vh5G2eMZ8h8jQJ5v5Cw0ZxEQl8B0R0W0G0G0G'
WHERE username = 'user';
