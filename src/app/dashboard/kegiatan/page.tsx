"use client";

import { useEffect, useState } from "react";
import { Plus, QrCode, X, Calendar as CalendarIcon, MapPin, Users, CheckCircle, Clock } from "lucide-react";
import Swal from "sweetalert2";
import { QRCodeCanvas } from "qrcode.react";

type Kegiatan = {
  id: string;
  nama: string;
  jenis: string;
  tempat: string;
  tanggal: string;
  waktu: string;
  status: string;
  created_at: string;
};

type Presensi = {
  id: string;
  kegiatan_id: string;
  guru_id: string;
  nama_guru: string;
  waktu_hadir: string;
};

export default function KegiatanPage() {
  const [data, setData] = useState<Kegiatan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showQR, setShowQR] = useState<Kegiatan | null>(null);
  
  const [presensi, setPresensi] = useState<Presensi[]>([]);
  const [loadingPresensi, setLoadingPresensi] = useState(false);

  const [form, setForm] = useState({
    nama: "",
    jenis: "KKG",
    tempat: "",
    tanggal: "",
    waktu: "",
  });

  const fetchData = async () => {
    try {
      const res = await fetch("/api/kegiatan");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPresensi = async (kegiatan_id: string) => {
    setLoadingPresensi(true);
    try {
      const res = await fetch(`/api/presensi?kegiatan_id=${kegiatan_id}`);
      const json = await res.json();
      setPresensi(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPresensi(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/kegiatan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        Swal.fire("Berhasil", "Kegiatan berhasil dibuat", "success");
        setShowModal(false);
        fetchData();
        setForm({ nama: "", jenis: "KKG", tempat: "", tanggal: "", waktu: "" });
      } else {
        const err = await res.json();
        Swal.fire("Error", err.error || "Gagal membuat kegiatan", "error");
      }
    } catch (err: any) {
      Swal.fire("Error", err.message, "error");
    }
  };

  const getQRValue = (id: string) => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/guru/scan?kegiatan_id=${id}`;
    }
    return `https://kkm-kkg-talang.vercel.app/guru/scan?kegiatan_id=${id}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manajemen Kegiatan & E-Presensi</h1>
          <p className="text-slate-500 text-sm mt-1">Buat kegiatan dan tampilkan QR Code untuk absensi otomatis.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm hover:shadow transition-all flex items-center gap-2">
          <Plus className="w-5 h-5" /> Buat Kegiatan
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Memuat data...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm">
                  <th className="p-4 font-semibold">Nama Kegiatan</th>
                  <th className="p-4 font-semibold">Waktu & Tempat</th>
                  <th className="p-4 font-semibold text-center">Status</th>
                  <th className="p-4 font-semibold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map(d => (
                  <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-slate-800">{d.nama}</p>
                      <span className="inline-block mt-1 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-md font-medium">
                        {d.jenis}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-600 space-y-1">
                      <div className="flex items-center gap-2"><CalendarIcon className="w-3.5 h-3.5" /> {d.tanggal} - {d.waktu}</div>
                      <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> {d.tempat || "-"}</div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${d.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${d.status === "active" ? "bg-emerald-500" : "bg-slate-400"}`}></div>
                        {d.status === "active" ? "Aktif" : "Selesai"}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button onClick={() => { setShowQR(d); fetchPresensi(d.id); }} className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-4 py-2 rounded-xl text-sm font-semibold transition-colors inline-flex items-center gap-2">
                        <QrCode className="w-4 h-4" /> Tampilkan QR
                      </button>
                    </td>
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr><td colSpan={4} className="p-8 text-center text-slate-500">Belum ada kegiatan.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" /> Buat Kegiatan
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1 block">Nama Kegiatan</label>
                <input type="text" required value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50 text-sm" placeholder="Contoh: Rapat Koordinasi KKG" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-1 block">Jenis</label>
                  <select value={form.jenis} onChange={e => setForm({ ...form, jenis: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50 text-sm">
                    <option value="KKG">KKG</option>
                    <option value="KKM">KKM</option>
                    <option value="Madrasah">Madrasah</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-1 block">Tanggal</label>
                  <input type="date" required value={form.tanggal} onChange={e => setForm({ ...form, tanggal: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-1 block">Waktu</label>
                  <input type="text" value={form.waktu} onChange={e => setForm({ ...form, waktu: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50 text-sm" placeholder="08:00 - Selesai" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-1 block">Tempat</label>
                  <input type="text" value={form.tempat} onChange={e => setForm({ ...form, tempat: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50 text-sm" placeholder="MIS Bustanul Huda 01" />
                </div>
              </div>
              <div className="pt-2">
                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold shadow-sm transition-all">
                  Simpan Kegiatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[85vh] md:h-[600px]">
            {/* Kiri: QR Code */}
            <div className="bg-emerald-600 p-8 flex flex-col items-center justify-center text-center relative w-full md:w-1/2">
              <button onClick={() => setShowQR(null)} className="absolute top-4 left-4 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 md:hidden">
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-black text-white mb-2 leading-tight">{showQR.nama}</h2>
              <p className="text-emerald-100 text-sm mb-8 flex items-center gap-2"><MapPin className="w-4 h-4"/> {showQR.tempat}</p>
              
              <div className="bg-white p-6 rounded-3xl shadow-xl">
                <QRCodeCanvas 
                  value={getQRValue(showQR.id)} 
                  size={250} 
                  level="H"
                  includeMargin={true}
                  className="rounded-xl"
                />
              </div>
              <p className="text-emerald-100 mt-6 text-sm max-w-xs leading-relaxed">
                Arahkan kamera smartphone Anda (atau buka menu <b>Scan QR</b> di sistem) untuk melakukan presensi.
              </p>
            </div>
            
            {/* Kanan: Daftar Hadir */}
            <div className="bg-white p-0 flex flex-col w-full md:w-1/2 relative h-full">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Users className="w-5 h-5 text-emerald-600" /> Daftar Hadir
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Real-time update (Refresh halaman jika perlu)</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => fetchPresensi(showQR.id)} className="text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors">
                    Refresh
                  </button>
                  <button onClick={() => setShowQR(null)} className="hidden md:flex text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                {loadingPresensi ? (
                  <div className="text-center text-slate-500 py-10">Memuat data...</div>
                ) : (
                  <div className="space-y-3">
                    {presensi.map((p, idx) => (
                      <div key={p.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between animate-in slide-in-from-right-4 duration-300" style={{ animationDelay: `${idx * 50}ms` }}>
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold shadow-inner">
                            {p.nama_guru.substring(0,2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{p.nama_guru}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> Hadir
                              </span>
                              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {new Date(p.waktu_hadir).toLocaleTimeString("id-ID")}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {presensi.length === 0 && (
                      <div className="text-center text-slate-400 py-12 flex flex-col items-center">
                        <Users className="w-12 h-12 mb-3 text-slate-200" />
                        <p>Belum ada yang melakukan presensi.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="p-4 border-t border-slate-100 bg-white text-center">
                <p className="text-sm font-bold text-slate-700">Total Hadir: <span className="text-emerald-600 text-lg">{presensi.length}</span> orang</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
