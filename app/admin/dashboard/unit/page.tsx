import { UnitTable } from "@/components/admin/UnitTable";

export default function UnitPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Unit List</h1>
      <UnitTable />
    </div>
  );
}
