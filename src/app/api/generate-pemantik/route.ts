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

    let prompt = `Anda adalah seorang ahli pendidikan Kurikulum Merdeka spesialis "Deep Learning" (Pembelajaran Mendalam) berdasarkan KMA 1503 untuk tingkat Madrasah Ibtidaiyah (MI).
Tugas Anda adalah merumuskan sekumpulan **Pertanyaan Pemantik Tingkat Tinggi (HOTS)** dan **Skenario Eksplorasi** yang akan memaksa anak-anak MI berpikir kritis, menalar, dan berdiskusi dengan gembira, bukan sekadar menghafal teori.

Data Materi:
- Fase & Kelas: ${faseKelas}
- Mata Pelajaran: ${mapel}
- Topik Pokok: ${topik}

Buatlah hasil dengan struktur berikut:
1. 3 PERTANYAAN PEMANTIK UTAMA (HOTS) (Berupa pertanyaan terbuka [open-ended] yang menggelitik rasa ingin tahu anak terkait topik ini. Contoh: "Bagaimana jadinya dunia jika...", "Mengapa menurutmu...").
2. 1 KASUS / TEKA-TEKI PEMIKIRAN (Berikan sebuah cerita pendek atau masalah sederhana yang relate dengan kehidupan anak MI, lalu minta mereka mencari solusinya berdasarkan topik tersebut).
3. DISKUSI BERPASANGAN ("Think-Pair-Share") (Berikan satu topik instruksi di mana anak harus mengobrol dengan teman sebangkunya selama 5 menit tentang materi ini).
4. TIPS GURU (1 paragraf saran untuk guru tentang bagaimana memandu sesi tanya jawab ini agar tetap "Joyful" dan "Meaningful" sesuai KMA 1503, dan apa yang harus dilakukan jika anak menjawab salah).

Aturan tambahan dan Format HTML:
- WAJIB gunakan struktur HTML yang semantik dan RAPI (<br>, <h3>, <h4>, <ul>, <ol>, <li>, <strong>, <p>, <table>) tanpa membungkus dengan backtick markdown (\`\`\`html).
- Sesuaikan bobot bahasa dan kompleksitas dengan usia ${faseKelas}.
- Jangan berikan pembuka percakapan, langsung berikan kode HTML-nya.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    text = text.replace(/```html\n?/g, '').replace(/```\n?/g, '');

    return NextResponse.json({ success: true, data: text });

  } catch (error: any) {
    console.error('Error generating pertanyaan pemantik:', error);
    return NextResponse.json(
      { error: (error.message || '').includes('429') || (error.message || '').includes('Quota') ? 'Batas penggunaan AI gratis harian telah habis atau server Google sedang sibuk. Mohon coba kembali besok atau beberapa saat lagi.' : (error.message || 'Terjadi kesalahan saat menghubungi layanan AI.') },
      { status: 500 }
    );
  }
}
