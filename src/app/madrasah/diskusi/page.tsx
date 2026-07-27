import DiskusiList from "@/components/diskusi/DiskusiList";

export const metadata = {
  title: "Forum Diskusi - Dashboard Madrasah",
};

export default function DiskusiMadrasahPage() {
  return <DiskusiList basePath="/madrasah/diskusi" role="madrasah" />;
}
