import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Inisialisasi Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { namaPenyusun, institusi, tahunPelajaran, faseKelas, mapel, topik, waktu, modelPembelajaran, tujuanPembelajaran } = body;

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'API Key Gemini belum dikonfigurasi. Silakan tambahkan GEMINI_API_KEY di environment variables.' },
        { status: 500 }
      );
    }

    if (!faseKelas || !mapel || !topik || !waktu) {
      return NextResponse.json(
        { error: 'Semua kolom form harus diisi' },
        { status: 400 }
      );
    }

    // Menggunakan model yang dijamin tersedia dan update
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    let prompt = `Anda adalah seorang instruktur pendidik profesional dan ahli Kurikulum Merdeka untuk tingkat Madrasah Ibtidaiyah (MI) di Indonesia.
Buatkan sebuah Modul Ajar (Rencana Pelaksanaan Pembelajaran) yang komprehensif, terstruktur, praktis, dan inspiratif berdasarkan detail berikut:

- Nama Penyusun: ${namaPenyusun || 'Guru'}
- Institusi / Madrasah: ${institusi || 'Madrasah Ibtidaiyah'}
- Tahun Pelajaran: ${tahunPelajaran || '2026/2027'}
- Fase & Kelas: ${faseKelas}
- Mata Pelajaran: ${mapel}
- Materi Pokok / Topik: ${topik}
- Alokasi Waktu: ${waktu}
${modelPembelajaran ? `- Model Pembelajaran: ${modelPembelajaran}` : ''}
${tujuanPembelajaran ? `- Tujuan Pembelajaran Spesifik: ${tujuanPembelajaran}` : ''}

Modul Ajar ini harus memuat secara berurutan sesuai pedoman KMA 1503 (Kurikulum Berbasis Cinta & Deep Learning):
1. INFORMASI UMUM: Kompetensi Awal, Profil Pelajar Pancasila & Pelajar Rahmatan Lil 'Alamin, Sarana dan Prasarana, Target Peserta Didik, Model Pembelajaran.
2. KOMPONEN INTI: Tujuan Pembelajaran, Pemahaman Bermakna, Pertanyaan Pemantik (HOTS).
3. INTEGRASI PANCA CINTA (KBC): Jelaskan minimal 3 aktivitas spesifik yang mengintegrasikan nilai Panca Cinta (Cinta Allah/Rasul, Cinta Ilmu, Cinta Diri, Cinta Sesama, atau Cinta Lingkungan) dalam materi ini.
4. KEGIATAN PEMBELAJARAN (Pendekatan Deep Learning):
   - Kegiatan Pendahuluan (Apersepsi, Motivasi, Eksplorasi Makna Awal)
   - Kegiatan Inti (Langkah-langkah Deep Learning: Mindful, Meaningful, Joyful. Jangan hanya transfer materi, berikan aktivitas diskusi, proyek mini, atau pemecahan masalah nyata).
   - Kegiatan Penutup (Refleksi, Kesimpulan bermakna, Doa)
5. ASESMEN: Penilaian Sikap (berbasis KBC), Pengetahuan, dan Keterampilan.
6. PENGAYAAN & REMEDIAL.
7. LAMPIRAN: Lembar Kerja Peserta Didik (LKPD) yang menuntut *Higher Order Thinking Skills* (HOTS), menarik, dan siap cetak.

Aturan tambahan dan Format HTML:
- WAJIB gunakan struktur HTML yang semantik dan RAPI. JANGAN menumpuk teks tanpa jarak.
- Gunakan <h3> untuk Judul Utama (seperti: 1. INFORMASI UMUM, 6. LAMPIRAN LKPD).
- Gunakan <h4> untuk Sub-judul (seperti: A. Identitas Modul, B. Tujuan Pembelajaran).
- Untuk Identitas Modul (Nama Penyusun, Institusi, Tahun, dll), WAJIB gunakan format tabel HTML agar sejajar: <table><tr><td width="200"><strong>Nama Penyusun</strong></td><td>: [Nama]</td></tr>...</table>
- Untuk mendaftar poin (seperti Sarana Prasarana, Langkah Pembelajaran, Asesmen), WAJIB gunakan tag <ul> atau <ol> dengan <li>. JANGAN HANYA menggunakan teks biasa dengan enter/br.
- Beri jarak antar elemen menggunakan <br> atau <p> jika perlu.
- Jangan berikan pembuka percakapan, langsung berikan kode HTML-nya (tanpa backtick markdown \`\`\`html).
- Pastikan kalimatnya baku, mendidik, dan sesuai kurikulum MI.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Membersihkan jika AI masih mengembalikan format markdown codeblock
    text = text.replace(/```html\n?/g, '').replace(/```\n?/g, '');

    return NextResponse.json({ success: true, data: text });

  } catch (error: any) {
    console.error('Error generating modul ajar:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan saat menghubungi layanan AI.' },
      { status: 500 }
    );
  }
}
