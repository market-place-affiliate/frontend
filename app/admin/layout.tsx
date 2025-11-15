import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Panel - Affiliate Management',
  description: 'Admin panel for managing affiliate campaigns',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
