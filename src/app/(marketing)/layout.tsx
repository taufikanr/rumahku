import { getCurrentProfile } from "@/lib/auth";
import { getLang } from "@/lib/i18n-server";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();
  const lang = await getLang();
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader
        user={profile ? { fullName: profile.fullName, role: profile.role } : null}
        lang={lang}
      />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
