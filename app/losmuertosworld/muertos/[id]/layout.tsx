import { Metadata } from 'next';

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}): Promise<Metadata> {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  try {
    const response = await fetch(`https://storyelement.ai/api/muertos/${id}`, {
      next: { revalidate: 60 },
    });

    console.log('response:', response);
    const muerto = await response.json();
    console.log('Muerto:', muerto);
    const [ipfsHash, filename] = muerto.image.replace('ipfs://', '').split('/');
    const imageUrl = `https://storyelement.ai/api/image-proxy/${ipfsHash}/${filename}`;

    return {
      metadataBase: new URL('https://storyelement.ai'),
      title: `${muerto.name} - StoryElement for Los Muertos World`,
      description: `Chat with ${muerto.name} #${id}`,
      twitter: {
        card: 'summary_large_image',
        site: '@arcusunda',
        title: `${muerto.name} - StoryElement for Los Muertos World`,
        description: `Chat with ${muerto.name} #${id}`,
        images: [imageUrl],
      },
      openGraph: {
        title: `${muerto.name} - StoryElement for Los Muertos World`,
        description: `Chat with ${muerto.name} #${id}`,
        images: [{ url: imageUrl }],
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'StoryElement for Los Muertos World',
      description: 'An error occurred while fetching metadata.',
    };
  }
}

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}