import { getCurrentProfile } from "@/lib/auth";
import { getUnreadCount } from "@/lib/messages";
import { getLang } from "@/lib/i18n-server";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ConciergeWidget } from "@/components/concierge/concierge-widget";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  const unread = profile ? await getUnreadCount() : 0;
  const lang = await getLang();
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader
        user={profile ? { fullName: profile.fullName, role: profile.role } : null}
        unread={unread}
        lang={lang}
      />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <ConciergeWidget />
    </div>
  );
}
