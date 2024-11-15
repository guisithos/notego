const API_URL = 'http://localhost:8080';

const api = {
    async getNotes() {
        const response = await fetch(`${API_URL}/notes/latest`, {
            method: 'GET',
            mode: 'cors',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) throw new Error('Failed to fetch notes');
        return response.json();
    },

    async createNote(note) {
        try {
            const response = await fetch(`${API_URL}/notes`, {
                method: 'POST',
                mode: 'cors',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(note),
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to create note: ${errorText}`);
            }
            
            return response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    async updateNote(id, note, commitMsg = '') {
        const response = await fetch(`${API_URL}/notes/${id}`, {
            method: 'PUT',
            mode: 'cors',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'X-Commit-Message': commitMsg,
            },
            body: JSON.stringify(note),
        });
        if (!response.ok) throw new Error('Failed to update note');
        return response.json();
    },

    async deleteNote(id, commitMsg = '') {
        const response = await fetch(`${API_URL}/notes/${id}`, {
            method: 'DELETE',
            mode: 'cors',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'X-Commit-Message': commitMsg,
            }
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to delete note: ${errorText}`);
        }
        
        // Return true for successful deletion
        return true;
    },

    async getNoteHistory(id) {
        const response = await fetch(`${API_URL}/notes/${id}/versions`, {
            method: 'GET',
            mode: 'cors',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) throw new Error('Failed to fetch note history');
        return response.json();
    },
}; 