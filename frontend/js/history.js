document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const noteId = params.get('noteId');

    if (!noteId) {
        alert('Note ID is required');
        window.location.href = '/';
        return;
    }

    try {
        const versions = await api.getNoteHistory(noteId);
        const versionList = document.getElementById('version-list');

        versions.forEach(version => {
            const versionCard = createDetailedVersionCard(version);
            versionList.appendChild(versionCard);
        });

    } catch (error) {
        console.error('Failed to load note history:', error);
        alert('Failed to load note history. Please try again.');
    }
});

function createDetailedVersionCard(version) {
    const versionDate = new Date(version.CreatedAt).toLocaleString();
    const card = document.createElement('div');
    card.className = 'version-card';
    
    card.innerHTML = `
        <div class="version-metadata">
            <div>
                <strong>Date:</strong> ${versionDate}
            </div>
            <div>
                <strong>Action:</strong> ${version.Action}
            </div>
            <div>
                <strong>Commit:</strong> ${version.CommitHash.substring(0, 8)}
            </div>
            ${version.ParentHash ? `
                <div>
                    <strong>Parent:</strong> ${version.ParentHash.substring(0, 8)}
                </div>
            ` : ''}
        </div>
        <div class="version-message">
            <strong>Message:</strong> ${version.CommitMsg}
        </div>
        <div class="version-content">
            <h3>${version.Title}</h3>
            <p>${version.Content}</p>
        </div>
    `;
    
    return card;
} 