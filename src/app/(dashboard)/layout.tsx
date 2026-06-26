import { requireUser } from "@/lib/auth";
import { DesktopSidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Redirects to /sign-in when unauthenticated; also syncs the Clerk user.
  await requireUser();

  return (
    <div className="flex min-h-screen">
      <DesktopSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 p-4 lg:p-6">
          <div className="mx-auto w-full max-w-7xl animate-fade-in space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
