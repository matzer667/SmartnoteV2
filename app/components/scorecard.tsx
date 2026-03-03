"use client";

import { useEffect, useState } from "react";
import { LayoutDashboard, Info } from "lucide-react";

type ScoreCardProps = {
  // On garde les props pour compatibilité, mais on utilise notre propre logique interne
  isScrolled?: boolean; 
  moyenneGeneraleStr: string;
  statutCss: string;
  statutText: string;
  reasons: string[];
  showDetails: boolean;
  setShowDetails: (v: boolean) => void;
};

export default function ScoreCard({ 
  moyenneGeneraleStr, statutCss, statutText, reasons, showDetails, setShowDetails 
}: ScoreCardProps) {
  
  // --- LOGIQUE SCROLL DYNAMIQUE ---
  const [style, setStyle] = useState({
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    translateY: 0,
    pointerEvents: 'auto' as 'auto' | 'none',
    display: 'block'
  });

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      
      // La "Zone de Mort" de la carte : entre 0px et 250px de scroll
      const startFade = 0;
      const endFade = 250; 
      
      // Calcul du pourcentage d'avancement (0 = en haut, 1 = carte disparue)
      let progress = (scrollY - startFade) / (endFade - startFade);
      
      // On borne entre 0 et 1
      if (progress < 0) progress = 0;
      if (progress > 1) progress = 1;

      // Si on a dépassé la zone, on cache complètement pour la perf
      if (progress === 1) {
          setStyle(prev => ({ ...prev, opacity: 0, pointerEvents: 'none', display: 'none' }));
          return;
      }

      // --- CALCULS APPLE-LIKE ---
      
      // 1. Opacité : Disparait progressivement
      const newOpacity = 1 - progress; 
      
      // 2. Échelle : Rétrécit légèrement (effet de profondeur)
      // On passe de taille 100% à 90%
      const newScale = 1 - (progress * 0.15); 
      
      // 3. Flou : Devient flou progressivement (Glassmorphism)
      const newBlur = progress * 10; 

      // 4. Parallaxe : La carte descend moins vite que le scroll (elle "glisse")
      // Cela donne l'impression qu'elle est lourde et ancrée
      const newTranslateY = scrollY * 0.5;

      setStyle({
        opacity: newOpacity,
        scale: newScale,
        filter: `blur(${newBlur}px)`,
        translateY: newTranslateY, // Effet parallaxe
        pointerEvents: newOpacity < 0.1 ? 'none' : 'auto',
        display: 'block'
      });
    };

    // On attache l'écouteur
    window.addEventListener("scroll", handleScroll, { passive: true });
    
    // Initialisation
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    // On applique les styles calculés directement ici via l'attribut `style`
    <div 
        className="glass-card rounded-[28px] border border-slate-700/50 bg-slate-900/40 relative origin-top mb-6"
        style={{
            opacity: style.opacity,
            transform: `scale(${style.scale}) translateY(${style.translateY}px)`,
            filter: style.filter,
            pointerEvents: style.pointerEvents,
            display: style.display,
            // Transition uniquement sur le hover pour fluidité max du scroll
            transition: 'border 0.3s ease' 
        }}
    >
      <div className="absolute -top-6 -right-6 opacity-5 rotate-12"><LayoutDashboard size={150} /></div>
      
      {/* Contenu de la carte (identique) */}
      <div className="relative z-10 flex flex-col sm:flex-row justify-between items-center gap-6 p-6 sm:p-8">
        <div className="text-center sm:text-left">
          <h2 className="text-slate-500 uppercase text-[0.65rem] font-black tracking-[0.3em] mb-2">Moyenne Semestrielle</h2>
          <div className="flex items-baseline gap-2 justify-center sm:justify-start overflow-hidden">
            <span key={moyenneGeneraleStr} className="text-6xl sm:text-7xl font-black text-[#facc15] tracking-tighter drop-shadow-2xl">
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
                    onClick={() => setShowDetails(!showDetails)}
                    onMouseEnter={() => setShowDetails(true)}
                    onMouseLeave={() => setShowDetails(false)}
                  >
                      <div className={`flex items-center justify-center gap-2 text-lg sm:text-xl font-black uppercase tracking-tighter ${statutCss.replace('bg-', 'text-').split(' ')[2]}`}>
                         <span>{statutText}</span>
                         {reasons.length > 0 && (
                           <div className="bg-white/10 p-0.5 rounded-full hover:bg-white/20 transition-colors">
                             <Info size={14} className="opacity-80" strokeWidth={3} />
                           </div>
                         )}
                      </div>
                      
                      {/* Tooltip détails */}
                      <div className={`absolute left-1/2 -translate-x-1/2 top-full mt-3 w-56 sm:w-64 bg-[#0f172a] border border-slate-700 rounded-xl shadow-2xl p-3 z-50 transition-all duration-200 origin-top ${showDetails && reasons.length > 0 ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}`}>
                         <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#0f172a] border-t border-l border-slate-700 rotate-45"></div>
                         <p className="text-[10px] uppercase font-bold text-slate-500 mb-2 border-b border-slate-800 pb-1">Détails de validation</p>
                         <ul className="text-left space-y-1.5">
                             {reasons.map((reason, idx) => (
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
  );
}