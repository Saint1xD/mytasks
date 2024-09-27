CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    status TEXT NOT NULL,
    label TEXT,
    priority TEXT NOT NULL
);

INSERT INTO tasks (title, status, label, priority) VALUES
('Implementar autenticação', 'todo', 'feature', 'high'),
('Corrigir bug na página inicial', 'in progress', 'bug', 'medium'),
('Atualizar documentação', 'done', 'documentation', 'low'),
('Otimizar consultas do banco de dados', 'backlog', 'performance', 'medium'),
('Adicionar testes unitários', 'todo', 'testing', 'high');
