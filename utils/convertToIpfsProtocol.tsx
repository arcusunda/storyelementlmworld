/**
 * Converts an IPFS gateway URL to IPFS protocol format
 * From: https://ipfs.io/ipfs/bafkreihd4b2wjisdgonnp3fwu4q7xdvbi5j62f56meyhkznaarrbs2iaze
 * To:   ipfs://bafkreihd4b2wjisdgonnp3fwu4q7xdvbi5j62f56meyhkznaarrbs2iaze
 */
export function convertToIpfsProtocol(url: string): string {
    if (url.startsWith('ipfs://')) {
      return url;
    }
    
    const ipfsGatewayRegex = /https?:\/\/(?:ipfs\.io\/ipfs\/|gateway\.pinata\.cloud\/ipfs\/|dweb\.link\/ipfs\/|cloudflare-ipfs\.com\/ipfs\/|gateway\.ipfs\.io\/ipfs\/|ipfs\.fleek\.co\/ipfs\/|ipfs\.infura\.io\/ipfs\/)([a-zA-Z0-9]+)/;
    const match = url.match(ipfsGatewayRegex);
    
    if (match && match[1]) {
      return `ipfs://${match[1]}`;
    }
    
    const fallbackRegex = /https?:\/\/.*\/ipfs\/([a-zA-Z0-9]+)/;
    const fallbackMatch = url.match(fallbackRegex);
    
    if (fallbackMatch && fallbackMatch[1]) {
      return `ipfs://${fallbackMatch[1]}`;
    }
    
    console.warn('Could not convert to IPFS protocol format:', url);
    return url;
  }