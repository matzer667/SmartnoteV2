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
    notes_enregistrees = notes_source if isinstance(notes_source, dict) else {}
    if isinstance(notes_source, str) and os.path.exists(notes_source):
        with open(notes_source, 'r', encoding='utf-8') as f:
            notes_enregistrees = json.load(f)

    moy_poles = {}
    moy_matieres = {}
    
    poles = data.get(annee_sel, {}).get(sem_sel, [])

    for pole in poles:
        nom_pole = pole.get('nom') or pole.get('pole') 
        total_points_pole = 0
        total_coefs_pole = 0
        
        for matiere in pole.get('matieres', []):
            code = matiere.get('code')
            p_mat = 0
            c_mat = 0
            
            if code in notes_enregistrees:
                for n in notes_enregistrees[code]:
                    p_mat += float(n['note']) * float(n['coef'])
                    c_mat += float(n['coef'])
                
                if c_mat > 0:
                    moy_m = round(p_mat / c_mat, 2)
                    moy_matieres[code] = moy_m
                    total_points_pole += p_mat
                    total_coefs_pole += c_mat
                else:
                    moy_matieres[code] = "N/A"
            else:
                moy_matieres[code] = "N/A"
        
        if total_coefs_pole > 0:
            moy_poles[nom_pole] = round(total_points_pole / total_coefs_pole, 2)
        else:
            moy_poles[nom_pole] = "N/A"
            
    return {"poles": moy_poles, "matieres": moy_matieres}