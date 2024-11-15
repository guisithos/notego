-- Drop existing tables if they exist
DROP TABLE IF EXISTS versions CASCADE;
DROP TABLE IF EXISTS notes CASCADE;

CREATE TABLE notes (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    title VARCHAR(255),
    content TEXT,
    color VARCHAR(50),
    archived BOOLEAN DEFAULT FALSE,
    pinned BOOLEAN DEFAULT FALSE
);

CREATE TABLE versions (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    note_id INTEGER REFERENCES notes(id) ON DELETE CASCADE ON UPDATE CASCADE,
    title VARCHAR(255),
    content TEXT,
    color VARCHAR(50),
    commit_msg TEXT,
    commit_hash VARCHAR(64),
    parent_hash VARCHAR(64),
    action VARCHAR(20)
);

CREATE INDEX idx_notes_deleted_at ON notes(deleted_at);
CREATE INDEX idx_versions_note_id ON versions(note_id);
CREATE INDEX idx_versions_commit_hash ON versions(commit_hash);

-- Insert sample notes
INSERT INTO notes (title, content, color, archived, pinned) VALUES
    ('Meeting Notes', 'Discuss project timeline and deliverables for Q1 2024', '#f28b82', false, true),
    ('Shopping List', 'Milk\nEggs\nBread\nFruits\nVegetables', '#fbbc04', false, false),
    ('Book Recommendations', '1. The Pragmatic Programmer\n2. Clean Code\n3. Design Patterns\n4. Refactoring', '#ccff90', false, false),
    ('Ideas for Project', 'Add version control\nImplement search functionality\nAdd tags support\nImprove UI/UX', '#a7ffeb', false, true),
    ('Quotes', 'Code is like humor. When you have to explain it, it''s bad. – Cory House', '#cbf0f8', false, false),
    ('Tasks', 'Fix bug in login page\nUpdate documentation\nDeploy to production', '#aecbfa', false, false);