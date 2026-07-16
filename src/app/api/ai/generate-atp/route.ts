import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { mapel, fase, kelas, elemen, cp } = await req.json();

    if (!mapel || !fase || !cp) {
      return NextResponse.json({ error: "Mata pelajaran, Fase, dan Capaian Pembelajaran wajib diisi" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "API Key Gemini belum dikonfigurasi. Silakan tambahkan GEMINI_API_KEY di environment variables." }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ 
      model: "gemini-flash-latest",
      generationConfig: {
        responseMimeType: "application/json",
        maxOutputTokens: 4096
      }
    });

    const prompt = `Anda adalah ahli kurikulum merdeka yang bertugas menyusun Alur Tujuan Pembelajaran (ATP).
Buatlah Alur Tujuan Pembelajaran berdasarkan data berikut:
- Mata Pelajaran: ${mapel}
- Fase/Kelas: ${fase} / ${kelas || "-"}
- Elemen: ${elemen || "Umum"}
- Capaian Pembelajaran (CP): ${cp}

Berikan hasilnya dalam format JSON dengan struktur yang valid (TANPA MARKDOWN) sebagai berikut:
{
  "atp": [
    {
      "kode": "Tuliskan kode tujuan, misal: TP.1.1",
      "tujuan": "Tuliskan deskripsi Tujuan Pembelajaran yang terukur (mengandung kompetensi dan materi)",
      "materi": "Materi Inti",
      "alokasiWaktu": "Misal: 2 JP",
      "profilPelajarPancasila": "Karakter/Profil Pelajar Pancasila yang relevan"
    }
  ],
  "ringkasan": "Ringkasan singkat tentang alur yang dibuat"
}

Pastikan output HANYA JSON murni tanpa ada teks lain di luarnya.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean markdown code blocks if any
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    let jsonResult;
    try {
      jsonResult = JSON.parse(text);
    } catch (parseError) {
      console.error("JSON Parse Error. Raw text:", text);
      return NextResponse.json({ error: "Terjadi kesalahan format data dari AI. Silakan klik Generate lagi." }, { status: 500 });
    }

    return NextResponse.json(jsonResult);
  } catch (error: any) {
    console.error("Error generating ATP:", error);
    return NextResponse.json({ error: (error.message || '').includes('429') || (error.message || '').includes('Quota') ? 'Batas penggunaan AI gratis harian telah habis atau server Google sedang sibuk. Mohon coba kembali besok atau beberapa saat lagi.' : (error.message || 'Terjadi kesalahan saat men-generate ATP') }, { status: 500 });
  }
}
