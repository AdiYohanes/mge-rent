import { RoomTable } from "@/components/admin/RoomTable";

export default function RoomPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Room List</h1>
      <RoomTable />
    </div>
  );
}
