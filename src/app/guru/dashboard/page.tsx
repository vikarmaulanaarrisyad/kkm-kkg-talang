"use client";

import { useEffect, useState } from "react";
import { Calendar, CheckCircle, MapPin, Download, Award } from "lucide-react";
import jsPDF from "jspdf";
import { useSession } from "next-auth/react";

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
  status: string;
};

export default function GuruDashboard() {
  const { data: session } = useSession();
  const [aktif, setAktif] = useState<Kegiatan[]>([]);
  const [riwayat, setRiwayat] = useState<(Presensi & { kegiatan?: Kegiatan })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [resK, resP] = await Promise.all([
          fetch("/api/kegiatan"),
          fetch("/api/presensi?guru_id=me")
        ]);
        
        const kegiatans: Kegiatan[] = await resK.json();
        const presensis: Presensi[] = await resP.json();
        
        const activeKegiatan = kegiatans.filter(k => k.status === "active");
        setAktif(activeKegiatan);
        
        // Map history
        const historyData = presensis.map(p => {
          const k = kegiatans.find(kg => kg.id === p.kegiatan_id);
          return { ...p, kegiatan: k };
        }).filter(h => h.kegiatan); // only show if kegiatan still exists
        
        setRiwayat(historyData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboard();
  }, []);

  const downloadSertifikat = (item: Presensi & { kegiatan?: Kegiatan }) => {
    if (!item.kegiatan || !session?.user) return;
    const guruName = session.user.name || "Guru";
    const k = item.kegiatan;

    const doc = new jsPDF({ orientation: "landscape", format: "a4" });
    
    // Border
    doc.setDrawColor(16, 185, 129); // emerald-500
    doc.setLineWidth(5);
    doc.rect(10, 10, 277, 190);
    
    // Inner border
    doc.setLineWidth(1);
    doc.rect(15, 15, 267, 180);

    // Title
    doc.setTextColor(16, 185, 129);
    doc.setFont("times", "bold");
    doc.setFontSize(32);
    doc.text("SERTIFIKAT KEIKUTSERTAAN", 148.5, 50, { align: "center" });

    doc.setTextColor(50, 50, 50);
    doc.setFontSize(14);
    doc.setFont("times", "normal");
    doc.text("Diberikan Kepada:", 148.5, 75, { align: "center" });

    // Name
    doc.setFont("times", "bold");
    doc.setFontSize(26);
    doc.text(guruName.toUpperCase(), 148.5, 95, { align: "center" });
    
    // Line under name
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(70, 100, 227, 100);

    // Description
    doc.setFont("times", "normal");
    doc.setFontSize(14);
    doc.text(`Atas partisipasinya sebagai peserta aktif dalam kegiatan:`, 148.5, 115, { align: "center" });

    doc.setFont("times", "bold");
    doc.setFontSize(18);
    doc.text(k.nama, 148.5, 130, { align: "center" });
    
    doc.setFontSize(12);
    doc.setFont("times", "normal");
    doc.text(`Yang diselenggarakan pada tanggal ${k.tanggal} bertempat di ${k.tempat}`, 148.5, 145, { align: "center" });

    // Footer/Signatures
    doc.setFontSize(12);
    doc.text("Mengetahui,", 220, 165, { align: "center" });
    doc.setFont("times", "bold");
    doc.text("Ketua KKG MI Talang", 220, 185, { align: "center" });

    doc.save(`Sertifikat_${k.nama.replace(/\s+/g, "_")}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl font-black mb-2">Selamat Datang!</h2>
          <p className="text-emerald-100 mb-6 max-w-sm">
            Gunakan menu <b>Scan Kehadiran</b> di bawah untuk melakukan absensi.
          </p>
        </div>
        <div className="absolute top-[-50%] right-[-10%] w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
      </div>

      {/* Kegiatan Aktif */}
      <div>
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-600" /> Kegiatan Aktif Saat Ini (Menunggu Scan)
        </h3>
        
        {loading ? (
          <div className="text-center p-8 text-slate-500">Memuat data...</div>
        ) : aktif.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 shadow-sm text-slate-500">
            Tidak ada kegiatan yang sedang membuka scan absensi saat ini.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {aktif.map(item => (
              <div key={item.id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm border-l-4 border-l-emerald-500">
                <div className="flex justify-between items-start mb-3">
                  <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                    {item.jenis}
                  </span>
                  <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-md animate-pulse">
                    Scan Terbuka
                  </span>
                </div>
                <h4 className="font-bold text-slate-800 leading-tight mb-2">{item.nama}</h4>
                <div className="space-y-1.5 mt-4">
                  <p className="text-xs text-slate-500 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" /> {item.tanggal} • {item.waktu}
                  </p>
                  <p className="text-xs text-slate-500 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {item.tempat}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Histori & Sertifikat */}
      <div>
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 mt-8">
          <Award className="w-5 h-5 text-blue-600" /> Histori Kehadiran & Sertifikat
        </h3>
        
        {loading ? (
          <div className="text-center p-8 text-slate-500">Memuat data...</div>
        ) : riwayat.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-100 shadow-sm text-slate-500">
            Anda belum memiliki riwayat kehadiran.
          </div>
        ) : (
          <div className="space-y-4">
            {riwayat.map(item => (
              <div key={item.id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                      {item.kegiatan?.jenis}
                    </span>
                    <span className="text-xs text-slate-500"><CheckCircle className="w-3 h-3 inline text-emerald-500" /> Hadir pada {new Date(item.waktu_hadir).toLocaleTimeString("id-ID", {hour: "2-digit", minute:"2-digit"})}</span>
                  </div>
                  <h4 className="font-bold text-slate-800 leading-tight">{item.kegiatan?.nama}</h4>
                  <p className="text-xs text-slate-500 mt-1">{item.kegiatan?.tanggal} • {item.kegiatan?.tempat}</p>
                </div>
                
                <button onClick={() => downloadSertifikat(item)} className="w-full sm:w-auto bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 shrink-0">
                  <Download className="w-4 h-4" /> Unduh Sertifikat
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
