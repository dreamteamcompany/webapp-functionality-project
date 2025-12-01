-- Таблица компаний
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица подразделений
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL REFERENCES companies(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Добавление полей в таблицу users
ALTER TABLE users 
ADD COLUMN company_id INTEGER REFERENCES companies(id),
ADD COLUMN department_id INTEGER REFERENCES departments(id);

-- Создание индексов
CREATE INDEX idx_departments_company_id ON departments(company_id);
CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_users_department_id ON users(department_id);

-- Создание тестовой компании и подразделения
INSERT INTO companies (name, description) VALUES 
('Стоматологическая клиника "Dental Care"', 'Основная клиника');

INSERT INTO departments (company_id, name, description) VALUES 
(1, 'Администрация', 'Административный отдел'),
(1, 'Лечение', 'Отделение лечения зубов'),
(1, 'Хирургия', 'Хирургическое отделение');

-- Привязка существующих пользователей к компании и подразделению
UPDATE users SET company_id = 1, department_id = 1 WHERE id = 1;

-- Добавление прав для управления компаниями и подразделениями
INSERT INTO permissions (code, name, description, category) VALUES
('companies.view', 'Просмотр компаний', 'Доступ к списку компаний', 'Организация'),
('companies.create', 'Создание компаний', 'Создание новых компаний', 'Организация'),
('companies.edit', 'Редактирование компаний', 'Изменение данных компаний', 'Организация'),
('companies.remove', 'Удаление компаний', 'Удаление компаний', 'Организация'),
('departments.view', 'Просмотр подразделений', 'Доступ к списку подразделений', 'Организация'),
('departments.create', 'Создание подразделений', 'Создание новых подразделений', 'Организация'),
('departments.edit', 'Редактирование подразделений', 'Изменение данных подразделений', 'Организация'),
('departments.remove', 'Удаление подразделений', 'Удаление подразделений', 'Организация');

-- Добавление прав администратору
INSERT INTO role_permissions (role_id, permission_id)
SELECT 1, id FROM permissions WHERE code IN (
    'companies.view', 'companies.create', 'companies.edit', 'companies.remove',
    'departments.view', 'departments.create', 'departments.edit', 'departments.remove'
);