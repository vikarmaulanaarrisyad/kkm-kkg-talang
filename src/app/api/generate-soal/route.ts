import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Inisialisasi Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { kelas, mapel, topik, jumlahSoal, kesulitan, jenisSoal } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'API Key Gemini belum dikonfigurasi. Silakan tambahkan GEMINI_API_KEY di environment variables.' },
        { status: 500 }
      );
    }

    if (!kelas || !mapel || !topik || !jumlahSoal || !kesulitan || !jenisSoal) {
      return NextResponse.json(
        { error: 'Semua field harus diisi' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    let prompt = `Buatkan soal ujian berstandar Kurikulum Merdeka untuk anak Madrasah Ibtidaiyah (MI) dengan kriteria berikut:
- Kelas: ${kelas}
- Mata Pelajaran: ${mapel}
- Topik/Materi Pokok: ${topik}
- Jumlah Soal: ${jumlahSoal} soal
- Tingkat Kesulitan: ${kesulitan}
- Jenis Soal: ${jenisSoal}

Aturan Penulisan:
1. Jika jenis soal Pilihan Ganda, PASTIKAN setiap pilihan jawaban SELALU DITULIS dengan format huruf awalan A, B, C, D secara eksplisit (contoh: A. Jawaban pertama, B. Jawaban kedua, dst). Jangan sekadar menggunakan bullet points biasa. Ketik hurufnya secara manual di setiap pilihan.
2. Sediakan KUNCI JAWABAN lengkap di bagian paling akhir.
3. Format hasil output WAJIB menggunakan elemen HTML standar (<br>, <h3>, <h4>, <ul>, <ol>, <li>, <strong>, <p>) tanpa membungkus dengan backtick markdown (\`\`\`html).
4. Jangan berikan kalimat pembuka, langsung berikan kode HTML-nya.
5. Gunakan bahasa Indonesia yang baku, sopan, dan mudah dipahami siswa MI.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Remove markdown codeblocks if AI still includes them
    text = text.replace(/```html\n?/g, '').replace(/```\n?/g, '');

    return NextResponse.json({ success: true, data: text });

  } catch (error: any) {
    console.error('Error generating questions:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan saat menghubungi layanan AI.' },
      { status: 500 }
    );
  }
}
