"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

// Interface untuk data agenda
export interface Agenda {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string;
  location: string;
  description: string;
  status: string;
  created_at: string;
}

// Fungsi untuk menentukan warna/kategori berdasarkan kata kunci judul
const getCategoryColor = (title: string) => {
  if (!title) return "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200";
  const t = title.toLowerCase();
  if (t.includes("libur")) return "bg-red-100 text-red-700 border-red-200 hover:bg-red-200";
  if (t.includes("ujian") || t.includes("penilaian") || t.includes("pts") || t.includes("pas") || t.includes("pat") || t.includes("sumatif")) return "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200";
  if (t.includes("rapat") || t.includes("kkg") || t.includes("kkm") || t.includes("pertemuan") || t.includes("mgmp")) return "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200";
  return "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200";
};

const getCategoryBadgeColor = (title: string) => {
  if (!title) return "bg-amber-500 hover:bg-amber-600";
  const t = title.toLowerCase();
  if (t.includes("libur")) return "bg-red-500 hover:bg-red-600";
  if (t.includes("ujian") || t.includes("penilaian") || t.includes("pts") || t.includes("pas") || t.includes("pat") || t.includes("sumatif")) return "bg-blue-500 hover:bg-blue-600";
  if (t.includes("rapat") || t.includes("kkg") || t.includes("kkm") || t.includes("pertemuan") || t.includes("mgmp")) return "bg-emerald-500 hover:bg-emerald-600";
  return "bg-amber-500 hover:bg-amber-600";
};

export default function CalendarView({ agendas }: { agendas: Agenda[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayEvents, setSelectedDayEvents] = useState<{date: Date, events: Agenda[]} | null>(null);

  // Menghitung data kalender
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-indexed

  // Hari pertama di bulan ini
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Minggu, 1 = Senin

  // Jumlah hari di bulan ini
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Jumlah hari di bulan sebelumnya
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  // Membuat Array Grid Kalender (42 sel = 6 baris x 7 kolom)
  const calendarDays = [];

  // 1. Hari-hari dari bulan sebelumnya (Padding awal)
  for (let i = 0; i < startingDayOfWeek; i++) {
    const day = daysInPrevMonth - startingDayOfWeek + i + 1;
    calendarDays.push({
      day,
      monthOffset: -1,
      date: new Date(currentYear, currentMonth - 1, day)
    });
  }

  // 2. Hari-hari bulan ini
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({
      day: i,
      monthOffset: 0,
      date: new Date(currentYear, currentMonth, i)
    });
  }

  // 3. Hari-hari dari bulan berikutnya (Padding akhir)
  const remainingCells = 42 - calendarDays.length;
  for (let i = 1; i <= remainingCells; i++) {
    calendarDays.push({
      day: i,
      monthOffset: 1,
      date: new Date(currentYear, currentMonth + 1, i)
    });
  }

  // Helper Functions
  const prevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];
  const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

  const getEventsForDate = (date: Date) => {
    // Memformat tanggal secara lokal tanpa offset UTC (YYYY-MM-DD)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;
    
    return agendas.filter(a => a.date === formattedDate);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };

  return (
    <div className="w-full bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
      
      {/* Header Controls */}
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/50 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-100 text-emerald-700 p-3 rounded-2xl">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800">
              {monthNames[currentMonth]} {currentYear}
            </h2>
            <p className="text-sm font-medium text-slate-500">Kalender Akademik Terpadu</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={goToToday}
            className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors mr-2"
          >
            Hari Ini
          </button>
          <button 
            onClick={prevMonth}
            className="p-2 text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-emerald-600 rounded-xl shadow-sm transition-all"
            aria-label="Bulan Sebelumnya"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={nextMonth}
            className="p-2 text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-emerald-600 rounded-xl shadow-sm transition-all"
            aria-label="Bulan Berikutnya"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Grid Label Hari */}
      <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
        {dayNames.map((day, i) => (
          <div key={day} className="py-3 text-center">
            <span className={`text-xs sm:text-sm font-bold uppercase tracking-wider ${i === 0 || i === 6 ? 'text-red-500' : 'text-slate-500'}`}>
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{day.slice(0,3)}</span>
            </span>
          </div>
        ))}
      </div>

      {/* Grid Kalender */}
      <div className="grid grid-cols-7 grid-rows-6">
        {calendarDays.map((cell, idx) => {
          const events = getEventsForDate(cell.date);
          const isCurrentMonth = cell.monthOffset === 0;
          const isWeekend = cell.date.getDay() === 0 || cell.date.getDay() === 6;
          const isDayToday = isToday(cell.date);

          return (
            <div 
              key={idx} 
              onClick={() => {
                if (events.length > 0) {
                  setSelectedDayEvents({ date: cell.date, events });
                }
              }}
              className={`
                min-h-[100px] sm:min-h-[120px] p-1 sm:p-2 border-r border-b border-slate-100 relative group transition-colors
                ${!isCurrentMonth ? 'bg-slate-50/50 text-slate-400' : 'bg-white'}
                ${events.length > 0 ? 'cursor-pointer hover:bg-slate-50' : ''}
              `}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={`
                  inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full text-sm sm:text-base font-semibold
                  ${isDayToday ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30' : ''}
                  ${!isDayToday && isWeekend && isCurrentMonth ? 'text-red-500' : ''}
                  ${!isDayToday && !isWeekend && isCurrentMonth ? 'text-slate-700' : ''}
                `}>
                  {cell.day}
                </span>
                
                {/* Indikator Titik (Mobile) */}
                <div className="flex sm:hidden gap-1 mt-2">
                  {events.slice(0,3).map(e => (
                    <div key={e.id} className={`w-1.5 h-1.5 rounded-full ${getCategoryBadgeColor(e.title).split(' ')[0]}`} />
                  ))}
                  {events.length > 3 && <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />}
                </div>
              </div>

              {/* Event Bars (Desktop) */}
              <div className="hidden sm:flex flex-col gap-1 mt-1">
                {events.slice(0, 3).map((event) => (
                  <div 
                    key={event.id} 
                    className={`text-[10px] sm:text-xs px-1.5 py-1 rounded border truncate font-medium transition-all group-hover:shadow-sm ${getCategoryColor(event.title)}`}
                    title={event.title}
                  >
                    {event.title}
                  </div>
                ))}
                {events.length > 3 && (
                  <div className="text-[10px] text-slate-500 font-medium px-1">
                    +{events.length - 3} lainnya
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legenda */}
      <div className="p-4 sm:p-6 bg-slate-50/50 flex flex-wrap gap-4 items-center justify-center sm:justify-start text-xs sm:text-sm font-medium text-slate-600 border-t border-slate-100 rounded-b-3xl">
        <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div> Libur Nasional</span>
        <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div> Ujian / Penilaian</span>
        <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> Rapat / KKG</span>
        <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500"></div> Acara Umum</span>
      </div>

      {/* Pop-up Dialog untuk Detail Acara */}
      <Dialog open={!!selectedDayEvents} onOpenChange={(open) => !open && setSelectedDayEvents(null)}>
        <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-emerald-600" />
              Agenda pada {selectedDayEvents?.date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </DialogTitle>
            <DialogDescription>
              Terdapat {selectedDayEvents?.events.length} agenda di hari ini.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {selectedDayEvents?.events.map((event) => (
              <Card key={event.id} className="border-slate-200 shadow-sm overflow-hidden relative">
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${getCategoryBadgeColor(event.title).split(' ')[0]}`} />
                <CardContent className="p-4 pl-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-slate-800 text-lg leading-tight">{event.title}</h3>
                    <Badge className={`ml-2 whitespace-nowrap ${getCategoryBadgeColor(event.title)}`}>
                      {event.status}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-col gap-2 mt-3 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span>{event.time || "Sepanjang Hari"}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span>{event.location}</span>
                      </div>
                    )}
                  </div>
                  
                  {event.description && (
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{event.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
