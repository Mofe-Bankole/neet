# Nimiq verification implementation research

Checked 10 September 2026. This is a source audit and local cryptographic fixture check, not a claim of a successful Nimiq Pay device transaction.

## Decision summary

Use `@nimiq/mini-app-sdk` 0.1.0 in the browser and the Node export of `@nimiq/core` 2.21.0 for server signature verification and canonical address parsing. Return both public key and signature from the browser helper. A server-selected RPC endpoint independently verifies payments. Never accept the browser's success flag as payment evidence.

The existing `work/repo-audit/src/lib/nimiq.ts` discards `publicKey`, hard-codes testnet, rounds floating-point values, and ignores the memo. Its companion hook assumes account/network events absent from the inspected documented interface and removes event handlers using different callback identities. These need implementation changes, not new claims in documentation.

## Message verification

1. Retrieve the stored, immutable server challenge by its ID. Validate its intended purpose, wallet, origin, network, expiry, session binding, and unused state. Do not accept a replacement message supplied by the caller.
2. Require public key to match 64 hex characters and signature 128 hex characters. No permissive truncation, embedded whitespace, odd hex length, or implicit encoding fallback.
3. Encode the exact stored message as UTF-8. Its length is the encoded byte count, not JavaScript UTF-16 `string.length`.
4. Prefix bytes are UTF-8 `\x16Nimiq Signed Message:\n`. There is **no space** between `\x16` and `Nimiq`. The prefix is 23 bytes total. Then concatenate decimal ASCII message-byte length, then the original message bytes; there is no delimiter between the decimal length and message.
5. Compute SHA-256 once over that preimage.
6. Parse `PublicKey.fromHex(publicKeyHex)` and `Signature.fromHex(signatureHex)`.
7. Derive `publicKey.toAddress()`, compare to `Address.fromString(expectedWallet)` using canonical addresses (or `equals`). A valid signature by a different wallet is rejected.
8. Call **`publicKey.verify(signature, digestBytes)`**. The current Core API does not use the old `signature.verify(publicKey, hash)` method seen in older documentation.
9. Atomically consume the one-time challenge and apply the authorized mutation in one database transaction. Enforce expiry and unused state in the mutation predicate, not solely in a prior read.

Reference implementation (server-only):

```ts
import { Address, Hash, PublicKey, Signature } from '@nimiq/core';

export function verifyNimiqMessage(
  message: string, expectedWallet: string, publicKeyHex: string, signatureHex: string,
): boolean {
  if (!/^[0-9a-fA-F]{64}$/.test(publicKeyHex)
    || !/^[0-9a-fA-F]{128}$/.test(signatureHex)) return false;
  try {
    const encoder = new TextEncoder();
    const body = encoder.encode(message);
    const header = encoder.encode('\x16Nimiq Signed Message:\n' + body.byteLength);
    const preimage = new Uint8Array(header.byteLength + body.byteLength);
    preimage.set(header);
    preimage.set(body, header.byteLength);
    const publicKey = PublicKey.fromHex(publicKeyHex);
    if (!publicKey.toAddress().equals(Address.fromString(expectedWallet))) return false;
    return publicKey.verify(Signature.fromHex(signatureHex), Hash.computeSha256(preimage));
  } catch {
    return false;
  }
}
```

This function only checks cryptography and address binding; it does not replace the challenge/session/authorization checks above.

### Evidence and compatibility limitation

- The published SDK registry identifies version 0.1.0 and source commit `15f9c92d0ae4c9a86bec31a25684714c7442047b`. Latest inspected provider source `49cfe535b90c61e48766d1f7a6206a80442692a1` passes `{message,isHex?}` to the native host and returns `{publicKey,signature}`. [SDK/provider source](https://github.com/nimiq/trust-web3-provider/blob/49cfe535b90c61e48766d1f7a6206a80442692a1/packages/nimiq/NimiqProvider.ts), [official provider documentation](https://nimiq.dev/mini-apps/api-reference/nimiq-provider).
- The exact prefix and byte algorithm are established in [Keyguard Key.js](https://github.com/nimiq/keyguard/blob/99bf5ae57a3bbc773ce9898fb4083eaeb03b0af0/src/lib/Key.js#L125) and [SignMessagePrefix.ts](https://github.com/nimiq/keyguard/blob/99bf5ae57a3bbc773ce9898fb4083eaeb03b0af0/client/src/SignMessagePrefix.ts).
- Current Core verifies through [PublicKey.verify](https://github.com/nimiq/core-rs-albatross/blob/6052b33ba9c9ce15e9d58d58c3367d4be91779da/web-client/src/primitives/public_key.rs#L71).
- NimQuest's own published [verifier](https://github.com/mystiquemide/nimquest/blob/main/apps/api/src/wallet-proof-service.js) and [encoder](https://github.com/mystiquemide/nimquest/blob/main/apps/api/src/nimiq-signed-message.js) implement the same format. Its README reports a device-completed proof; that statement has not been independently reproduced here.
- Native Nimiq Pay's signing implementation was not found publicly in this research. Capture real ASCII and Unicode `sign()` fixtures in Nimiq Pay and check them against the server verifier before claiming device compatibility. Do not add permissive raw-message or alternate-prefix fallbacks to conceal a failed fixture.

### Local fixture approach

`signature-vectors.json` contains four deterministic vectors generated with Node's built-in Ed25519 implementation using an explicitly synthetic test seed. These cover ASCII, multiline, Unicode, and an empty message. They are **not** signatures captured from a device. `generate-vectors.cjs` independently checks the signatures with Node crypto. Run those vectors through the server's Core verifier; assert changed message, wrong wallet, changed signature, extra-space prefix, and UTF-16-length encodings fail. Application challenges should reject an empty message even though the cryptographic primitive supports one.

## RPC payment verification

### Wire format

Request:

```json
{"jsonrpc":"2.0","id":1,"method":"getTransactionByHash","params":["<64-character transaction hash>"]}
```

Current raw JSON-RPC success has the structure:

```text
result: {
  data: {
    hash, blockNumber, timestamp, confirmations,
    from, fromType, to, toType, value, fee,
    senderData, recipientData, flags, validityStartHeight,
    proof, networkId, executionResult, ...
  },
  metadata: null
}
```

`executionResult` is flattened into the transaction object. Data fields are hex strings. The response includes an executed transaction from indexed history, including reward entries; it is not a promise that every hash represents an ordinary successful payment.

Source: [RPC structures, transaction fields and envelope](https://github.com/nimiq/core-rs-albatross/blob/6052b33ba9c9ce15e9d58d58c3367d4be91779da/rpc-interface/src/types.rs#L537), [lookup implementation](https://github.com/nimiq/core-rs-albatross/blob/6052b33ba9c9ce15e9d58d58c3367d4be91779da/rpc-server/src/dispatchers/blockchain.rs#L157).

### Network mapping

| App setting | `getNetworkId` result.data | Transaction networkId |
|---|---|---:|
| mainnet | MainAlbatross | 24 |
| testnet | TestAlbatross | 5 |
| devnet | DevAlbatross | 6 |

Old PoW IDs 42/1/2 do not identify current PoS networks. Network names are serialized strings for `getNetworkId`, whereas transaction `networkId` is explicitly a byte value. [Official enum and serializer](https://github.com/nimiq/core-rs-albatross/blob/6052b33ba9c9ce15e9d58d58c3367d4be91779da/primitives/src/networks.rs).

The browser provider's `.getNetwork()` returns `'nimiq'` (chain family). It does not distinguish mainnet and testnet. Its generic `.request()` forwards non-wallet requests to its configured RPC; therefore querying that RPC's network also does not prove the native wallet's selected network. Show the application's configured network prominently, require a matching server RPC, and reject payments from any other network.

### Matching recipe

- Persist an immutable payment intent before requesting the wallet. Bind contributor address, authenticated builder address, exact Luna amount, network, and a random intent ID.
- Parse decimal user amounts into integer Luna using string arithmetic, at most five decimal places; reject unsafe or out-of-range integers. Do not round a floating-point `amountNim * 100_000`.
- Use `sendBasicTransactionWithData` with the marker `dotneet:<intentId>`. This reference becomes public blockchain data. Do not put contribution text, private names, sensitive evidence, or authentication tokens in it.
- Send only the resulting hash to the server's verification endpoint. The server chooses the RPC URL; never accept a caller-supplied endpoint.
- Validate HTTP status, request timeout, JSON-RPC ID/envelope and error branch. Validate the returned transaction with a strict schema.
- Require exact transaction hash; network ID; canonical sender and recipient addresses; integer Luna value; `fromType === 0`, `toType === 0`, `flags === 0`; and recipientData matching the marker's UTF-8 hex. For this intentionally narrow flow reject contract/staking/reward transactions and self-payments if the PRD excludes them.
- Require `executionResult === true`. A recorded transaction may have failed execution.
- Require a valid blockNumber, timestamp, and sufficient confirmations under the documented policy. Normal transaction confirmations are `headHeight - blockNumber + 1` in current source. At least one means included; it is not a claim of irreversible finality. Strong finality claims require a separately checked macro-block policy.
- Store the exact checked fields, verification timestamp and verification-policy version. Ensure unique `(network, transactionHash)` and one payment per intent in the database.
- Bind the later signed acknowledgment to intent ID, payment hash, network, contributor address, issuer address, amount, statement, evidence link, and schema version. Store the exact signing text; do not rebuild it from mutable profiles later.
- Treat signing and payment as separate approvals. If payment succeeds but signing is cancelled, resume the signature step against the same payment. Never request a second payment automatically.

### Errors and recovery

`getTransactionByHash` does not search the mempool. A missing hash can mean not yet included, wrong network, an old/pruned record, or an unavailable history source. The current server maps its errors to JSON-RPC internal error with the specific reason in `error.data`, for example `Transaction not found: <hash>`. Inspect the full error; do not classify all internal errors as pending.

Missing transaction can be a pending/reconciliation state; missing history index, unsupported light node, RPC failure, malformed response, timeout, or rate limiting are verification-unavailable states. None is proof that the transfer failed. [RPC error implementation](https://github.com/nimiq/core-rs-albatross/blob/6052b33ba9c9ce15e9d58d58c3367d4be91779da/rpc-server/src/error.rs), [official migration note on mempool behavior](https://nimiq.dev/migration/migration-json-rpc).

If the wallet request times out after user approval, suppress another send and offer reconciliation by transaction hash/marker. Server idempotency alone cannot undo or prevent a second wallet transfer when the client blindly resends.

Open community RPC endpoints are development resources without uptime guarantees. A configured reliable history-indexed RPC is a release dependency, not a fabricated default. [Official open-server guidance](https://nimiq.dev/rpc/open-servers).

## PostgreSQL validation boundary

The initial workstation check did not find a usable native PostgreSQL server, and Docker was unavailable. A separate native PostgreSQL 18.4 installation was subsequently prepared on loopback for final verification. Both migrations and the HTTP lifecycle tests passed against that real PostgreSQL instance; see [the final validation report](VALIDATION.md) for scope and results. The earlier PGlite socket experiment failed concurrent-client correctness and was removed from the supported setup. Schema validation or migration generation alone would not establish database execution or concurrency correctness.

## Addendum: native payment result and error compatibility (11 September)

A source/documentation inconsistency remains: current [official provider docs](https://nimiq.dev/mini-apps/api-reference/nimiq-provider#sendbasictransactionwithdata) call the returned string a transaction hash, while the published SDK 0.1.0 type declarations and provider source JSDoc call it a serialized transaction. The runtime bridge simply forwards the host result, so source alone does not resolve what a particular Nimiq Pay build returns.

Use a narrow compatibility adapter on the server: accept an exact 64-hex string as a hash; otherwise accept only bounded, even-length hex, parse with `Transaction.deserialize`, require exact serialization round-trip equality, and take `transaction.hash()`. Reject objects, malformed values, trailing bytes, and oversized input as unknown results requiring reconciliation. Do not use a generic hash of the serialized string. Do not broadcast it, auto-resend, or mark paid based on parsing. The independently fetched, matching executed transaction remains the payment evidence.

`review-transaction-result.cjs` exercises the current Core parser with a locally constructed unsigned fixture. It accepts a serialized transaction and direct uppercase hash, while rejecting appended bytes, malformed text, and oversized input. Nothing was signed or sent. This does not replace capturing a real Nimiq Pay result.

The official [FAQ](https://nimiq.dev/mini-apps/faq) and provider docs identify `PermissionDeniedError` as a user's rejected confirmation. The published SDK exposes a generic `ErrorResponse.error.type` string, not a closed enum or exported native error class. Reset a pending attempt only on the exact structured `PermissionDeniedError` type/name from the native send operation; do not infer a guaranteed pre-broadcast rejection from error-message text, a timeout, network failure, generic invalid-transaction error, or a later server attach failure. Confirm the actual returned/thrown device shape during release checks.
