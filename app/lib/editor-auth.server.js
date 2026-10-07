/** Shared password session for /editor and /editor/pages. */
export const SESSION_KEY = 'editorAuthUntil';
export const SESSION_HOURS = 8;

export function isAuthed(session) {
  return Number(session.get(SESSION_KEY) ?? 0) > Date.now();
}

/** Constant-time string compare so the password check doesn't leak timing. */
export function safeEqual(a, b) {
  const x = String(a ?? '');
  const y = String(b ?? '');
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    diff |= (x.charCodeAt(i) || 0) ^ (y.charCodeAt(i) || 0);
  }
  return diff === 0;
}
