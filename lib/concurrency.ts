import {
  MAX_CONCURRENT_GENERATIONS_GLOBAL,
  MAX_CONCURRENT_GENERATIONS_PER_IP,
} from '@/lib/config';

let globalInFlight = 0;
const perIpInFlight = new Map<string, number>();

export function acquireGenerationSlot(ipHash: string): { ok: true; release: () => void } | { ok: false; reason: 'global' | 'ip' } {
  if (globalInFlight >= MAX_CONCURRENT_GENERATIONS_GLOBAL) {
    return { ok: false, reason: 'global' };
  }

  const ipCount = perIpInFlight.get(ipHash) || 0;
  if (ipCount >= MAX_CONCURRENT_GENERATIONS_PER_IP) {
    return { ok: false, reason: 'ip' };
  }

  globalInFlight += 1;
  perIpInFlight.set(ipHash, ipCount + 1);

  return {
    ok: true,
    release: () => {
      globalInFlight = Math.max(0, globalInFlight - 1);
      const next = Math.max(0, (perIpInFlight.get(ipHash) || 0) - 1);
      if (next === 0) {
        perIpInFlight.delete(ipHash);
      } else {
        perIpInFlight.set(ipHash, next);
      }
    },
  };
}
