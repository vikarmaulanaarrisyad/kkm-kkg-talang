"use client";

import React, { useEffect, useState, useRef } from "react";
import { Users, School, BookOpen, Trophy } from "lucide-react";

function CountUp({ end, suffix = "", duration = 2500 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const countRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          let startTimestamp: number | null = null;
          const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            // Ease-out cubic formula for smoother slowdown at the end
            const easeOutProgress = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(easeOutProgress * end));
            
            if (progress < 1) {
              window.requestAnimationFrame(step);
            }
          };
          window.requestAnimationFrame(step);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    if (countRef.current) {
      observer.observe(countRef.current);
    }
    
    return () => observer.disconnect();
  }, [end, duration]);

  return <div ref={countRef}>{count}{suffix}</div>;
}

export default function StatistikSection({ 
  totalGuru = 0,
  totalMadrasah = 0,
  totalSiswa = 0,
  totalKegiatanSelesai = 0
}: { 
  totalGuru?: number;
  totalMadrasah?: number;
  totalSiswa?: number;
  totalKegiatanSelesai?: number;
}) {
  const stats = [
    { label: "Madrasah Anggota", value: totalMadrasah, icon: School, color: "text-emerald-400", suffix: "" },
    { label: "Guru & Tendik", value: totalGuru, icon: Users, color: "text-blue-400", suffix: "" },
    { label: "Siswa Dibina", value: totalSiswa, icon: BookOpen, color: "text-amber-400", suffix: "" },
    { label: "Kegiatan Selesai", value: totalKegiatanSelesai, icon: Trophy, color: "text-rose-400", suffix: "" },
  ];

  return (
    <section className="w-full relative z-20 py-20 px-4 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="bg-slate-900 rounded-[2.5rem] p-8 sm:p-12 relative overflow-hidden shadow-2xl shadow-slate-900/20 border border-slate-800">
          
          {/* Decorative background gradients */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 relative z-10">
            {stats.map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center text-center group">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 border border-white/10 backdrop-blur-sm shadow-inner">
                  <stat.icon className={`w-8 h-8 ${stat.color} group-hover:text-white transition-colors`} />
                </div>
                <div className="text-4xl sm:text-5xl font-black text-white mb-3 tracking-tight flex items-center justify-center">
                  <CountUp end={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
