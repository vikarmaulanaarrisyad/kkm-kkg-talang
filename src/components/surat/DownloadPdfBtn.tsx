"use client";

import { useState, useRef } from "react";
import { Download, Loader2 } from "lucide-react";
import Swal from "sweetalert2";

interface Surat {
  id: string;
  judul: string;
  jenis: string;
  isi: string;
  created_at: string;
}

export default function DownloadPdfBtn({ surat }: { surat: Surat }) {
  const [loading, setLoading] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const [config, setConfig] = useState<any>(null);

  const handleDownload = async () => {
    setLoading(true);
    try {
      // 1. Fetch Config if not cached
      let currentConfig = config;
      if (!currentConfig) {
        const res = await fetch("/api/surat/pdf-config");
        if (!res.ok) throw new Error("Gagal mengambil data Kop Surat");
        currentConfig = await res.json();
        setConfig(currentConfig);
      }

      // We need to wait for state/DOM to update if it was just set.
      // But we can also just use the currentConfig directly in the DOM if we structure it right,
      // or we can manually build the HTML string for html2pdf to ensure it uses the fetched data synchronously.
      // Building HTML string is safer to avoid React re-render timing issues.

      const html2pdf = (await import("html2pdf.js")).default;
      
      const todayStr = surat.created_at 
        ? new Date(surat.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
        : new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

      const htmlContent = `
        <div style="width: 800px; padding: 40px; color: black; background-color: white; font-family: 'Times New Roman', Times, serif;">
          <!-- KOP SURAT -->
          <div style="display: flex; align-items: center; border-bottom: 3px solid black; padding-bottom: 10px; margin-bottom: 2px;">
            ${currentConfig.logo ? `
            <div style="width: 90px; flex-shrink: 0; text-align: center;">
              <img src="${currentConfig.logo}" alt="Logo" style="max-width: 100%; max-height: 90px;" crossorigin="anonymous" />
            </div>
            ` : ''}
            <div style="flex-grow: 1; text-align: center;">
              <h2 style="margin: 0; font-size: 24px; font-weight: bold; text-transform: uppercase;">${currentConfig.siteName}</h2>
              <p style="margin: 5px 0 0 0; font-size: 14px;">
                ${currentConfig.kontak.alamat.replace(/\n/g, ", ")}
              </p>
              <p style="margin: 0; font-size: 13px;">
                Email: ${currentConfig.kontak.email} | Telp/WA: ${currentConfig.kontak.telepon}
              </p>
            </div>
          </div>
          <div style="border-bottom: 1px solid black; margin-bottom: 30px;"></div>

          <!-- HEADER SURAT -->
          <div style="display: flex; justify-content: space-between; margin-bottom: 30px; font-size: 16px;">
            <div>
              <p style="margin: 0 0 5px 0;">Nomor&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: ..............................</p>
              <p style="margin: 0 0 5px 0;">Lampiran&nbsp;&nbsp;&nbsp;&nbsp;: -</p>
              <p style="margin: 0 0 5px 0;">Hal&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: <b>${surat.jenis}</b></p>
            </div>
            <div>
              <p style="margin: 0;">Tegal, ${todayStr}</p>
            </div>
          </div>

          <!-- BODY SURAT -->
          <div style="font-size: 16px; line-height: 1.5; text-align: justify; min-height: 400px;">
            <p style="white-space: pre-wrap; margin: 0;">${surat.isi.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
          </div>

          <!-- SIGNATURES -->
          <div style="display: flex; justify-content: space-between; margin-top: 50px; font-size: 16px; text-align: center;">
            <div style="width: 250px;">
              <p style="margin: 0 0 80px 0;">Mengetahui,<br/>Ketua KKG</p>
              <p style="margin: 0; font-weight: bold; text-decoration: underline;">${currentConfig.ketua}</p>
            </div>
            <div style="width: 250px;">
              <p style="margin: 0 0 80px 0;"><br/>Sekretaris KKG</p>
              <p style="margin: 0; font-weight: bold; text-decoration: underline;">${currentConfig.sekretaris}</p>
            </div>
          </div>
        </div>
      `;

      // Create a hidden iframe to prevent html2canvas from parsing Tailwind v4's global oklch/lab colors
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.top = '-9999px';
      iframe.style.width = '1000px';
      iframe.style.height = '1000px';
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentWindow?.document;
      if (!iframeDoc) throw new Error("Gagal membuat konteks cetak");

      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { margin: 0; padding: 0; background: white; }
              * { border-color: black; }
            </style>
          </head>
          <body>
            ${htmlContent}
          </body>
        </html>
      `);
      iframeDoc.close();

      // Ensure images are loaded in the iframe before printing
      await new Promise(resolve => setTimeout(resolve, 500));

      const opt = {
        margin:       10, // top, left, bottom, right
        filename:     `${surat.jenis} - ${surat.judul}.pdf`,
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, logging: false },
        jsPDF:        { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
      };

      await html2pdf().set(opt).from(iframeDoc.body.firstElementChild || iframeDoc.body).save();
      
      document.body.removeChild(iframe);
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
