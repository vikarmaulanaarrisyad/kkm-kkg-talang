"use client";

import { useState } from "react";
import { Download, Bot, Save, FileText, File } from "lucide-react";
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import "jspdf-autotable"; // Make sure to install if not present, but we will use raw or html2pdf if needed. Actually we'll use autoTable if available, otherwise manual.

type ATPItem = {
  kode: string;
  tujuan: string;
  materi: string;
  alokasiWaktu: string;
  profilPelajarPancasila: string;
};

type ATPResult = {
  atp: ATPItem[];
  ringkasan: string;
};

export default function GeneratorATPPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    mapel: "",
    fase: "A",
    kelas: "1",
    elemen: "",
    cp: ""
  });

  const [result, setResult] = useState<ATPResult | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.mapel || !formData.cp) {
      Swal.fire("Peringatan", "Mata Pelajaran dan Capaian Pembelajaran wajib diisi!", "warning");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/ai/generate-atp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Gagal generate ATP");

      setResult(data);
      Swal.fire("Berhasil!", "Alur Tujuan Pembelajaran berhasil digenerate oleh AI.", "success");
    } catch (err: any) {
      Swal.fire("Gagal", err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = () => {
    if (!result) return;
    const doc = new jsPDF({ orientation: "landscape" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("ALUR TUJUAN PEMBELAJARAN (ATP)", 14, 20);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Mata Pelajaran : ${formData.mapel}`, 14, 30);
    doc.text(`Fase / Kelas : ${formData.fase} / ${formData.kelas}`, 14, 36);
    doc.text(`Elemen       : ${formData.elemen || "-"}`, 14, 42);

    // Check if autoTable is available
    if (typeof (doc as any).autoTable === "function") {
      const tableData = result.atp.map(item => [
        item.kode,
        item.tujuan,
        item.materi,
        item.alokasiWaktu,
        item.profilPelajarPancasila
      ]);

      (doc as any).autoTable({
        startY: 50,
        head: [['Kode', 'Tujuan Pembelajaran', 'Materi', 'Waktu', 'Profil Pelajar Pancasila']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [16, 185, 129] }
      });
    } else {
      // Fallback
      doc.text("Gagal meload tabel, silakan gunakan fitur download Word", 14, 55);
    }

    doc.save(`ATP_${formData.mapel.replace(/\s+/g, '_')}_Fase_${formData.fase}.pdf`);
  };

  const exportWord = async () => {
    if (!result) return;
    try {
      // Import docx dynamically
      const docx = await import("docx");
      const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle } = docx;

      const tableRows = [
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Kode", bold: true })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Tujuan Pembelajaran", bold: true })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Materi", bold: true })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Alokasi Waktu", bold: true })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Profil Pelajar Pancasila", bold: true })] })] }),
          ],
        }),
        ...result.atp.map(item => new TableRow({
          children: [
            new TableCell({ children: [new Paragraph(item.kode)] }),
            new TableCell({ children: [new Paragraph(item.tujuan)] }),
            new TableCell({ children: [new Paragraph(item.materi)] }),
            new TableCell({ children: [new Paragraph(item.alokasiWaktu)] }),
            new TableCell({ children: [new Paragraph(item.profilPelajarPancasila)] }),
          ],
        }))
      ];

      const doc = new Document({
        creator: "KKG MI Talang",
        title: "Alur Tujuan Pembelajaran",
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({ text: "ALUR TUJUAN PEMBELAJARAN (ATP)", bold: true, size: 28 }),
              ],
            }),
            new Paragraph({ text: "" }),
            new Paragraph(`Mata Pelajaran: ${formData.mapel}`),
            new Paragraph(`Fase / Kelas: ${formData.fase} / ${formData.kelas}`),
            new Paragraph(`Elemen: ${formData.elemen || "-"}`),
            new Paragraph({ text: "" }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: tableRows,
            }),
            new Paragraph({ text: "" }),
            new Paragraph({ children: [new TextRun({ text: "Ringkasan:", bold: true })] }),
            new Paragraph(result.ringkasan),
          ],
        }],
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ATP_${formData.mapel.replace(/\s+/g, '_')}_Fase_${formData.fase}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error(err);
      Swal.fire("Gagal", "Tidak dapat mengekspor file Word.", "error");
    }
  };

  return (
    <main className="flex-grow flex flex-col w-full bg-slate-50 min-h-screen pb-20 print:bg-white print:pb-0">

      {/* Header Section */}
      <section className="w-full bg-gradient-to-br from-emerald-50 via-white to-emerald-100/50 pt-32 pb-24 px-4 sm:px-6 relative overflow-hidden print:hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 sm:w-96 sm:h-96 rounded-full bg-emerald-200/40 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 sm:w-96 sm:h-96 rounded-full bg-teal-100/40 blur-3xl" />

        <div className="max-w-4xl mx-auto relative z-10 text-center text-slate-800">
          <div className="w-16 h-16 bg-white/50 backdrop-blur-md rounded-2xl border border-white/40 flex items-center justify-center mx-auto mb-8 shadow-xl">
            <Bot className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
            <span className="text-emerald-600">AI Generator</span> ATP
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
            Susun Alur Tujuan Pembelajaran (ATP) Kurikulum Merdeka secara otomatis menggunakan Kecerdasan Buatan.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 -mt-10 relative z-20 w-full space-y-8 print:space-y-0 print:mt-0 print:px-0">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:block">

          {/* Kolom Kiri: Form Input */}
          <div className="lg:col-span-1 print:hidden">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 sticky top-24">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                Data ATP
              </h2>

              <form onSubmit={handleGenerate} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Mata Pelajaran <span className="text-red-500">*</span></label>
                  <textarea
                    required
                    rows={2}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:border-emerald-500 focus:ring-emerald-500 outline-none transition-all bg-white resize-none"
                    placeholder="Cth: Pendidikan Agama Islam"
                    value={formData.mapel}
                    onChange={e => setFormData({ ...formData, mapel: e.target.value })}
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Fase</label>
                    <select
                      className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:border-emerald-500 focus:ring-emerald-500 outline-none transition-all bg-white"
                      value={formData.fase}
                      onChange={e => setFormData({ ...formData, fase: e.target.value })}
                    >
                      <option value="A">Fase A</option>
                      <option value="B">Fase B</option>
                      <option value="C">Fase C</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Kelas</label>
                    <select
                      className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:border-emerald-500 focus:ring-emerald-500 outline-none transition-all bg-white"
                      value={formData.kelas}
                      onChange={e => setFormData({ ...formData, kelas: e.target.value })}
                    >
                      <option value="1">Kelas 1</option>
                      <option value="2">Kelas 2</option>
                      <option value="3">Kelas 3</option>
                      <option value="4">Kelas 4</option>
                      <option value="5">Kelas 5</option>
                      <option value="6">Kelas 6</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Elemen CP</label>
                  <textarea
                    rows={2}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:border-emerald-500 focus:ring-emerald-500 outline-none transition-all bg-white resize-none"
                    placeholder="Cth: Fiqih / Akidah / Menyimak"
                    value={formData.elemen}
                    onChange={e => setFormData({ ...formData, elemen: e.target.value })}
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Capaian Pembelajaran (CP) <span className="text-red-500">*</span></label>
                  <textarea
                    required
                    rows={5}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 focus:border-emerald-500 focus:ring-emerald-500 outline-none transition-all bg-white resize-none"
                    placeholder="Salin dan tempel deskripsi Capaian Pembelajaran di sini..."
                    value={formData.cp}
                    onChange={e => setFormData({ ...formData, cp: e.target.value })}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <><Bot className="w-5 h-5" /> Generate ATP</>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Kolom Kanan: Hasil Preview */}
          <div className="lg:col-span-2 space-y-6">
            {result ? (
              <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800">Hasil ATP</h3>
                    <p className="text-slate-500 text-sm">{formData.mapel} - Fase {formData.fase}</p>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button onClick={exportWord} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl font-bold transition-colors">
                      <File className="w-4 h-4" /> Word
                    </button>
                    <button onClick={exportPDF} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl font-bold transition-colors">
                      <Save className="w-4 h-4" /> PDF
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-emerald-50 text-emerald-700 uppercase font-bold text-[11px]">
                      <tr>
                        <th className="px-4 py-3">Kode</th>
                        <th className="px-4 py-3 min-w-[200px]">Tujuan Pembelajaran</th>
                        <th className="px-4 py-3">Materi</th>
                        <th className="px-4 py-3 whitespace-nowrap">Waktu</th>
                        <th className="px-4 py-3">Profil Pancasila</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-600">
                      {result.atp.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-semibold text-slate-800">{item.kode}</td>
                          <td className="px-4 py-3 leading-relaxed">{item.tujuan}</td>
                          <td className="px-4 py-3">{item.materi}</td>
                          <td className="px-4 py-3">{item.alokasiWaktu}</td>
                          <td className="px-4 py-3 text-emerald-600 font-medium">{item.profilPelajarPancasila}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 bg-slate-50 p-5 rounded-xl border border-slate-100">
                  <h4 className="font-bold text-slate-800 mb-2">Ringkasan AI:</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">{result.ringkasan}</p>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[400px] bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-8 text-slate-400">
                <Bot className="w-16 h-16 text-slate-300 mb-4" />
                <h3 className="text-xl font-bold text-slate-500 mb-2">Belum ada hasil</h3>
                <p className="max-w-md">Isi formulir di samping dan tekan tombol Generate untuk membiarkan AI menyusun ATP secara otomatis.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
