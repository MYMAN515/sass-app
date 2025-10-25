export function isAbortError(error) {
  if (!error) return false;
  const name = error.name || error.code;
  if (name === 'AbortError' || name === 'ABORT_ERR') return true;
  const message = typeof error.message === 'string' ? error.message : '';
  return message.includes('aborted');
}

