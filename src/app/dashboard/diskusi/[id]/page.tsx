import DiskusiDetail from "@/components/diskusi/DiskusiDetail";

export const metadata = {
  title: "Detail Diskusi - Admin Dashboard",
};

export default async function DiskusiAdminDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DiskusiDetail id={id} basePath="/dashboard/diskusi" />;
}
