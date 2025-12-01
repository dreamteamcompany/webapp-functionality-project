-- Таблица курсов
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT,
    duration_hours INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица тренажеров
CREATE TABLE trainers (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT,
    difficulty_level VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица связи курсов с подразделениями (многие ко многим)
CREATE TABLE course_departments (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id),
    department_id INTEGER NOT NULL REFERENCES departments(id),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(course_id, department_id)
);

-- Таблица связи тренажеров с подразделениями (многие ко многим)
CREATE TABLE trainer_departments (
    id SERIAL PRIMARY KEY,
    trainer_id INTEGER NOT NULL REFERENCES trainers(id),
    department_id INTEGER NOT NULL REFERENCES departments(id),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(trainer_id, department_id)
);

-- Создание индексов
CREATE INDEX idx_courses_created_by ON courses(created_by);
CREATE INDEX idx_trainers_created_by ON trainers(created_by);
CREATE INDEX idx_course_departments_course_id ON course_departments(course_id);
CREATE INDEX idx_course_departments_department_id ON course_departments(department_id);
CREATE INDEX idx_trainer_departments_trainer_id ON trainer_departments(trainer_id);
CREATE INDEX idx_trainer_departments_department_id ON trainer_departments(department_id);

-- Добавляем тестовые данные
INSERT INTO courses (title, description, content, duration_hours, created_by) VALUES
('Основы стоматологии', 'Базовый курс для начинающих специалистов', 'Содержание курса: анатомия, инструменты, базовые процедуры', 40, 1),
('Эндодонтия', 'Продвинутый курс по лечению корневых каналов', 'Техники обработки каналов, пломбирование', 24, 1);

INSERT INTO trainers (title, description, content, difficulty_level, created_by) VALUES
('Препарирование зубов', 'Тренажер для отработки навыков препарирования', 'Виртуальный симулятор с обратной связью', 'Средний', 1),
('Наложение пломб', 'Практика установки композитных пломб', 'Пошаговые инструкции и оценка качества', 'Начальный', 1);

-- Привязываем к подразделениям
INSERT INTO course_departments (course_id, department_id) VALUES
(1, 2), (1, 3), (2, 2);

INSERT INTO trainer_departments (trainer_id, department_id) VALUES
(1, 2), (1, 3), (2, 2), (2, 3);