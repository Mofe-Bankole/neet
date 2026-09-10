import { init, NimiqProvider, NimiqPayHostContext } from '@nimiq/mini-app-sdk'

export interface NimiqWalletInfo {
  address: string
  network: 'mainnet' | 'testnet' | 'devnet'
}

export interface NimiqPaymentResult {
  success: boolean
  transactionHash?: string
  error?: string
}

export interface NimiqEndorsementParams {
  toAddress: string
  amountNim: number
  memo?: string
}

declare global {
  interface Window {
    nimiq?: NimiqProvider
    nimiqPay?: NimiqPayHostContext
  }
}

interface ErrorResponse {
  error: { type: string; message: string }
}

let nimiqProviderPromise: Promise<NimiqProvider> | null = null

export async function initializeNimiqProvider(): Promise<NimiqProvider> {
  if (nimiqProviderPromise) return nimiqProviderPromise

  if (typeof window === 'undefined') {
    throw new Error('Window not available')
  }

  nimiqProviderPromise = init({ timeout: 10_000 })
    .then((nimiq) => {
      if (!nimiq) {
        throw new Error('Nimiq provider initialization returned null')
      }
      return nimiq
    })
    .catch((error) => {
      nimiqProviderPromise = null
      throw error
    })

  return nimiqProviderPromise
}

export function isNimiqPayAvailable(): boolean {
  return typeof window !== 'undefined' && !!window.nimiq
}

export async function connectNimiqWallet(): Promise<string[]> {
  const nimiq = await initializeNimiqProvider()
  await nimiq.connect()
  const accounts = await nimiq.listAccounts()
  if (isErrorResponse(accounts)) {
    throw new Error(accounts.error.message)
  }
  return accounts
}

export async function getNimiqAccount(): Promise<NimiqWalletInfo | null> {
  try {
    const nimiq = await initializeNimiqProvider()
    const accounts = await nimiq.listAccounts()
    if (isErrorResponse(accounts) || accounts.length === 0) {
      return null
    }
    return { address: accounts[0], network: 'testnet' }
  } catch {
    return null
  }
}

function isErrorResponse(value: unknown): value is { error: { type: string; message: string } } {
  return typeof value === 'object' && value !== null && 'error' in value
}

export async function sendNimPayment(params: { toAddress: string; amountNim: number; memo?: string }): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
  try {
    const nimiq = await initializeNimiqProvider()
    
    const value = Math.round(params.amountNim * 100_000)
    
    const txHash = await nimiq.sendBasicTransaction({
      recipient: params.toAddress,
      value,
    })
    
    if (isErrorResponse(txHash)) {
      return { success: false, error: txHash.error.message }
    }
    
    return { success: true, transactionHash: txHash }
  } catch (error) {
    console.error('Failed to send NIM payment:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function signMessage(message: string): Promise<string> {
  const nimiq = await initializeNimiqProvider()
  const result = await nimiq.sign(message)
  if (isErrorResponse(result)) {
    throw new Error(result.error.message)
  }
  return result.signature
}

export async function listNimiqAccounts(): Promise<string[]> {
  const nimiq = await initializeNimiqProvider()
  const accounts = await nimiq.listAccounts()
  if (isErrorResponse(accounts)) {
    throw new Error(accounts.error.message)
  }
  return accounts
}

export async function checkConsensus(): Promise<boolean> {
  const nimiq = await initializeNimiqProvider()
  return nimiq.isConsensusEstablished()
}

export async function getBlockNumber(): Promise<number> {
  const nimiq = await initializeNimiqProvider()
  return nimiq.getBlockNumber()
}

export function getNimiqPayLanguage(): string | null {
  if (typeof window === 'undefined') return null
  return window.nimiqPay?.language ?? null
}

export function formatNimAddress(address: string): string {
  if (address.length <= 10) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function formatNimAmount(amount: number): string {
  return `${amount.toFixed(5)} NIM`
}