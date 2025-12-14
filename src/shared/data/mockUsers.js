const WALLET = {
  PRODUCER: import.meta.env.VITE_WALLET_PRODUCER || '',
  PROCESSOR: import.meta.env.VITE_WALLET_PROCESSOR || '',
  LOGISTICS: import.meta.env.VITE_WALLET_LOGISTICS || '',
  RETAIL: import.meta.env.VITE_WALLET_RETAIL || '',
  AUDITOR: import.meta.env.VITE_WALLET_AUDITOR || '',
}

export const USERS = [
  { id: 1, name: 'Granja El Valle', role: 'PRODUCER', location: 'Cajamarca', walletAddress: WALLET.PRODUCER },
  { id: 2, name: 'Centro Acopio Andino', role: 'PROCESSOR', location: 'Huancayo', walletAddress: WALLET.PROCESSOR },
  { id: 3, name: 'Transportes Rápidos', role: 'LOGISTICS', deviceId: 'IOT-99', walletAddress: WALLET.LOGISTICS },
  { id: 4, name: 'Supermercados Wong', role: 'RETAIL', branch: 'Lima', walletAddress: WALLET.RETAIL },
  { id: 5, name: 'Inspector SENASA', role: 'AUDITOR', license: 'GOV-PE', walletAddress: WALLET.AUDITOR },
]
