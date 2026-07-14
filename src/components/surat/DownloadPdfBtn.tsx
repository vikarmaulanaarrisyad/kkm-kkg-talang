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
  created_at: string;
}

export default function DownloadPdfBtn({ surat }: { surat: Surat }) {
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<any>(null);

  const handleDownload = async () => {
    setLoading(true);
    try {
      // 1. Fetch config (logo, site name, contacts, signatures)
      let cfg = config;
      if (!cfg) {
        const res = await fetch("/api/surat/pdf-config");
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
        
        // Split text to fit width
        const lines = doc.splitTextToSize(p, contentW);
        lines.forEach((line: string) => {
          if (y > pageH - 40) {
            doc.addPage();
            y = margin;
          }
          doc.text(line, margin, y, { align: "justify", maxWidth: contentW });
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

      y += 22; // space for signature

      const namaKetua = cfg.ketua || "M. RIZKY, S.Pd.I";
      const namaSekretaris = cfg.sekretaris || "SITI AMINAH, S.Pd";

      doc.setFont("times", "bold");
      doc.text(namaKetua, leftSigX + sigW / 2, y, { align: "center" });
      doc.text(namaSekretaris, rightSigX + sigW / 2, y, { align: "center" });
      
      // Underlines
      doc.setLineWidth(0.3);
      const ketuaTextW = doc.getTextWidth(namaKetua);
      const sekretarisTextW = doc.getTextWidth(namaSekretaris);
      doc.line(
        leftSigX + sigW / 2 - ketuaTextW / 2, y + 1,
        leftSigX + sigW / 2 + ketuaTextW / 2, y + 1
      );
      doc.line(
        rightSigX + sigW / 2 - sekretarisTextW / 2, y + 1,
        rightSigX + sigW / 2 + sekretarisTextW / 2, y + 1
      );
      
      doc.setFont("times", "normal");
      y += 4;
      doc.text("NIP. 19800101 200501 1 001", leftSigX + sigW / 2, y, { align: "center" });
      doc.text("NIP. 19850202 201001 2 002", rightSigX + sigW / 2, y, { align: "center" });

      // 3. Save
      doc.save(`${surat.jenis} - ${surat.judul}.pdf`);
    } catch (error: any) {
      console.error("Gagal men-generate PDF", error);
      Swal.fire("Error", "Gagal mengunduh PDF: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all disabled:opacity-70"
      title="Unduh format resmi dengan Kop KKG"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
      Unduh PDF (Kop KKG)
    </button>
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
