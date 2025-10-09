import dns from 'node:dns/promises';
import net from 'node:net';

const CONTROL_CHARS_REGEX = /[\u0000-\u001F\u007F]+/g;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

const PRIVATE_IPV4_RANGES = [
  [/^10\./, true],
  [/^127\./, true],
  [/^169\.254\./, true],
  [/^172\.(1[6-9]|2[0-9]|3[0-1])\./, true],
  [/^192\.168\./, true],
  [/^0\./, true],
];

const MAX_INPUT_LENGTH = {
  email: 254,
  password: 72,
  default: 512,
  name: 80,
};

export function sanitizeString(value, { maxLength = MAX_INPUT_LENGTH.default } = {}) {
  if (typeof value !== 'string') {
    return '';
  }

  const trimmed = value.trim().replace(CONTROL_CHARS_REGEX, '');
  return trimmed.slice(0, maxLength);
}

export function sanitizeEmail(value) {
  const sanitized = sanitizeString(value, { maxLength: MAX_INPUT_LENGTH.email }).toLowerCase();
  if (!sanitized || !EMAIL_REGEX.test(sanitized)) {
    return null;
  }
  return sanitized;
}

export function isPasswordAllowed(value) {
  if (typeof value !== 'string') {
    return false;
  }

  if (value.length < 8 || value.length > MAX_INPUT_LENGTH.password) {
    return false;
  }

  // Ensure the password does not include control characters
  return !CONTROL_CHARS_REGEX.test(value);
}

export function sanitizeActionType(value, allowed = []) {
  const sanitized = sanitizeString(value, { maxLength: 32 }).toLowerCase();
  if (allowed.length && !allowed.includes(sanitized)) {
    return null;
  }
  return sanitized;
}

function isPrivateIPv4(ip) {
  return PRIVATE_IPV4_RANGES.some(([regex]) => regex.test(ip));
}

function isPrivateIPv6(ip) {
  const normalized = ip.toLowerCase();
  if (normalized.startsWith('::ffff:')) {
    const mapped = normalized.slice(7);
    if (net.isIP(mapped) === 4) {
      return isPrivateIPv4(mapped);
    }
  }
  return (
    normalized === '::1' ||
    normalized.startsWith('fc') ||
    normalized.startsWith('fd') ||
    normalized.startsWith('fe80')
  );
}

function isPrivateIp(address) {
  const family = net.isIP(address);
  if (family === 4) {
    return isPrivateIPv4(address);
  }
  if (family === 6) {
    return isPrivateIPv6(address);
  }
  // Treat unknown addresses as unsafe to avoid SSRF edge-cases
  return true;
}

export async function validateRemoteUrl(input, { allowHttp = false } = {}) {
  if (typeof input !== 'string') {
    return null;
  }

  let parsed;
  try {
    parsed = new URL(input);
  } catch (error) {
    return null;
  }

  const protocol = parsed.protocol.toLowerCase();
  const allowedProtocols = allowHttp ? ['https:', 'http:'] : ['https:'];
  if (!allowedProtocols.includes(protocol)) {
    return null;
  }

  if (!parsed.hostname || parsed.username || parsed.password) {
    return null;
  }

  if (parsed.hostname === 'localhost') {
    return null;
  }

  try {
    const records = await dns.lookup(parsed.hostname, { all: true });
    if (!records.length) {
      return null;
    }

    const unsafe = records.some(({ address }) => isPrivateIp(address));
    if (unsafe) {
      return null;
    }
  } catch (error) {
    return null;
  }

  return parsed;
}

export function clampFileSize(bytes, maxBytes) {
  return typeof bytes === 'number' && Number.isFinite(bytes) && bytes <= maxBytes;
}

export function safeJsonResponse(res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Pragma', 'no-cache');
}
