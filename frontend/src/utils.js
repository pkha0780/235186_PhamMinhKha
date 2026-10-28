export function coverStyle(seed = '') {
  let hash = 0;
  for (const ch of seed) hash = (hash * 31 + ch.charCodeAt(0)) % 360;
  return {
    '--cover-bg': `hsl(${hash} 32% 90%)`,
    '--cover-fg': `hsl(${hash} 42% 28%)`,
  };
}

export function stockInfo(quantity) {
  if (quantity <= 0) return { label: 'Hết sách', tone: 'danger' };
  if (quantity <= 5) return { label: `Sắp hết · ${quantity}`, tone: 'warning' };
  return { label: `Còn ${quantity}`, tone: 'success' };
}
