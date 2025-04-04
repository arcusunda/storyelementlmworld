import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
): Promise<Response> {
  const slug = request.nextUrl.pathname.split('/').filter(Boolean).slice(-2);
  
  if (!slug || slug.length < 2) {
    return new Response('Invalid URL parameters', { status: 400 });
  }

  const hash = slug[0];
  const filename = slug[1];
  const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${hash}/${filename}`;

  try {
    const response = await fetch(ipfsUrl);
    const blob = await response.blob();

    return new Response(blob, {
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'image/png',
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch {
    return new Response('Error fetching image', { status: 500 });
  }
}