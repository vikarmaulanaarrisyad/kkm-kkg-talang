import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { namaSiswa, nilaiRata, predikat, kelebihan, kelemahan, gayaBahasa, panjangNarasi } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'API Key Gemini belum dikonfigurasi. Silakan tambahkan GEMINI_API_KEY di environment variables.' },
        { status: 500 }
      );
    }

    if (!nilaiRata || !kelebihan) {
      return NextResponse.json(
        { error: 'Nilai Rata-rata dan Kelebihan Siswa harus diisi' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    let prompt = `Buatkan deskripsi atau catatan wali kelas untuk raport siswa (Madrasah Ibtidaiyah/SD) dengan data berikut:
- Nama Siswa: ${namaSiswa || 'Siswa'}
- Nilai Rata-rata: ${nilaiRata} (Predikat: ${predikat})
- Kelebihan / Pencapaian: ${kelebihan}
- Area yang Perlu Ditingkatkan / Kelemahan: ${kelemahan || 'Tidak ada catatan khusus'}
- Gaya Bahasa: ${gayaBahasa}
- Panjang Narasi: ${panjangNarasi}

Aturan Penulisan:
1. Posisikan diri Anda sebagai Guru Wali Kelas yang sedang menulis catatan di raport.
2. Buat 1 atau 2 paragraf yang mengalir dengan baik, menggabungkan apresiasi atas kelebihan/pencapaian, memberikan motivasi atau saran konstruktif untuk mengatasi kelemahan (jika ada), dan harapan untuk semester/tahun berikutnya.
3. Jangan sebutkan nilai angka secara gamblang jika tidak perlu, lebih fokus pada perkembangan sikap dan akademisnya.
4. Gunakan sapaan yang sesuai (misalnya Ananda ${namaSiswa || 'Siswa'}).
5. Format hasil output dalam paragraf HTML biasa menggunakan tag <p>. Jangan gunakan judul, langsung ke isi catatan. Jangan membungkus dengan markdown \`\`\`html.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Remove markdown codeblocks if AI still includes them
    text = text.replace(/```html\n?/g, '').replace(/```\n?/g, '');

    return NextResponse.json({ success: true, data: text });

  } catch (error: any) {
    console.error('Error generating raport narrative:', error);
    return NextResponse.json(
      { error: (error.message || '').includes('429') || (error.message || '').includes('Quota') || (error.message || '').includes('503') || (error.message || '').includes('high demand') ? 'Batas penggunaan AI gratis harian telah habis atau server Google sedang sibuk. Mohon coba kembali besok atau beberapa saat lagi.' : (error.message || 'Terjadi kesalahan saat menghubungi layanan AI.') },
      { status: 500 }
    );
  }
}
