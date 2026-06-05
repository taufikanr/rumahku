import { getCurrentProfile } from "@/lib/auth";
import { getUnreadCount } from "@/lib/messages";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ConciergeWidget } from "@/components/concierge/concierge-widget";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  const unread = profile ? await getUnreadCount() : 0;
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader
        user={profile ? { fullName: profile.fullName, role: profile.role } : null}
        unread={unread}
      />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <ConciergeWidget />
    </div>
  );
}
