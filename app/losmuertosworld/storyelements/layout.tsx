import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Muerto StoryElements | Los Muertos World',
  description: 'Explore the rich histories and untold tales of muertos within a particular narrative context.',
};

export default function StoryElementsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}