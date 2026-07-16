import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { faseKelas, mapel, topik } = body;

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'API Key Gemini belum dikonfigurasi. Silakan tambahkan GEMINI_API_KEY di environment variables.' },
        { status: 500 }
      );
    }

    if (!faseKelas || !mapel || !topik) {
      return NextResponse.json(
        { error: 'Semua kolom form harus diisi' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    let prompt = `Anda adalah seorang instruktur Kurikulum Merdeka ahli Kurikulum Berbasis Cinta (KBC) / Panca Cinta sesuai pedoman KMA 1503 untuk tingkat Madrasah Ibtidaiyah (MI).
Tugas Anda adalah merancang Skenario Aktivitas Panca Cinta yang sangat praktis dan bermakna berdasarkan data berikut:

- Fase & Kelas: ${faseKelas}
- Mata Pelajaran: ${mapel}
- Topik / Materi: ${topik}

Buatlah Skenario Panca Cinta dengan format terstruktur sebagai berikut:
1. PENGANTAR (Konteks bagaimana materi ini sangat relevan dengan nilai kasih sayang dan kehidupan sehari-hari anak MI).
2. IMPLEMENTASI 5 CINTA (Berikan 1 ide aktivitas kelas, pertanyaan pemantik, atau tugas singkat untuk masing-masing nilai cinta berikut, kaitkan secara logis dengan Topik):
   - Cinta Allah dan Rasul-Nya
   - Cinta Ilmu
   - Cinta Diri Sendiri
   - Cinta Sesama (Manusia)
   - Cinta Lingkungan / Alam Semesta
3. REFLEKSI PENUTUP (Satu kalimat afirmasi positif yang harus diucapkan bersama-sama di akhir pelajaran).

Aturan tambahan dan Format HTML:
- WAJIB gunakan struktur HTML yang semantik dan RAPI (<br>, <h3>, <h4>, <ul>, <ol>, <li>, <strong>, <p>, <table>) tanpa membungkus dengan backtick markdown (\`\`\`html).
- Buat agar bahasanya mudah dimengerti, empatik, dan inspiratif.
- Jangan berikan pembuka percakapan, langsung berikan kode HTML-nya.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    text = text.replace(/```html\n?/g, '').replace(/```\n?/g, '');

    return NextResponse.json({ success: true, data: text });

  } catch (error: any) {
    console.error('Error generating KBC scenario:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan saat menghubungi layanan AI.' },
      { status: 500 }
    );
  }
}
