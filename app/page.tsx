"use client";

import { useEffect, useState } from "react";
import Link from "next/link"; 
import { GraduationCap, ArrowRight, Sparkles, ShieldCheck, Zap, BarChart3 } from "lucide-react";

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 overflow-x-hidden selection:bg-[#facc15] selection:text-[#020617]">
      
      {/* BACKGROUND GRID (Subtil) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />
      </div>

      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 px-6 py-6 flex justify-between items-center mix-blend-difference">
        <div className="flex items-center gap-2">
            <div className="bg-[#facc15] p-1 rounded-lg">
                <GraduationCap size={16} className="text-[#020617]" />
            </div>
            <span className="font-bold tracking-tighter uppercase text-white">SmartNote</span>
        </div>
        <Link href="/calculator" className="text-xs font-bold uppercase tracking-widest hover:text-[#facc15] transition-colors">
            Accéder à l'app
        </Link>
      </nav>

      <main className="relative z-10">

        {/* --- HERO SECTION --- */}
        <section className="h-screen flex flex-col items-center justify-center text-center px-4 relative">
            {/* Parallaxe sur le texte */}
            <div style={{ transform: `translateY(${scrollY * 0.4}px)`, opacity: 1 - scrollY / 600 }} className="space-y-6 max-w-4xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-700 bg-slate-900/50 backdrop-blur-md mb-4 animate-fade-in-up">
                    <Sparkles size={12} className="text-[#facc15]" />
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Nouvelle Version 2.0</span>
                </div>
                
                <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-600 pb-4 leading-[0.9]">
                    L'excellence <br />
                    <span className="text-[#facc15]">Académique.</span>
                </h1>
                
                <p className="max-w-md mx-auto text-slate-400 text-sm sm:text-base leading-relaxed px-4">
                    Ne laissez plus vos notes au hasard. Simulez, analysez et validez votre semestre avec une précision chirurgicale.
                </p>
            </div>

            {/* Bouton CTA */}
            <div 
                className="mt-12"
                style={{ transform: `translateY(${scrollY * 0.2}px)`, opacity: 1 - scrollY / 400 }}
            >
                <Link href="/calculator" className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white text-[#020617] rounded-full font-black uppercase tracking-widest text-xs hover:scale-105 transition-transform duration-300 shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                    Lancer le Calculateur
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
        </section>


        {/* --- FEATURES (STYLE BENTO CARDS) --- */}
        <section className="py-20 px-4 relative">
            <div className="max-w-4xl mx-auto space-y-8">
                
                {/* CARD 1 : SIMULATION */}
                <div 
                    className="group relative overflow-hidden rounded-[40px] bg-slate-900/40 border border-slate-800 backdrop-blur-sm transition-all duration-700"
                    style={{ 
                        opacity: scrollY > 100 ? 1 : 0, 
                        transform: `translateY(${scrollY > 100 ? 0 : 50}px) scale(${scrollY > 100 ? 1 : 0.95})` 
                    }}
                >
                    {/* Contenu Texte */}
                    <div className="p-8 md:p-12 relative z-20">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 mb-4 border border-blue-500/20">
                            <Zap size={20} />
                        </div>
                        <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter mb-2">Simulation <span className="text-blue-400">Temps Réel</span></h2>
                        <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-lg">
                            Ajustez vos coefficients et faites varier vos notes cibles. Voyez l'impact instantanément sur votre moyenne.
                        </p>
                    </div>

                    {/* Visuel "Intégré" en bas */}
                    <div className="relative h-48 md:h-64 w-full mt-[-20px] md:mt-[-40px] z-10 overflow-hidden mask-gradient-bottom">
                        <div className="absolute inset-x-0 bottom-0 top-10 bg-gradient-to-t from-blue-900/20 to-transparent opacity-50" />
                        {/* Simulation d'interface */}
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-[-20px] w-[80%] h-full bg-[#0f172a] border border-slate-700 rounded-t-3xl shadow-2xl flex flex-col items-center pt-8 transform group-hover:translate-y-[-10px] transition-transform duration-500">
                             <span className="text-6xl font-black text-blue-500/80 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">14.5</span>
                             <span className="text-xs font-bold uppercase text-slate-500 tracking-widest mt-2">Moyenne Projetée</span>
                        </div>
                    </div>
                </div>


                {/* CARD 2 : SÉCURITÉ */}
                <div 
                    className="group relative overflow-hidden rounded-[40px] bg-slate-900/40 border border-slate-800 backdrop-blur-sm transition-all duration-700 delay-100"
                    style={{ 
                        opacity: scrollY > 400 ? 1 : 0, 
                        transform: `translateY(${scrollY > 400 ? 0 : 50}px) scale(${scrollY > 400 ? 1 : 0.95})` 
                    }}
                >
                    <div className="flex flex-col md:flex-row-reverse items-center">
                        <div className="p-8 md:p-12 flex-1 relative z-20">
                            <div className="w-10 h-10 bg-[#facc15]/20 rounded-xl flex items-center justify-center text-[#facc15] mb-4 border border-[#facc15]/20">
                                <ShieldCheck size={20} />
                            </div>
                            <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter mb-2">100% <span className="text-[#facc15]">Privé</span></h2>
                            <p className="text-slate-400 text-sm md:text-base leading-relaxed">
                                Aucune donnée ne quitte votre téléphone. Tout est stocké localement dans votre navigateur.
                            </p>
                        </div>
                        
                        {/* Visuel Cadenas */}
                        <div className="flex-1 w-full h-48 md:h-full flex items-center justify-center relative">
                             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#facc15_0%,transparent_60%)] opacity-5" />
                             <ShieldCheck size={80} className="text-slate-700 group-hover:text-[#facc15] transition-colors duration-500" strokeWidth={1} />
                        </div>
                    </div>
                </div>


                {/* CARD 3 : STRATÉGIE (Format compact) */}
                <div 
                    className="group relative overflow-hidden rounded-[40px] bg-slate-900/40 border border-slate-800 backdrop-blur-sm transition-all duration-700 delay-200"
                    style={{ 
                        opacity: scrollY > 700 ? 1 : 0, 
                        transform: `translateY(${scrollY > 700 ? 0 : 50}px) scale(${scrollY > 700 ? 1 : 0.95})` 
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-green-900/10 pointer-events-none" />
                    
                    <div className="p-8 md:p-12 relative z-20 text-center">
                        <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center text-green-400 mb-6 border border-green-500/20 mx-auto">
                            <BarChart3 size={24} />
                        </div>
                        <h2 className="text-3xl font-black uppercase tracking-tighter mb-4">Stratégie <span className="text-green-400">Pédagogique</span></h2>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-lg mx-auto mb-8">
                            Définissez votre niveau de confiance. L'outil répartit les points manquants pour optimiser vos révisions là où ça compte.
                        </p>
                        
                        {/* Visuel Graphique minimaliste */}
                        <div className="flex justify-center gap-3 items-end h-24 pb-4">
                            <div className="w-6 h-12 bg-slate-700/50 rounded-t-lg group-hover:h-16 transition-all duration-500 delay-75" />
                            <div className="w-6 h-16 bg-slate-600/50 rounded-t-lg group-hover:h-20 transition-all duration-500 delay-100" />
                            <div className="w-6 h-20 bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.4)] rounded-t-lg group-hover:h-24 transition-all duration-500" />
                            <div className="w-6 h-10 bg-slate-800/50 rounded-t-lg group-hover:h-14 transition-all duration-500 delay-150" />
                        </div>
                    </div>
                </div>

            </div>
        </section>

        {/* --- FOOTER CTA --- */}
        <section className="py-20 pb-32 text-center px-6">
            <div className="max-w-xl mx-auto">
                <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tighter mb-8 text-white">Prêt à réussir ?</h2>
                <Link href="/calculator" className="inline-flex items-center justify-center w-full sm:w-auto px-10 py-5 bg-[#facc15] text-[#020617] rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-white hover:scale-105 transition-all duration-300 shadow-[0_0_40px_rgba(250,204,21,0.2)]">
                    Ouvrir SmartNote
                </Link>
            </div>
        </section>

        <footer className="border-t border-slate-800 py-8 text-center text-[10px] text-slate-600 uppercase tracking-widest">
            © {new Date().getFullYear()} SmartNote • Roméo & Mathis
        </footer>

      </main>
    </div>
  );
}