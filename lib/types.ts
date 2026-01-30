// C'est ici qu'on définit le "vocabulaire" de ton application

export type NoteData = {
  valeur: number;
  coef: number;
  isSimulated?: boolean;
};

export type NotesState = Record<string, NoteData[]>;

export type SimItem = {
    id: string; 
    coef: number;
    affinity: number; // 1 (Dur) à 100 (Facile)
};

export type SimConfig = Record<string, SimItem[]>;