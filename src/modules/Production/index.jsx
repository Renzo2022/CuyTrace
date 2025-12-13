import { useCallback, useMemo, useState } from 'react'
import { Clipboard, Wallet } from 'lucide-react'
import Button from '../../shared/ui/Button.jsx'
import Card from '../../shared/ui/Card.jsx'
import Input from '../../shared/ui/Input.jsx'
import Badge from '../../shared/ui/Badge.jsx'
import { useSupplyChain } from '../../shared/context/SupplyChainContext.jsx'

export default function ProductionPage() {
  const { account, connectWallet, crearLote, getContadorLotes, isConnecting, isTransacting } = useSupplyChain()

  const [producto, setProducto] = useState('')
  const [ipfsOrigen, setIpfsOrigen] = useState('')
  const [lastId, setLastId] = useState(null)
  const [status, setStatus] = useState(null)
  const [localLoading, setLocalLoading] = useState(false)

  const busy = isConnecting || isTransacting || localLoading

  const canMint = useMemo(() => {
    return producto.trim().length > 0 && ipfsOrigen.trim().length > 0 && !busy
  }, [producto, ipfsOrigen, busy])

  const handleMint = useCallback(async () => {
    setStatus(null)

    if (!producto.trim()) {
      alert('Ingresa el nombre del producto')
      return
    }
    if (!ipfsOrigen.trim()) {
      alert('Ingresa el link/hash del PDF de origen')
      return
    }

    setLocalLoading(true)
    try {
      if (!account) {
        const acc = await connectWallet()
        if (!acc) return
      }

      const receipt = await crearLote(producto.trim(), ipfsOrigen.trim())
      if (!receipt) return

      const contador = await getContadorLotes()
      if (contador !== null && contador !== undefined) {
        setLastId(contador.toString())
      }

      setStatus('Éxito: lote acuñado en blockchain')
      setProducto('')
      setIpfsOrigen('')
    } finally {
      setLocalLoading(false)
    }
  }, [account, connectWallet, crearLote, getContadorLotes, ipfsOrigen, producto])

  const copyLastId = useCallback(async () => {
    if (!lastId) return
    try {
      await navigator.clipboard.writeText(String(lastId))
      setStatus('Copiado al portapapeles')
    } catch {
      alert('No se pudo copiar. Copia manualmente el ID.')
    }
  }, [lastId])

  return (
    <div className="space-y-4">
      {!account ? (
        <Card className="p-4 bg-white">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-xl">Conecta tu wallet</div>
              <div className="mt-1 text-sm font-bold">Necesitas MetaMask para acuñar el lote</div>
            </div>
            <Button disabled={busy} onClick={connectWallet}>
              <Wallet className="h-4 w-4" />
              Conectar
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="p-4 bg-white">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-bold">Wallet conectada</div>
              <div className="mt-1 text-xs break-all">{account}</div>
            </div>
            <Badge variant="primary">PRODUCER</Badge>
          </div>
        </Card>
      )}

      <Card className="p-6 bg-primary">
        <div className="text-3xl">Nuevo Lote de Cuy</div>
        <div className="mt-2 text-sm font-bold">
          Registra el origen y acuña el lote en blockchain. La transacción puede tardar.
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4">
          <div>
            <div className="text-sm">Nombre del Producto</div>
            <div className="mt-2">
              <Input
                value={producto}
                onChange={(e) => setProducto(e.target.value)}
                placeholder='Ej: "Cuy Premium"'
                disabled={busy}
              />
            </div>
          </div>

          <div>
            <div className="text-sm">Link PDF Origen (Simulado)</div>
            <div className="mt-2">
              <Input
                value={ipfsOrigen}
                onChange={(e) => setIpfsOrigen(e.target.value)}
                placeholder="ipfs://... o https://..."
                disabled={busy}
              />
            </div>
          </div>

          <div className="pt-2">
            <Button className="w-full" disabled={!canMint} onClick={handleMint}>
              {busy ? 'Cargando...' : 'ACUÑAR LOTE (MINT)'}
            </Button>
          </div>

          {status ? (
            <Card className="p-4 bg-white">
              <div className="text-sm">{status}</div>
            </Card>
          ) : null}

          {lastId ? (
            <Card className="p-4 bg-white">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm">Último ID de lote</div>
                  <div className="mt-1 text-2xl">{lastId}</div>
                </div>
                <Button variant="ghost" onClick={copyLastId} disabled={busy}>
                  <Clipboard className="h-4 w-4" />
                  Copiar
                </Button>
              </div>
            </Card>
          ) : null}
        </div>
      </Card>
    </div>
  )
}
