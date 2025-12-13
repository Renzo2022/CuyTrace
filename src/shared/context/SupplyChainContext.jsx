import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { BrowserProvider, Contract } from 'ethers'

const CONTRACT_ADDRESS = '0xA8A3aeFb797158cce9315124Ce3CCe2BEc616505'

const CONTRACT_ABI = [
  { inputs: [], stateMutability: 'nonpayable', type: 'constructor' },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'id', type: 'uint256' },
      { indexed: false, internalType: 'string', name: 'coordenadas', type: 'string' },
      { indexed: false, internalType: 'string', name: 'mensaje', type: 'string' },
    ],
    name: 'AlertaIoT',
    type: 'event',
  },
  {
    inputs: [
      { internalType: 'string', name: '_producto', type: 'string' },
      { internalType: 'string', name: '_ipfsOrigen', type: 'string' },
    ],
    name: 'crearLote',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'id', type: 'uint256' },
      { indexed: false, internalType: 'address', name: 'nuevoCustodio', type: 'address' },
      { indexed: false, internalType: 'enum CuyTrace.Estado', name: 'nuevoEstado', type: 'uint8' },
    ],
    name: 'CustodiaTransferida',
    type: 'event',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_id', type: 'uint256' },
      { internalType: 'string', name: '_ipfsActa', type: 'string' },
      { internalType: 'bool', name: '_aprobado', type: 'bool' },
    ],
    name: 'inspeccionarLote',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'id', type: 'uint256' },
      { indexed: false, internalType: 'string', name: 'ipfsHash', type: 'string' },
    ],
    name: 'InspeccionSenasa',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'id', type: 'uint256' },
      { indexed: false, internalType: 'address', name: 'productor', type: 'address' },
    ],
    name: 'LoteCreado',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'id', type: 'uint256' },
      { indexed: false, internalType: 'address', name: 'quienRechazo', type: 'address' },
      { indexed: false, internalType: 'string', name: 'motivo', type: 'string' },
    ],
    name: 'LoteRechazado',
    type: 'event',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_id', type: 'uint256' },
      { internalType: 'string', name: '_ipfsProceso', type: 'string' },
    ],
    name: 'procesarLote',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_id', type: 'uint256' },
      { internalType: 'string', name: '_motivo', type: 'string' },
    ],
    name: 'rechazarLote',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_id', type: 'uint256' },
      { internalType: 'int256', name: '_temperatura', type: 'int256' },
      { internalType: 'string', name: '_gps', type: 'string' },
    ],
    name: 'reporteIoT',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_id', type: 'uint256' },
      { internalType: 'address', name: '_nuevoCustodio', type: 'address' },
      { internalType: 'string', name: '_tipoDestino', type: 'string' },
    ],
    name: 'transferirCustodia',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'contadorLotes',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: 'lotes',
    outputs: [
      { internalType: 'uint256', name: 'id', type: 'uint256' },
      { internalType: 'string', name: 'producto', type: 'string' },
      { internalType: 'enum CuyTrace.Estado', name: 'estado', type: 'uint8' },
      { internalType: 'address', name: 'custodioActual', type: 'address' },
      { internalType: 'uint256', name: 'fechaRegistro', type: 'uint256' },
      { internalType: 'bool', name: 'cadenaFrioOk', type: 'bool' },
      { internalType: 'string', name: 'ultimasCoordenadas', type: 'string' },
      { internalType: 'string', name: 'ipfsCertificadoOrigen', type: 'string' },
      { internalType: 'string', name: 'ipfsCertificadoProceso', type: 'string' },
      { internalType: 'string', name: 'ipfsActaSenasa', type: 'string' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_id', type: 'uint256' }],
    name: 'obtenerLote',
    outputs: [
      {
        components: [
          { internalType: 'uint256', name: 'id', type: 'uint256' },
          { internalType: 'string', name: 'producto', type: 'string' },
          { internalType: 'enum CuyTrace.Estado', name: 'estado', type: 'uint8' },
          { internalType: 'address', name: 'custodioActual', type: 'address' },
          { internalType: 'uint256', name: 'fechaRegistro', type: 'uint256' },
          { internalType: 'bool', name: 'cadenaFrioOk', type: 'bool' },
          { internalType: 'string', name: 'ultimasCoordenadas', type: 'string' },
          { internalType: 'string', name: 'ipfsCertificadoOrigen', type: 'string' },
          { internalType: 'string', name: 'ipfsCertificadoProceso', type: 'string' },
          { internalType: 'string', name: 'ipfsActaSenasa', type: 'string' },
          { internalType: 'address[]', name: 'historialCustodios', type: 'address[]' },
        ],
        internalType: 'struct CuyTrace.Lote',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'ROL_ACOPIO',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'ROL_LOGISTICA',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'ROL_PRODUCTOR',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
]

const SupplyChainContext = createContext(null)

function getErrorMessage(error) {
  if (!error) return 'Error desconocido'
  if (typeof error === 'string') return error
  if (error?.shortMessage) return error.shortMessage
  if (error?.reason) return error.reason
  if (error?.message) return error.message
  return 'Error desconocido'
}

export function SupplyChainProvider({ children }) {
  const [account, setAccount] = useState(null)
  const [chainId, setChainId] = useState(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isTransacting, setIsTransacting] = useState(false)

  const hasMetaMask = typeof window !== 'undefined' && Boolean(window.ethereum)

  const getProvider = useCallback(async () => {
    if (!hasMetaMask) {
      alert('MetaMask no está disponible en este navegador')
      throw new Error('MetaMask not available')
    }
    return new BrowserProvider(window.ethereum)
  }, [hasMetaMask])

  const getReadContract = useCallback(async () => {
    const provider = await getProvider()
    return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)
  }, [getProvider])

  const getWriteContract = useCallback(async () => {
    const provider = await getProvider()
    const signer = await provider.getSigner()
    return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
  }, [getProvider])

  const refreshSession = useCallback(async () => {
    if (!hasMetaMask) return

    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' })
      const currentAccount = accounts?.[0] || null
      setAccount(currentAccount)
      const chain = await window.ethereum.request({ method: 'eth_chainId' })
      setChainId(chain)
    } catch (error) {
      setAccount(null)
      setChainId(null)
    }
  }, [hasMetaMask])

  useEffect(() => {
    refreshSession()
  }, [refreshSession])

  useEffect(() => {
    if (!hasMetaMask) return

    const handleAccountsChanged = (accounts) => {
      setAccount(accounts?.[0] || null)
    }

    const handleChainChanged = (nextChainId) => {
      setChainId(nextChainId)
    }

    window.ethereum.on('accountsChanged', handleAccountsChanged)
    window.ethereum.on('chainChanged', handleChainChanged)

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
      window.ethereum.removeListener('chainChanged', handleChainChanged)
    }
  }, [hasMetaMask])

  const connectWallet = useCallback(async () => {
    if (!hasMetaMask) {
      alert('Instala MetaMask para conectar tu wallet')
      return null
    }

    setIsConnecting(true)
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      const currentAccount = accounts?.[0] || null
      setAccount(currentAccount)
      const chain = await window.ethereum.request({ method: 'eth_chainId' })
      setChainId(chain)
      return currentAccount
    } catch (error) {
      const msg = getErrorMessage(error)
      alert(`No se pudo conectar la wallet: ${msg}`)
      return null
    } finally {
      setIsConnecting(false)
    }
  }, [hasMetaMask])

  const ensureConnected = useCallback(async () => {
    if (account) return account
    return await connectWallet()
  }, [account, connectWallet])

  const runTx = useCallback(async (fn) => {
    setIsTransacting(true)
    try {
      const tx = await fn()
      const receipt = await tx.wait()
      return receipt
    } catch (error) {
      const msg = getErrorMessage(error)
      alert(`Transacción fallida: ${msg}`)
      return null
    } finally {
      setIsTransacting(false)
    }
  }, [])

  const crearLote = useCallback(
    async (producto, hashIpfs) => {
      const connected = await ensureConnected()
      if (!connected) return null
      return runTx(async () => {
        const contract = await getWriteContract()
        return contract.crearLote(producto, hashIpfs)
      })
    },
    [ensureConnected, getWriteContract, runTx],
  )

  const procesarLote = useCallback(
    async (id, hashIpfs) => {
      const connected = await ensureConnected()
      if (!connected) return null
      return runTx(async () => {
        const contract = await getWriteContract()
        return contract.procesarLote(id, hashIpfs)
      })
    },
    [ensureConnected, getWriteContract, runTx],
  )

  const transferirCustodia = useCallback(
    async (id, nuevoAddress, tipoRolDestino) => {
      if (tipoRolDestino !== 'LOGISTICA' && tipoRolDestino !== 'RETAIL') {
        alert('tipoRolDestino debe ser "LOGISTICA" o "RETAIL"')
        return null
      }

      const connected = await ensureConnected()
      if (!connected) return null
      return runTx(async () => {
        const contract = await getWriteContract()
        return contract.transferirCustodia(id, nuevoAddress, tipoRolDestino)
      })
    },
    [ensureConnected, getWriteContract, runTx],
  )

  const reportarIoT = useCallback(
    async (id, temperatura, coordenadas) => {
      const connected = await ensureConnected()
      if (!connected) return null
      return runTx(async () => {
        const contract = await getWriteContract()
        return contract.reporteIoT(id, temperatura, coordenadas)
      })
    },
    [ensureConnected, getWriteContract, runTx],
  )

  const inspeccionarSenasa = useCallback(
    async (id, hashIpfs, aprobado) => {
      const connected = await ensureConnected()
      if (!connected) return null
      return runTx(async () => {
        const contract = await getWriteContract()
        return contract.inspeccionarLote(id, hashIpfs, aprobado)
      })
    },
    [ensureConnected, getWriteContract, runTx],
  )

  const rechazarLote = useCallback(
    async (id, motivo) => {
      const connected = await ensureConnected()
      if (!connected) return null
      return runTx(async () => {
        const contract = await getWriteContract()
        return contract.rechazarLote(id, motivo)
      })
    },
    [ensureConnected, getWriteContract, runTx],
  )

  const obtenerLote = useCallback(
    async (id) => {
      try {
        const contract = await getReadContract()
        return await contract.obtenerLote(id)
      } catch (error) {
        const msg = getErrorMessage(error)
        alert(`No se pudo obtener el lote: ${msg}`)
        return null
      }
    },
    [getReadContract],
  )

  const value = useMemo(
    () => ({
      contractAddress: CONTRACT_ADDRESS,
      hasMetaMask,
      account,
      chainId,
      isConnecting,
      isTransacting,
      connectWallet,
      crearLote,
      procesarLote,
      transferirCustodia,
      reportarIoT,
      inspeccionarSenasa,
      rechazarLote,
      obtenerLote,
    }),
    [
      account,
      chainId,
      connectWallet,
      crearLote,
      hasMetaMask,
      inspeccionarSenasa,
      isConnecting,
      isTransacting,
      obtenerLote,
      procesarLote,
      rechazarLote,
      reportarIoT,
      transferirCustodia,
    ],
  )

  return <SupplyChainContext.Provider value={value}>{children}</SupplyChainContext.Provider>
}

export function useSupplyChain() {
  const ctx = useContext(SupplyChainContext)
  if (!ctx) throw new Error('useSupplyChain must be used within SupplyChainProvider')
  return ctx
}
