"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, CheckCircle, MapPin, Download, Award, Pointer, Quote, ArrowRight } from "lucide-react";
import { useSession } from "next-auth/react";
import Swal from "sweetalert2";
import jsPDF from "jspdf";

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
  const [madrasahName, setMadrasahName] = useState<string>("");
  const [guruDetail, setGuruDetail] = useState<any>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [resK, resP] = await Promise.all([
          fetch("/api/kegiatan"),
          fetch("/api/presensi?guru_id=me")
        ]);
        
        const kegiatansData = await resK.json();
        const presensisData = await resP.json();
        
        const kegiatans: Kegiatan[] = Array.isArray(kegiatansData) ? kegiatansData : [];
        const presensis: Presensi[] = Array.isArray(presensisData) ? presensisData : [];
        
        // Ambil info Madrasah dan Guru jika memungkinkan
        if (session && (session.user as any)?.madrasahId) {
          fetch(`/api/madrasah/${(session.user as any).madrasahId}`)
            .then(r => r.ok ? r.json() : null)
            .then(data => {
              if (data && data.nama) setMadrasahName(data.nama);
            }).catch(() => {});
            
          fetch(`/api/guru`)
            .then(r => r.ok ? r.json() : [])
            .then(gurus => {
              const myId = (session.user as any).id;
              const me = gurus.find((g: any) => g.id === myId || g.peg_id === myId || g.nip === myId);
              if (me) setGuruDetail(me);
            }).catch(() => {});
        }
        
        const activeKegiatan = kegiatans.filter(k => k.status === "active");
        setAktif(activeKegiatan);
        
        // Map history
        const historyData = presensis.map(p => {
          const k = kegiatans.find(kg => kg.id === p.kegiatan_id);
          return { ...p, kegiatan: k };
        }).filter(h => h.kegiatan); // only show if kegiatan still exists
        
        setRiwayat(historyData);
      } catch (e) {
        console.error("Dashboard fetch error:", e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboard();
  }, []);

  const handleHadirDirect = async (kegiatan_id: string) => {
    try {
      Swal.fire({ title: "Mencatat kehadiran...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      const res = await fetch("/api/presensi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kegiatan_id })
      });
      const json = await res.json();
      
      if (res.ok) {
        Swal.fire("Berhasil", "Kehadiran Anda telah dicatat", "success").then(() => {
          window.location.reload();
        });
      } else {
        Swal.fire("Gagal", json.error || "Gagal mencatat kehadiran", "error");
      }
    } catch (e: any) {
      Swal.fire("Gagal", e.message || "Terjadi kesalahan", "error");
    }
  };

  const downloadSertifikat = (item: Presensi & { kegiatan?: Kegiatan }) => {
    if (!item.kegiatan || !session?.user) return;
    const guruName = session.user.name || "Guru";
    const k = item.kegiatan;

    const doc = new jsPDF({ orientation: "landscape", format: "a4" });
    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();

    // Background Base
    doc.setFillColor(250, 252, 251);
    doc.rect(0, 0, width, height, "F");

    // Modern Geometric Header (Emerald Green)
    doc.setFillColor(16, 185, 129); // emerald-500
    doc.rect(0, 0, width, 40, "F");
    doc.triangle(0, 40, width, 40, 0, 60, "F");

    // Accent Ribbon (Gold/Amber)
    doc.setFillColor(245, 158, 11); // amber-500
    // A quadrilateral made of 2 triangles
    doc.triangle(0, 60, width, 40, width, 45, "F");
    doc.triangle(0, 60, width, 45, 0, 65, "F");

    // Decorative Bottom Right Corner
    doc.setFillColor(209, 250, 229); // emerald-100
    doc.triangle(width, height - 80, width, height, width - 80, height, "F");
    doc.setFillColor(16, 185, 129); // emerald-500
    doc.triangle(width, height - 40, width, height, width - 40, height, "F");

    // Decorative Top Left Corner (over the header)
    doc.setFillColor(255, 255, 255);
    (doc as any).setGState(new (doc as any).GState({ opacity: 0.15 }));
    doc.circle(0, 0, 40, "F");
    doc.circle(20, -10, 60, "F");
    (doc as any).setGState(new (doc as any).GState({ opacity: 1 }));

    // --- TEXT CONTENT ---
    
    // Header Text
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(38);
    doc.text("SERTIFIKAT", width / 2, 28, { align: "center" });
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text("KEIKUTSERTAAN", width / 2, 38, { align: "center" });

    // Main Content
    doc.setTextColor(100, 116, 139); // slate-500
    doc.setFontSize(14);
    doc.setFont("helvetica", "italic");
    doc.text("Diberikan dengan bangga kepada:", width / 2, 95, { align: "center" });

    // Participant Name
    doc.setTextColor(15, 23, 42); // slate-900
    doc.setFont("helvetica", "bold");
    doc.setFontSize(32);
    doc.text(guruName.toUpperCase(), width / 2, 115, { align: "center" });
    
    // Line under name
    doc.setDrawColor(245, 158, 11); // amber-500
    doc.setLineWidth(1.5);
    doc.line(width / 2 - 60, 122, width / 2 + 60, 122);

    // Event Description
    doc.setTextColor(71, 85, 105); // slate-600
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text("Atas partisipasinya sebagai peserta aktif dalam kegiatan:", width / 2, 138, { align: "center" });

    doc.setTextColor(16, 185, 129); // emerald-500
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    const splitTitle = doc.splitTextToSize(k.nama, 200);
    doc.text(splitTitle, width / 2, 150, { align: "center" });
    
    // Event Details
    doc.setTextColor(100, 116, 139); // slate-500
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    const detailsY = 150 + (splitTitle.length * 8) + 5;
    doc.text(`Diselenggarakan pada ${k.tanggal} bertempat di ${k.tempat}`, width / 2, detailsY, { align: "center" });

    // Signatures
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.text("Mengetahui,", 230, height - 45, { align: "center" });
    doc.setFont("helvetica", "bold");
    doc.text("Ketua KKM / KKG", 230, height - 20, { align: "center" });
    
    // Signature Line
    doc.setDrawColor(100, 116, 139);
    doc.setLineWidth(0.5);
    doc.line(195, height - 25, 265, height - 25);

    // Download
    doc.save(`Sertifikat_${guruName.replace(/\s+/g, "_")}.pdf`);
  };

  const downloadKTA = async () => {
    if (!session?.user) return;
    const guruName = session.user.name || "Guru";
    const madrasah = madrasahName || "MI TALANG";
    const identitas = guruDetail?.peg_id || guruDetail?.nip || (session.user as any).id || "Anggota KKG";
    
    // CR-80 standard size: 85.6 mm x 53.98 mm
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: [85.6, 53.98] });
    const width = 85.6;
    const height = 53.98;

    // Background
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, width, height, "F");

    // Header Polygon (Emerald)
    doc.setFillColor(16, 185, 129); // emerald-500
    doc.rect(0, 0, width, 14, "F");

    // Header Text
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("KARTU TANDA ANGGOTA KKG", width / 2, 6, { align: "center" });
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text("KECAMATAN TALANG - KABUPATEN TEGAL", width / 2, 10, { align: "center" });

    // Decorative Yellow Bar
    doc.setFillColor(245, 158, 11);
    doc.rect(0, 14, width, 1.5, "F");

    // Content: Profile details
    doc.setTextColor(15, 23, 42); // slate-900
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(guruName.toUpperCase(), 5, 25);
    
    doc.setTextColor(71, 85, 105); // slate-600
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text("PegID / NIP:", 5, 30);
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.text(identitas, 25, 30);

    doc.setTextColor(71, 85, 105);
    doc.setFont("helvetica", "normal");
    doc.text("Unit Kerja:", 5, 35);
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.text(madrasah.toUpperCase(), 25, 35);
    
    if (guruDetail?.jabatan) {
      doc.setTextColor(71, 85, 105);
      doc.setFont("helvetica", "normal");
      doc.text("Jabatan:", 5, 40);
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.text(guruDetail.jabatan.toUpperCase(), 25, 40);
    }

    // Generate QR Code
    try {
      const QRCode = (await import("qrcode")).default;
      const qrData = `KTA KKG Talang\nNama: ${guruName}\nID: ${identitas}\nUnit: ${madrasah}`;
      const qrDataUri = await QRCode.toDataURL(qrData, { margin: 0, width: 60 });
      doc.addImage(qrDataUri, "PNG", width - 20, 20, 15, 15);
    } catch (e) {
      console.error("Gagal generate QR untuk KTA", e);
    }
    
    // Watermark Logo if we had one, but we'll skip for now
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(6);
    doc.setFont("helvetica", "normal");
    doc.text("Berlaku selama menjadi anggota KKG MI Talang", width / 2, height - 3, { align: "center" });

    doc.save(`KTA_${guruName.replace(/\s+/g, "_")}.pdf`);
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-10">
      {/* Full bleed mobile header */}
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-b-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden -mt-1 pb-12">
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-emerald-200 text-sm font-medium mb-1 tracking-wide">Portal Guru KKG</p>
            <h2 className="text-3xl font-black mb-2">Halo, {session?.user?.name?.split(" ")[0] || "Guru"}! 👋</h2>
            <p className="text-emerald-100/90 text-sm max-w-[250px] leading-relaxed">
              Selamat datang. Siap untuk kegiatan hari ini?
            </p>
          </div>
          {/* Avatar/Initials */}
          <div className="w-14 h-14 rounded-full bg-emerald-800/50 border-2 border-emerald-400/50 flex items-center justify-center text-xl font-bold shadow-inner shrink-0 backdrop-blur-sm">
            {session?.user?.name?.substring(0, 2).toUpperCase() || "GU"}
          </div>
        </div>
        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-40%] left-[-20%] w-72 h-72 bg-emerald-900 opacity-20 rounded-full blur-3xl"></div>
      </div>

      <div className="px-5 sm:px-8 space-y-8 -mt-6 relative z-20">
        
        {/* KTA UI Card Section */}
        <div>
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600" /> Kartu Tanda Anggota (KTA) Digital
          </h3>
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row gap-6 items-center">
            
            {/* Visual KTA Card */}
            <div className="w-full max-w-[340px] aspect-[1.58] bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden relative group">
              {/* Header Card */}
              <div className="bg-emerald-600 h-14 w-full flex flex-col justify-center items-center text-white px-4 pt-1">
                <h4 className="font-bold text-sm leading-tight tracking-wide">KARTU TANDA ANGGOTA KKG</h4>
                <p className="text-[9px] text-emerald-100 uppercase tracking-widest">Kec. Talang - Kab. Tegal</p>
              </div>
              <div className="h-1.5 w-full bg-amber-500"></div>
              
              {/* Body Card */}
              <div className="p-4 flex gap-3 relative h-full">
                {/* Photo Placeholder */}
                <div className="w-16 h-20 bg-slate-100 border border-slate-200 rounded shrink-0 flex items-center justify-center">
                  <div className="text-slate-400 font-bold text-lg">
                    {session?.user?.name?.substring(0,2).toUpperCase() || "GU"}
                  </div>
                </div>
                
                {/* Details */}
                <div className="flex-1 pb-4">
                  <p className="font-bold text-slate-900 text-[13px] leading-tight mb-2 truncate">
                    {(session?.user?.name || "GURU").toUpperCase()}
                  </p>
                  <table className="text-[10px] text-slate-700 w-full leading-tight">
                    <tbody>
                      <tr>
                        <td className="w-16 py-0.5 align-top">NIP/PegID</td>
                        <td className="w-2 py-0.5 align-top">:</td>
                        <td className="font-bold py-0.5 truncate">{guruDetail?.peg_id || guruDetail?.nip || (session?.user as any)?.id || "-"}</td>
                      </tr>
                      <tr>
                        <td className="py-0.5 align-top">Unit Kerja</td>
                        <td className="py-0.5 align-top">:</td>
                        <td className="font-bold py-0.5 line-clamp-2">{madrasahName ? madrasahName.toUpperCase() : "MI TALANG"}</td>
                      </tr>
                      {guruDetail?.jabatan && (
                        <tr>
                          <td className="py-0.5 align-top">Jabatan</td>
                          <td className="py-0.5 align-top">:</td>
                          <td className="font-bold py-0.5 truncate">{guruDetail.jabatan.toUpperCase()}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                {/* Decorative Bottom */}
                <div className="absolute bottom-2 right-4 opacity-50 flex items-center justify-center">
                  <div className="w-10 h-10 border border-dashed border-slate-300 flex items-center justify-center rounded">
                    <span className="text-[6px] text-slate-400">QR CODE</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions & Info */}
            <div className="flex-1 space-y-4 text-center md:text-left">
              <p className="text-slate-600 text-sm">
                Ini adalah KTA Digital resmi Anda sebagai anggota aktif Kelompok Kerja Guru (KKG) MI Kecamatan Talang. Anda dapat mengunduh dan mencetaknya.
              </p>
              <button onClick={downloadKTA} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow-md flex items-center gap-2 mx-auto md:mx-0">
                <Download className="w-4 h-4" /> Download KTA (PDF)
              </button>
            </div>
          </div>
        </div>

        {/* Testimoni Link */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-1">
              <Quote className="w-5 h-5 text-emerald-600" /> Suara Anda (Testimoni)
            </h3>
            <p className="text-slate-600 text-sm">
              Bagikan pengalaman Anda menggunakan platform KKG ini agar dapat menginspirasi guru lain.
            </p>
          </div>
          <Link href="/guru/testimoni" className="whitespace-nowrap bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center gap-2">
            Tulis Testimoni <ArrowRight className="w-4 h-4" />
          </Link>
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
                <div className="mt-5">
                  <button onClick={() => handleHadirDirect(item.id)} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors shadow-sm flex justify-center items-center gap-2">
                    <Pointer className="w-4 h-4" /> Hadir Kegiatan
                  </button>
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
  </div>
  );
}
