import { AdminDashboard } from "@/features/admin/admin-dashboard";
import { getAdminDashboardData } from "@/features/admin/queries";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const data = await getAdminDashboardData();

  return <AdminDashboard data={data} />;
}
