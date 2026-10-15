import type { MetadataRoute } from 'next';
import { entries } from '@/lib/data';

export const dynamic = 'force-static';
const BASE = 'https://invisible-infrastructure.netlify.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ['', 'timeline/', 'atlas/', 'connections/', 'follow/', 'plates/', 'sources/', 'sources/report/', 'sources/dataset/'];
  return [...pages.map((p) => ({ url: `${BASE}/${p}` })), ...entries.map((e) => ({ url: `${BASE}/atlas/${e.id}/` }))];
}
