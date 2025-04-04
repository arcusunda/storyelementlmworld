import fetch from 'node-fetch';

export async function fetchMagicEdenListings(collectionSymbol: string) {
  const listings = [];
  let offset = 0;
  const limit = 50;

  while (true) {
    const url = `https://api-mainnet.magiceden.dev/v2/collections/${collectionSymbol}/listings?offset=${offset}&limit=${limit}`;
    const response = await fetch(url);
    const data: any[] = await response.json() as any[];

    if (data.length === 0) break;

    listings.push(...data);
    offset += limit;
  }

  return listings;
}

interface Listing {
  price: number;
  attributes: { trait_type: string; value: string }[];
}

export function calculateFloorPrices(listings: Listing[]) {
  const floorPrices: { [key: string]: number } = {};

  listings.forEach((listing) => {
    const price = listing.price;
    listing.attributes.forEach(({ trait_type, value }) => {
      const key = `${trait_type}:${value}`;
      if (!floorPrices[key]) {
        floorPrices[key] = price;
      } else {
        floorPrices[key] = Math.min(floorPrices[key], price);
      }
    });
  });

  return floorPrices;
}
