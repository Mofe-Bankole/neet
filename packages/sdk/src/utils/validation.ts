import { NeetSDKError } from '../errors.js'

/** Minimum length of a .neet handle. */
export const HANDLE_MIN_LENGTH = 3

/** Maximum length of a .neet handle. */
export const HANDLE_MAX_LENGTH = 20

/** Allowed characters: lowercase letters, digits, underscore, hyphen. */
export const HANDLE_REGEX = /^[a-z0-9_-]+$/

/** Suffix appended to every claimed handle. */
export const NEET_SUFFIX = '.neet'

/**
 * Nimiq uses a modified RFC-4648 base32 alphabet (32 symbols).
 * It omits `I`, `O`, and `Z` to avoid ambiguity.
 */
export const NIMIQ_ALPHABET = '0123456789ABCDEFGHJKLMNPQRSTUVXY'

/**
 * Canonical Nimiq address shape: `NQ` + 2 checksum digits + 32 alphabet chars
 * (36 characters total, spaces optional, human-readable tag allowed after `+`).
 */
const NIMIQ_ADDRESS_REGEX = new RegExp(
  `^NQ\\d{2}[${NIMIQ_ALPHABET}]{32}(?:\\+[A-Za-z0-9-]{1,32})?$`,
)

// Ethereum-style addresses used for cross-chain comparison / future support.
const ETHEREUM_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/

/**
 * Trim, lowercase, and strip any `.neet` suffix from a handle-like input.
 */
export function normalizeHandle(handle: string): string {
  if (typeof handle !== 'string') {
    throw new NeetSDKError('Handle must be a string', { code: 'VALIDATION' })
  }
  return handle.trim().toLowerCase().replace(/\.neet$/, '')
}

/**
 * Validate a handle and return its normalized (bare) form.
 */
export function assertValidHandle(handle: string, label = 'handle'): string {
  const normalized = normalizeHandle(handle)
  if (normalized.length < HANDLE_MIN_LENGTH || normalized.length > HANDLE_MAX_LENGTH) {
    throw new NeetSDKError(
      `${label} must be between ${HANDLE_MIN_LENGTH} and ${HANDLE_MAX_LENGTH} characters`,
      { code: 'VALIDATION' },
    )
  }
  if (!HANDLE_REGEX.test(normalized)) {
    throw new NeetSDKError(
      `${label} can only contain lowercase letters, numbers, underscores, and hyphens`,
      { code: 'VALIDATION' },
    )
  }
  return normalized
}

/**
 * Validate a handle and return the canonical full form (`foo.neet`).
 */
export function toFullHandle(handle: string): string {
  return `${assertValidHandle(handle)}${NEET_SUFFIX}`
}

/** Non-throwing check for handle validity. */
export function isValidHandle(handle: string): boolean {
  try {
    assertValidHandle(handle)
    return true
  } catch {
    return false
  }
}

/** Normalize a Nimiq address: trim, uppercase, remove whitespace. */
export function normalizeNimiqAddress(address: string): string {
  if (typeof address !== 'string') {
    throw new NeetSDKError('Nimiq address must be a string', { code: 'VALIDATION' })
  }
  return address.trim().toUpperCase().replace(/\s+/g, '')
}

/** Validate a Nimiq address (shape + IBAN mod-97 checksum) and return its normalized form. */
export function assertValidNimiqAddress(address: string, label = 'Nimiq address'): string {
  const normalized = normalizeNimiqAddress(address)
  const core = normalized.split('+', 1)[0] ?? normalized
  if (!NIMIQ_ADDRESS_REGEX.test(normalized) || ibanChecksum(core) !== 1) {
    throw new NeetSDKError(`${label} must be a valid Nimiq NQ address`, {
      code: 'VALIDATION',
    })
  }
  return normalized
}

/** Non-throwing check for Nimiq address validity. */
export function isValidNimiqAddress(address: string): boolean {
  try {
    assertValidNimiqAddress(address)
    return true
  } catch {
    return false
  }
}

/**
 * IBAN-style mod-97 checksum verification used by Nimiq user-friendly addresses.
 * Move the first 4 chars (`NQ` + check digits) to the end, map letters to
 * 10-35, then require the resulting integer modulo 97 to equal 1.
 */
function ibanChecksum(address: string): number {
  if (address.length !== 36) return -1

  const rearranged = address.slice(4) + address.slice(0, 4)
  let num = ''
  for (const char of rearranged) {
    const code = char.charCodeAt(0)
    if (char >= '0' && char <= '9') {
      num += char
    } else if (char >= 'A' && char <= 'Z') {
      num += String(code - 55)
    } else {
      return -1
    }
  }

  let checksum = 0
  for (const char of num) {
    checksum = (checksum * 10 + (char.charCodeAt(0) - 48)) % 97
  }
  return checksum
}

/** Non-throwing check for Ethereum address validity (structural only). */
export function isValidEthereumAddress(address: string): boolean {
  return typeof address === 'string' && ETHEREUM_ADDRESS_REGEX.test(address)
}