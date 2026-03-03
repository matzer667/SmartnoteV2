import { ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-800/50 py-10 text-center space-y-4">
        <div className="flex items-center justify-center gap-2 text-slate-400">
            <ShieldCheck size={16} />
            <h3 className="text-xs font-black uppercase tracking-widest">Confidentialité & RGPD</h3>
        </div>
        <p className="text-[10px] text-slate-500 max-w-md mx-auto leading-relaxed px-6">
            Aucune donnée ne quitte votre appareil. Vos notes sont stockées exclusivement dans le
            <span className="text-slate-400 font-bold"> LocalStorage</span> de votre navigateur.
        </p>
        
        {/* LIGNE CRÉDITS + INSTAGRAM */}
        <p className="text-[10px] text-slate-600 uppercase tracking-widest flex flex-wrap justify-center items-center gap-x-1">
            <span>© {new Date().getFullYear()} SmartNote • Powered by</span>
            
            <a 
                href="https://nayzenstudio.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-bold text-slate-500 hover:text-[#facc15] transition-colors"
            >
                Nayzen Studio
            </a>

            <span className="text-slate-700">•</span>

            <a 
                href="https://instagram.com/nayzenstudio" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-bold text-slate-500 hover:text-[#facc15] transition-colors"
            >
                Instagram
            </a>
        </p>
    </footer>
  );
}