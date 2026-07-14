import { getOrCreateGoogleSheet } from "./google-sheets";

const SHEET_TITLE = "ActivityLog";
const HEADERS = ["id", "action", "description", "user", "created_at"];

export type ActivityLog = {
  id: string;
  action: string;
  description: string;
  user: string;
  created_at: string;
};

export async function addActivityLog(action: string, description: string, user: string = "Admin") {
  try {
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    if (!spreadsheetId) return;

    const sheet = await getOrCreateGoogleSheet(spreadsheetId, SHEET_TITLE, HEADERS);
    const id = Date.now().toString();
    await sheet.addRow({
      id,
      action,
      description,
      user,
      created_at: new Date().toISOString(),
    });
  } catch (e) {
    console.error("Failed to add activity log:", e);
  }
}

export async function getActivityLogs(limit = 10): Promise<ActivityLog[]> {
  try {
    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    if (!spreadsheetId) return [];

    const sheet = await getOrCreateGoogleSheet(spreadsheetId, SHEET_TITLE, HEADERS);
    const rows = await sheet.getRows();

    return rows
      .map((r) => ({
        id: r.get("id"),
        action: r.get("action"),
        description: r.get("description"),
        user: r.get("user"),
        created_at: r.get("created_at"),
      }))
      .filter((r) => r.id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
  } catch (e) {
    console.error("Failed to get activity logs:", e);
    return [];
  }
}
