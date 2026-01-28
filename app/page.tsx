"use client";

import { useState, useMemo, useEffect, useCallback } from 'react';
import data from "@/data/matieres.json";
import { calculerSaaS, UserGradesInput } from "@/lib/calculator";
import { Plus, Trash2, GraduationCap, LayoutDashboard, ArrowUp, AlertTriangle } from "lucide-react";

export default function SmartNotePage() {
  const stylesAnimation = `
    @keyframes slideInRightShort {
      0% { opacity: 0; transform: translateX(50px); filter: blur(10px); }
      100% { opacity: 1; transform: translateX(0); filter: blur(0); }
    }
    .animate-slide-right {
      animation: slideInRightShort 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;
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
  const [notesInput, setNotesInput] = useState<UserGradesInput>({});
  const [isScrolled, setIsScrolled] = useState(false);

  // --- ACTIONS NAVIGATION ---
  const handleChangeAnnee = (newAnnee: string) => {
    if (newAnnee === annee) return;
    const defaultSem = "Semestre 1";
    setAnnee(newAnnee);
    setSemestre(defaultSem);
    const dispo = getFilieres(newAnnee, defaultSem);
    setFiliere(dispo[0] || "");
  };

  const handleChangeSemestre = (newSemestre: string) => {
    if (newSemestre === semestre) return;
    setSemestre(newSemestre);
    const dispo = getFilieres(annee, newSemestre);
    if (!dispo.includes(filiere)) {
      setFiliere(dispo[0] || "");
    }
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

  // --- SCROLL OPTIMISÉ (SEUIL AUGMENTÉ À 80px) ---
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // J'ai mis 80 au lieu de 50 pour que ça ne "saute" pas dès qu'on touche l'écran
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
    try { return calculerSaaS(annee, semestre, filiere, notesInput); } catch { return null; }
  }, [annee, semestre, filiere, notesInput]);

  const poles = useMemo(() => {
    try {
      const raw = (data as any)[annee]?.[semestre]?.[filiere];
      return Array.isArray(raw) ? raw : [];
    } catch { return []; }
  }, [annee, semestre, filiere]);

  // --- GESTION NOTES ---
  const updateNote = useCallback((code: string, index: number, field: 'valeur' | 'coef', value: number) => {
    setNotesInput(prev => {
      const copy = { ...prev };
      if (!copy[code]) copy[code] = [];
      else copy[code] = [...copy[code]]; 
      if (copy[code][index]) {
        copy[code][index] = { ...copy[code][index], [field]: isNaN(value) ? 0 : value };
      }
      return copy;
    });
  }, []);

  const addNote = (code: string) => {
    setNotesInput(prev => {
      const curr = prev[code] || [];
      return { ...prev, [code]: [...curr, { valeur: 0, coef: 1 }] };
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

      {/* HEADER */}
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
                <div className={`px-2 py-1 sm:px-3 rounded-full border text-[9px] sm:text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${moyenneGeneraleNum >= 10 ? 'bg-blue-500/10 border-blue-500 text-blue-400' : 'bg-red-500/10 border-red-500 text-red-400'}`}>
                    {moyenneGeneraleNum >= 10 ? 'Admis' : 'Attente'}
                </div>
            </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1100px] w-full mx-auto p-3 sm:p-8 space-y-6">
        
        {/* SCORE CARD (CORRECTION BUG DE SCROLL) 
            J'ai retiré : 'h-0 p-0 m-0 overflow-hidden' quand isScrolled est true.
            Maintenant, la carte reste là (invisible) donc le contenu ne saute pas.
        */}
        <div className={`p-6 sm:p-8 glass-card rounded-[28px] border border-slate-700/50 bg-slate-900/40 relative overflow-hidden transition-all duration-500 transform-gpu ${isScrolled ? 'opacity-0 pointer-events-none blur-sm scale-95' : 'opacity-100 scale-100'}`}>
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
            <div className="w-full sm:w-auto overflow-hidden rounded-2xl">
                <div className="flex justify-center sm:block bg-slate-900/60 p-3 sm:p-4 border border-slate-800 w-full sm:w-36 backdrop-blur-sm">
                   <div className="text-center">
                      <p className="text-[9px] text-slate-500 font-black mb-1 uppercase tracking-widest">Statut</p>
                      <p key={moyenneGeneraleNum >= 10 ? 'admis' : 'attente'} 
                         className={`text-lg sm:text-xl font-black uppercase tracking-tighter animate-slide-right ${moyenneGeneraleNum >= 10 ? 'text-blue-400' : 'text-red-400'}`}
                         style={{ animationDelay: '0.1s' }}>
                          {moyenneGeneraleNum >= 10 ? 'Admis' : 'En attente'}
                      </p>
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
                <h3 className="font-black text-[9px] sm:text-[10px] uppercase tracking-widest text-slate-400 truncate max-w-[70%]">{pole.pole}</h3>
                <span className={`text-base sm:text-lg font-black ${parseFloat(resultats?.details[pIdx]?.moyennePole || "0") >= 10 ? 'text-green-400' : 'text-red-400'}`}>
                    {resultats?.details[pIdx]?.moyennePole || "0.00"}
                </span>
              </div>
              <div className="divide-y divide-slate-800/40">
                {pole.matieres.map((matiere: any) => {
                  const detailM = resultats?.details[pIdx]?.matieres.find((m:any) => m.nom === matiere.nom);
                  const noteMoy = parseFloat(detailM?.moyenne || "0");
                  return (
                    <div key={matiere.code} className="p-4 sm:px-6 sm:py-5 hover:bg-slate-800/20 transition-colors group">
                      <div className="flex justify-between items-start mb-4 sm:mb-0 sm:items-center">
                        <div className="flex items-start gap-3 flex-1">
                            <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${detailM?.moyenne === "N/A" ? 'bg-slate-700' : noteMoy >= 10 ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`} />
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
                            <div key={i} className="group/item flex items-center bg-[#020617] border border-slate-700/60 p-1.5 rounded-xl shadow-lg hover:border-[#facc15]/30 transition-all">
                                <div className="flex flex-col items-center px-1">
                                    <span className="text-[7px] text-slate-600 font-black uppercase mb-0.5">Note</span>
                                    <input type="number" inputMode="decimal" step="any" className="w-8 sm:w-10 bg-transparent text-center text-xs sm:text-sm font-black text-[#facc15] outline-none p-0"
                                    value={n.valeur || ""} onChange={(e) => updateNote(matiere.code, i, 'valeur', parseFloat(e.target.value))} />
                                </div>
                                <div className="h-5 w-[1px] bg-slate-800 mx-1"></div>
                                <div className="flex flex-col items-center px-1">
                                    <span className="text-[7px] text-slate-600 font-black uppercase mb-0.5">Coef</span>
                                    <input type="number" inputMode="decimal" step="any" className="w-6 sm:w-8 bg-transparent text-center text-[9px] sm:text-[10px] text-slate-400 font-bold outline-none p-0"
                                    value={n.coef || ""} onChange={(e) => updateNote(matiere.code, i, 'coef', parseFloat(e.target.value))} />
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
                    <p className="text-xs mt-1 max-w-xs mx-auto">
                        Il semble que les matières pour <span className="text-[#facc15]">{annee} / {semestre}</span> soient manquantes.
                    </p>
                </div>
            </div>
          )}
        </div>
      </main>
      
      <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className={`fixed bottom-6 right-6 p-3 bg-[#facc15] text-[#020617] rounded-full shadow-lg shadow-[#facc15]/20 transition-all duration-500 z-50 ${isScrolled ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
        <ArrowUp size={24} strokeWidth={3} />
      </button>
    </div>
  );
}