'use client'

import { useSyncExternalStore } from 'react'

function subscribe(onStoreChange: () => void) {
  window.addEventListener('eip6963:announceProvider', onStoreChange)
  window.addEventListener('ethereum#initialized', onStoreChange)
  return () => {
    window.removeEventListener('eip6963:announceProvider', onStoreChange)
    window.removeEventListener('ethereum#initialized', onStoreChange)
  }
}

function getSnapshot() {
  return typeof window !== 'undefined' && !!(window as unknown as { ethereum?: unknown }).ethereum
}

function getServerSnapshot() {
  return false
}

// Whether a browser-extension wallet (window.ethereum) is actually present.
// Mobile in-app browsers (Telegram, X, Instagram, etc.) and plain mobile
// Safari/Chrome never have one — WalletConnect is the only option there,
// and offering the injected connector anyway just guarantees a failed click.
export function useHasInjectedProvider() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
