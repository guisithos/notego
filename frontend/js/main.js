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
            <button onclick="saveNote(event, ${note.ID})">
                <span class="material-icons">save</span>
            </button>
            <button onclick="showHistory(event, ${note.ID})">
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
            if (activeNoteId) {
                // This is an edit of an existing note
                const existingNote = notes.find(n => n.ID === activeNoteId);
                if (existingNote) {
                    const updatedNote = {
                        ...existingNote,
                        Title: title,
                        Content: content
                    };
                    // Get the updated note from the server
                    const savedNote = await api.updateNote(activeNoteId, updatedNote, 'User edited note');
                    // Update the note in our local array - replace the old version with the new one
                    const index = notes.findIndex(n => n.BaseID === savedNote.BaseID);
                    if (index !== -1) {
                        notes[index] = savedNote;
                    } else {
                        notes.push(savedNote);
                    }
                }
            } else {
                // This is a new note
                const note = {
                    Title: title,
                    Content: content,
                    Color: '#ffffff',
                };
                const newNote = await api.createNote(note);
                notes.push(newNote);
            }
            
            // Update UI
            renderNotes();
        } catch (error) {
            console.error('Failed to save note:', error);
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
    activeNoteId = null;
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

async function saveNote(event, noteId) {
    event.stopPropagation(); // Prevent note edit when clicking save
    
    try {
        const note = notes.find(n => n.ID === noteId);
        if (!note) {
            throw new Error('Note not found');
        }

        // Get current values from the note card
        const noteElement = document.querySelector(`.note-card[data-note-id="${noteId}"]`);
        const titleElement = noteElement.querySelector('h3');
        const contentElement = noteElement.querySelector('p');

        const updatedNote = {
            ...note,
            Title: titleElement.textContent,
            Content: contentElement.textContent
        };

        // Update on server
        const savedNote = await api.updateNote(noteId, updatedNote, 'User saved note');
        
        // Update in local array
        const index = notes.findIndex(n => n.ID === noteId);
        if (index !== -1) {
            notes[index] = savedNote;
        }
        
        // Update UI without reloading all notes
        renderNotes();
    } catch (error) {
        console.error('Failed to save note:', error);
        alert('Failed to save note. Please try again.');
    }
}

async function showHistory(event, noteId) {
    event.stopPropagation(); // Prevent note edit when clicking history
    
    try {
        // Find the note element
        const noteElement = document.querySelector(`.note-card[data-note-id="${noteId}"]`);
        if (!noteElement) {
            console.error('Note element not found');
            return;
        }

        // Check if history is already shown (toggle functionality)
        const existingHistory = noteElement.querySelector('.note-history');
        if (existingHistory) {
            existingHistory.remove();
            return;
        }

        // Fetch note history
        const versions = await api.getNoteHistory(noteId);
        console.log('Fetched versions:', versions);

        // Create history container
        const historyContainer = document.createElement('div');
        historyContainer.className = 'note-history';
        
        // Show up to 5 versions initially
        const initialVersions = versions.slice(0, 5);
        initialVersions.forEach(version => {
            const versionElement = createVersionElement(version);
            historyContainer.appendChild(versionElement);
        });

        // Add "Show More" button if there are more versions
        if (versions.length > 5) {
            const showMoreBtn = document.createElement('button');
            showMoreBtn.className = 'show-more-btn';
            showMoreBtn.innerHTML = `
                <span class="material-icons">more_horiz</span>
                Show all ${versions.length} versions
            `;
            showMoreBtn.onclick = (e) => {
                e.stopPropagation();
                window.location.href = `/history.html?noteId=${noteId}`;
            };
            historyContainer.appendChild(showMoreBtn);
        }

        // Insert history container after the note tools
        const toolsContainer = noteElement.querySelector('.note-tools');
        toolsContainer.parentNode.insertBefore(historyContainer, toolsContainer.nextSibling);

    } catch (error) {
        console.error('Failed to load note history:', error);
        alert('Failed to load note history. Please try again.');
    }
}

function createVersionElement(version) {
    const versionDate = new Date(version.CreatedAt).toLocaleString();
    const element = document.createElement('div');
    element.className = 'version-item';
    
    element.innerHTML = `
        <div class="version-header">
            <span class="version-date">${versionDate}</span>
            <span class="version-action">${version.Action}</span>
        </div>
        <div class="version-message">${version.CommitMsg}</div>
    `;
    
    return element;
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