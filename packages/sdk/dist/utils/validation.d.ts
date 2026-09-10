/** Minimum length of a .neet handle. */
export declare const HANDLE_MIN_LENGTH = 3;
/** Maximum length of a .neet handle. */
export declare const HANDLE_MAX_LENGTH = 20;
/** Allowed characters: lowercase letters, digits, underscore, hyphen. */
export declare const HANDLE_REGEX: RegExp;
/** Suffix appended to every claimed handle. */
export declare const NEET_SUFFIX = ".neet";
/**
 * Nimiq uses a modified RFC-4648 base32 alphabet (32 symbols).
 * It omits `I`, `O`, and `Z` to avoid ambiguity.
 */
export declare const NIMIQ_ALPHABET = "0123456789ABCDEFGHJKLMNPQRSTUVXY";
/**
 * Trim, lowercase, and strip any `.neet` suffix from a handle-like input.
 */
export declare function normalizeHandle(handle: string): string;
/**
 * Validate a handle and return its normalized (bare) form.
 */
export declare function assertValidHandle(handle: string, label?: string): string;
/**
 * Validate a handle and return the canonical full form (`foo.neet`).
 */
export declare function toFullHandle(handle: string): string;
/** Non-throwing check for handle validity. */
export declare function isValidHandle(handle: string): boolean;
/** Normalize a Nimiq address: trim, uppercase, remove whitespace. */
export declare function normalizeNimiqAddress(address: string): string;
/** Validate a Nimiq address (shape + IBAN mod-97 checksum) and return its normalized form. */
export declare function assertValidNimiqAddress(address: string, label?: string): string;
/** Non-throwing check for Nimiq address validity. */
export declare function isValidNimiqAddress(address: string): boolean;
/** Non-throwing check for Ethereum address validity (structural only). */
export declare function isValidEthereumAddress(address: string): boolean;
//# sourceMappingURL=validation.d.ts.map