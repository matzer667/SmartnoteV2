function ajouterChamp(code) {
    const container = document.getElementById('container-' + code);
    const div = document.createElement('div');
    div.className = 'note-entry';
    div.style.display = "flex"; // Aligne les inputs sur une ligne
    div.style.gap = "5px";
    div.style.marginBottom = "5px"; 
    
    div.innerHTML = `
        <input type="number" step="0.01" name="note-${code}" placeholder="Note" style="width: 60px;" required>
        <input type="number" step="0.1" name="coef-${code}" placeholder="Coef" style="width: 50px;" required>
        <button type="button" onclick="this.parentElement.remove()" style="color:red; border:none; background:none; cursor:pointer; font-weight:bold;">✕</button>
    `;
    
    container.appendChild(div);
}

function supprimerNoteReel(code, index) {
    if (!confirm("Supprimer cette note ?")) return;

    // Encodage strict pour l'URL
    const codeEncoded = encodeURIComponent(code);

    fetch(`/supprimer-note/${codeEncoded}/${index}`, {
        method: 'POST'
    })
    .then(response => {
        if (response.ok) {
            window.location.reload(); // On recharge pour recalculer la moyenne
        } else {
            alert("Erreur lors de la suppression. Code erreur: " + response.status);
        }
    })
    .catch(error => console.error("Erreur:", error));
}

/**
 * Ajoute dynamiquement des champs de saisie pour une nouvelle note
 */
function ajouterChamp(code) {
    const container = document.getElementById('container-' + code);
    const div = document.createElement('div');
    div.className = 'new-note-row';
    
    div.innerHTML = `
        <input type="number" step="0.01" name="note-${code}" placeholder="Note" required>
        <input type="number" step="0.1" name="coef-${code}" placeholder="Coef" required>
        <button type="button" class="btn-remove-row" onclick="this.parentElement.remove()">✕</button>
    `;
    container.appendChild(div);
}

/**
 * Supprime une note en base de données via une requête AJAX
 */
function supprimerNoteReel(code, index) {
    if (!confirm("Supprimer définitivement cette note ?")) return;

    const codeEncoded = encodeURIComponent(code);

    fetch(`/supprimer-note/${codeEncoded}/${index}`, {
        method: 'POST'
    })
    .then(response => {
        if (response.ok) {
            // Rechargement nécessaire pour recalculer les moyennes côté serveur
            window.location.reload(); 
        } else {
            alert("Erreur lors de la suppression (Code: " + response.status + ")");
        }
    })
    .catch(err => {
        console.error("Erreur réseau:", err);
        alert("Erreur de connexion au serveur.");
    });
}