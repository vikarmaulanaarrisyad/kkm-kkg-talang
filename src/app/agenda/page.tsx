export const revalidate = 60; // Cache selama 60 detik

import { getOrCreateGoogleSheet } from "@/lib/google-sheets";
import { Calendar, Clock, MapPin, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "Agenda Kegiatan | KKM & KKG",
  description: "Jadwal dan Agenda Kegiatan Kelompok Kerja Madrasah (KKM) dan Kelompok Kerja Guru (KKG)",
};

async function getAgendas() {
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
  if (!spreadsheetId) return [];

  try {
    const sheet = await getOrCreateGoogleSheet(spreadsheetId, "Agenda", [
      "id", "title", "date", "time", "location", "description", "status", "created_at"
    ]);
    const rows = await sheet.getRows();
    const data = rows.map(r => ({
      id: r.get("id"),
      title: r.get("title"),
      date: r.get("date"),
      time: r.get("time"),
      location: r.get("location"),
      description: r.get("description"),
      status: r.get("status"),
      created_at: r.get("created_at"),
    }));

    // Urutkan berdasarkan tanggal terdekat / terbaru
    data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return data;
  } catch (error) {
    console.error("Gagal mengambil data agenda:", error);
    return [];
  }
}

export default async function AgendaPage() {
  const agendas = await getAgendas();
  
  const upcomingAgendas = agendas.filter(a => a.status !== "Completed" && new Date(a.date) >= new Date(new Date().setHours(0,0,0,0)));
  const pastAgendas = agendas.filter(a => a.status === "Completed" || new Date(a.date) < new Date(new Date().setHours(0,0,0,0)));

  return (
    <main className="flex-grow flex flex-col w-full bg-slate-50 min-h-screen pb-20">
      <div className="bg-gradient-to-b from-madrasah-900 to-madrasah-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Calendar className="w-16 h-16 mx-auto mb-6 text-gold-400" />
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Agenda Kegiatan</h1>
          <p className="text-madrasah-100 text-lg max-w-2xl mx-auto leading-relaxed">
            Jadwal kegiatan terbaru, rapat kerja, dan acara penting dari Kelompok Kerja Madrasah (KKM) & Kelompok Kerja Guru (KKG).
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-8 relative z-10 w-full space-y-12">
        {/* Agenda Akan Datang */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-bold text-slate-800">Akan Datang</h2>
            <Badge className="bg-emerald-500 hover:bg-emerald-600">{upcomingAgendas.length}</Badge>
          </div>
          
          {upcomingAgendas.length === 0 ? (
            <Card className="border-dashed shadow-sm">
              <CardContent className="py-12 text-center text-muted-foreground">
                <Calendar className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                <p>Belum ada agenda kegiatan dalam waktu dekat.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {upcomingAgendas.map(agenda => (
                <Card key={agenda.id} className="border-l-4 border-l-emerald-500 shadow-md hover:shadow-lg transition-all overflow-hidden group">
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row">
                      <div className="bg-emerald-50/50 sm:w-48 p-6 flex flex-col items-center justify-center border-b sm:border-b-0 sm:border-r border-slate-100">
                        <span className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-1">
                          {new Date(agenda.date).toLocaleDateString('id-ID', { month: 'short' })}
                        </span>
                        <span className="text-4xl font-black text-slate-800">
                          {new Date(agenda.date).getDate()}
                        </span>
                        <span className="text-sm font-medium text-slate-500 mt-1">
                          {new Date(agenda.date).getFullYear()}
                        </span>
                      </div>
                      <div className="p-6 flex-1">
                        <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-emerald-700 transition-colors">{agenda.title}</h3>
                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600 mb-4">
                          {agenda.time && (
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-emerald-500" />
                              <span>{agenda.time}</span>
                            </div>
                          )}
                          {agenda.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-emerald-500" />
                              <span>{agenda.location}</span>
                            </div>
                          )}
                        </div>
                        {agenda.description && (
                          <p className="text-slate-600 text-sm leading-relaxed border-t pt-3 border-slate-100">
                            {agenda.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Agenda Selesai */}
        {pastAgendas.length > 0 && (
          <section className="opacity-80">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Telah Selesai</h2>
              <Badge variant="secondary">{pastAgendas.length}</Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pastAgendas.map(agenda => (
                <Card key={agenda.id} className="shadow-sm border-slate-200">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3 text-sm font-medium text-slate-500">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(agenda.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">{agenda.title}</h3>
                    {(agenda.time || agenda.location) && (
                      <div className="space-y-1 text-sm text-slate-500 mb-3">
                        {agenda.time && <p>Waktu: {agenda.time}</p>}
                        {agenda.location && <p>Tempat: {agenda.location}</p>}
                      </div>
                    )}
                    <Badge variant="outline" className="bg-slate-50">Selesai</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
