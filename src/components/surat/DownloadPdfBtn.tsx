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
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text(cfg.siteName || "KKM & KKG MI TALANG", pageW / 2, y + 8, { align: "center" });

      // Address
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      const alamatLine = (cfg.kontak?.alamat || "").replace(/\n/g, ", ");
      doc.text(alamatLine, pageW / 2, y + 14, { align: "center" });
      doc.text(
        `Email: ${cfg.kontak?.email || ""} | Telp/WA: ${cfg.kontak?.telepon || ""}`,
        pageW / 2,
        y + 19,
        { align: "center" }
      );

      y += 24;

      // Thick line
      doc.setLineWidth(0.8);
      doc.line(margin, y, pageW - margin, y);
      y += 1;
      // Thin line
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

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      // Left column
      const col1X = margin;
      const col2X = margin + 30;
      const lineH = 6;

      doc.text("Nomor", col1X, y);
      doc.text(":", col2X - 4, y);
      doc.text(surat.nomor_surat || "...............................", col2X, y);
      y += lineH;

      doc.text("Lampiran", col1X, y);
      doc.text(":", col2X - 4, y);
      doc.text("-", col2X, y);
      y += lineH;

      doc.text("Hal", col1X, y);
      doc.text(":", col2X - 4, y);
      doc.setFont("helvetica", "bold");
      doc.text(surat.jenis, col2X, y);
      doc.setFont("helvetica", "normal");

      // Date on right
      doc.text(`Tegal, ${todayStr}`, pageW - margin, y - lineH * 2, { align: "right" });

      y += 10;

      // ── BODY SURAT ─────────────────────────────────────────────────
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");

      const isiLines = doc.splitTextToSize(surat.isi || "", contentW);
      isiLines.forEach((line: string) => {
        if (y > pageH - 60) {
          doc.addPage();
          y = margin;
        }
        doc.text(line, margin, y);
        y += 6;
      });

      // ── TANDA TANGAN ───────────────────────────────────────────────
      y = Math.max(y + 10, pageH - 70); // push to bottom if short

      const sigW = 65;
      const leftSigX = margin;
      const rightSigX = pageW - margin - sigW;

      doc.setFontSize(11);
      doc.text("Mengetahui,", leftSigX + sigW / 2, y, { align: "center" });
      y += 5;
      doc.text("Ketua KKG", leftSigX + sigW / 2, y, { align: "center" });
      doc.text("Sekretaris KKG", rightSigX + sigW / 2, y, { align: "center" });

      y += 25; // space for signature

      doc.setFont("helvetica", "bold");
      doc.text(cfg.ketua || "KETUA KKG", leftSigX + sigW / 2, y, { align: "center" });
      doc.text(cfg.sekretaris || "SEKRETARIS KKG", rightSigX + sigW / 2, y, { align: "center" });

      // Underline below names
      doc.setFont("helvetica", "normal");
      doc.setLineWidth(0.3);
      const ketuaTextW = doc.getTextWidth(cfg.ketua || "KETUA KKG");
      const sekretarisTextW = doc.getTextWidth(cfg.sekretaris || "SEKRETARIS KKG");
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
