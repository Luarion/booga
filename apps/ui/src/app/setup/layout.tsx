import { CenteredLayout } from '@/components/CenteredLayout';

export default function SetupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CenteredLayout>{children}</CenteredLayout>;
}
