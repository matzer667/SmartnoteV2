"use client";

import { useState, useMemo, useEffect } from 'react';
import data from "@/data/matieres.json";
import { calculerSaaS, UserGradesInput } from "@/lib/calculator";
import { Plus, Trash2, GraduationCap, LayoutDashboard } from "lucide-react";

export default function SmartNotePage() {
  // 1. ÉTATS DE BASE
  const [annee, setAnnee] = useState(Object.keys(data)[0]);
  const [semestre, setSemestre] = useState("Semestre 1");
  const [notesInput, setNotesInput] = useState<UserGradesInput>({});

  // 2. GESTION DYNAMIQUE DE LA FILIÈRE (SÉCURISÉE)
  const filieresDisponibles = useMemo(() => {
    const sData = (data as any)[annee]?.[semestre] || {};
    return Object.keys(sData);
  }, [annee, semestre]);

  const [filiere, setFiliere] = useState("");

  // Synchronisation sécurisée de la filière
  useEffect(() => {
    if (filieresDisponibles.length > 0) {
      if (!filiere || !filieresDisponibles.includes(filiere)) {
        setFiliere(filieresDisponibles[0]);
      }
    } else {
      setFiliere("");
    }
  }, [filieresDisponibles, filiere]);

  // 3. PERSISTANCE
  useEffect(() => {
    const saved = localStorage.getItem('smartnote-data');
    if (saved) {
      try { setNotesInput(JSON.parse(saved)); } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    if (Object.keys(notesInput).length > 0) {
      localStorage.setItem('smartnote-data', JSON.stringify(notesInput));
    }
  }, [notesInput]);

  // 4. CALCULS
  const resultats = useMemo(() => {
    if (!annee || !semestre || !filiere) return null;
    return calculerSaaS(annee, semestre, filiere, notesInput);
  }, [annee, semestre, filiere, notesInput]);

  const poles = useMemo(() => {
    return (data as any)[annee]?.[semestre]?.[filiere] || [];
  }, [annee, semestre, filiere]);

  // 5. ACTIONS
  const updateNote = (code: string, index: number, field: 'valeur' | 'coef', value: number) => {
    const newNotes = { ...notesInput };
    if (!newNotes[code]) newNotes[code] = [];
    if (newNotes[code][index]) {
      // On s'assure que c'est bien un nombre, sinon 0 (pour éviter les crashs)
      newNotes[code][index][field] = isNaN(value) ? 0 : value;
      setNotesInput(newNotes);
    }
  };

  const moyenneGeneraleNum = parseFloat(resultats?.moyenneGenerale || "0");

  return (
    <div className="flex flex-col min-h-screen text-slate-200 pb-20 bg-[#020617]">
      {/* HEADER */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="bg-[#facc15] p-1.5 rounded-lg shadow-lg">
            <GraduationCap size={20} className="text-[#020617]" />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase text-[#facc15]">SmartNote</span>
        </div>
      </header>

      <main className="flex-1 max-w-[1100px] w-full mx-auto p-4 sm:p-8 space-y-8">
        
        {/* SCORE BOARD & STATUS */}
        <div className="p-8 glass-card rounded-[28px] border border-slate-700/50 bg-slate-900/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5"><LayoutDashboard size={120} /></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Partie Gauche : Moyenne */}
            <div className="text-center md:text-left">
              <h2 className="text-slate-500 uppercase text-[0.65rem] font-black tracking-[0.3em] mb-3">Moyenne Semestrielle</h2>
              <div className="flex items-baseline gap-2 justify-center md:justify-start">
                <span className="text-7xl font-black text-[#facc15] tracking-tighter drop-shadow-2xl">
                    {resultats?.moyenneGenerale || "0.00"}
                </span>
                <span className="text-2xl text-slate-600 font-bold">/20</span>
              </div>
            </div>

            {/* Partie Droite : Status Box (AJOUTÉ) */}
            <div className="flex gap-4">
                <div className="text-center bg-slate-900/60 p-4 rounded-2xl border border-slate-800 w-36 backdrop-blur-sm">
                    <p className="text-[9px] text-slate-500 font-black mb-1 uppercase tracking-widest">Statut</p>
                    <p className={`text-xl font-black uppercase tracking-tighter ${moyenneGeneraleNum >= 10 ? 'text-blue-400' : 'text-slate-500'}`}>
                        {moyenneGeneraleNum >= 10 ? 'Admis' : 'En attente'}
                    </p>
                </div>
            </div>
          </div>
        </div>

        {/* NAVIGATION SELECTORS */}
        <div className="space-y-4">
          <div className="glass-card p-2 rounded-2xl flex flex-wrap gap-2 bg-slate-900/30 border border-slate-800/60">
            {Object.keys(data).map(a => (
              <button key={a} onClick={() => setAnnee(a)} 
                className={`px-5 py-2 rounded-xl text-xs font-black transition-all uppercase ${annee === a ? 'bg-[#facc15] text-[#020617]' : 'text-slate-500 hover:bg-slate-800'}`}>
                {a}
              </button>
            ))}
            <div className="w-[1px] bg-slate-800 mx-2 hidden md:block"></div>
            {Object.keys((data as any)[annee] || {}).map(s => (
              <button key={s} onClick={() => setSemestre(s)}
                className={`px-5 py-2 rounded-xl text-xs font-black transition-all uppercase ${semestre === s ? 'bg-slate-700 text-white' : 'text-slate-600 hover:bg-slate-800'}`}>
                {s}
              </button>
            ))}
          </div>

          {filieresDisponibles.length > 0 && (
            <div className="flex flex-wrap gap-3 items-center px-2">
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Filière :</span>
              {filieresDisponibles.map(f => (
                <button key={f} onClick={() => setFiliere(f)}
                  className={`px-4 py-1.5 rounded-full text-[10px] font-bold border transition-all ${filiere === f ? 'bg-blue-500/10 border-blue-500 text-blue-400' : 'border-slate-800 text-slate-500'}`}>
                  {f}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* LISTE DES PÔLES */}
        <div className="space-y-10">
          {poles.map((pole: any, pIdx: number) => (
            <section key={pIdx} className="glass-card rounded-[26px] border border-slate-800/80 bg-[#0f172a]/40 overflow-hidden shadow-2xl">
              <div className="px-8 py-4 bg-slate-800/20 border-b border-slate-800 flex justify-between items-center">
                <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-400">{pole.pole}</h3>
                <span className={`text-lg font-black ${parseFloat(resultats?.details[pIdx]?.moyennePole || "0") >= 10 ? 'text-green-400' : 'text-red-400'}`}>
                    {resultats?.details[pIdx]?.moyennePole || "0.00"}
                </span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <tbody className="divide-y divide-slate-800/40">
                    {pole.matieres.map((matiere: any) => {
                      const detailM = resultats?.details[pIdx]?.matieres.find((m:any) => m.nom === matiere.nom);
                      const noteMoy = parseFloat(detailM?.moyenne || "0");
                      
                      return (
                        <tr key={matiere.code} className="hover:bg-slate-800/5 transition-colors">
                          <td className="px-6 py-6 min-w-[200px]">
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${detailM?.moyenne === "N/A" ? 'bg-slate-700' : noteMoy >= 10 ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`} />
                              <div>
                                <p className="text-sm font-black text-slate-100 uppercase">{matiere.nom}</p>
                                <p className="text-[9px] text-slate-500 font-bold mt-1">ID: {matiere.code} • COEFF: {matiere.coeff_ue}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-6 text-center">
                            <div className="flex flex-col items-center">
                              <span className="text-[8px] text-slate-600 font-black uppercase mb-1">Moyenne</span>
                              <span className={`text-sm font-black p-2 rounded-lg ${detailM?.moyenne !== "N/A" ? 'bg-slate-900 text-[#facc15] border border-slate-800 shadow-md' : 'text-slate-800 italic'}`}>
                                {detailM?.moyenne || "N/A"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-6 text-right">
                            <div className="flex flex-wrap justify-end gap-3">
                              {(notesInput[matiere.code] || []).map((n, i) => (
                                <div key={i} className="group/item relative flex items-center gap-3 bg-[#020617] border border-slate-700/60 p-2 rounded-2xl shadow-xl hover:border-[#facc15]/40 transition-all">
                                  
                                  {/* INPUT NOTE (RESTITUÉ) */}
                                  <div className="flex flex-col items-center px-1">
                                    <span className="text-[8px] text-slate-500 font-black uppercase mb-1">Note</span>
                                    <input type="number" step="0.5" className="w-10 bg-transparent text-center text-sm font-black text-[#facc15] outline-none"
                                      value={n.valeur || ""} onChange={(e) => updateNote(matiere.code, i, 'valeur', parseFloat(e.target.value))} />
                                  </div>

                                  <div className="h-6 w-[1px] bg-slate-800"></div>

                                  {/* INPUT COEF (RESTITUÉ) */}
                                  <div className="flex flex-col items-center px-1">
                                    <span className="text-[8px] text-slate-500 font-black uppercase mb-1">Coef</span>
                                    <input type="number" step="0.25" className="w-8 bg-transparent text-center text-[10px] text-slate-400 font-bold outline-none"
                                      value={n.coef || ""} onChange={(e) => updateNote(matiere.code, i, 'coef', parseFloat(e.target.value))} />
                                  </div>

                                  {/* BOUTON SUPPRIMER */}
                                  <button onClick={() => {
                                    const next = {...notesInput};
                                    next[matiere.code].splice(i, 1);
                                    setNotesInput({...next});
                                  }} className="text-slate-700 hover:text-red-500 ml-1 px-1"><Trash2 size={14}/></button>
                                </div>
                              ))}

                              {/* BOUTON AJOUTER */}
                              <button onClick={() => {
                                const curr = notesInput[matiere.code] || [];
                                setNotesInput({...notesInput, [matiere.code]: [...curr, {valeur: 0, coef: 1}]});
                              }} className="w-12 h-12 rounded-2xl border-2 border-dashed border-slate-800 text-slate-700 hover:border-[#facc15] hover:text-[#facc15] flex items-center justify-center transition-all">
                                <Plus size={20} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}