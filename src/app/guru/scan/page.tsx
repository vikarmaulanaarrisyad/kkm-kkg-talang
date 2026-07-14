"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, Camera, Loader2, ArrowLeft } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import Link from "next/link";
import Swal from "sweetalert2";

function ScanContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"scanning" | "loading" | "success" | "error">("scanning");
  const [message, setMessage] = useState("");
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const kegiatan_id = searchParams.get("kegiatan_id");

  useEffect(() => {
    if (kegiatan_id) {
      // If accessed via link directly from standard camera
      submitPresensi(kegiatan_id);
    } else {
      // Start camera
      startScanner();
    }

    return () => {
      stopScanner();
    };
  }, [kegiatan_id]);

  const submitPresensi = async (id: string) => {
    setStatus("loading");
    stopScanner();
    try {
      const res = await fetch("/api/presensi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kegiatan_id: id })
      });
      const json = await res.json();
      if (res.ok) {
        setStatus("success");
        setMessage("Berhasil! Kehadiran Anda telah dicatat.");
      } else {
        setStatus("error");
        setMessage(json.error || "Gagal melakukan presensi.");
      }
    } catch (e: any) {
      setStatus("error");
      setMessage(e.message || "Terjadi kesalahan jaringan.");
    }
  };

  const startScanner = async () => {
    try {
      if (!document.getElementById("reader")) return;
      
      const html5QrCode = new Html5Qrcode("reader");
      scannerRef.current = html5QrCode;
      
      await html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          // decodedText should be a URL like https://domain.com/guru/scan?kegiatan_id=XYZ
          // or just XYZ
          try {
            const url = new URL(decodedText);
            const id = url.searchParams.get("kegiatan_id");
            if (id) {
              submitPresensi(id);
            } else {
              Swal.fire("Error", "QR Code tidak valid", "error");
            }
          } catch {
            // Fallback, maybe it's just the ID
            if (decodedText.startsWith("EVT-")) {
              submitPresensi(decodedText);
            } else {
              Swal.fire("Error", "Bukan QR Code presensi yang valid", "error");
            }
          }
        },
        () => {}
      );
    } catch (err) {
      console.warn("Scanner error:", err);
      Swal.fire("Kamera Error", "Gagal mengakses kamera. Pastikan Anda memberi izin kamera.", "error");
    }
  };

  const stopScanner = () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop().catch(console.error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      {status === "scanning" && !kegiatan_id && (
        <div className="w-full max-w-sm mx-auto text-center space-y-4">
          <div className="bg-white p-4 rounded-3xl shadow-lg border border-slate-100 relative overflow-hidden">
            <div id="reader" className="w-full h-auto rounded-2xl overflow-hidden [&>video]:object-cover" />
          </div>
          <div className="bg-emerald-50 text-emerald-700 px-6 py-4 rounded-2xl text-sm font-semibold inline-flex items-center gap-3">
            <Camera className="w-5 h-5 animate-pulse" />
            Arahkan kamera ke QR Code kegiatan
          </div>
        </div>
      )}

      {status === "loading" && (
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto" />
          <p className="text-slate-600 font-medium">Memproses presensi...</p>
        </div>
      )}

      {status === "success" && (
        <div className="text-center space-y-4 bg-white p-8 rounded-3xl shadow-sm border border-emerald-100 max-w-sm mx-auto w-full">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-500">
            <CheckCircle className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-1">Presensi Berhasil</h2>
            <p className="text-sm text-slate-500">{message}</p>
          </div>
          <Link href="/guru/dashboard" className="mt-4 block w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-semibold transition-colors">
            Kembali ke Dashboard
          </Link>
        </div>
      )}

      {status === "error" && (
        <div className="text-center space-y-4 bg-white p-8 rounded-3xl shadow-sm border border-red-100 max-w-sm mx-auto w-full">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-500">
            <XCircle className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-1">Presensi Gagal</h2>
            <p className="text-sm text-slate-500">{message}</p>
          </div>
          <Link href="/guru/dashboard" className="mt-4 block w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-semibold transition-colors">
            Kembali ke Dashboard
          </Link>
          {!kegiatan_id && (
            <button onClick={() => setStatus("scanning")} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-semibold transition-colors">
              Coba Ulang Scan
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function ScanPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600"/></div>}>
      <ScanContent />
    </Suspense>
  );
}
