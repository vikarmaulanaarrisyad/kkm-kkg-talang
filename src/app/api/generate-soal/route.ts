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

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    let prompt = `Anda adalah seorang ahli pembuat soal ujian untuk tingkat Madrasah Ibtidaiyah (MI) di Indonesia.
Buatlah soal dengan detail berikut:
- Kelas: ${kelas}
- Mata Pelajaran: ${mapel}
- Topik/Materi: ${topik}
- Tingkat Kesulitan: ${kesulitan}
- Jumlah Soal: ${jumlahSoal}
- Jenis Soal: ${jenisSoal}

Aturan tambahan:
1. Soal harus sesuai dengan kurikulum MI di Indonesia (menggunakan bahasa Indonesia yang baik dan benar).
2. Jika jenis soal adalah "Pilihan Ganda", berikan 4 pilihan ganda (A, B, C, D).
3. Berikan Kunci Jawaban di bagian bawah, terpisah dari soal.
4. Formatlah hasil output Anda menggunakan HTML standar tanpa menggunakan Markdown backticks, gunakan tag HTML seperti <h2>, <ol>, <li>, <strong>, <br>, <p>. Jangan bungkus respon dengan \`\`\`html.
Pastikan struktur HTML-nya rapi untuk langsung di-render di dalam container berkelas "prose".
Format Contoh Output:
<h3>Soal ${jenisSoal}</h3>
<ol>
  <li>Pertanyaan pertama...
    <ol type="A">
      <li>Pilihan A</li>
      <li>Pilihan B</li>
      <li>Pilihan C</li>
      <li>Pilihan D</li>
    </ol>
  </li>
</ol>
<hr/>
<h3>Kunci Jawaban</h3>
<ol>
  <li>Jawaban 1</li>
</ol>
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
