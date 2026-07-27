"use client";

import { useState, useEffect } from "react";
import { Clock, AlertCircle } from "lucide-react";

export default function DeadlineWidget() {
  const [deadlines, setDeadlines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    // Fetch upcoming deadlines
    const fetchDeadlines = async () => {
      try {
        const res = await fetch("/api/deadlines");
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          // Take the top 3 closest deadlines
          setDeadlines(json.data.slice(0, 3));
        }
      } catch (error) {
        console.error("Failed to fetch deadlines", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeadlines();

    // Setup timer to update the countdown every minute (or second, let's do minute to save render cycle)
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  if (loading) return null;
  if (deadlines.length === 0) return null; // Hide widget if no upcoming deadlines

  const calculateTimeLeft = (targetDate: string) => {
    const difference = new Date(targetDate).getTime() - now.getTime();
    
    if (difference <= 0) return { days: 0, hours: 0, minutes: 0, expired: true };

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      expired: false
    };
  };

  return (
    <div className="w-full bg-white border border-amber-200 shadow-lg rounded-2xl overflow-hidden mb-8">
      <div className="bg-linear-to-r from-amber-500 to-orange-500 p-4 text-white flex items-center gap-3">
        <AlertCircle className="w-6 h-6 animate-pulse" />
        <h3 className="font-bold text-lg">Pengingat Penting (Cut-off)</h3>
      </div>
      
      <div className="divide-y divide-slate-100">
        {deadlines.map((deadline) => {
          const timeLeft = calculateTimeLeft(deadline.date);
          const isCritical = timeLeft.days <= 3 && !timeLeft.expired;

          return (
            <div key={deadline.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isCritical ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                    {deadline.category}
                  </span>
                </div>
                <h4 className="font-bold text-slate-800 text-lg leading-tight">{deadline.title}</h4>
                {deadline.description && <p className="text-sm text-slate-500 mt-1">{deadline.description}</p>}
                <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                  Batas Akhir: {new Date(deadline.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })} WIB
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                {timeLeft.expired ? (
                  <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-2 rounded-xl text-sm font-bold text-center">
                    WAKTU HABIS
                  </div>
                ) : (
                  <div className={`flex gap-2 text-center ${isCritical ? 'text-red-600' : 'text-amber-600'}`}>
                    <div className={`bg-white border rounded-xl w-16 h-16 flex flex-col items-center justify-center shadow-sm ${isCritical ? 'border-red-200' : 'border-amber-200'}`}>
                      <span className="text-xl font-black">{timeLeft.days}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider">Hari</span>
                    </div>
                    <div className={`bg-white border rounded-xl w-16 h-16 flex flex-col items-center justify-center shadow-sm ${isCritical ? 'border-red-200' : 'border-amber-200'}`}>
                      <span className="text-xl font-black">{timeLeft.hours}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider">Jam</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
