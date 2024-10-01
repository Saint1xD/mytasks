CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    status TEXT NOT NULL,
    label TEXT,
    priority TEXT
);

INSERT INTO tasks (title, status, label, priority) VALUES
('Implement authentication', 'todo', 'feature', 'high'),
('Fix bug on home page', 'in progress', 'bug', 'medium'),
('Update documentation', 'done', 'documentation', 'low'),
('Optimize database queries', 'backlog', 'performance', 'medium'),
('Add unit tests', 'todo', 'testing', 'high');
