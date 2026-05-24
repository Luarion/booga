import { CenteredLayout } from '@/components/CenteredLayout';

export default function SignLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CenteredLayout>{children}</CenteredLayout>;
}
