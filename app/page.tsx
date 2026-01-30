"use client";

import { useState, useMemo, useEffect } from 'react';
import data from "@/data/matieres.json";
import { calculerSaaS } from "@/lib/calculator";
// CORRECTION : J'ai ajouté 'Plus' dans les imports ci-dessous
import { Plus, Trash2, GraduationCap, LayoutDashboard, ArrowUp, AlertTriangle, ShieldCheck, Info, Wand2, X, Calculator, PlusCircle, MinusCircle } from "lucide-react";

// --- TYPES LOCAUX ---
// On définit le type ici pour être sûr qu'il inclut 'isSimulated'
type NoteData = {
  valeur: number;
  coef: number;
  isSimulated?: boolean;
};

type NotesState = Record<string, NoteData[]>;

// Configuration de simulation
type SimItem = {
    id: string; 
    coef: number;
    affinity: number; // 1 (Dur) à 100 (Facile)
};
type SimConfig = Record<string, SimItem[]>;

export default function SmartNotePage() {
  const stylesAnimation = `
    @keyframes slideInRightShort {
      0% { opacity: 0; transform: translateX(50px); filter: blur(10px); }
      100% { opacity: 1; transform: translateX(0); filter: blur(0); }
    }
    .animate-slide-right {
      animation: slideInRightShort 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    .animate-pop-in {
      animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
    }
    @keyframes popIn {
      0% { opacity: 0; transform: scale(0.9); }
      100% { opacity: 1; transform: scale(1); }
    }
    .range-slider {
      -webkit-appearance: none;
      width: 100%;
      height: 6px;
      border-radius: 5px;
      background: linear-gradient(90deg, #ef4444 0%, #facc15 50%, #22c55e 100%);
      outline: none;
      cursor: pointer;
    }
    .range-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #fff;
      border: 2px solid #0f172a;
      box-shadow: 0 0 10px rgba(0,0,0,0.5);
      cursor: grab;
      transition: transform 0.1s;
    }
    .range-slider::-webkit-slider-thumb:active {
      transform: scale(1.3);
      cursor: grabbing;
    }
  `;

  // --- HELPER ---
  const getFilieres = (a: string, s: string) => {
    try {
      const sData = (data as any)[a]?.[s];
      if (!sData || typeof sData !== 'object' || Array.isArray(sData)) return [];
      return Object.keys(sData);
    } catch { return []; }
  };

  // --- ÉTATS ---
  const [annee, setAnnee] = useState(() => Object.keys(data)[0]);
  const [semestre, setSemestre] = useState("Semestre 1");
  const [filiere, setFiliere] = useState(() => getFilieres(Object.keys(data)[0], "Semestre 1")[0] || "");
  const [notesInput, setNotesInput] = useState<NotesState>({});
  const [isScrolled, setIsScrolled] = useState(false);
  const [showStatusDetails, setShowStatusDetails] = useState(false);

  // --- ÉTATS SIMULATION ---
  const [simModalOpen, setSimModalOpen] = useState(false);
  const [simTargetPoleIndex, setSimTargetPoleIndex] = useState<number | null>(null);
  const [simConfig, setSimConfig] = useState<SimConfig>({});

  // --- NAVIGATION ---
  const handleChangeAnnee = (newAnnee: string) => {
    if (newAnnee === annee) return;
    setAnnee(newAnnee);
    setSemestre("Semestre 1");
    const dispo = getFilieres(newAnnee, "Semestre 1");
    setFiliere(dispo[0] || "");
  };

  const handleChangeSemestre = (newSemestre: string) => {
    if (newSemestre === semestre) return;
    setSemestre(newSemestre);
    const dispo = getFilieres(annee, newSemestre);
    if (!dispo.includes(filiere)) setFiliere(dispo[0] || "");
  };

  const filieresDisponibles = useMemo(() => getFilieres(annee, semestre), [annee, semestre]);

  // --- PERSISTANCE ---
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('smartnote-data');
      if (saved) { try { setNotesInput(JSON.parse(saved)); } catch (e) { console.error(e); } }
    }
  }, []);

  useEffect(() => {
    if (Object.keys(notesInput).length > 0) {
      localStorage.setItem('smartnote-data', JSON.stringify(notesInput));
    }
  }, [notesInput]);

  // --- SCROLL ---
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 80);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // --- CALCULS ---
  const resultats = useMemo(() => {
    if (!annee || !semestre || !filiere) return null;
    try { 
        // Cast 'as any' pour éviter le conflit de type avec la lib externe
        return calculerSaaS(annee, semestre, filiere, notesInput as any); 
    } catch { return null; }
  }, [annee, semestre, filiere, notesInput]);

  const poles = useMemo(() => {
    try {
      const raw = (data as any)[annee]?.[semestre]?.[filiere];
      return Array.isArray(raw) ? raw : [];
    } catch { return []; }
  }, [annee, semestre, filiere]);

  // --- STATUT ---
  const statutInfo = useMemo(() => {
    if (!resultats) return { text: "EN ATTENTE", css: "bg-slate-800 border-slate-700 text-slate-500", reasons: [] };
    const moyGen = parseFloat(resultats.moyenneGenerale);
    const reasons: string[] = [];
    
    if (moyGen < 10) reasons.push(`Moyenne Générale < 10 (${resultats.moyenneGenerale}/20)`);

    let polesFailed = false;
    let matiereFailed = false;

    resultats.details.forEach((poleResult: any, index: number) => {
        const nomPole = poles[index]?.pole || "Pôle Inconnu";
        if (parseFloat(poleResult.moyennePole) < 10) {
            reasons.push(`Pôle "${nomPole}" non validé (<10)`);
            polesFailed = true;
        }
        poleResult.matieres.forEach((mat: any) => {
            if (mat.moyenne !== "N/A" && parseFloat(mat.moyenne) < 5) {
                reasons.push(`Note éliminatoire en ${mat.nom} (<5)`);
                matiereFailed = true;
            }
        });
    });

    if (moyGen < 10) return { text: "NON VALIDÉ", key: "nonvalide", css: "bg-red-500/10 border-red-500 text-red-400", reasons };
    else if (polesFailed || matiereFailed) return { text: "RATTRAPAGES", key: "rattrapages", css: "bg-orange-500/10 border-orange-500 text-orange-400", reasons };
    else return { text: "ADMIS", key: "admis", css: "bg-blue-500/10 border-blue-500 text-blue-400", reasons: ["Semestre validé avec succès !"] };
  }, [resultats, poles]);

  // --- GESTION MODAL & SIMULATION ---

  const openSimulationModal = (pIdx: number) => {
    setSimTargetPoleIndex(pIdx);
    setSimConfig({});
    setSimModalOpen(true);
  };

  const addSimSlot = (codeMatiere: string) => {
    setSimConfig(prev => {
        const currentSlots = prev[codeMatiere] || [];
        return { ...prev, [codeMatiere]: [...currentSlots, { id: Math.random().toString(36), coef: 1, affinity: 50 }] };
    });
  };

  const removeSimSlot = (codeMatiere: string, index: number) => {
    setSimConfig(prev => {
        const currentSlots = [...(prev[codeMatiere] || [])];
        currentSlots.splice(index, 1);
        return { ...prev, [codeMatiere]: currentSlots };
    });
  };

  const updateSimItem = (codeMatiere: string, index: number, field: 'coef' | 'affinity', value: number) => {
    setSimConfig(prev => {
        const currentSlots = [...(prev[codeMatiere] || [])];
        currentSlots[index] = { ...currentSlots[index], [field]: value };
        return { ...prev, [codeMatiere]: currentSlots };
    });
  };

  // --- CŒUR DE LA STRATÉGIE (CALCUL TEMPS RÉEL) ---
  const simPreview = useMemo(() => {
    if (simTargetPoleIndex === null || !poles[simTargetPoleIndex]) return {};

    const matieresDuPole = poles[simTargetPoleIndex].matieres;
    let totalPointsAcquis = 0;
    let totalCoefAcquis = 0;
    
    matieresDuPole.forEach((m: any) => {
        const existingNotes = notesInput[m.code] || [];
        existingNotes.forEach(n => {
            if (!n.isSimulated) {
                totalPointsAcquis += n.valeur * n.coef;
                totalCoefAcquis += n.coef;
            }
        });
    });

    let totalWeightedAffinity = 0;
    let totalCoefSimulable = 0;

    matieresDuPole.forEach((m: any) => {
        const sims = simConfig[m.code] || [];
        sims.forEach(sim => {
            totalCoefSimulable += sim.coef;
            const safeAffinity = Math.max(1, sim.affinity);
            totalWeightedAffinity += safeAffinity * sim.coef;
        });
    });

    const totalCoefGlobal = totalCoefAcquis + totalCoefSimulable;
    if (totalCoefGlobal === 0) return {};

    const pointsCibles = 10 * totalCoefGlobal;
    const pointsManquants = pointsCibles - totalPointsAcquis;

    if (totalCoefSimulable === 0) return {};

    if (pointsManquants <= 0) {
        const result: Record<string, number> = {};
        matieresDuPole.forEach((m: any) => {
            (simConfig[m.code] || []).forEach(sim => result[sim.id] = 0);
        });
        return result;
    }

    const K = pointsManquants / totalWeightedAffinity;
    const previews: Record<string, number> = {};

    matieresDuPole.forEach((m: any) => {
        const sims = simConfig[m.code] || [];
        sims.forEach(sim => {
            const safeAffinity = Math.max(1, sim.affinity);
            let targetNote = K * safeAffinity;
            targetNote = Math.ceil(targetNote * 4) / 4;
            previews[sim.id] = targetNote;
        });
    });

    return previews;
  }, [simConfig, simTargetPoleIndex, poles, notesInput]); 


  // APPLIQUER LA SIMULATION
  const applySimulation = () => {
    if (simTargetPoleIndex === null || !poles[simTargetPoleIndex]) return;
    const matieresDuPole = poles[simTargetPoleIndex].matieres;
    
    let currentNotes: NotesState = JSON.parse(JSON.stringify(notesInput));

    matieresDuPole.forEach((m: any) => {
        const sims = simConfig[m.code] || [];
        
        if (currentNotes[m.code]) {
            currentNotes[m.code] = currentNotes[m.code].filter(n => !n.isSimulated);
        } else {
            currentNotes[m.code] = [];
        }

        sims.forEach(sim => {
            const noteValue = simPreview[sim.id] !== undefined ? simPreview[sim.id] : 0;
            currentNotes[m.code].push({
                valeur: noteValue,
                coef: sim.coef,
                isSimulated: true
            });
        });
    });

    setNotesInput(currentNotes);
    setSimModalOpen(false);
  };


  // --- GESTION INPUT NOTES ---
  const handleInputChange = (code: string, index: number, field: 'valeur' | 'coef', rawValue: string) => {
    let cleanValue = rawValue.replace(',', '.');
    if (cleanValue === '' || /^\d*\.?\d*$/.test(cleanValue)) {
        setNotesInput(prev => {
            const copy = { ...prev };
            if (!copy[code]) copy[code] = [];
            else copy[code] = [...copy[code]];

            const numValue = cleanValue === '' ? 0 : parseFloat(cleanValue);
            if (copy[code][index]) {
                copy[code][index] = { ...copy[code][index], [field]: isNaN(numValue) ? 0 : numValue, isSimulated: false };
            }
            return copy;
        });
    }
  };

  const addNote = (code: string) => {
    setNotesInput(prev => {
      const curr = prev[code] || [];
      return { ...prev, [code]: [...curr, { valeur: 0, coef: 1, isSimulated: false }] };
    });
  };

  const removeNote = (code: string, index: number) => {
    setNotesInput(prev => {
      const nextArr = [...(prev[code] || [])];
      nextArr.splice(index, 1);
      return { ...prev, [code]: nextArr };
    });
  };

  const moyenneGeneraleStr = resultats?.moyenneGenerale || "0.00";
  const moyenneGeneraleNum = parseFloat(moyenneGeneraleStr);

  return (
    <div className="flex flex-col min-h-screen text-slate-200 pb-20 bg-[#020617]">
      <style>{stylesAnimation}</style>

      {/* MODAL SIMULATION AVANCÉE */}
      {simModalOpen && simTargetPoleIndex !== null && poles[simTargetPoleIndex] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm animate-pop-in">
            <div className="bg-[#0f172a] border border-slate-700 w-full max-w-md rounded-3xl shadow-2xl relative flex flex-col max-h-[85vh]">
                
                {/* Header Modal */}
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-[#0f172a] rounded-t-3xl z-10">
                    <div className="flex items-center gap-3">
                        <div className="bg-cyan-500/10 p-2 rounded-xl text-cyan-400">
                            <Wand2 size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black uppercase text-slate-200 leading-none">Stratégie</h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-widest">{poles[simTargetPoleIndex].pole}</p>
                        </div>
                    </div>
                    <button onClick={() => setSimModalOpen(false)} className="text-slate-500 hover:text-white p-2 bg-slate-800/50 rounded-full"><X size={18}/></button>
                </div>

                {/* Body Scrollable */}
                <div className="p-4 overflow-y-auto space-y-6">
                    <div className="text-xs text-slate-400 bg-slate-900/50 p-3 rounded-xl border border-slate-800 text-center">
                        Ajoutez vos examens et ajustez la difficulté (Curseur). Les notes cibles s'adaptent <span className="text-[#facc15] font-bold">instantanément</span>.
                    </div>

                    <div className="space-y-6">
                        {poles[simTargetPoleIndex].matieres.map((mat: any) => (
                            <div key={mat.code} className="bg-[#020617] border border-slate-800 rounded-xl p-4">
                                <div className="flex justify-between items-center mb-3 border-b border-slate-800 pb-2">
                                    <span className="text-xs font-black uppercase text-slate-300">{mat.nom}</span>
                                    <button 
                                        onClick={() => addSimSlot(mat.code)}
                                        className="text-[9px] font-bold uppercase bg-cyan-900/20 text-cyan-400 px-2 py-1 rounded-lg border border-cyan-900/50 hover:bg-cyan-900/40 flex items-center gap-1"
                                    >
                                        <PlusCircle size={12} /> Ajouter
                                    </button>
                                </div>

                                {/* Liste des slots de simulation pour cette matière */}
                                <div className="space-y-3">
                                    {(simConfig[mat.code] || []).length === 0 && (
                                        <p className="text-[10px] text-slate-600 italic text-center py-2">Aucun examen simulé.</p>
                                    )}
                                    {(simConfig[mat.code] || []).map((slot, idx) => (
                                        <div key={slot.id} className="animate-slide-right bg-slate-900/40 p-2 rounded-lg border border-slate-800 relative">
                                            
                                            {/* Ligne du haut : Coef + Delete */}
                                            <div className="flex justify-between items-center mb-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] font-bold text-slate-500 uppercase">Coef</span>
                                                    <input 
                                                        type="text" 
                                                        inputMode="decimal"
                                                        value={slot.coef}
                                                        onChange={(e) => updateSimItem(mat.code, idx, 'coef', parseFloat(e.target.value) || 0)}
                                                        className="w-10 bg-slate-800 text-center text-xs font-bold text-[#facc15] rounded py-0.5 outline-none border border-slate-700"
                                                    />
                                                </div>
                                                <button onClick={() => removeSimSlot(mat.code, idx)} className="text-slate-600 hover:text-red-500 absolute top-2 right-2">
                                                    <X size={14} />
                                                </button>
                                            </div>

                                            {/* Slider Affinité */}
                                            <div className="flex items-center gap-4">
                                                <div className="flex-1">
                                                    <div className="flex justify-between mb-1">
                                                        <span className="text-[8px] uppercase font-bold text-red-400">Dur</span>
                                                        <span className="text-[8px] uppercase font-bold text-green-400">Simple</span>
                                                    </div>
                                                    <input 
                                                        type="range" 
                                                        min="1" max="100" step="1"
                                                        value={slot.affinity}
                                                        onChange={(e) => updateSimItem(mat.code, idx, 'affinity', parseInt(e.target.value))}
                                                        className="range-slider"
                                                    />
                                                </div>
                                                
                                                {/* Note Cible (Résultat) */}
                                                <div className="flex flex-col items-center min-w-[50px] bg-slate-800 rounded p-1 border border-slate-700">
                                                    <span className="text-[7px] uppercase font-bold text-slate-400">Cible</span>
                                                    <span className={`text-lg font-black ${simPreview[slot.id] > 20 ? 'text-red-500' : 'text-cyan-400'}`}>
                                                        {simPreview[slot.id] !== undefined ? simPreview[slot.id] : "-"}
                                                    </span>
                                                </div>
                                            </div>

                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Fixe */}
                <div className="p-6 border-t border-slate-800 bg-[#0f172a] rounded-b-3xl z-10">
                    <button 
                        onClick={applySimulation}
                        className="w-full py-4 bg-[#facc15] hover:bg-[#eab308] text-[#020617] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/20"
                    >
                        <Calculator size={18} />
                        Appliquer
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* HEADER PAGE */}
      <header className={`sticky top-0 z-40 w-full border-b transition-all duration-500 transform-gpu ${isScrolled ? 'bg-[#0f172a]/95 backdrop-blur-md border-slate-800 shadow-xl py-2' : 'bg-transparent border-transparent py-4'}`}>
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 flex items-center justify-between">
            <div className="flex items-center gap-2 shrink-0">
                <div className="bg-[#facc15] p-1.5 rounded-lg shadow-lg">
                    <GraduationCap size={18} className="text-[#020617]" />
                </div>
                <span className={`text-lg sm:text-xl font-black tracking-tighter uppercase text-[#facc15] transition-opacity duration-300 ${isScrolled ? 'hidden sm:block' : 'block'}`}>
                  SmartNote
                </span>
            </div>
            <div className={`flex items-center gap-3 sm:gap-4 transition-all duration-500 ease-out transform ${isScrolled ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
                <div className="text-right">
                    <p className="text-[7px] sm:text-[8px] uppercase font-black text-slate-500 leading-none mb-0.5">Moyenne</p>
                    <p className="text-xs sm:text-sm font-black text-[#facc15] leading-none">
                        {moyenneGeneraleStr}
                        <span className="text-[8px] sm:text-[10px] text-slate-600 ml-0.5">/20</span>
                    </p>
                </div>
                <div className={`flex items-center justify-center px-3 py-1 rounded-full border text-[9px] sm:text-[10px] font-black uppercase tracking-widest whitespace-nowrap min-w-[80px] text-center ${statutInfo.css}`}>
                    {statutInfo.text}
                </div>
            </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1100px] w-full mx-auto p-3 sm:p-8 space-y-6">
        
        {/* SCORE CARD */}
        <div className={`p-6 sm:p-8 glass-card rounded-[28px] border border-slate-700/50 bg-slate-900/40 relative overflow-visible transition-all duration-500 transform-gpu ${isScrolled ? 'opacity-0 pointer-events-none blur-sm scale-95' : 'opacity-100 scale-100'}`}>
          <div className="absolute -top-6 -right-6 opacity-5 rotate-12"><LayoutDashboard size={150} /></div>
          <div className="relative z-10 flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="text-center sm:text-left">
              <h2 className="text-slate-500 uppercase text-[0.65rem] font-black tracking-[0.3em] mb-2">Moyenne Semestrielle</h2>
              <div className="flex items-baseline gap-2 justify-center sm:justify-start overflow-hidden">
                <span key={moyenneGeneraleStr} className="text-6xl sm:text-7xl font-black text-[#facc15] tracking-tighter drop-shadow-2xl animate-slide-right inline-block">
                    {moyenneGeneraleStr}
                </span>
                <span className="text-xl sm:text-2xl text-slate-600 font-bold">/20</span>
              </div>
            </div>

            <div className="w-full sm:w-auto overflow-visible z-20">
                <div className="flex justify-center sm:block bg-slate-900/60 p-3 sm:p-4 border border-slate-800 w-full sm:w-48 backdrop-blur-sm rounded-2xl">
                   <div className="text-center relative">
                      <p className="text-[9px] text-slate-500 font-black mb-1 uppercase tracking-widest">Statut</p>
                      
                      <div 
                        className="relative cursor-pointer group flex justify-center"
                        onClick={() => setShowStatusDetails(!showStatusDetails)}
                        onMouseEnter={() => setShowStatusDetails(true)}
                        onMouseLeave={() => setShowStatusDetails(false)}
                      >
                          <div className={`flex items-center justify-center gap-2 text-lg sm:text-xl font-black uppercase tracking-tighter animate-slide-right ${statutInfo.css.replace('bg-', 'text-').split(' ')[2]}`}>
                             <span>{statutInfo.text}</span>
                             {statutInfo.reasons.length > 0 && (
                               <div className="bg-white/10 p-0.5 rounded-full hover:bg-white/20 transition-colors">
                                 <Info size={14} className="opacity-80" strokeWidth={3} />
                               </div>
                             )}
                          </div>
                          <div className={`absolute left-1/2 -translate-x-1/2 top-full mt-3 w-56 sm:w-64 bg-[#0f172a] border border-slate-700 rounded-xl shadow-2xl p-3 z-50 transition-all duration-200 origin-top ${showStatusDetails && statutInfo.reasons.length > 0 ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}`}>
                             <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#0f172a] border-t border-l border-slate-700 rotate-45"></div>
                             <p className="text-[10px] uppercase font-bold text-slate-500 mb-2 border-b border-slate-800 pb-1">Détails de validation</p>
                             <ul className="text-left space-y-1.5">
                                 {statutInfo.reasons.map((reason, idx) => (
                                     <li key={idx} className="text-[10px] font-medium text-slate-300 flex items-start gap-1.5">
                                         <span className="text-red-400 mt-0.5">•</span>
                                         {reason}
                                     </li>
                                 ))}
                             </ul>
                          </div>
                      </div>
                   </div>
                </div>
            </div>
          </div>
        </div>

        {/* NAVIGATION */}
        <div className="space-y-4">
          <div className="glass-card p-1.5 sm:p-2 rounded-2xl flex flex-col sm:flex-row gap-2 bg-slate-900/30 border border-slate-800/60">
            <div className="flex overflow-x-auto pb-1 sm:pb-0 gap-1 sm:gap-2 no-scrollbar">
                {Object.keys(data).map(a => (
                <button key={a} onClick={() => handleChangeAnnee(a)} className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-black transition-all uppercase whitespace-nowrap ${annee === a ? 'bg-[#facc15] text-[#020617]' : 'text-slate-500 hover:bg-slate-800'}`}>
                    {a}
                </button>
                ))}
            </div>
            <div className="h-[1px] sm:h-auto sm:w-[1px] bg-slate-800 mx-1"></div>
            <div className="flex gap-1 sm:gap-2">
                {Object.keys((data as any)[annee] || {}).map(s => (
                <button key={s} onClick={() => handleChangeSemestre(s)} className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-[10px] sm:text-xs font-black transition-all uppercase ${semestre === s ? 'bg-slate-700 text-white' : 'text-slate-600 hover:bg-slate-800'}`}>
                    {s}
                </button>
                ))}
            </div>
          </div>
          {filieresDisponibles.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center px-1">
              <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest hidden sm:inline">Filière :</span>
              {filieresDisponibles.map(f => (
                <button key={f} onClick={() => setFiliere(f)} className={`px-3 py-1.5 rounded-full text-[9px] font-bold border transition-all ${filiere === f ? 'bg-blue-500/10 border-blue-500 text-blue-400' : 'border-slate-800 text-slate-500'}`}>
                  {f}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* LISTES */}
        <div className="space-y-8">
          {poles.length > 0 ? (
             poles.map((pole: any, pIdx: number) => (
            <section key={pIdx} className="rounded-[24px] border border-slate-800 bg-[#0f172a] shadow-xl transform-gpu will-change-transform">
              <div className="px-5 py-3 sm:px-8 sm:py-4 bg-slate-800/30 border-b border-slate-800 flex justify-between items-center">
                <h3 className="font-black text-[9px] sm:text-[10px] uppercase tracking-widest text-slate-400 truncate max-w-[60%]">{pole.pole}</h3>
                <div className="flex items-center gap-3">
                    {/* BOUTON SIMULER AVEC BADGE BETA */}
                    <button 
                        onClick={() => openSimulationModal(pIdx)}
                        className="relative flex items-center gap-1.5 px-2 py-1 bg-cyan-900/30 border border-cyan-800 rounded-lg text-cyan-400 hover:bg-cyan-900/50 hover:border-cyan-500 transition-all active:scale-95 group/magic"
                    >
                        <Wand2 size={12} className="group-hover/magic:animate-pulse" />
                        <span className="text-[9px] font-bold uppercase hidden sm:inline">Simuler</span>
                        {/* PETIT BADGE BETA */}
                        <span className="absolute -top-1.5 -right-1 bg-cyan-500 text-[#020617] text-[5px] font-black px-1 rounded-sm tracking-widest border border-[#020617]">BETA</span>
                    </button>

                    <span className={`text-base sm:text-lg font-black ${parseFloat(resultats?.details[pIdx]?.moyennePole || "0") >= 10 ? 'text-green-400' : 'text-orange-400'}`}>
                        {resultats?.details[pIdx]?.moyennePole || "0.00"}
                    </span>
                </div>
              </div>
              <div className="divide-y divide-slate-800/40">
                {pole.matieres.map((matiere: any) => {
                  const detailM = resultats?.details[pIdx]?.matieres.find((m:any) => m.nom === matiere.nom);
                  const noteMoy = parseFloat(detailM?.moyenne || "0");
                  let dotColor = 'bg-slate-700';
                  if (detailM?.moyenne !== "N/A") {
                      if (noteMoy >= 10) dotColor = 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]';
                      else if (noteMoy < 5) dotColor = 'bg-red-500 animate-pulse'; 
                      else dotColor = 'bg-orange-400'; 
                  }
                  return (
                    <div key={matiere.code} className="p-4 sm:px-6 sm:py-5 hover:bg-slate-800/20 transition-colors group">
                      <div className="flex justify-between items-start mb-4 sm:mb-0 sm:items-center">
                        <div className="flex items-start gap-3 flex-1">
                            <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${dotColor}`} />
                            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6 w-full">
                                <div>
                                    <p className="text-xs sm:text-sm font-black text-slate-100 uppercase leading-tight">{matiere.nom}</p>
                                    <p className="text-[9px] text-slate-500 font-bold mt-1">ID: {matiere.code} • COEFF: {matiere.coeff_ue}</p>
                                </div>
                                <div className="mt-2 sm:hidden flex items-center gap-2">
                                     <span className="text-[9px] text-slate-600 font-black uppercase">Moyenne:</span>
                                     <span className={`text-xs font-black ${detailM?.moyenne !== "N/A" ? 'text-[#facc15]' : 'text-slate-600'}`}>
                                        {detailM?.moyenne || "N/A"}
                                     </span>
                                </div>
                            </div>
                        </div>
                        <div className="hidden sm:block text-center px-4">
                            <span className={`block text-sm font-black px-3 py-1.5 rounded-lg ${detailM?.moyenne !== "N/A" ? 'bg-slate-900 text-[#facc15] border border-slate-800' : 'text-slate-700 italic'}`}>
                                {detailM?.moyenne || "N/A"}
                            </span>
                        </div>
                      </div>
                      <div className="mt-2 sm:mt-4 flex flex-wrap sm:justify-end gap-2 sm:gap-3 items-center">
                          {(notesInput[matiere.code] || []).map((n, i) => (
                            <div key={i} className={`group/item flex items-center bg-[#020617] border p-1.5 rounded-xl shadow-lg transition-all ${n.isSimulated ? 'border-cyan-500/50 shadow-cyan-900/20' : 'border-slate-700/60 hover:border-[#facc15]/30'}`}>
                                <div className="flex flex-col items-center px-1">
                                    <span className="text-[7px] text-slate-600 font-black uppercase mb-0.5">Note</span>
                                    <input 
                                        type="text" 
                                        inputMode="decimal" 
                                        className={`w-10 bg-transparent text-center text-base sm:text-sm font-black outline-none p-0 placeholder-slate-700 ${n.isSimulated ? 'text-cyan-400' : 'text-[#facc15]'}`}
                                        placeholder="0"
                                        value={n.valeur === 0 && !n.isSimulated ? '' : n.valeur} 
                                        onChange={(e) => handleInputChange(matiere.code, i, 'valeur', e.target.value)} 
                                    />
                                </div>
                                <div className="h-5 w-[1px] bg-slate-800 mx-1"></div>
                                <div className="flex flex-col items-center px-1">
                                    <span className="text-[7px] text-slate-600 font-black uppercase mb-0.5">Coef</span>
                                    <input type="text" inputMode="decimal" className="w-8 bg-transparent text-center text-base sm:text-[10px] text-slate-400 font-bold outline-none p-0 placeholder-slate-800" placeholder="1" value={n.coef} onChange={(e) => handleInputChange(matiere.code, i, 'coef', e.target.value)} />
                                </div>
                                <button onClick={() => removeNote(matiere.code, i)} className="text-slate-700 hover:text-red-500 flex justify-center items-center w-6 sm:w-0 sm:group-hover/item:w-6 overflow-hidden transition-all duration-200">
                                    <Trash2 size={14}/>
                                </button>
                            </div>
                          ))}
                          <button onClick={() => addNote(matiere.code)} className="w-10 h-10 rounded-xl border border-dashed border-slate-700 text-slate-600 hover:border-[#facc15] hover:text-[#facc15] flex items-center justify-center transition-all bg-slate-900/20 active:scale-95">
                            <Plus size={18} />
                          </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-800 rounded-[28px] text-slate-500 gap-4">
                <div className="bg-slate-800/50 p-4 rounded-full"><AlertTriangle size={32} /></div>
                <div className="text-center px-4">
                    <p className="font-bold text-lg text-slate-400">Aucune donnée trouvée</p>
                </div>
            </div>
          )}
        </div>

        <footer className="mt-20 border-t border-slate-800/50 py-10 text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-slate-400">
                <ShieldCheck size={16} />
                <h3 className="text-xs font-black uppercase tracking-widest">Confidentialité & RGPD</h3>
            </div>
            <p className="text-[10px] text-slate-500 max-w-md mx-auto leading-relaxed px-6">
                Aucune donnée ne quitte votre appareil. Vos notes sont stockées exclusivement dans le
                <span className="text-slate-400 font-bold"> LocalStorage</span> de votre navigateur.
            </p>
            <p className="text-[10px] text-slate-600">
                © {new Date().getFullYear()} SmartNote • Développé par Roméo & Mathis
            </p>
        </footer>

      </main>
      
      <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className={`fixed bottom-6 right-6 p-3 bg-[#facc15] text-[#020617] rounded-full shadow-lg shadow-[#facc15]/20 transition-all duration-500 z-50 ${isScrolled ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
        <ArrowUp size={24} strokeWidth={3} />
      </button>
    </div>
  );
}