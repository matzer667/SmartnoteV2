"use client";

import { useState, useMemo, useEffect } from 'react';
import data from "@/data/matieres.json";
import { calculerSaaS } from "@/lib/calculator";
import { NotesState, SimConfig } from "@/lib/types";

// --- IMPORTS DES COMPOSANTS (Chemins en minuscules) ---
// Note : On garde la Majuscule pour le nom de la variable (Header, Footer...)
import Header from "@/app/components/header";
import ScoreCard from "@/app/components/scorecard";
import SimulationModal from "@/app/components/simulationmodal";
import Footer from "@/app/components/footer";

// --- ICONES ---
import { Trash2, ArrowUp, AlertTriangle, Wand2, Plus, MinusCircle, PlusCircle } from "lucide-react";

export default function SmartNotePage() {
  
  // --- ÉTATS ---
  const [annee, setAnnee] = useState(() => Object.keys(data)[0]);
  const [semestre, setSemestre] = useState("Semestre 1");
  const [filiere, setFiliere] = useState(""); 
  const [notesInput, setNotesInput] = useState<NotesState>({});
  const [isScrolled, setIsScrolled] = useState(false);
  const [showStatusDetails, setShowStatusDetails] = useState(false);

  // --- ÉTATS SIMULATION ---
  const [simModalOpen, setSimModalOpen] = useState(false);
  const [simTargetPoleIndex, setSimTargetPoleIndex] = useState<number | null>(null);
  const [simConfig, setSimConfig] = useState<SimConfig>({});

  // --- HELPER INIT ---
  const getFilieres = (a: string, s: string) => {
    try {
      const sData = (data as any)[a]?.[s];
      return (sData && typeof sData === 'object' && !Array.isArray(sData)) ? Object.keys(sData) : [];
    } catch { return []; }
  };
  
  // Initialisation safe de la filière
  useEffect(() => {
      if(!filiere) setFiliere(getFilieres(annee, semestre)[0] || "");
  }, []); // eslint-disable-line

  // --- NAVIGATION ---
  const handleChangeAnnee = (newAnnee: string) => {
    if (newAnnee === annee) return;
    setAnnee(newAnnee);
    setSemestre("Semestre 1");
    setFiliere(getFilieres(newAnnee, "Semestre 1")[0] || "");
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

  // --- SCROLL DETECTION ---
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => { 
            // On déclenche l'effet "scrolled" après 50px
            setIsScrolled(window.scrollY > 50); 
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
        return calculerSaaS(annee, semestre, filiere, notesInput as any); 
    } catch { return null; }
  }, [annee, semestre, filiere, notesInput]);

  const poles = useMemo(() => {
    try {
      const raw = (data as any)[annee]?.[semestre]?.[filiere];
      return Array.isArray(raw) ? raw : [];
    } catch { return []; }
  }, [annee, semestre, filiere]);

  const statutInfo = useMemo(() => {
    if (!resultats) return { text: "EN ATTENTE", css: "bg-slate-800 border-slate-700 text-slate-500", reasons: [] };
    const moyGen = parseFloat(resultats.moyenneGenerale);
    const reasons: string[] = [];
    
    if (moyGen < 10) reasons.push(`Moyenne Générale < 10 (${resultats.moyenneGenerale}/20)`);
    
    let polesFailed = false;
    let matiereFailed = false;
    
    resultats.details.forEach((poleResult: any, index: number) => {
        const nomPole = poles[index]?.pole || "Pôle Inconnu";
        if (parseFloat(poleResult.moyennePole) < 10) { reasons.push(`Pôle "${nomPole}" non validé (<10)`); polesFailed = true; }
        poleResult.matieres.forEach((mat: any) => {
            if (mat.moyenne !== "N/A" && parseFloat(mat.moyenne) < 5) { reasons.push(`Note éliminatoire en ${mat.nom} (<5)`); matiereFailed = true; }
        });
    });

    if (moyGen < 10) return { text: "NON VALIDÉ", css: "bg-red-500/10 border-red-500 text-red-400", reasons };
    else if (polesFailed || matiereFailed) return { text: "RATTRAPAGES", css: "bg-orange-500/10 border-orange-500 text-orange-400", reasons };
    else return { text: "ADMIS", css: "bg-blue-500/10 border-blue-500 text-blue-400", reasons: ["Semestre validé avec succès !"] };
  }, [resultats, poles]);

  // --- LOGIQUE SIMULATION ---
  const openSimulationModal = (pIdx: number) => { setSimTargetPoleIndex(pIdx); setSimConfig({}); setSimModalOpen(true); };
  
  const addSimSlot = (code: string) => setSimConfig(p => ({ ...p, [code]: [...(p[code]||[]), { id: Math.random().toString(36), coef: 1, affinity: 50 }] }));
  
  const removeSimSlot = (code: string, idx: number) => setSimConfig(p => { const n = [...(p[code]||[])]; n.splice(idx, 1); return { ...p, [code]: n }; });
  
  const updateSimItem = (code: string, idx: number, f: 'coef'|'affinity', v: number) => setSimConfig(p => { const n = [...(p[code]||[])]; n[idx] = { ...n[idx], [f]: v }; return { ...p, [code]: n }; });

  const simPreview = useMemo(() => {
    if (simTargetPoleIndex === null || !poles[simTargetPoleIndex]) return {};
    const matieresDuPole = poles[simTargetPoleIndex].matieres;
    let ptsAcquis = 0, coefAcquis = 0, weightedAffinity = 0, coefSim = 0;
    
    matieresDuPole.forEach((m: any) => (notesInput[m.code] || []).forEach(n => { if (!n.isSimulated) { ptsAcquis += n.valeur * n.coef; coefAcquis += n.coef; } }));
    matieresDuPole.forEach((m: any) => (simConfig[m.code] || []).forEach(s => { coefSim += s.coef; weightedAffinity += Math.max(1, s.affinity) * s.coef; }));

    const coefGlobal = coefAcquis + coefSim;
    if (coefGlobal === 0 || coefSim === 0) return {};
    const ptsManquants = (10 * coefGlobal) - ptsAcquis;
    
    if (ptsManquants <= 0) { const r:any={}; matieresDuPole.forEach((m:any) => (simConfig[m.code]||[]).forEach(s=>r[s.id]=0)); return r; }

    const K = ptsManquants / weightedAffinity;
    const r:any={};
    matieresDuPole.forEach((m: any) => (simConfig[m.code] || []).forEach(s => { r[s.id] = Math.ceil(K * Math.max(1, s.affinity) * 4) / 4; }));
    return r;
  }, [simConfig, simTargetPoleIndex, poles, notesInput]);

  const applySimulation = () => {
    if (simTargetPoleIndex === null || !poles[simTargetPoleIndex]) return;
    const nextNotes = JSON.parse(JSON.stringify(notesInput));
    poles[simTargetPoleIndex].matieres.forEach((m: any) => {
        if (nextNotes[m.code]) nextNotes[m.code] = nextNotes[m.code].filter((n:any) => !n.isSimulated);
        else nextNotes[m.code] = [];
        (simConfig[m.code] || []).forEach(s => nextNotes[m.code].push({ valeur: simPreview[s.id] || 0, coef: s.coef, isSimulated: true }));
    });
    setNotesInput(nextNotes); setSimModalOpen(false);
  };

  // --- LOGIQUE NOTES ---
  const handleInputChange = (code: string, idx: number, field: 'valeur' | 'coef', valStr: string) => {
    const clean = valStr.replace(',', '.');
    if (clean === '' || /^\d*\.?\d*$/.test(clean)) {
        setNotesInput(p => {
            const next = { ...p, [code]: [...(p[code] || [])] };
            if (next[code][idx]) next[code][idx] = { ...next[code][idx], [field]: clean === '' ? 0 : parseFloat(clean), isSimulated: false };
            return next;
        });
    }
  };
  const addNote = (code: string) => setNotesInput(p => ({ ...p, [code]: [...(p[code] || []), { valeur: 0, coef: 1, isSimulated: false }] }));
  const removeNote = (code: string, idx: number) => setNotesInput(p => { const n = [...(p[code]||[])]; n.splice(idx, 1); return { ...p, [code]: n }; });

  const moyenneGeneraleStr = resultats?.moyenneGenerale || "0.00";

  // --- RENDER ---
  return (
    // CORRECTION SCROLL : Pas de overflow-hidden ici !
    <div className="flex flex-col min-h-screen text-slate-200 pb-20 bg-[#020617] w-full">
      
      {/* 1. MODAL */}
      <SimulationModal 
        isOpen={simModalOpen}
        onClose={() => setSimModalOpen(false)}
        poleName={simTargetPoleIndex !== null && poles[simTargetPoleIndex] ? poles[simTargetPoleIndex].pole : ""}
        matieres={simTargetPoleIndex !== null && poles[simTargetPoleIndex] ? poles[simTargetPoleIndex].matieres : []}
        config={simConfig}
        preview={simPreview}
        onAddSlot={addSimSlot}
        onRemoveSlot={removeSimSlot}
        onUpdateItem={updateSimItem}
        onApply={applySimulation}
      />

      {/* 2. HEADER */}
      <Header 
        isScrolled={isScrolled}
        moyenneGeneraleStr={moyenneGeneraleStr}
        statutCss={statutInfo.css}
        statutText={statutInfo.text}
      />

      <main className="flex-1 max-w-[1100px] w-full mx-auto p-3 sm:p-8 space-y-6">
        
        {/* 3. SCORE CARD */}
        <ScoreCard 
            isScrolled={isScrolled}
            moyenneGeneraleStr={moyenneGeneraleStr}
            statutCss={statutInfo.css}
            statutText={statutInfo.text}
            reasons={statutInfo.reasons}
            showDetails={showStatusDetails}
            setShowDetails={setShowStatusDetails}
        />

        {/* 4. NAVIGATION */}
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

        {/* 5. LISTE DES MATIERES */}
        <div className="space-y-8">
          {poles.length > 0 ? (
             poles.map((pole: any, pIdx: number) => (
            <section key={pIdx} className="rounded-[24px] border border-slate-800 bg-[#0f172a] shadow-xl transform-gpu will-change-transform">
              <div className="px-5 py-3 sm:px-8 sm:py-4 bg-slate-800/30 border-b border-slate-800 flex justify-between items-center">
                <h3 className="font-black text-[9px] sm:text-[10px] uppercase tracking-widest text-slate-400 truncate max-w-[60%]">{pole.pole}</h3>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => openSimulationModal(pIdx)}
                        className="relative flex items-center gap-1.5 px-2 py-1 bg-cyan-900/30 border border-cyan-800 rounded-lg text-cyan-400 hover:bg-cyan-900/50 hover:border-cyan-500 transition-all active:scale-95 group/magic"
                    >
                        <Wand2 size={12} className="group-hover/magic:animate-pulse" />
                        <span className="text-[9px] font-bold uppercase hidden sm:inline">Simuler</span>
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

        <Footer />

      </main>
      
      <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className={`fixed bottom-6 right-6 p-3 bg-[#facc15] text-[#020617] rounded-full shadow-lg shadow-[#facc15]/20 transition-all duration-500 z-50 ${isScrolled ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
        <ArrowUp size={24} strokeWidth={3} />
      </button>
    </div>
  );
}