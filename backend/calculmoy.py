import json
import os

def calculer_moyennes_semestre(path_data, notes_source, annee_sel, sem_sel):
    # 1. Chargement de la structure data.json
    if isinstance(path_data, str):
        with open(path_data, 'r', encoding='utf-8') as f:
            data = json.load(f)
    else:
        data = path_data

    # 2. Gestion de la source des notes
    if isinstance(notes_source, str):
        if os.path.exists(notes_source):
            with open(notes_source, 'r', encoding='utf-8') as f:
                notes_enregistrees = json.load(f)
        else:
            notes_enregistrees = {}
    else:
        notes_enregistrees = notes_source

    moyennes_recap = {}
    poles = data.get(annee_sel, {}).get(sem_sel, [])

    for pole in poles:
        # On utilise 'nom' (doit correspondre à la clé dans data.json)
        nom_pole = pole.get('nom') or pole.get('pole') 
        total_points = 0
        total_coefs = 0
        
        for matiere in pole.get('matieres', []):
            code = matiere.get('code')
            if code in notes_enregistrees:
                for n in notes_enregistrees[code]:
                    # Conversion forcée en float pour éviter les erreurs de type
                    total_points += float(n['note']) * float(n['coef'])
                    total_coefs += float(n['coef'])
        
        if total_coefs > 0:
            moyennes_recap[nom_pole] = round(total_points / total_coefs, 2)
        else:
            moyennes_recap[nom_pole] = "N/A" # Plus simple pour le HTML
            
    return moyennes_recap