import { createContext, useContext, useMemo, useState } from 'react'

const SupplyChainContext = createContext(null)

export function SupplyChainProvider({ children }) {
  const [batches] = useState([])

  const value = useMemo(
    () => ({
      batches,
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
