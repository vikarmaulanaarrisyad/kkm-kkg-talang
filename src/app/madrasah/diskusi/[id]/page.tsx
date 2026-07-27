import DiskusiDetail from "@/components/diskusi/DiskusiDetail";

export const metadata = {
  title: "Detail Diskusi - Dashboard Madrasah",
};

export default async function DiskusiMadrasahDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DiskusiDetail id={id} basePath="/madrasah/diskusi" />;
}
