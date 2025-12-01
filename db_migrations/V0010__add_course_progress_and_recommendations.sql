-- Таблица прогресса пользователей по курсам
CREATE TABLE t_p66738329_webapp_functionality.course_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES t_p66738329_webapp_functionality.users(id),
    course_id INTEGER NOT NULL REFERENCES t_p66738329_webapp_functionality.courses(id),
    status VARCHAR(50) DEFAULT 'not_started',
    progress_percent INTEGER DEFAULT 0,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, course_id)
);

-- Таблица прогресса по тренажерам
CREATE TABLE t_p66738329_webapp_functionality.trainer_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES t_p66738329_webapp_functionality.users(id),
    trainer_id INTEGER NOT NULL REFERENCES t_p66738329_webapp_functionality.trainers(id),
    status VARCHAR(50) DEFAULT 'not_started',
    progress_percent INTEGER DEFAULT 0,
    attempts_count INTEGER DEFAULT 0,
    best_score INTEGER DEFAULT 0,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, trainer_id)
);

-- Индексы для быстрого поиска
CREATE INDEX idx_course_progress_user ON t_p66738329_webapp_functionality.course_progress(user_id);
CREATE INDEX idx_course_progress_status ON t_p66738329_webapp_functionality.course_progress(status);
CREATE INDEX idx_trainer_progress_user ON t_p66738329_webapp_functionality.trainer_progress(user_id);
CREATE INDEX idx_trainer_progress_status ON t_p66738329_webapp_functionality.trainer_progress(status);
