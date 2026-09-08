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
    nimiq?: {
      connect: () => Promise<NimiqWalletInfo>
      disconnect: () => Promise<void>
      getAccount: () => Promise<NimiqWalletInfo | null>
      signMessage: (message: string) => Promise<string>
      sendTransaction: (params: NimiqEndorsementParams) => Promise<NimiqPaymentResult>
      onAccountChange: (callback: (account: NimiqWalletInfo | null) => void) => () => void
      onNetworkChange: (callback: (network: string) => void) => () => void
    }
  }
}

export function isNimiqPayAvailable(): boolean {
  return typeof window !== 'undefined' && !!window.nimiq
}

export async function connectNimiqWallet(): Promise<NimiqWalletInfo | null> {
  if (!isNimiqPayAvailable()) {
    throw new Error('Nimiq Pay not available. Please open this app inside Nimiq Pay.')
  }
  
  try {
    const account = await window.nimiq!.connect()
    return account
  } catch (error) {
    console.error('Failed to connect Nimiq wallet:', error)
    throw error
  }
}

export async function getNimiqAccount(): Promise<NimiqWalletInfo | null> {
  if (!isNimiqPayAvailable()) {
    return null
  }
  
  try {
    return await window.nimiq!.getAccount()
  } catch (error) {
    console.error('Failed to get Nimiq account:', error)
    return null
  }
}

export async function sendNimPayment(params: NimiqEndorsementParams): Promise<NimiqPaymentResult> {
  if (!isNimiqPayAvailable()) {
    throw new Error('Nimiq Pay not available')
  }
  
  try {
    const result = await window.nimiq!.sendTransaction(params)
    return result
  } catch (error) {
    console.error('Failed to send NIM payment:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

export async function signMessage(message: string): Promise<string> {
  if (!isNimiqPayAvailable()) {
    throw new Error('Nimiq Pay not available')
  }
  
  return window.nimiq!.signMessage(message)
}

export function onAccountChange(callback: (account: NimiqWalletInfo | null) => void): () => void {
  if (isNimiqPayAvailable()) {
    return window.nimiq!.onAccountChange(callback)
  }
  return () => {}
}

export function onNetworkChange(callback: (network: string) => void): () => void {
  if (isNimiqPayAvailable()) {
    return window.nimiq!.onNetworkChange(callback)
  }
  return () => {}
}

export function formatNimAddress(address: string): string {
  if (address.length <= 10) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function formatNimAmount(amount: number): string {
  return `${amount.toFixed(5)} NIM`
}