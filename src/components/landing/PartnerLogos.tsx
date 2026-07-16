"use client";

import React from "react";
import { Building2, GraduationCap, School, Landmark, Ribbon, Users } from "lucide-react";

export default function PartnerLogos() {
  const partners = [
    { name: "Kementerian Agama", icon: Landmark, color: "text-emerald-700", bg: "bg-emerald-50" },
    { name: "KKG MI", icon: Users, color: "text-blue-700", bg: "bg-blue-50" },
    { name: "Madrasah Hebat Bermartabat", icon: School, color: "text-amber-700", bg: "bg-amber-50" },
    { name: "Kurikulum Merdeka", icon: GraduationCap, color: "text-rose-700", bg: "bg-rose-50" },
    { name: "K3MI", icon: Building2, color: "text-purple-700", bg: "bg-purple-50" },
    { name: "Pendidikan Madrasah", icon: Ribbon, color: "text-indigo-700", bg: "bg-indigo-50" },
  ];

  return (
    <section className="w-full py-12 bg-white border-t border-slate-100 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 mb-8 text-center relative z-10">
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Sinergi & Kemitraan Bersama</p>
      </div>
      
      {/* Marquee Container */}
      <div className="relative flex overflow-x-hidden group">
        
        {/* Fade gradients on left and right for smooth entry/exit */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

        {/* Track 1 */}
        <div className="animate-marquee flex whitespace-nowrap items-center group-hover:[animation-play-state:paused]">
          {partners.map((partner, index) => (
            <div key={index} className="mx-6 sm:mx-10 flex items-center gap-3 grayscale hover:grayscale-0 transition-all opacity-70 hover:opacity-100 cursor-default">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${partner.bg}`}>
                <partner.icon className={`w-6 h-6 ${partner.color}`} />
              </div>
              <span className="text-lg font-bold text-slate-700">{partner.name}</span>
            </div>
          ))}
          {partners.map((partner, index) => (
            <div key={`dup1-${index}`} className="mx-6 sm:mx-10 flex items-center gap-3 grayscale hover:grayscale-0 transition-all opacity-70 hover:opacity-100 cursor-default">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${partner.bg}`}>
                <partner.icon className={`w-6 h-6 ${partner.color}`} />
              </div>
              <span className="text-lg font-bold text-slate-700">{partner.name}</span>
            </div>
          ))}
        </div>

        {/* Track 2 (absolute positioned to follow immediately after track 1) */}
        <div className="absolute top-0 animate-marquee2 flex whitespace-nowrap items-center group-hover:[animation-play-state:paused]">
          {partners.map((partner, index) => (
            <div key={`dup2-${index}`} className="mx-6 sm:mx-10 flex items-center gap-3 grayscale hover:grayscale-0 transition-all opacity-70 hover:opacity-100 cursor-default">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${partner.bg}`}>
                <partner.icon className={`w-6 h-6 ${partner.color}`} />
              </div>
              <span className="text-lg font-bold text-slate-700">{partner.name}</span>
            </div>
          ))}
          {partners.map((partner, index) => (
            <div key={`dup3-${index}`} className="mx-6 sm:mx-10 flex items-center gap-3 grayscale hover:grayscale-0 transition-all opacity-70 hover:opacity-100 cursor-default">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${partner.bg}`}>
                <partner.icon className={`w-6 h-6 ${partner.color}`} />
              </div>
              <span className="text-lg font-bold text-slate-700">{partner.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
