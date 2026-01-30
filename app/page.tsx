"use client";

import { useEffect, useState } from "react";
import Link from "next/link"; // Pour la navigation fluide
import { GraduationCap, ArrowRight, Sparkles, ShieldCheck, Zap, BarChart3 } from "lucide-react";

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);

  // Écouteur de scroll pour les effets parallaxe
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 overflow-x-hidden selection:bg-[#facc15] selection:text-[#020617]">
      
      {/* --- BACKGROUND ANIMÉ (GRILLE) --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />
      </div>

      {/* --- NAVBAR --- */}
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

        {/* --- SECTION HERO (PARALLAXE) --- */}
        <section className="h-screen flex flex-col items-center justify-center text-center px-4 relative">
            
            {/* Titre qui bouge moins vite que le scroll (Parallaxe) */}
            <div style={{ transform: `translateY(${scrollY * 0.5}px)`, opacity: 1 - scrollY / 700 }} className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-700 bg-slate-900/50 backdrop-blur-md mb-4 animate-fade-in-up">
                    <Sparkles size={12} className="text-[#facc15]" />
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Nouvelle Version 2.0</span>
                </div>
                
                <h1 className="text-5xl sm:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-600 pb-4">
                    L'excellence <br />
                    <span className="text-[#facc15]">Académique.</span>
                </h1>
                
                <p className="max-w-md mx-auto text-slate-400 text-sm sm:text-base leading-relaxed">
                    Ne laissez plus vos notes au hasard. Simulez, analysez et validez votre semestre avec une précision chirurgicale.
                </p>
            </div>

            {/* Bouton CTA qui reste un peu plus longtemps */}
            <div 
                className="mt-12"
                style={{ transform: `translateY(${scrollY * 0.2}px)`, opacity: 1 - scrollY / 500 }}
            >
                <Link href="/calculator" className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white text-[#020617] rounded-full font-black uppercase tracking-widest text-xs hover:scale-105 transition-transform duration-300">
                    Lancer le Calculateur
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    <div className="absolute inset-0 rounded-full ring-2 ring-white/20 group-hover:ring-white/50 transition-all scale-110 opacity-0 group-hover:opacity-100" />
                </Link>
            </div>

        </section>


        {/* --- SECTION FEATURES (SCROLL REVEAL) --- */}
        <section className="py-32 px-4 relative">
            <div className="max-w-5xl mx-auto space-y-32">
                
                {/* Feature 1 */}
                <div className="flex flex-col md:flex-row items-center gap-12 group">
                    <div className="flex-1 space-y-4 text-left transition-all duration-700 transform translate-y-10 opacity-0 group-hover:opacity-100 group-hover:translate-y-0" style={{ opacity: scrollY > 200 ? 1 : 0, transform: `translateY(${scrollY > 200 ? 0 : 50}px)`, transition: 'all 1s ease' }}>
                        <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 mb-4 border border-blue-500/20">
                            <Zap size={24} />
                        </div>
                        <h2 className="text-3xl font-black uppercase tracking-tighter">Simulation <span className="text-blue-400">Temps Réel</span></h2>
                        <p className="text-slate-400 leading-relaxed">
                            Ajustez vos coefficients, faites varier vos notes cibles et voyez instantanément l'impact sur votre moyenne générale. Un algorithme puissant au bout des doigts.
                        </p>
                    </div>
                    <div className="flex-1 h-64 w-full bg-gradient-to-tr from-slate-900 to-slate-800 rounded-[32px] border border-slate-700/50 shadow-2xl flex items-center justify-center relative overflow-hidden" style={{ transform: `scale(${scrollY > 200 ? 1 : 0.9})`, transition: 'transform 1s cubic-bezier(0.2, 0.8, 0.2, 1)' }}>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,#3b82f6_0%,transparent_50%)] opacity-20" />
                        <span className="text-6xl font-black text-slate-700/50 select-none">/20</span>
                    </div>
                </div>

                {/* Feature 2 (Inversé) */}
                <div className="flex flex-col md:flex-row-reverse items-center gap-12">
                    <div className="flex-1 space-y-4 text-left transition-all duration-700" style={{ opacity: scrollY > 500 ? 1 : 0, transform: `translateY(${scrollY > 500 ? 0 : 50}px)`, transition: 'all 1s ease' }}>
                        <div className="w-12 h-12 bg-[#facc15]/10 rounded-2xl flex items-center justify-center text-[#facc15] mb-4 border border-[#facc15]/20">
                            <ShieldCheck size={24} />
                        </div>
                        <h2 className="text-3xl font-black uppercase tracking-tighter">Données <span className="text-[#facc15]">Sécurisées</span></h2>
                        <p className="text-slate-400 leading-relaxed">
                            Rien ne part dans le cloud. Vos notes sont stockées localement sur votre appareil. Confidentialité totale, performance maximale.
                        </p>
                    </div>
                    <div className="flex-1 h-64 w-full bg-gradient-to-bl from-slate-900 to-slate-800 rounded-[32px] border border-slate-700/50 shadow-2xl flex items-center justify-center relative overflow-hidden" style={{ transform: `scale(${scrollY > 500 ? 1 : 0.9})`, transition: 'transform 1s cubic-bezier(0.2, 0.8, 0.2, 1)' }}>
                         <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#facc15_0%,transparent_50%)] opacity-10" />
                         <ShieldCheck size={80} className="text-slate-700/50" />
                    </div>
                </div>

                 {/* Feature 3 */}
                 <div className="flex flex-col md:flex-row items-center gap-12 group">
                    <div className="flex-1 space-y-4 text-left transition-all duration-700" style={{ opacity: scrollY > 800 ? 1 : 0, transform: `translateY(${scrollY > 800 ? 0 : 50}px)`, transition: 'all 1s ease' }}>
                        <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-400 mb-4 border border-green-500/20">
                            <BarChart3 size={24} />
                        </div>
                        <h2 className="text-3xl font-black uppercase tracking-tighter">Stratégie <span className="text-green-400">Pédagogique</span></h2>
                        <p className="text-slate-400 leading-relaxed">
                            Définissez votre niveau de confiance par matière. L'outil répartit intelligemment les points manquants pour optimiser vos efforts de révision.
                        </p>
                    </div>
                    <div className="flex-1 h-64 w-full bg-gradient-to-br from-slate-900 to-slate-800 rounded-[32px] border border-slate-700/50 shadow-2xl flex items-center justify-center relative overflow-hidden" style={{ transform: `scale(${scrollY > 800 ? 1 : 0.9})`, transition: 'transform 1s cubic-bezier(0.2, 0.8, 0.2, 1)' }}>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_50%,#22c55e_0%,transparent_50%)] opacity-10" />
                        <div className="flex gap-2 items-end">
                            <div className="w-4 h-12 bg-slate-700 rounded-t-sm" />
                            <div className="w-4 h-20 bg-slate-600 rounded-t-sm" />
                            <div className="w-4 h-16 bg-[#facc15] rounded-t-sm shadow-[0_0_15px_#facc15]" />
                            <div className="w-4 h-24 bg-slate-500 rounded-t-sm" />
                        </div>
                    </div>
                </div>

            </div>
        </section>

        {/* --- FOOTER CTA --- */}
        <section className="py-20 pb-32 text-center">
            <div className="max-w-2xl mx-auto px-6">
                <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter mb-8">Prêt à réussir ?</h2>
                <Link href="/calculator" className="inline-block px-10 py-5 bg-[#facc15] text-[#020617] rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-white hover:scale-105 transition-all duration-300 shadow-[0_0_40px_rgba(250,204,21,0.3)]">
                    Commencer maintenant
                </Link>
            </div>
        </section>

        {/* Footer simple */}
        <footer className="border-t border-slate-800 py-8 text-center text-[10px] text-slate-600 uppercase tracking-widest">
            © {new Date().getFullYear()} SmartNote • Roméo & Mathis
        </footer>

      </main>
    </div>
  );
}