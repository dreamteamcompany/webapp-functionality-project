-- Создание нового пользователя с логином user и паролем user123
-- Хеш сгенерирован с помощью bcrypt
INSERT INTO users (username, email, password_hash, full_name, role_id, is_blocked, created_at)
VALUES (
  'user',
  'user@example.com',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWIvM0qG',
  'Новый пользователь',
  4,
  false,
  CURRENT_TIMESTAMP
);
