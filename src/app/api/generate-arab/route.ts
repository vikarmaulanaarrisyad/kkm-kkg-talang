import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { topik, tingkatKesulitan, jenisKonten } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'API Key Gemini belum dikonfigurasi. Silakan tambahkan GEMINI_API_KEY di environment variables.' },
        { status: 500 }
      );
    }

    if (!topik || !jenisKonten) {
      return NextResponse.json(
        { error: 'Topik dan jenis konten harus diisi' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    let prompt = `Anda adalah seorang ahli Bahasa Arab dan guru untuk siswa Madrasah Ibtidaiyah (MI).
Buatkan ${jenisKonten} dalam Bahasa Arab dengan topik: "${topik}".
Tingkat kesulitan: ${tingkatKesulitan}.

Aturan:
1. Wajib memberikan tulisan Arab lengkap dengan harakat (syakal) agar mudah dibaca oleh anak MI.
2. Berikan terjemahan Bahasa Indonesia di bawah setiap kalimat atau kata.
3. Gunakan kosa kata dasar yang umum diajarkan di tingkat SD/MI.
4. Format hasil output menggunakan elemen HTML standar (<br>, <h3>, <h4>, <ul>, <ol>, <li>, <strong>, <p>, <table>) tanpa membungkus dengan backtick markdown (\`\`\`html).
5. Jangan berikan kalimat pembuka, langsung berikan kode HTML-nya.
6. Untuk teks bahasa Arab, gunakan tag <p dir="rtl" lang="ar" style="font-size: 1.7rem; line-height: 2.5; font-family: 'Amiri', 'Lateef', 'Traditional Arabic', serif; margin-bottom: 0.5rem; text-align: right;"> agar tampilannya besar dan jelas dari kanan ke kiri.
7. Format jika Percakapan: Buat dalam tabel dengan kolom: Pembicara (Arab/Indo), Teks Arab, Teks Terjemahan. Atau pakai format p yang rapi.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Remove markdown codeblocks if AI still includes them
    text = text.replace(/```html\n?/g, '').replace(/```\n?/g, '');

    return NextResponse.json({ success: true, data: text });

  } catch (error: any) {
    console.error('Error generating arab content:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan saat menghubungi layanan AI.' },
      { status: 500 }
    );
  }
}
