import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Inisialisasi Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { faseKelas, mapel, topik, waktu, kehadiran, catatan } = body;

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'API Key Gemini belum dikonfigurasi. Silakan tambahkan GEMINI_API_KEY di environment variables.' },
        { status: 500 }
      );
    }

    if (!faseKelas || !mapel || !topik || !waktu) {
      return NextResponse.json(
        { error: 'Formulir belum lengkap (Fase, Mapel, Topik, dan Waktu wajib diisi)' },
        { status: 400 }
      );
    }

    // Menggunakan model yang cepat dan mumpuni
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    let prompt = `Anda adalah asisten AI profesional untuk membantu Guru Madrasah Ibtidaiyah (MI) di Indonesia membuat Jurnal Mengajar Harian / Logbook Pembelajaran yang sesuai dengan standar KMA 1503 (Kurikulum Berbasis Cinta & Deep Learning).
Berdasarkan data berikut, buatkan format laporan Jurnal Mengajar yang terstruktur, rapi, dan mudah dibaca:

- Fase & Kelas: ${faseKelas}
- Mata Pelajaran: ${mapel}
- Materi Pokok / Topik: ${topik}
- Waktu Pelaksanaan / JP: ${waktu}
${kehadiran ? `- Kehadiran Siswa: ${kehadiran}` : ''}
${catatan ? `- Catatan Khusus / Hambatan Guru: ${catatan}` : ''}

Struktur Jurnal Mengajar WAJIB terdiri dari:
1. IDENTITAS PEMBELAJARAN (Hari/Tanggal (kosongkan titik-titik agar diisi manual), Kelas, Mapel, Topik, Waktu, Kehadiran Siswa).
2. TUJUAN PEMBELAJARAN (Tuliskan rumusan tujuan pembelajaran yang relevan dengan topik ini secara singkat).
3. KEGIATAN PEMBELAJARAN (Sajikan secara ringkas dalam bentuk poin-poin):
   - Pendahuluan (Doa, motivasi).
   - Inti (Tuliskan aktivitas bermakna yang memuat unsur Deep Learning: Mindful, Meaningful, Joyful).
   - Penutup (Refleksi dan kesimpulan).
4. INTEGRASI PANCA CINTA (KBC) (Sebutkan satu/dua nilai panca cinta: Cinta Allah/Rasul, Ilmu, Diri, Sesama, atau Lingkungan yang ditanamkan pada sesi ini).
5. PENILAIAN / ASESMEN (Teknik asesmen yang digunakan secara singkat).
6. REFLEKSI & TINDAK LANJUT GURU (Sintesis dari catatan hambatan guru jika ada, dan apa rencana tindak lanjut pertemuan berikutnya).

Aturan tambahan dan Format HTML:
- WAJIB gunakan struktur HTML yang semantik dan RAPI. JANGAN menumpuk teks tanpa jarak.
- Gunakan <h3> untuk Judul Bagian Utama (seperti: 1. IDENTITAS PEMBELAJARAN).
- Untuk Identitas Pembelajaran, WAJIB gunakan format tabel HTML agar sejajar: <table><tr><td width="200"><strong>Kelas</strong></td><td>: [Kelas]</td></tr>...</table>
- Gunakan tag <ul> atau <ol> dengan <li> untuk rincian kegiatan dan deskripsi.
- Beri jarak antar elemen menggunakan <br> atau <p> jika perlu.
- Jangan berikan pembuka percakapan (seperti "Berikut adalah jurnal..."), langsung berikan kode HTML-nya (tanpa backtick markdown \`\`\`html).
- Pastikan bahasanya profesional, baku, dan sesuai konteks Madrasah.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Membersihkan jika AI masih mengembalikan format markdown codeblock
    text = text.replace(/```html\n?/g, '').replace(/```\n?/g, '');

    return NextResponse.json({ success: true, data: text });

  } catch (error: any) {
    console.error('Error generating jurnal mengajar:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan saat menghubungi layanan AI.' },
      { status: 500 }
    );
  }
}
