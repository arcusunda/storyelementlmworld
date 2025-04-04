export const DEFAULT_WHITELIST = [834, 91, 9126, 934, 936, 1524, 426];

export function getMuertoWhitelist(): number[] {
  const whitelistStr = process.env.NEXT_PUBLIC_MUERTO_WHITELIST;
  if (!whitelistStr) {
    console.warn('NEXT_PUBLIC_MUERTO_WHITELIST is not defined');
    return DEFAULT_WHITELIST;
  }
  
  return whitelistStr
    .split(',')
    .map(id => parseInt(id.trim(), 10))
    .filter(id => !isNaN(id));
}

export function getRandomMuertoId(): number {
  const whitelist = getMuertoWhitelist();
  if (whitelist.length === 0) {
    console.warn('No whitelisted Muertos available');
    return DEFAULT_WHITELIST[0];
  }
  
  const randomIndex = Math.floor(Math.random() * whitelist.length);
  return whitelist[randomIndex];
}

export function useRandomMuerto(router: any) {
  return () => {
    const randomId = getRandomMuertoId();
    router.push(`/losmuertosworld/muertos/${randomId}`);
  };
}