import { useCallback, useMemo, useState } from 'react'
import { Wallet } from 'lucide-react'
import Button from '../../shared/ui/Button.jsx'
import Card from '../../shared/ui/Card.jsx'
import Input from '../../shared/ui/Input.jsx'
import Badge from '../../shared/ui/Badge.jsx'
import QrLabel from '../../shared/ui/QrLabel.jsx'
import { useSupplyChain } from '../../shared/context/SupplyChainContext.jsx'

export default function ProcessingPage() {
  const { account, connectWallet, procesarLote, transferirCustodia, isConnecting, isTransacting } = useSupplyChain()

  const [id, setId] = useState('')
  const [ipfsProceso, setIpfsProceso] = useState('')
  const [addressLogistica, setAddressLogistica] = useState('')
  const [status, setStatus] = useState(null)
  const [localLoading, setLocalLoading] = useState(false)
  const [qrLotId, setQrLotId] = useState(null)

  const busy = isConnecting || isTransacting || localLoading

  const canProcess = useMemo(() => {
    return id.trim().length > 0 && ipfsProceso.trim().length > 0 && !busy
  }, [id, ipfsProceso, busy])

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
    if (!ipfsProceso.trim()) {
      alert('Ingresa el link/hash del PDF HACCP')
      return
    }

    setLocalLoading(true)
    try {
      const acc = await ensureWallet()
      if (!acc) return

      const receipt = await procesarLote(id.trim(), ipfsProceso.trim())
      if (!receipt) return
      setStatus('Éxito: lote procesado y registrado')
      setQrLotId(id.trim())
    } finally {
      setLocalLoading(false)
    }
  }, [ensureWallet, id, ipfsProceso, procesarLote])

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
            <div className="text-sm">Link PDF HACCP (Simulado)</div>
            <div className="mt-2">
              <Input
                value={ipfsProceso}
                onChange={(e) => setIpfsProceso(e.target.value)}
                placeholder="ipfs://... o https://..."
                disabled={busy}
              />
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
