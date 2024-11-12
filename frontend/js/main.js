let activeNoteId = null;
let notes = [];

async function loadNotes() {
    try {
        notes = await api.getNotes();
        renderNotes();
    } catch (error) {
        console.error('Failed to load notes:', error);
    }
}

function renderNotes() {
    const container = document.getElementById('notes-container');
    container.innerHTML = '';

    notes.forEach(note => {
        const noteElement = createNoteElement(note);
        container.appendChild(noteElement);
    });
}

function createNoteElement(note) {
    const div = document.createElement('div');
    div.className = 'note-card';
    div.style.backgroundColor = note.color || '#ffffff';
    div.innerHTML = `
        <h3>${note.title}</h3>
        <p>${note.content}</p>
        <div class="note-tools hidden">
            <button onclick="showColorPicker(event, ${note.id})">
                <span class="material-icons">palette</span>
            </button>
            <button onclick="archiveNote(${note.id})">
                <span class="material-icons">archive</span>
            </button>
            <button onclick="showHistory(${note.id})">
                <span class="material-icons">history</span>
            </button>
        </div>
    `;

    div.addEventListener('click', () => editNote(note));
    div.addEventListener('mouseenter', () => div.querySelector('.note-tools').classList.remove('hidden'));
    div.addEventListener('mouseleave', () => div.querySelector('.note-tools').classList.add('hidden'));

    return div;
}

function expandNoteInput() {
    const container = document.querySelector('.note-input-container');
    const titleInput = document.getElementById('title-input');
    const actions = document.querySelector('.note-actions');
    
    container.classList.add('expanded');
    titleInput.classList.remove('hidden');
    actions.classList.remove('hidden');
}

async function closeNoteInput() {
    const container = document.querySelector('.note-input-container');
    const titleInput = document.getElementById('title-input');
    const contentInput = document.getElementById('content-input');
    const actions = document.querySelector('.note-actions');

    const title = titleInput.value.trim();
    const content = contentInput.value.trim();

    if (title || content) {
        try {
            await api.createNote({
                title,
                content,
                color: '#ffffff',
            });
            await loadNotes();
        } catch (error) {
            console.error('Failed to create note:', error);
        }
    }

    titleInput.value = '';
    contentInput.value = '';
    container.classList.remove('expanded');
    titleInput.classList.add('hidden');
    actions.classList.add('hidden');
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    loadNotes();
}); 