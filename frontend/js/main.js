let activeNoteId = null;
let notes = [];
let activeColorPickerNoteId = null;

async function loadNotes() {
    try {
        console.log('Fetching notes from server...');
        const data = await api.getNotes();
        console.log('API response data:', data);
        notes = Array.isArray(data) ? data : [];
        console.log('Notes array after assignment:', notes);
        renderNotes();
    } catch (error) {
        console.error('Failed to load notes:', error);
    }
}

function editNote(note) {
    activeNoteId = note.ID;
    const titleInput = document.getElementById('title-input');
    const contentInput = document.getElementById('content-input');
    
    titleInput.value = note.Title || '';
    contentInput.value = note.Content || '';
    
    expandNoteInput();
}

function renderNotes() {
    const container = document.getElementById('notes-container');
    if (!container) {
        console.error('Notes container not found!');
        return;
    }

    // Clear existing notes
    container.innerHTML = '';
    
    console.log('Rendering notes:', notes);
    
    if (!Array.isArray(notes)) {
        console.error('Notes is not an array:', notes);
        return;
    }

    if (notes.length === 0) {
        console.log('No notes to display');
        container.innerHTML = '<p>No notes found</p>';
        return;
    }

    notes.forEach((note, index) => {
        try {
            console.log(`Creating element for note ${index}:`, note);
            const noteElement = createNoteElement(note);
            console.log(`Created element dimensions:`, {
                width: noteElement.offsetWidth,
                height: noteElement.offsetHeight
            });
            container.appendChild(noteElement);
            console.log(`Note ${index} appended to container`);
        } catch (error) {
            console.error(`Error rendering note ${index}:`, note, error);
        }
    });

    // Log container contents after rendering
    console.log('Container after rendering:', {
        childCount: container.children.length,
        innerHTML: container.innerHTML.substring(0, 100) + '...',
        dimensions: {
            width: container.offsetWidth,
            height: container.offsetHeight
        }
    });
}

function createNoteElement(note) {
    console.log('Creating note element for:', note);
    const div = document.createElement('div');
    div.className = 'note-card';
    div.setAttribute('data-note-id', note.ID);
    div.style.backgroundColor = note.Color || '#ffffff';
    
    div.style.display = 'block';
    
    // Use the actual note title and content
    const title = note.Title || 'Untitled';  // Note the capital 'T' in Title
    const content = note.Content || 'No content';  // Note the capital 'C' in Content
    console.log(`Creating note with title: ${title} and content: ${content}`);
    
    div.innerHTML = `
        <h3 style="margin-bottom: 8px;">${title}</h3>
        <p style="margin-bottom: 16px;">${content}</p>
        <div class="note-tools">
            <button title="Change color" onclick="showColorPicker(event, ${note.ID})">
                <span class="material-icons">palette</span>
            </button>
            <button onclick="saveNote(${note.ID})">
                <span class="material-icons">save</span>
            </button>
            <button onclick="showHistory(${note.ID})">
                <span class="material-icons">history</span>
            </button>
            <button title="Delete note" onclick="deleteNote(event, ${note.ID})">
                <span class="material-icons">delete</span>
            </button>
        </div>
    `;

    // Add click event listener to the div
    div.addEventListener('click', () => editNote(note));

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
            const note = {
                Title: title || '',  // Note the capital 'T'
                Content: content || '',  // Note the capital 'C'
                Color: '#ffffff',  // Note the capital 'C'
            };
            console.log('Sending note to server:', note);
            const createdNote = await api.createNote(note);
            console.log('Server response for created note:', createdNote);
            
            // Immediately reload notes after creation
            console.log('Reloading notes after creation...');
            await loadNotes();
            console.log('Notes reloaded');
        } catch (error) {
            console.error('Failed to create note:', error);
            alert('Failed to save note. Please try again.');
            return; // Don't clear inputs if save failed
        }
    }

    // Clear and reset the input form
    titleInput.value = '';
    contentInput.value = '';
    container.classList.remove('expanded');
    titleInput.classList.add('hidden');
    actions.classList.add('hidden');
}

function showColorPicker(event, noteId) {
    event.stopPropagation();
    console.log('showColorPicker called for note:', noteId);
    
    const colorPicker = document.querySelector('.color-picker');
    if (!colorPicker) {
        console.error('Color picker element not found');
        return;
    }
    
    const button = event.currentTarget;
    const buttonRect = button.getBoundingClientRect();
    console.log('Button position:', buttonRect);
    
    // If color picker is already shown for this note, hide it
    if (activeColorPickerNoteId === noteId && !colorPicker.classList.contains('hidden')) {
        console.log('Hiding color picker for note:', noteId);
        colorPicker.classList.add('hidden');
        activeColorPickerNoteId = null;
        return;
    }
    
    // Position the color picker below the palette button
    const top = buttonRect.bottom + window.scrollY + 5;
    const left = buttonRect.left;
    console.log('Positioning color picker at:', { top, left });
    
    colorPicker.style.top = `${top}px`;
    colorPicker.style.left = `${left}px`;
    
    // Show the color picker and set active note
    colorPicker.classList.remove('hidden');
    activeColorPickerNoteId = noteId;
    console.log('Showing color picker for note:', noteId);
    
    // Remove any existing event listeners
    const colorOptions = colorPicker.querySelectorAll('.color-option');
    colorOptions.forEach(option => {
        option.replaceWith(option.cloneNode(true));
    });
    
    // Add new event listeners
    colorPicker.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', async (e) => {
            e.stopPropagation();
            const color = option.dataset.color;
            console.log('Color option clicked:', color);
            
            try {
                // Find the note in our notes array
                const note = notes.find(n => n.ID === noteId);
                if (!note) throw new Error('Note not found');
                
                // Update the note's color
                const updatedNote = {
                    ...note,
                    Color: color
                };
                
                // Save to backend
                await api.updateNote(noteId, updatedNote, `Changed color to ${color}`);
                
                // Update UI
                const noteElement = document.querySelector(`.note-card[data-note-id="${noteId}"]`);
                if (noteElement) {
                    noteElement.style.backgroundColor = color;
                }
                
                // Hide color picker
                colorPicker.classList.add('hidden');
                activeColorPickerNoteId = null;
                
                // Reload notes to ensure consistency
                await loadNotes();
            } catch (error) {
                console.error('Failed to update note color:', error);
                alert('Failed to update note color. Please try again.');
            }
        });
    });
}

function saveNote(noteId) {
    event.stopPropagation(); // Prevent note edit when clicking save
    // TODO: Implement save functionality
    console.log('Save note:', noteId);
}

function showHistory(noteId) {
    event.stopPropagation(); // Prevent note edit when clicking history
    // TODO: Implement history functionality
    console.log('Show history for note:', noteId);
}

// Add click event listener to close color picker when clicking outside
document.addEventListener('click', (event) => {
    const colorPicker = document.querySelector('.color-picker');
    const isClickInsideColorPicker = event.target.closest('.color-picker');
    const isClickOnPaletteButton = event.target.closest('button[title="Change color"]');
    
    if (!isClickInsideColorPicker && !isClickOnPaletteButton && !colorPicker.classList.contains('hidden')) {
        colorPicker.classList.add('hidden');
        activeColorPickerNoteId = null;
    }
});

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, calling loadNotes()');
    loadNotes();
});

async function deleteNote(event, noteId) {
    event.stopPropagation(); // Prevent note edit when clicking delete
    
    const confirmDelete = confirm('Are you sure you want to delete this note? It will be archived and can be restored later.');
    if (!confirmDelete) return;
    
    try {
        await api.deleteNote(noteId, 'User deleted note');
        // Remove note from local array
        notes = notes.filter(note => note.ID !== noteId);
        // Update UI
        renderNotes();
    } catch (error) {
        console.error('Failed to delete note:', error);
        alert('Failed to delete note. Please try again.');
    }
} 