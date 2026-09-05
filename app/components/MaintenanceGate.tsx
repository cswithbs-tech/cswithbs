import { headers } from "next/headers";
import Setting from "@/models/Setting";
import dbConnect from "@/lib/db";
import MaintenancePage from "@/app/maintenance/page";
import AnnouncementBar from "./AnnouncementBar";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function MaintenanceGate({
  children,
}: {
  children: React.ReactNode;
}) {
  await dbConnect();

  // Fetch Site Settings
  let isMaintenance = false;
  let showAnnouncement = false;
  let announcementMessage = "";

  try {
    const settings = await Setting.find({
      key: {
        $in: [
          "maintenance_mode",
          "announcement_active",
          "announcement_message",
        ],
      },
    });

    const config = settings.reduce((acc: any, curr: any) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});

    isMaintenance = !!config.maintenance_mode;
    showAnnouncement = !!config.announcement_active;
    announcementMessage = config.announcement_message || "";
  } catch (e) {
    console.error("Failed to check site settings", e);
  }

  // Check Current Path
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";

  // 1. Get User Session and evaluate roles
  const session = await getServerSession(authOptions);
  const roles = (session?.user as any)?.roles || [];
  
  const isSuperAdminOrAdmin = Array.isArray(roles) 
    ? roles.some((r: string) => ["ADMIN", "SUPER_ADMIN"].includes(r.toUpperCase()))
    : ["ADMIN", "SUPER_ADMIN"].includes((roles as string).toUpperCase());

  // 2. Admins completely bypass maintenance mode.
  // They can browse the live site, Writer's Hub, etc., to verify everything works before turning maintenance off.
  if (isSuperAdminOrAdmin) {
    return (
      <>
        {showAnnouncement && <AnnouncementBar message={announcementMessage} />}
        {children}
      </>
    );
  }

  // 3. For standard users and writers, check if the route is a core system route.
  // Note: We intentionally DO NOT allow "/login" here to prevent public signups/logins during maintenance.
  // Only the secret "/admin" (which redirects to /admin/login) and essential "/api" routes remain open.
  const isInternal =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api");

  // 4. Block access to the public site and Writer's Hub for non-admins if maintenance is active
  if (isMaintenance && !isInternal) {
    return <MaintenancePage />;
  }

  return (
    <>
      {showAnnouncement && <AnnouncementBar message={announcementMessage} />}
      {children}
    </>
  );
}
