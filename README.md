# NoteGo

NoteGo is an open-source note-taking application inspired by Google Keep, with the added feature of git-like version control for your notes. 

## Features

- Create, read, update, and delete notes
- Version history 
- Color coding for notes
- Archive functionality
- Git-like version control system

## Technical Stack

- Backend: Go
- Database: PostgreSQL

## Prerequisites

- Go 1.16 or higher
- PostgreSQL 12 or higher
  

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/guisithos/notego.git
   ```

2. Set up the database:
   ```bash
   createdb notego-db
   ```

3. Update the database connection string in `main.go` if needed.

4. Run the application:
   ```bash
   go run main.go
   ```

## API Endpoints

- `POST /notes` - Create a new note
- `GET /notes` - Get all notes
- `GET /notes/{id}` - Get a specific note
- `PUT /notes/{id}` - Update a note
- `DELETE /notes/{id}` - Delete a note

## Version Control System

NoteGo implements a Git-like version control system for notes:
- Each note modification creates a new version
- Versions are linked through parent-child relationships
- Each version has a unique commit hash
- Versions store the complete state of the note at that point in time

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
