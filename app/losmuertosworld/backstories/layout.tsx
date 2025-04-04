import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Muerto Backstories | Los Muertos World',
  description: 'Explore the rich histories and untold tales of Los Muertos World characters.',
};

export default function BackstoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}