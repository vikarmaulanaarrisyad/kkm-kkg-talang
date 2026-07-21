export const revalidate = 60; // Cache selama 60 detik

import { Calendar } from "lucide-react";
import CalendarView from "@/components/CalendarView";
import prisma from "@/lib/prisma";

export const metadata = {
  title: "Agenda Kegiatan | KKM & KKG",
  description: "Jadwal dan Agenda Kegiatan Kelompok Kerja Madrasah (KKM) dan Kelompok Kerja Guru (KKG)",
};

import { unstable_cache } from "next/cache";

const getCachedAgendas = unstable_cache(
  async () => {
    try {
      const data = await prisma.agenda.findMany({
        orderBy: { date: 'desc' }
      });
      return data.map((a: any) => ({
        id: a.id,
        title: a.title,
        date: typeof a.date === 'string' ? a.date : a.date.toISOString(),
        time: a.time,
        location: a.location,
        description: a.description,
        status: a.status,
        created_at: a.created_at.toISOString()
      }));
    } catch (error) {
      console.error("Gagal mengambil data agenda:", error);
      return [];
    }
  },
  ['agenda-page-cache'],
  { revalidate: 300, tags: ['agenda'] }
);

async function getAgendas() {
  return await getCachedAgendas();
}

export default async function AgendaPage() {
  const agendas = await getAgendas();

  return (
    <main className="flex-grow flex flex-col w-full bg-slate-50 min-h-screen pb-20">
      <section className="w-full bg-gradient-to-br from-emerald-50 via-white to-emerald-100/50 pt-32 pb-24 px-4 sm:px-6 relative overflow-hidden">
        {/* Subtle Background Pattern/Glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 sm:w-96 sm:h-96 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 sm:w-96 sm:h-96 rounded-full bg-blue-100/40 blur-3xl" />
        
        <div className="max-w-4xl mx-auto relative z-10 text-center text-slate-800">
          <div className="w-16 h-16 bg-white/50 backdrop-blur-md rounded-2xl border border-white/40 flex items-center justify-center mx-auto mb-8 shadow-xl">
            <Calendar className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
            Kalender <span className="text-emerald-600">Akademik</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
            Jadwal kegiatan terbaru, libur nasional, ujian, dan acara penting Kelompok Kerja Madrasah (KKM) & Kelompok Kerja Guru (KKG).
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 -mt-10 relative z-20 w-full">
        <CalendarView agendas={agendas} />
      </div>
    </main>
  );
}
