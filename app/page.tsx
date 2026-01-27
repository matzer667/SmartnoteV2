"use client";

import { useState, useMemo, useEffect } from 'react';
import data from "@/data/matieres.json";
import { calculerSaaS, UserGradesInput } from "@/lib/calculator";
import { Plus, Trash2, GraduationCap, ChevronRight, LayoutDashboard } from "lucide-react";

export default function SmartNotePage() {
  // --- ÉTATS ---
  const [annee, setAnnee] = useState(Object.keys(data)[0]);
  const [semestre, setSemestre] = useState("Semestre 1");
  const filiere = "Aéronautique";
  const [notesInput, setNotesInput] = useState<UserGradesInput>({});

  // --- PERSISTANCE (LocalStorage) ---
  useEffect(() => {
    const saved = localStorage.getItem('smartnote-data');
    if (saved) {
      try {
        setNotesInput(JSON.parse(saved));
      } catch (e) {
        console.error("Erreur de lecture du stockage local", e);
      }
    }
  }, []);

  useEffect(() => {
    if (Object.keys(notesInput).length > 0) {
      localStorage.setItem('smartnote-data', JSON.stringify(notesInput));
    }
  }, [notesInput]);

  // --- LOGIQUE DE CALCUL ---
  const poles = (data as any)[annee]?.[semestre]?.[filiere] || [];
  const resultats = useMemo(() => 
    calculerSaaS(annee, semestre, filiere, notesInput), 
    [annee, semestre, filiere, notesInput]
  );

  // --- ACTIONS ---
  const ajouterNote = (code: string) => {
    const current = notesInput[code] || [];
    setNotesInput({ ...notesInput, [code]: [...current, { valeur: 0, coef: 1 }] });
  };

  const updateNote = (code: string, index: number, field: 'valeur' | 'coef', value: number) => {
    const newNotes = { ...notesInput };
    if (newNotes[code] && newNotes[code][index]) {
      newNotes[code][index][field] = isNaN(value) ? 0 : value;
      setNotesInput({ ...newNotes });
    }
  };

  const supprimerNote = (code: string, index: number) => {
    const newNotes = { ...notesInput };
    newNotes[code].splice(index, 1);
    setNotesInput({ ...newNotes });
  };

  return (
    <div className="flex flex-col min-h-screen text-slate-200 pb-20">
      {/* BARRE DE NAVIGATION */}
      <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="bg-[#facc15] p-1.5 rounded-lg shadow-lg shadow-[#facc15]/20">
            <GraduationCap size={20} className="text-[#020617]" />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase text-[#facc15]">SmartNote</span>
        </div>
        <div className="flex items-center gap-4">
            <span className="hidden md:block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Dashboard Étudiant</span>
            <button className="text-[0.7rem] font-bold uppercase tracking-widest px-4 py-2 border border-slate-700 rounded-full hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-400 transition-all">
                Déconnexion
            </button>
        </div>
      </header>

      <main className="flex-1 max-w-[1100px] w-full mx-auto p-4 sm:p-8">
        
        {/* CARTE SCORE GÉNÉRAL */}
        <div className="mb-8 p-8 glass-card rounded-[28px] border border-slate-700/50 bg-slate-900/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <LayoutDashboard size={120} />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <h2 className="text-slate-500 uppercase text-[0.65rem] font-black tracking-[0.3em] mb-3 italic">Moyenne Semestrielle</h2>
              <div className="flex items-baseline gap-2">
                <span className="text-7xl font-black text-[#facc15] tracking-tighter drop-shadow-2xl">{resultats?.moyenneGenerale}</span>
                <span className="text-2xl text-slate-600 font-bold">/20</span>
              </div>
            </div>
            
            <div className="flex gap-4 sm:gap-8">
                <div className="text-center bg-slate-900/60 p-4 rounded-2xl border border-slate-800 w-32">
                    <p className="text-[9px] text-slate-500 uppercase font-black mb-1">Pôles OK</p>
                    <p className="text-2xl font-black text-green-400">
                        {resultats?.details.filter((p:any) => parseFloat(p.moyennePole) >= 10).length}
                        <span className="text-sm text-slate-600 ml-1">/{resultats?.details.length}</span>
                    </p>
                </div>
                <div className="text-center bg-slate-900/60 p-4 rounded-2xl border border-slate-800 w-32 text-blue-400">
                    <p className="text-[9px] text-slate-500 uppercase font-black mb-1">Status</p>
                    <p className="text-xl font-black uppercase tracking-tighter">
                        {parseFloat(resultats?.moyenneGenerale || "0") >= 10 ? 'Admis' : 'En attente'}
                    </p>
                </div>
            </div>
          </div>
        </div>

        {/* NAVIGATION ANNÉE / SEMESTRE */}
        <div className="glass-card p-2 rounded-2xl flex flex-wrap gap-2 mb-10 bg-slate-900/30 border border-slate-800/60 shadow-inner">
          {Object.keys(data).map(a => (
            <button key={a} onClick={() => {setAnnee(a); setNotesInput({});}} 
              className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${annee === a ? 'bg-[#facc15] text-[#020617] scale-105 shadow-xl shadow-[#facc15]/20' : 'text-slate-500 hover:text-slate-300'}`}>
              {a}
            </button>
          ))}
          <div className="w-[2px] bg-slate-800 mx-2 self-stretch"></div>
          {Object.keys((data as any)[annee] || {}).map(s => (
            <button key={s} onClick={() => {setSemestre(s); setNotesInput({});}}
              className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${semestre === s ? 'bg-slate-700 text-white' : 'text-slate-600 hover:text-slate-400'}`}>
              {s}
            </button>
          ))}
        </div>

        {/* AFFICHAGE DES PÔLES */}
        <div className="space-y-10">
          {poles.map((pole: any, pIdx: number) => (
            <section key={pIdx} className="glass-card rounded-[26px] border border-slate-800/80 bg-[#0f172a]/40 shadow-2xl overflow-hidden">
              <div className="px-8 py-5 bg-slate-800/20 border-b border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#facc15]"></div>
                    <h3 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400">{pole.pole}</h3>
                </div>
                <div className="text-right">
                  <span className={`text-xl font-black px-4 py-1.5 rounded-xl border-2 ${parseFloat(resultats?.details[pIdx].moyennePole) >= 10 ? 'border-green-500/30 text-green-400 bg-green-500/5' : 'border-red-500/30 text-red-400 bg-red-500/5'}`}>
                    {resultats?.details[pIdx].moyennePole}
                  </span>
                </div>
              </div>

              <div className="p-0 overflow-x-auto">
                <table className="w-full">
                  <tbody className="divide-y divide-slate-800/40">
                    {pole.matieres.map((matiere: any) => {
                      const detailM = resultats?.details[pIdx].matieres.find((m:any) => m.nom === matiere.nom);
                      return (
                        <tr key={matiere.code} className="hover:bg-slate-800/10 transition-colors group">
                          <td className="px-6 py-6 min-w-[200px]">
                            <p className="text-sm font-black text-slate-100 uppercase tracking-tight">{matiere.nom}</p>
                            <p className="text-[9px] text-slate-500 font-bold mt-1 opacity-60">ID: {matiere.code} • COEFF: {matiere.coeff_ue}</p>
                          </td>
                          <td className="px-6 py-6 text-center">
                            <div className="flex flex-col items-center">
                              <span className="text-[8px] text-slate-600 font-black uppercase mb-1 tracking-widest">Moyenne</span>
                              <span className={`text-sm font-black p-2 rounded-lg ${detailM?.moyenne !== "N/A" ? 'bg-slate-900/80 text-[#facc15] border border-slate-800' : 'text-slate-800 italic'}`}>
                                {detailM?.moyenne || "N/A"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-6">
                            <div className="flex flex-wrap justify-end gap-3">
                              {(notesInput[matiere.code] || []).map((n, i) => (
                                <div key={i} className="group/item relative flex items-center gap-3 bg-[#020617] border border-slate-700/60 p-2 rounded-2xl shadow-xl hover:border-[#facc15]/40 transition-all">
                                  <div className="flex flex-col items-center px-1">
                                    <span className="text-[8px] text-slate-500 font-black uppercase mb-1">Note</span>
                                    <input type="number" step="0.5" className="w-10 bg-transparent text-center text-sm font-black text-[#facc15] outline-none"
                                      value={n.valeur || ""} onChange={(e) => updateNote(matiere.code, i, 'valeur', parseFloat(e.target.value))} />
                                  </div>
                                  <div className="h-6 w-[1px] bg-slate-800"></div>
                                  <div className="flex flex-col items-center px-1">
                                    <span className="text-[8px] text-slate-500 font-black uppercase mb-1">Coef</span>
                                    <input type="number" step="0.25" className="w-8 bg-transparent text-center text-[10px] text-slate-400 font-bold outline-none"
                                      value={n.coef || ""} onChange={(e) => updateNote(matiere.code, i, 'coef', parseFloat(e.target.value))} />
                                  </div>
                                  <button onClick={() => supprimerNote(matiere.code, i)} className="w-0 overflow-hidden group-hover/item:w-6 text-red-500 transition-all flex justify-center">
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              ))}
                              <button onClick={() => ajouterNote(matiere.code)} className="w-12 h-12 rounded-2xl border-2 border-dashed border-slate-800 text-slate-700 hover:border-[#facc15] hover:text-[#facc15] transition-all flex items-center justify-center">
                                <Plus size={22} />
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