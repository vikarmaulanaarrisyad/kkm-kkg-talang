import KontakClient from "./KontakClient";
import { getCachedSiteName, getCachedKontakInfo } from "@/lib/settings";

export const revalidate = 60;

export async function generateMetadata() {
  const siteName = await getCachedSiteName();
  return {
    title: `Hubungi Kami | ${siteName}`,
    description: `Hubungi pengurus ${siteName} untuk pertanyaan, saran, dan masukan.`,
  };
}

export default async function KontakPage() {
  const kontakInfo = await getCachedKontakInfo();
  return <KontakClient kontakInfo={kontakInfo} />;
}
