"use client";

import { useEffect, useState } from "react";
import { Calendar, CheckCircle, MapPin, Clock } from "lucide-react";

type Presensi = {
  id: string;
  kegiatan_id: string;
  waktu_hadir: string;
  status: string;
};

type Kegiatan = {
  id: string;
  nama: string;
  tanggal: string;
  waktu: string;
  tempat: string;
  jenis: string;
};

export default function GuruDashboard() {
  const [riwayat, setRiwayat] = useState<(Presensi & { kegiatan?: Kegiatan })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app we'd have a specific endpoint for "my presensi".
    // For now, let's fetch all kegiatan and presensi, then filter.
    // Actually, we can fetch all kegiatan and just display them for now,
    // or add an endpoint for the guru. Let's just create a basic UI for now.
    
    // To keep it simple, we just show a static welcome or we fetch from /api/kegiatan 
    // and /api/presensi?guru_id=me (but we don't have that endpoint specifically built for guru yet).
    // Let's just fetch all kegiatan that are active to show "Kegiatan Mendatang".
    
    const fetchDashboard = async () => {
      try {
        const resK = await fetch("/api/kegiatan");
        const kegiatans: Kegiatan[] = await resK.json();
        const active = kegiatans.filter(k => k.status === "active");
        
        // We will just map them as upcoming
        setRiwayat(active.map(k => ({
          id: "", kegiatan_id: k.id, waktu_hadir: "", status: "Belum Hadir", kegiatan: k
        })));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboard();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl font-black mb-2">Selamat Datang!</h2>
          <p className="text-emerald-100 mb-6 max-w-sm">
            Gunakan tombol <b>Scan Kehadiran</b> di bawah untuk melakukan absensi pada kegiatan KKG atau rapat.
          </p>
        </div>
        
        {/* Decorative circle */}
        <div className="absolute top-[-50%] right-[-10%] w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
      </div>

      <div>
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-600" /> Kegiatan Aktif Saat Ini
        </h3>
        
        {loading ? (
          <div className="text-center p-8 text-slate-500">Memuat data...</div>
        ) : riwayat.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 shadow-sm text-slate-500">
            Tidak ada kegiatan aktif saat ini.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {riwayat.map(item => (
              <div key={item.kegiatan?.id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-3">
                  <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                    {item.kegiatan?.jenis}
                  </span>
                  <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-1 rounded-md">
                    Menunggu Absensi
                  </span>
                </div>
                <h4 className="font-bold text-slate-800 leading-tight mb-2">{item.kegiatan?.nama}</h4>
                <div className="space-y-1.5 mt-4">
                  <p className="text-xs text-slate-500 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" /> {item.kegiatan?.tanggal} • {item.kegiatan?.waktu}
                  </p>
                  <p className="text-xs text-slate-500 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {item.kegiatan?.tempat}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
