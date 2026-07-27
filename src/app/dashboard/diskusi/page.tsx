import DiskusiList from "@/components/diskusi/DiskusiList";

export const metadata = {
  title: "Forum Diskusi - Admin Dashboard",
};

export default function DiskusiAdminPage() {
  return <DiskusiList basePath="/dashboard/diskusi" role="admin" />;
}
