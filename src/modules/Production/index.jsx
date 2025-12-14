import { useCallback, useMemo, useState } from 'react'
import { Clipboard, Wallet } from 'lucide-react'
import Button from '../../shared/ui/Button.jsx'
import Card from '../../shared/ui/Card.jsx'
import Input from '../../shared/ui/Input.jsx'
import Badge from '../../shared/ui/Badge.jsx'
import QrLabel from '../../shared/ui/QrLabel.jsx'
import { uploadToIPFS } from '../../shared/services/ipfsService.js'
import { useSupplyChain } from '../../shared/context/SupplyChainContext.jsx'

export default function ProductionPage() {
  const { account, connectWallet, crearLote, getContadorLotes, transferirCustodia, isConnecting, isTransacting } = useSupplyChain()

  const [producto, setProducto] = useState('')
  const [origenFile, setOrigenFile] = useState(null)
  const [origenUrl, setOrigenUrl] = useState('')
  const [isUploadingOrigen, setIsUploadingOrigen] = useState(false)
  const [fileInputKey, setFileInputKey] = useState(0)
  const [lastId, setLastId] = useState(null)
  const [addressAcopio, setAddressAcopio] = useState(() => import.meta.env.VITE_WALLET_PROCESSOR || '')
  const [status, setStatus] = useState(null)
  const [localLoading, setLocalLoading] = useState(false)
  const [showQr, setShowQr] = useState(false)

  const busy = isConnecting || isTransacting || localLoading || isUploadingOrigen

  const canMint = useMemo(() => {
    return producto.trim().length > 0 && origenUrl.trim().length > 0 && !busy
  }, [producto, origenUrl, busy])

  const canTransferToAcopio = useMemo(() => {
    return Boolean(lastId) && addressAcopio.trim().length > 0 && !busy
  }, [addressAcopio, busy, lastId])

  const ensureWallet = useCallback(async () => {
    if (account) return account
    return await connectWallet()
  }, [account, connectWallet])

  const handleOrigenFile = useCallback(async (e) => {
    const file = e.target.files?.[0] || null
    setOrigenFile(file)
    setOrigenUrl('')

    if (!file) return

    setIsUploadingOrigen(true)
    try {
      const url = await uploadToIPFS(file)
      setOrigenUrl(url)
      setStatus('PDF subido a IPFS')
    } catch (error) {
      const msg = error?.message || 'No se pudo subir el PDF a IPFS'
      alert(msg)
    } finally {
      setIsUploadingOrigen(false)
    }
  }, [])

  const handleMint = useCallback(async () => {
    setStatus(null)

    if (!producto.trim()) {
      alert('Ingresa el nombre del producto')
      return
    }
    if (!origenUrl.trim()) {
      alert('Sube el PDF de origen para continuar')
      return
    }

    setLocalLoading(true)
    try {
      const acc = await ensureWallet()
      if (!acc) return

      const receipt = await crearLote(producto.trim(), origenUrl.trim())
      if (!receipt) return

      const contador = await getContadorLotes()
      if (contador !== null && contador !== undefined) {
        setLastId(contador.toString())
      }

      setStatus('Éxito: lote acuñado en blockchain')
      setShowQr(true)
      setProducto('')
      setOrigenFile(null)
      setOrigenUrl('')
      setFileInputKey((k) => k + 1)
    } finally {
      setLocalLoading(false)
    }
  }, [crearLote, ensureWallet, getContadorLotes, origenUrl, producto])

  const handleTransferToAcopio = useCallback(async () => {
    setStatus(null)

    if (!lastId) {
      alert('Primero crea un lote (necesitas un ID)')
      return
    }
    if (!addressAcopio.trim()) {
      alert('Ingresa la address del centro de acopio')
      return
    }

    setLocalLoading(true)
    try {
      const acc = await ensureWallet()
      if (!acc) return

      const receipt = await transferirCustodia(String(lastId).trim(), addressAcopio.trim(), 'ACOPIO')
      if (!receipt) return

      setStatus('Éxito: custodia transferida a ACOPIO')
    } finally {
      setLocalLoading(false)
    }
  }, [addressAcopio, ensureWallet, lastId, transferirCustodia])

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
            <div className="text-sm">PDF Origen (Pinata IPFS)</div>
            <div className="mt-2">
              <input
                key={fileInputKey}
                type="file"
                accept="application/pdf"
                onChange={handleOrigenFile}
                disabled={busy}
                className="w-full border-2 border-black shadow-brutal bg-white px-3 py-2 rounded-lg font-bold"
              />
              <div className="mt-2 text-xs">
                {isUploadingOrigen ? 'Subiendo a IPFS...' : origenUrl ? 'Listo para acuñar' : origenFile ? 'Archivo seleccionado' : 'Selecciona un PDF'}
              </div>
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

          {showQr && lastId ? <QrLabel lotId={lastId} /> : null}

          {lastId ? (
            <Card className="p-4 bg-white">
              <div className="text-sm">Transferencia</div>
              <div className="mt-2 text-xs font-bold">Address del centro de acopio</div>
              <div className="mt-2">
                <Input
                  value={addressAcopio}
                  onChange={(e) => setAddressAcopio(e.target.value)}
                  placeholder="0x..."
                  disabled={busy}
                />
              </div>
              <div className="mt-3">
                <Button variant="secondary" className="w-full" disabled={!canTransferToAcopio} onClick={handleTransferToAcopio}>
                  {busy ? 'Cargando...' : 'TRANSFERIR A ACOPIO'}
                </Button>
              </div>
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
