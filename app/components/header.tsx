import { GraduationCap } from "lucide-react";

type HeaderProps = {
  isScrolled: boolean;
  moyenneGeneraleStr: string;
  statutCss: string;
  statutText: string;
};

export default function Header({ isScrolled, moyenneGeneraleStr, statutCss, statutText }: HeaderProps) {
  return (
    <header className={`sticky top-0 z-40 w-full border-b transition-all duration-500 ease-in-out ${isScrolled ? 'bg-[#0f172a]/90 backdrop-blur-lg border-slate-800 shadow-2xl py-2' : 'bg-transparent border-transparent py-4'}`}>
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 flex items-center justify-between">
          
          {/* GAUCHE : Logo (Reste toujours visible) */}
          <div className="flex items-center gap-2 shrink-0 transition-all duration-300">
              <div className={`p-1.5 rounded-lg shadow-lg transition-colors ${isScrolled ? 'bg-[#facc15]' : 'bg-[#facc15]'}`}>
                  <GraduationCap size={18} className="text-[#020617]" />
              </div>
              <span className="text-lg sm:text-xl font-black tracking-tighter uppercase text-[#facc15] block">
                SmartNote
              </span>
          </div>

          {/* DROITE : Moyenne (Apparait SEULEMENT quand on scroll) */}
          <div className={`flex items-center gap-3 sm:gap-4 transition-all duration-500 ease-out transform ${isScrolled ? 'opacity-100 translate-y-0 visible' : 'opacity-0 translate-y-4 invisible'}`}>
              <div className="text-right">
                  <p className="text-[7px] sm:text-[8px] uppercase font-black text-slate-500 leading-none mb-0.5">Moyenne</p>
                  <p className="text-xs sm:text-sm font-black text-[#facc15] leading-none">
                      {moyenneGeneraleStr}
                      <span className="text-[8px] sm:text-[10px] text-slate-600 ml-0.5">/20</span>
                  </p>
              </div>
              <div className={`flex items-center justify-center px-3 py-1 rounded-full border text-[9px] sm:text-[10px] font-black uppercase tracking-widest whitespace-nowrap min-w-[80px] text-center ${statutCss}`}>
                  {statutText}
              </div>
          </div>
      </div>
    </header>
  );
}