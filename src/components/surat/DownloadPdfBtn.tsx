"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import Swal from "sweetalert2";

interface Surat {
  id: string;
  nomor_surat?: string;
  judul: string;
  jenis: string;
  isi: string;
  penerima?: string;
  created_at: string;
}

export default function DownloadPdfBtn({ surat }: { surat: Surat }) {
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<any>(null);

  const handleDownload = async (isTTE: boolean) => {
    setLoading(true);
    try {
      // 1. Fetch config (logo, site name, contacts, signatures)
      let cfg = config;
      if (!cfg) {
        const res = await fetch("/api/surat/pdf-config", { cache: "no-store" });
        if (!res.ok) throw new Error("Gagal mengambil data Kop Surat");
        cfg = await res.json();
        setConfig(cfg);
      }

      // 2. Use jsPDF directly — no html2canvas → no CSS color parsing issue
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });

      const pageW = 210;
      const pageH = 297;
      const margin = 20;
      const contentW = pageW - margin * 2;
      let y = margin;

      // ── KOP SURAT ──────────────────────────────────────────────────
      // Logo (if available)
      if (cfg.logo) {
        try {
          const logoData = await loadImageAsBase64(cfg.logo);
          doc.addImage(logoData, "JPEG", margin, y, 20, 20);
        } catch {
          // skip logo if can't load
        }
      }

      // Org name
      doc.setFont("times", "bold");
      doc.setFontSize(16);
      doc.text(cfg.siteName || "KELOMPOK KERJA GURU (KKG) MI KEC. TALANG", pageW / 2, y + 8, { align: "center" });

      // Address
      doc.setFont("times", "normal");
      doc.setFontSize(10);
      const alamatLine = (cfg.kontak?.alamat || "").replace(/\n/g, ", ");
      doc.text(alamatLine, pageW / 2, y + 14, { align: "center" });
      doc.text(
        `Email: ${cfg.kontak?.email || ""} | Telp/WA: ${cfg.kontak?.telepon || ""}`,
        pageW / 2,
        y + 19,
        { align: "center" }
      );

      y += 24;

      // Double line for formal Kop Surat
      doc.setLineWidth(1.0);
      doc.line(margin, y, pageW - margin, y);
      y += 1.2;
      doc.setLineWidth(0.3);
      doc.line(margin, y, pageW - margin, y);
      y += 8;

      // ── HEADER SURAT ───────────────────────────────────────────────
      const todayStr = surat.created_at
        ? new Date(surat.created_at).toLocaleDateString("id-ID", {
            day: "numeric", month: "long", year: "numeric",
          })
        : new Date().toLocaleDateString("id-ID", {
            day: "numeric", month: "long", year: "numeric",
          });

      // ── INFO SURAT (Nomor, Hal, dll) ────────────────────────────────
      doc.setFontSize(12);
      doc.setFont("times", "normal");
      // Left column
      const col1X = margin;
      const col2X = margin + 25;
      const lineH = 6;

      doc.text("Nomor", col1X, y);
      doc.text(":", col2X - 3, y);
      doc.text(surat.nomor_surat || "...............................", col2X, y);
      y += lineH;

      doc.text("Lampiran", col1X, y);
      doc.text(":", col2X - 3, y);
      doc.text("-", col2X, y);
      y += lineH;

      doc.text("Hal", col1X, y);
      doc.text(":", col2X - 3, y);
      doc.text(surat.jenis, col2X, y);

      // Date on right
      const initY = y - (lineH * 2);
      doc.text(`Tegal, ${todayStr}`, pageW - margin, initY, { align: "right" });

      // Recipient block
      y += lineH;
      doc.text("Kepada Yth.", col1X, y);
      y += lineH;
      let penerimaText = "Bapak/Ibu Kepala Madrasah & Guru";
      if (surat.penerima && surat.penerima !== "all") {
        penerimaText = "Bapak/Ibu Pimpinan Madrasah Terkait";
      }
      doc.setFont("times", "bold");
      doc.text(penerimaText, col1X, y);
      doc.setFont("times", "normal");
      y += lineH;
      doc.text("di", col1X, y);
      y += lineH;
      doc.text("    Tempat", col1X, y);

      y += 12;

      // ── BODY SURAT ─────────────────────────────────────────────────
      doc.setFontSize(12);
      
      // Use doc.text with maxWidth and justify for neat formatting
      const paragraphs = (surat.isi || "").split("\n");
      
      paragraphs.forEach((p: string) => {
        if (p.trim() === "") {
          y += 4; // Add small spacing for empty lines
          return;
        }
        
        // Deteksi format list (Label : Value) untuk dirapikan secara tabular
        // Menggunakan indexOf agar 100% akurat menangkap baris yang memiliki titik dua
        const colonIndex = p.indexOf(":");
        if (colonIndex !== -1 && colonIndex < 35) {
          const label = p.substring(0, colonIndex).trim();
          const value = p.substring(colonIndex + 1).trim();
          
          if (y > pageH - 40) { doc.addPage(); y = margin; }
          
          doc.text(label, margin, y);
          doc.text(":", margin + 35, y);
          
          const valueLines = doc.splitTextToSize(value, contentW - 40);
          valueLines.forEach((vLine: string, vIndex: number) => {
            if (y > pageH - 40) { doc.addPage(); y = margin; }
            if (vIndex === valueLines.length - 1) {
              doc.text(vLine, margin + 40, y);
            } else {
              doc.text(vLine, margin + 40, y, { align: "justify", maxWidth: contentW - 40 });
            }
            if (vIndex < valueLines.length - 1) y += 6;
          });
          y += 6;
          return;
        }
        
        // Default paragraph rendering
        const lines = doc.splitTextToSize(p, contentW);
        lines.forEach((line: string, i: number) => {
          if (y > pageH - 40) {
            doc.addPage();
            y = margin;
          }
          
          // Mencegah justify pada baris terakhir paragraf atau paragraf 1 baris
          if (i === lines.length - 1) {
            doc.text(line, margin, y);
          } else {
            doc.text(line, margin, y, { align: "justify", maxWidth: contentW });
          }
          y += 6;
        });
      });

      // ── TANDA TANGAN ───────────────────────────────────────────────
      y = Math.max(y + 15, pageH - 80); // push to bottom if short

      const sigW = 65;
      const leftSigX = margin;
      const rightSigX = pageW - margin - sigW;

      doc.setFontSize(12);
      doc.text("Mengetahui,", leftSigX + sigW / 2, y, { align: "center" });
      y += 5;
      
      doc.text("Ketua KKG MI Talang", leftSigX + sigW / 2, y, { align: "center" });
      doc.text("Sekretaris KKG MI Talang", rightSigX + sigW / 2, y, { align: "center" });

      const namaKetua = cfg.signatures?.ketua_nama || cfg.ketua || "M. RIZKY, S.Pd.I";
      const namaSekretaris = cfg.signatures?.sekretaris_nama || cfg.sekretaris || "SITI AMINAH, S.Pd";

      if (isTTE) {
        y += 5; // Padding atas (sebelumnya 2)
        const qrSize = 20; // 20x20 mm
        
        try {
          // Dynamically import qrcode to keep initial bundle size small
          const QRCode = (await import("qrcode")).default;
          
          const textKetua = `Verifikasi TTE:\nDitandatangani oleh: ${namaKetua}\nJabatan: Ketua KKG MI Talang\nDokumen: ${surat.judul}\nTanggal: ${todayStr}`;
          const textSekretaris = `Verifikasi TTE:\nDitandatangani oleh: ${namaSekretaris}\nJabatan: Sekretaris KKG MI Talang\nDokumen: ${surat.judul}\nTanggal: ${todayStr}`;
          
          const qrDataUriKetua = await QRCode.toDataURL(textKetua, { width: 150, margin: 0, color: { dark: '#000000', light: '#ffffff' } });
          const qrDataUriSekretaris = await QRCode.toDataURL(textSekretaris, { width: 150, margin: 0, color: { dark: '#000000', light: '#ffffff' } });
          
          doc.addImage(qrDataUriKetua, "PNG", leftSigX + sigW / 2 - qrSize / 2, y, qrSize, qrSize);
          doc.addImage(qrDataUriSekretaris, "PNG", rightSigX + sigW / 2 - qrSize / 2, y, qrSize, qrSize);
        } catch (e) {
          console.error("Gagal membuat QR Code", e);
        }
        
        y += qrSize + 5; // Padding bawah (sebelumnya 2)
      } else {
        y += 22; // space for manual signature
      }

      doc.setFont("times", "bold");
      doc.setFontSize(12);
      
      const formatName = (name: string) => {
        const parts = name.split(',');
        if (parts.length > 1) {
          const gelar = parts.slice(1).join(',');
          return parts[0].toUpperCase() + ',' + gelar;
        }
        return name.toUpperCase();
      };

      const formattedKetua = formatName(namaKetua);
      const formattedSekretaris = formatName(namaSekretaris);

      doc.text(formattedKetua, leftSigX + sigW / 2, y, { align: "center" });
      doc.text(formattedSekretaris, rightSigX + sigW / 2, y, { align: "center" });
      
      // Underlines
      doc.setLineWidth(0.3);
      const ketuaTextW = doc.getTextWidth(formattedKetua);
      const sekretarisTextW = doc.getTextWidth(formattedSekretaris);
      doc.line(
        leftSigX + sigW / 2 - ketuaTextW / 2, y + 1,
        leftSigX + sigW / 2 + ketuaTextW / 2, y + 1
      );
      doc.line(
        rightSigX + sigW / 2 - sekretarisTextW / 2, y + 1,
        rightSigX + sigW / 2 + sekretarisTextW / 2, y + 1
      );

      // 3. Save
      doc.save(`${surat.jenis} - ${surat.judul}.pdf`);
    } catch (error: any) {
      console.error("Gagal men-generate PDF", error);
      Swal.fire("Error", "Gagal mengunduh PDF: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <button disabled className="inline-flex items-center gap-2 bg-amber-500/70 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all">
        <Loader2 className="w-4 h-4 animate-spin" />
        Menyiapkan PDF...
      </button>
    );
  }

  return (
    <div className="relative group/btn">
      <button
        onClick={(e) => {
          e.preventDefault();
          const menu = e.currentTarget.nextElementSibling;
          if (menu) menu.classList.toggle('hidden');
        }}
        onBlur={(e) => {
          // Add a small delay to allow click events on menu items to fire before hiding
          const menu = e.currentTarget.nextElementSibling;
          if (menu) {
            setTimeout(() => {
              menu.classList.add('hidden');
            }, 200);
          }
        }}
        className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/50"
        title="Pilih Opsi Unduh PDF"
      >
        <Download className="w-4 h-4" />
        Unduh PDF
      </button>
      <div className="absolute left-0 mt-2 w-72 bg-white border border-slate-200 shadow-xl rounded-xl hidden z-50 p-2 text-sm animate-in fade-in zoom-in-95 duration-100">
        <button
          onClick={(e) => { e.preventDefault(); e.currentTarget.parentElement?.classList.add('hidden'); handleDownload(false); }}
          className="w-full text-left px-3 py-3 rounded-lg hover:bg-slate-50 flex items-center justify-between transition-colors group mb-1"
        >
          <div className="flex items-center gap-3">
            <div className="bg-slate-100 text-slate-500 p-2 rounded-lg group-hover:bg-amber-100 group-hover:text-amber-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 5-3-3H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2"/><path d="M8 18h1"/><path d="M18.4 9.6a2 2 0 1 1 3 3L17 17l-4 1 1-4Z"/></svg>
            </div>
            <div>
              <p className="font-semibold text-slate-700 group-hover:text-amber-700 transition-colors text-[13px]">Tanda Tangan Manual</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Kosongkan ruang untuk cap tinta</p>
            </div>
          </div>
        </button>
        <button
          onClick={(e) => { e.preventDefault(); e.currentTarget.parentElement?.classList.add('hidden'); handleDownload(true); }}
          className="w-full text-left px-3 py-3 rounded-lg hover:bg-emerald-50 text-emerald-700 font-medium flex items-center justify-between transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 text-emerald-600 p-2 rounded-lg group-hover:bg-emerald-200 group-hover:text-emerald-700 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>
            </div>
            <div>
              <p className="font-semibold text-emerald-800 text-[13px]">Tanda Tangan Elektronik</p>
              <p className="text-[10px] text-emerald-600/70 mt-0.5">Berisi lencana QR keamanan digital</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

// Helper: load image via server proxy → base64 (avoids CORS/405 on Cloudinary/external URLs)
async function loadImageAsBase64(url: string): Promise<string> {
  const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(url)}`;
  const res = await fetch(proxyUrl);
  if (!res.ok) throw new Error(`Image proxy failed: ${res.status}`);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
