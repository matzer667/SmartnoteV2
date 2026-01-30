import { X, Wand2, PlusCircle, MinusCircle, Calculator } from "lucide-react";
import { SimConfig } from "@/lib/types";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    poleName: string;
    matieres: any[];
    config: SimConfig;
    preview: Record<string, number>;
    onAddSlot: (code: string) => void;
    onRemoveSlot: (code: string, idx: number) => void;
    onUpdateItem: (code: string, idx: number, field: 'coef' | 'affinity', val: number) => void;
    onApply: () => void;
};

export default function SimulationModal({ 
    isOpen, onClose, poleName, matieres, config, preview, 
    onAddSlot, onRemoveSlot, onUpdateItem, onApply 
}: Props) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm animate-pop-in">
            <div className="bg-[#0f172a] border border-slate-700 w-full max-w-md rounded-3xl shadow-2xl relative flex flex-col max-h-[85vh]">
                
                {/* Header */}
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-[#0f172a] rounded-t-3xl z-10">
                    <div className="flex items-center gap-3">
                        <div className="bg-cyan-500/10 p-2 rounded-xl text-cyan-400">
                            <Wand2 size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black uppercase text-slate-200 leading-none">Stratégie</h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-widest">{poleName}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-white p-2 bg-slate-800/50 rounded-full"><X size={18}/></button>
                </div>

                {/* Body */}
                <div className="p-4 overflow-y-auto space-y-6">
                    <div className="text-xs text-slate-400 bg-slate-900/50 p-3 rounded-xl border border-slate-800 text-center">
                        Ajoutez vos examens et ajustez la difficulté (Curseur). Les notes cibles s'adaptent <span className="text-[#facc15] font-bold">instantanément</span>.
                    </div>

                    <div className="space-y-6">
                        {matieres.map((mat: any) => (
                            <div key={mat.code} className="bg-[#020617] border border-slate-800 rounded-xl p-4">
                                <div className="flex justify-between items-center mb-3 border-b border-slate-800 pb-2">
                                    <span className="text-xs font-black uppercase text-slate-300">{mat.nom}</span>
                                    <button 
                                        onClick={() => onAddSlot(mat.code)}
                                        className="text-[9px] font-bold uppercase bg-cyan-900/20 text-cyan-400 px-2 py-1 rounded-lg border border-cyan-900/50 hover:bg-cyan-900/40 flex items-center gap-1"
                                    >
                                        <PlusCircle size={12} /> Ajouter
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {(config[mat.code] || []).length === 0 && (
                                        <p className="text-[10px] text-slate-600 italic text-center py-2">Aucun examen simulé.</p>
                                    )}
                                    {(config[mat.code] || []).map((slot, idx) => (
                                        <div key={slot.id} className="animate-slide-right bg-slate-900/40 p-2 rounded-lg border border-slate-800 relative">
                                            
                                            <div className="flex justify-between items-center mb-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] font-bold text-slate-500 uppercase">Coef</span>
                                                    <input 
                                                        type="text" 
                                                        inputMode="decimal"
                                                        value={slot.coef}
                                                        onChange={(e) => onUpdateItem(mat.code, idx, 'coef', parseFloat(e.target.value) || 0)}
                                                        className="w-10 bg-slate-800 text-center text-xs font-bold text-[#facc15] rounded py-0.5 outline-none border border-slate-700"
                                                    />
                                                </div>
                                                <button onClick={() => onRemoveSlot(mat.code, idx)} className="text-slate-600 hover:text-red-500 absolute top-2 right-2">
                                                    <X size={14} />
                                                </button>
                                            </div>

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
                                                        onChange={(e) => onUpdateItem(mat.code, idx, 'affinity', parseInt(e.target.value))}
                                                        className="range-slider"
                                                    />
                                                </div>
                                                
                                                <div className="flex flex-col items-center min-w-[50px] bg-slate-800 rounded p-1 border border-slate-700">
                                                    <span className="text-[7px] uppercase font-bold text-slate-400">Cible</span>
                                                    <span className={`text-lg font-black ${preview[slot.id] > 20 ? 'text-red-500' : 'text-cyan-400'}`}>
                                                        {preview[slot.id] !== undefined ? preview[slot.id] : "-"}
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

                {/* Footer */}
                <div className="p-6 border-t border-slate-800 bg-[#0f172a] rounded-b-3xl z-10">
                    <button 
                        onClick={onApply}
                        className="w-full py-4 bg-[#facc15] hover:bg-[#eab308] text-[#020617] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/20"
                    >
                        <Calculator size={18} />
                        Appliquer
                    </button>
                </div>
            </div>
        </div>
    );
}