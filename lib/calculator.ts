import data from "@/data/matieres.json";

// Structure des notes envoyées par le front-end
export type UserGradesInput = { 
  [codeMatiere: string]: { valeur: number; coef: number }[] 
};

/**
 * Calcule la moyenne complète au prorata des notes saisies.
 */
export function calculerSaaS(
  annee: string,
  semestre: string,
  filiere: string,
  notesInput: UserGradesInput
) {
  // Récupération des données du JSON selon le parcours choisi
  const polesData = (data as any)[annee]?.[semestre]?.[filiere];
  
  if (!polesData) return null;

  let sommeMoyennesPoles = 0;
  let polesComptabilises = 0;

  // 1. On parcourt chaque Pôle (ex: Sciences fondamentales)
  const rapportDetaille = polesData.map((pole: any) => {
    let pointsPole = 0;
    let totalCoefsUEActive = 0;

    // 2. On parcourt chaque Matière du pôle (ex: Algèbre)
    const detailMatieres = pole.matieres.map((matiere: any) => {
      const evaluations = notesInput[matiere.code] || [];
      
      let pointsMatiere = 0;
      let coefsMatiere = 0;
      
      // Calcul de la moyenne de la MATIÈRE (DS, TP, etc.)
      evaluations.forEach(ev => {
        // On vérifie que la note est un nombre valide
        if (!isNaN(ev.valeur) && ev.valeur !== null) {
          pointsMatiere += ev.valeur * (ev.coef || 1);
          coefsMatiere += (ev.coef || 1);
        }
      });

      const aDesNotes = coefsMatiere > 0;
      const moyenneMatiere = aDesNotes ? pointsMatiere / coefsMatiere : null;

      // 3. Préparation du calcul du PÔLE (Matière * Coeff UE)
      if (aDesNotes && moyenneMatiere !== null) {
        pointsPole += moyenneMatiere * matiere.coeff_ue;
        totalCoefsUEActive += matiere.coeff_ue;
      }

      return { 
        nom: matiere.nom, 
        moyenne: aDesNotes ? moyenneMatiere?.toFixed(2) : "N/A" 
      };
    });

    // Calcul de la moyenne du PÔLE
    const aDesNotesDansLePole = totalCoefsUEActive > 0;
    const moyennePole = aDesNotesDansLePole ? pointsPole / totalCoefsUEActive : null;
    
    // On n'ajoute au calcul général que si le pôle a commencé à être noté
    if (aDesNotesDansLePole && moyennePole !== null) {
      sommeMoyennesPoles += moyennePole;
      polesComptabilises++;
    }

    return {
      nomPole: pole.pole,
      moyennePole: aDesNotesDansLePole ? moyennePole?.toFixed(2) : "N/A",
      matieres: detailMatieres
    };
  });

  // 4. Moyenne GÉNÉRALE (Moyenne simple des moyennes de pôles)
  const moyenneGenerale = polesComptabilises > 0 
    ? (sommeMoyennesPoles / polesComptabilises).toFixed(2) 
    : "0.00";

  return {
    moyenneGenerale,
    details: rapportDetaille
  };
}