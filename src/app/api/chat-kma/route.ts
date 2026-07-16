import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'API Key Gemini belum dikonfigurasi.' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { messages } = body; // Array of { role: 'user' | 'model', content: string }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    const SYSTEM_PROMPT = `Anda adalah "Konsultan KMA 1503", seorang Asisten AI spesialis pedagogik Madrasah Ibtidaiyah yang ramah, antusias, dan berwibawa.
Tugas Anda adalah membantu guru-guru merancang ide mengajar, memberikan pemahaman terkait Kurikulum Berbasis Cinta, dan merumuskan strategi Deep Learning (HOTS).
Jawablah dengan bahasa Indonesia yang natural, suportif, dan memotivasi. Sapa guru dengan sebutan "Bapak/Ibu Guru".
WAJIB: Format jawaban Anda WAJIB menggunakan tag HTML semantik (contoh: <p>, <strong>, <ul>, <li>, <br>) karena akan dirender menggunakan dangerouslySetInnerHTML. JANGAN gunakan markdown backticks (seperti \`\`\`html atau \`\`\`). Jangan gunakan tag markdown standar (seperti ** atau *).`;

    // Format for Gemini API
    const contents = messages.map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

    // Inject system prompt into the first user message
    if (contents.length > 0 && contents[0].role === 'user') {
      const originalText = contents[0].parts[0].text;
      contents[0].parts[0].text = `[SYSTEM INSTRUCTION]: ${SYSTEM_PROMPT}\n\n[USER MESSAGE]: ${originalText}`;
    }

    const result = await model.generateContent({ contents });
    const response = await result.response;
    let text = response.text();
    
    // Clean up potential markdown formatting that the AI might still try to output
    text = text.replace(/```html\n?/g, '').replace(/```\n?/g, '');

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: error.message || "Terjadi kesalahan pada AI" }, { status: 500 });
  }
}
