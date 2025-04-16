import AppShell from '@/lib/component/common/AppShell/AppShell';

export default function IndexLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AppShell>
      {children}
    </AppShell>
  )
}