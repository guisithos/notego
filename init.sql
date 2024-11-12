CREATE TABLE IF NOT EXISTS notes (
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

CREATE TABLE IF NOT EXISTS note_versions (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    note_id INTEGER REFERENCES notes(id),
    title VARCHAR(255),
    content TEXT,
    color VARCHAR(50),
    commit_hash VARCHAR(64),
    parent_hash VARCHAR(64),
    commit_msg TEXT
); 