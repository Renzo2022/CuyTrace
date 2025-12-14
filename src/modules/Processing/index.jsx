import { useCallback, useMemo, useState } from 'react'
import { Wallet } from 'lucide-react'
import Button from '../../shared/ui/Button.jsx'
import Card from '../../shared/ui/Card.jsx'
import Input from '../../shared/ui/Input.jsx'
import Badge from '../../shared/ui/Badge.jsx'
import QrLabel from '../../shared/ui/QrLabel.jsx'
import { uploadToIPFS } from '../../shared/services/ipfsService.js'
import { useSupplyChain } from '../../shared/context/SupplyChainContext.jsx'

export default function ProcessingPage() {
  const { account, connectWallet, procesarLote, transferirCustodia, isConnecting, isTransacting } = useSupplyChain()

  const [id, setId] = useState('')
  const [haccpFile, setHaccpFile] = useState(null)
  const [haccpUrl, setHaccpUrl] = useState('')
  const [isUploadingHaccp, setIsUploadingHaccp] = useState(false)
  const [fileInputKey, setFileInputKey] = useState(0)
  const [addressLogistica, setAddressLogistica] = useState(() => import.meta.env.VITE_WALLET_LOGISTICS || '')
  const [status, setStatus] = useState(null)
  const [localLoading, setLocalLoading] = useState(false)
  const [qrLotId, setQrLotId] = useState(null)

  const busy = isConnecting || isTransacting || localLoading || isUploadingHaccp

  const canProcess = useMemo(() => {
    return id.trim().length > 0 && haccpUrl.trim().length > 0 && !busy
  }, [id, haccpUrl, busy])

  const handleHaccpFile = useCallback(async (e) => {
    const file = e.target.files?.[0] || null
    setHaccpFile(file)
    setHaccpUrl('')

    if (!file) return

    setIsUploadingHaccp(true)
    try {
      const url = await uploadToIPFS(file)
      setHaccpUrl(url)
      setStatus('PDF HACCP subido a IPFS')
    } catch (error) {
      const msg = error?.message || 'No se pudo subir el PDF a IPFS'
      alert(msg)
    } finally {
      setIsUploadingHaccp(false)
    }
  }, [])

  const canTransfer = useMemo(() => {
    return id.trim().length > 0 && addressLogistica.trim().length > 0 && !busy
  }, [id, addressLogistica, busy])

  const ensureWallet = useCallback(async () => {
    if (account) return account
    return await connectWallet()
  }, [account, connectWallet])

  const handleProcesar = useCallback(async () => {
    setStatus(null)
    setQrLotId(null)
    if (!id.trim()) {
      alert('Ingresa el ID del lote')
      return
    }
    if (!haccpUrl.trim()) {
      alert('Sube el PDF HACCP para continuar')
      return
    }

    setLocalLoading(true)
    try {
      const acc = await ensureWallet()
      if (!acc) return

      const receipt = await procesarLote(id.trim(), haccpUrl.trim())
      if (!receipt) return
      setStatus('Éxito: lote procesado y registrado')
      setQrLotId(id.trim())
      setHaccpFile(null)
      setHaccpUrl('')
      setFileInputKey((k) => k + 1)
    } finally {
      setLocalLoading(false)
    }
  }, [ensureWallet, haccpUrl, id, procesarLote])

  const handleTransfer = useCallback(async () => {
    setStatus(null)
    if (!id.trim()) {
      alert('Ingresa el ID del lote')
      return
    }
    if (!addressLogistica.trim()) {
      alert('Ingresa la address del transportista')
      return
    }

    setLocalLoading(true)
    try {
      const acc = await ensureWallet()
      if (!acc) return

      const receipt = await transferirCustodia(id.trim(), addressLogistica.trim(), 'LOGISTICA')
      if (!receipt) return
      setStatus('Éxito: custodia transferida a logística')
    } finally {
      setLocalLoading(false)
    }
  }, [addressLogistica, ensureWallet, id, transferirCustodia])

  return (
    <div className="space-y-4">
      {!account ? (
        <Card className="p-4 bg-white">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-xl">Conecta tu wallet</div>
              <div className="mt-1 text-sm font-bold">Necesitas MetaMask para firmar acciones</div>
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
            <Badge variant="highlight">PROCESSOR</Badge>
          </div>
        </Card>
      )}

      <Card className="p-6 bg-highlight">
        <div className="text-3xl">Procesar y Empacar</div>
        <div className="mt-2 text-sm font-bold">Registra HACCP (simulado) y transfiere custodia a logística.</div>

        <div className="mt-6 grid grid-cols-1 gap-4">
          <div>
            <div className="text-sm">ID del Lote</div>
            <div className="mt-2">
              <Input value={id} onChange={(e) => setId(e.target.value)} placeholder="Ej: 1" disabled={busy} />
            </div>
          </div>

          <div>
            <div className="text-sm">PDF HACCP (Pinata IPFS)</div>
            <div className="mt-2">
              <input
                key={fileInputKey}
                type="file"
                accept="application/pdf"
                onChange={handleHaccpFile}
                disabled={busy}
                className="w-full border-2 border-black shadow-brutal bg-white px-3 py-2 rounded-lg font-bold"
              />
              <div className="mt-2 text-xs">
                {isUploadingHaccp ? 'Subiendo a IPFS...' : haccpUrl ? 'Listo para procesar' : haccpFile ? 'Archivo seleccionado' : 'Selecciona un PDF'}
              </div>
            </div>
          </div>

          <Button className="w-full" disabled={!canProcess} onClick={handleProcesar}>
            {busy ? 'Cargando...' : 'PROCESAR Y EMPACAR'}
          </Button>

          <Card className="p-4 bg-white">
            <div className="text-sm">Transferencia</div>
            <div className="mt-2 text-xs font-bold">Address del transportista</div>
            <div className="mt-2">
              <Input
                value={addressLogistica}
                onChange={(e) => setAddressLogistica(e.target.value)}
                placeholder="0x..."
                disabled={busy}
              />
            </div>
            <div className="mt-3">
              <Button variant="secondary" className="w-full" disabled={!canTransfer} onClick={handleTransfer}>
                {busy ? 'Cargando...' : 'TRANSFERIR A LOGÍSTICA'}
              </Button>
            </div>
          </Card>

          {status ? (
            <Card className="p-4 bg-white">
              <div className="text-sm">{status}</div>
            </Card>
          ) : null}

          {qrLotId ? <QrLabel lotId={qrLotId} /> : null}
        </div>
      </Card>
    </div>
  )
}
