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

    let prompt = `Anda adalah seorang ahli Bahasa Inggris dan guru untuk siswa Madrasah Ibtidaiyah (MI) / SD di Indonesia.
Buatkan ${jenisKonten} dalam Bahasa Inggris dengan topik: "${topik}".
Tingkat kesulitan: ${tingkatKesulitan}.

Aturan:
1. Gunakan Bahasa Inggris yang sederhana, baku, dan sesuai dengan tata bahasa (grammar) dasar untuk anak MI/SD.
2. Wajib berikan terjemahan Bahasa Indonesia di bawah setiap kalimat atau kata.
3. (PENTING) Tambahkan panduan cara pengucapan (pronunciation) sederhana dalam tanda kurung untuk kosakata utama agar mudah dibaca anak-anak.
4. Gunakan kosa kata dasar yang umum diajarkan di tingkat SD/MI.
5. Format hasil output menggunakan elemen HTML standar (<br>, <h3>, <h4>, <ul>, <ol>, <li>, <strong>, <p>, <table>) tanpa membungkus dengan backtick markdown (\`\`\`html).
6. Jangan berikan kalimat pembuka, langsung berikan kode HTML-nya.
7. Format jika Percakapan: Buat dalam tabel HTML dengan kolom: Pembicara, Kalimat Bahasa Inggris, Cara Membaca, Terjemahan.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Remove markdown codeblocks if AI still includes them
    text = text.replace(/```html\n?/g, '').replace(/```\n?/g, '');

    return NextResponse.json({ success: true, data: text });

  } catch (error: any) {
    console.error('Error generating english content:', error);
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan saat menghubungi layanan AI.' },
      { status: 500 }
    );
  }
}
