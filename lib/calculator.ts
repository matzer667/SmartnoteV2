import data from "@/data/matieres.json";

// On définit une interface pour typer tes données JSON
interface MatiereJson {
  code: string;
  nom: string;
  coeff_ue: number;
}

interface PoleJson {
  pole: string;
  coeff_ects?: number; // C'est le champ que tu as ajouté !
  matieres: MatiereJson[];
}

export function calculerSaaS(annee: string, semestre: string, filiere: string, notesUser: any) {
  // 1. Récupération des données du JSON
  const polesData = (data as any)[annee]?.[semestre]?.[filiere] as PoleJson[];

  if (!polesData) {
    return { moyenneGenerale: "0.00", details: [] };
  }

  let totalPointsGeneraux = 0;
  let totalCoefsGeneraux = 0;

  // On prépare le tableau de détails pour l'affichage
  const details = polesData.map((pole) => {
    let totalPointsPole = 0;
    let totalCoefsPole = 0;

    // Calcul de la moyenne DU PÔLE
    const matieresDetails = pole.matieres.map((matiere) => {
      // On récupère les notes de l'utilisateur pour cette matière
      const userNotes = notesUser[matiere.code] || [];
      
      let totalPointsMatiere = 0;
      let totalCoefsMatiere = 0;

      userNotes.forEach((n: any) => {
        // Sécurité : on s'assure que c'est bien un nombre
        const val = typeof n.valeur === 'string' ? parseFloat(n.valeur.replace(',', '.')) : n.valeur;
        const coef = n.coef;
        
        if (!isNaN(val)) {
            totalPointsMatiere += val * coef;
            totalCoefsMatiere += coef;
        }
      });

      // Moyenne de la matière
      let moyenneMatiere = "N/A";
      let moyenneMatiereNum = 0;

      if (totalCoefsMatiere > 0) {
        moyenneMatiereNum = totalPointsMatiere / totalCoefsMatiere;
        moyenneMatiere = moyenneMatiereNum.toFixed(2);
        
        // Ajout au total du Pôle (Moyenne Matière * Coef UE du JSON)
        totalPointsPole += moyenneMatiereNum * matiere.coeff_ue;
        totalCoefsPole += matiere.coeff_ue;
      }

      return {
        nom: matiere.nom,
        code: matiere.code,
        moyenne: moyenneMatiere,
        coeff: matiere.coeff_ue
      };
    });

    // Calcul de la moyenne finale du PÔLE
    let moyennePoleNum = 0;
    if (totalCoefsPole > 0) {
      moyennePoleNum = totalPointsPole / totalCoefsPole;
    }

    // --- C'EST ICI QUE CA CHANGE POUR LA MOYENNE GÉNÉRALE ---
    
    // On récupère ton nouveau coeff_ects (ou 1 par défaut si tu as oublié de le mettre)
    const poidDuPole = pole.coeff_ects || 1; 

    // On ajoute au "Grand Total" pour la moyenne générale
    // Si le pôle a une moyenne (donc des notes), on l'inclut
    if (totalCoefsPole > 0) {
        totalPointsGeneraux += moyennePoleNum * poidDuPole;
        totalCoefsGeneraux += poidDuPole;
    }

    return {
      pole: pole.pole,
      moyennePole: moyennePoleNum.toFixed(2),
      matieres: matieresDetails,
      coeff_ects: poidDuPole // On le renvoie si jamais tu veux l'afficher
    };
  });

  // Calcul final de la MOYENNE GÉNÉRALE PONDÉRÉE
  const moyenneGenerale = totalCoefsGeneraux > 0 
    ? (totalPointsGeneraux / totalCoefsGeneraux).toFixed(2) 
    : "0.00";

  return {
    moyenneGenerale,
    details
  };
}