import { query } from './db.js';

const stripAccents = (value) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export function baseUsernameFromName(fullName) {
  const parts = stripAccents(fullName)
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return 'user';
  if (parts.length === 1) return parts[0];

  const first = parts[0];
  const last = parts[parts.length - 1];
  const middle = parts.slice(1, -1).join('');

  return `${first[0]}${middle.slice(0, 1)}${last}`;
}

export async function generateUniqueUsername(fullName) {
  const parts = stripAccents(fullName)
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
  const first = parts[0] ?? 'user';
  const last = parts.length > 1 ? parts[parts.length - 1] : '';
  const middle = parts.slice(1, -1).join('');
  const maxMiddle = Math.max(1, middle.length);

  for (let middleLength = 1; middleLength <= maxMiddle; middleLength += 1) {
    const candidate = parts.length > 1 ? `${first[0]}${middle.slice(0, middleLength)}${last}` : first;
    const exists = await query('SELECT 1 FROM users WHERE username = $1', [candidate]);
    if (exists.rowCount === 0) return candidate;
  }

  const base = parts.length > 1 ? `${first.slice(0, 2)}${middle}${last}` : first;
  let suffix = 2;
  while (suffix < 10000) {
    const candidate = `${base}${suffix}`;
    const exists = await query('SELECT 1 FROM users WHERE username = $1', [candidate]);
    if (exists.rowCount === 0) return candidate;
    suffix += 1;
  }

  throw new Error('Nao foi possivel gerar um username unico.');
}
