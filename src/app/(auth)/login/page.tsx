import { LoginForm } from "@/components/auth/login-form";

export const metadata = { title: "Log in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ "check-email"?: string }>;
}) {
  const sp = await searchParams;
  const notice = sp["check-email"]
    ? "Account created! Please confirm your email, then log in."
    : undefined;
  return <LoginForm notice={notice} />;
}
