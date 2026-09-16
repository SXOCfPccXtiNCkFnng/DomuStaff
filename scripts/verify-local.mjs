/**
 * Smoke test: localStore + api without Supabase keys.
 * Run: node scripts/verify-local.mjs
 */
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const store = new Map();

globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => { store.set(k, String(v)); },
  removeItem: (k) => { store.delete(k); },
};

// Vite env shim — force local mode
process.env.VITE_SUPABASE_URL = '';
process.env.VITE_SUPABASE_ANON_KEY = '';

// constants / localStore / api are ESM without import.meta.env in localStore;
// api.js imports supabase.js which reads import.meta.env — patch via dynamic import after mock.
const { readFileSync, writeFileSync, unlinkSync } = await import('node:fs');
const apiPath = path.join(root, 'src/lib/api.js');
const supabasePath = path.join(root, 'src/lib/supabase.js');
const localPath = path.join(root, 'src/lib/localStore.js');
const constantsPath = path.join(root, 'src/lib/constants.js');

// Strip lucide icons from constants for node
const constantsSrc = readFileSync(constantsPath, 'utf8')
  .replace(/import \{[\s\S]*?\} from 'lucide-react';\s*/, '')
  .replace(/icon: \w+,?/g, '');
const tmpConstants = path.join(root, 'scripts/_tmp_constants.mjs');
writeFileSync(tmpConstants, constantsSrc);

const tmpLocal = path.join(root, 'scripts/_tmp_localStore.mjs');
writeFileSync(
  tmpLocal,
  readFileSync(localPath, 'utf8').replace("from './constants'", "from './_tmp_constants.mjs'")
);

const tmpApi = path.join(root, 'scripts/_tmp_api.mjs');
writeFileSync(
  tmpApi,
  readFileSync(apiPath, 'utf8')
    .replace("from './supabase'", "from './_tmp_supabase.mjs'")
    .replace("from './localStore'", "from './_tmp_localStore.mjs'")
    .replace("from './constants'", "from './_tmp_constants.mjs'")
);

writeFileSync(
  path.join(root, 'scripts/_tmp_supabase.mjs'),
  `export const supabaseUrl = '';\nexport const supabaseAnonKey = '';\nexport const isSupabaseConfigured = false;\nexport const supabase = null;\n`
);

try {
  const api = await import(pathToFileURL(tmpApi).href);

  const marcos = await api.signIn('marcos.ferreira@atlantico.com.br', 'domu123');
  if (marcos.account.role !== 'gerencia') throw new Error('Marcos role');

  const data = await api.loadHotelData(marcos.account);
  if (data.professionals.length !== 14) throw new Error('pros ' + data.professionals.length);

  await api.sendToRH({
    hotelId: marcos.account.hotelId,
    sector: 'restaurante',
    dayId: 'sex',
    guestCount: 500,
    professionalCodes: ['1', '2', '3'],
    uuidByCode: {},
    createdBy: marcos.account.id,
  });

  const afterSend = await api.loadHotelData(marcos.account);
  if (!afterSend.sentDays.sex) throw new Error('sentDays.sex missing');

  await api.signOut();
  const joao = await api.signIn('joao.pedro@domustaff.app', 'domu123');
  if (joao.account.role !== 'freelancer') throw new Error('João role');

  const freela = await api.loadHotelData(joao.account);
  const pending = freela.invites.filter((i) => i.status === 'pending');
  if (pending.length < 1) throw new Error('no pending invites');

  await api.setInviteStatus(pending[0].id, 'accepted');
  const again = await api.loadHotelData(joao.account);
  const accepted = again.invites.find((i) => i.id === pending[0].id);
  if (accepted.status !== 'accepted') throw new Error('accept not persisted');

  const session = await api.getSession();
  if (session.account.role !== 'freelancer') throw new Error('session lost');

  console.log('OK — login, sendToRH, accept invite, session persist');
} finally {
  for (const f of ['_tmp_constants.mjs', '_tmp_localStore.mjs', '_tmp_api.mjs', '_tmp_supabase.mjs']) {
    try { unlinkSync(path.join(root, 'scripts', f)); } catch {}
  }
}
