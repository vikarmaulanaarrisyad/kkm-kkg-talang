import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { deskripsi, umur, mapelFavorit } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'API Key Gemini belum dikonfigurasi. Silakan tambahkan GEMINI_API_KEY di environment variables.' },
        { status: 500 }
      );
    }

    if (!deskripsi) {
      return NextResponse.json(
        { error: 'Deskripsi perilaku siswa harus diisi' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    let prompt = `Anda adalah seorang ahli Psikologi Pendidikan dan Psikolog Anak berpengalaman untuk siswa tingkat Madrasah Ibtidaiyah (MI) / Sekolah Dasar.
Tugas Anda adalah menganalisis gaya belajar (Learning Style) seorang siswa berdasarkan observasi kebiasaan dan perilakunya di kelas.

Data Observasi Siswa:
- Kelas / Rentang Usia: ${umur}
- Pelajaran / Aktivitas yang Disukai: ${mapelFavorit || 'Tidak disebutkan'}
- Deskripsi Kebiasaan & Perilaku: "${deskripsi}"

Berikan analisis komprehensif dengan struktur berikut:
1. Diagnosis Gaya Belajar Utama (Sebutkan apakah Visual, Auditori, Kinestetik, atau kombinasinya, dan persentasenya jika memungkinkan).
2. Penjelasan Psikologis (Mengapa Anda menyimpulkan gaya belajar tersebut dari perilaku di atas).
3. 5 Strategi Mengajar Praktis (Langkah konkret yang bisa dilakukan guru di kelas untuk memfasilitasi anak ini agar lebih fokus dan paham).
4. Pendekatan Komunikasi (Cara berbicara atau menegur anak ini agar merasa dihargai dan tidak tantrum/bosan).

Aturan:
1. Format hasil menggunakan elemen HTML standar (<br>, <h3>, <h4>, <ul>, <ol>, <li>, <strong>, <p>, <table>) tanpa membungkus dengan backtick markdown (\`\`\`html).
2. Gunakan gaya bahasa yang empatik, profesional, mudah dipahami, dan memberikan semangat kepada guru (rekan sejawat).
3. Jangan berikan kalimat pengantar, langsung berikan output HTML-nya.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Remove markdown codeblocks if AI still includes them
    text = text.replace(/```html\n?/g, '').replace(/```\n?/g, '');

    return NextResponse.json({ success: true, data: text });

  } catch (error: any) {
    console.error('Error generating learning style:', error);
    return NextResponse.json(
      { error: (error.message || '').includes('429') || (error.message || '').includes('Quota') || (error.message || '').includes('503') || (error.message || '').includes('high demand') ? 'Batas penggunaan AI gratis harian telah habis atau server Google sedang sibuk. Mohon coba kembali besok atau beberapa saat lagi.' : (error.message || 'Terjadi kesalahan saat menghubungi layanan AI.') },
      { status: 500 }
    );
  }
}
