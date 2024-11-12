const API_URL = 'http://localhost:8080';

const api = {
    async getNotes() {
        const response = await fetch(`${API_URL}/notes`);
        if (!response.ok) throw new Error('Failed to fetch notes');
        return response.json();
    },

    async createNote(note) {
        const response = await fetch(`${API_URL}/notes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(note),
        });
        if (!response.ok) throw new Error('Failed to create note');
        return response.json();
    },

    async updateNote(id, note, commitMsg = '') {
        const response = await fetch(`${API_URL}/notes/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Commit-Message': commitMsg,
            },
            body: JSON.stringify(note),
        });
        if (!response.ok) throw new Error('Failed to update note');
        return response.json();
    },

    async deleteNote(id) {
        const response = await fetch(`${API_URL}/notes/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete note');
    },

    async getNoteHistory(id) {
        const response = await fetch(`${API_URL}/notes/${id}/versions`);
        if (!response.ok) throw new Error('Failed to fetch note history');
        return response.json();
    },
}; 