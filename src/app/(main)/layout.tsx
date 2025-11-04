import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import AppShell from '@/component/layout/AppShell';

export default async function IndexLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return redirect("/signin")
  }
  return (
    <AppShell>
      {children}
    </AppShell>
  )
}