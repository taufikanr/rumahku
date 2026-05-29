import Link from "next/link";
import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";

/**
 * A Button that navigates like a link. Renders a real <a> (via next/link) and
 * sets `nativeButton={false}` so Base UI doesn't expect a native <button>.
 */
export function ButtonLink({
  href,
  ...props
}: Omit<ComponentProps<typeof Button>, "render"> & { href: string }) {
  return <Button nativeButton={false} {...props} render={<Link href={href} />} />;
}
