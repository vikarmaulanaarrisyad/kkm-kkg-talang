import { NextRequest, NextResponse } from "next/server";
import { getOrCreateGoogleSheet } from "@/lib/google-sheets";

const SHEET_TITLE = "Settings";
const HEADERS = ["key", "value"];
const VISITOR_KEY = "visitor_count";

export async function GET() {
  try {
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    if (!spreadsheetId) return NextResponse.json({ count: 0 });

    const sheet = await getOrCreateGoogleSheet(spreadsheetId, SHEET_TITLE, HEADERS);
    const rows = await sheet.getRows();
    const row = rows.find((r) => r.get("key") === VISITOR_KEY);
    const count = row ? parseInt(row.get("value") || "0", 10) : 0;

    return NextResponse.json({ count });
  } catch (e: any) {
    return NextResponse.json({ count: 0 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    if (!spreadsheetId) return NextResponse.json({ count: 0 });

    const sheet = await getOrCreateGoogleSheet(spreadsheetId, SHEET_TITLE, HEADERS);
    const rows = await sheet.getRows();
    const row = rows.find((r) => r.get("key") === VISITOR_KEY);

    let newCount = 1;
    if (row) {
      newCount = parseInt(row.get("value") || "0", 10) + 1;
      row.assign({ value: String(newCount) });
      await row.save();
    } else {
      await sheet.addRow({ key: VISITOR_KEY, value: "1" });
    }

    return NextResponse.json({ count: newCount });
  } catch (e: any) {
    return NextResponse.json({ count: 0 });
  }
}
