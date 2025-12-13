import { createContext, useContext, useMemo, useState } from 'react'
import { BATCHES } from '../data/mockBatches.js'

const SupplyChainContext = createContext(null)

export function SupplyChainProvider({ children }) {
  const [batches, setBatches] = useState(BATCHES)

  const value = useMemo(
    () => ({
      batches,
      setBatches,
    }),
    [batches],
  )

  return <SupplyChainContext.Provider value={value}>{children}</SupplyChainContext.Provider>
}

export function useSupplyChain() {
  const ctx = useContext(SupplyChainContext)
  if (!ctx) throw new Error('useSupplyChain must be used within SupplyChainProvider')
  return ctx
}
