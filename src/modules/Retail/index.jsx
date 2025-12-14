import { useCallback, useMemo, useState } from 'react'
import { CheckCircle2, Wallet, XCircle } from 'lucide-react'
import Button from '../../shared/ui/Button.jsx'
import Card from '../../shared/ui/Card.jsx'
import Input from '../../shared/ui/Input.jsx'
import Badge from '../../shared/ui/Badge.jsx'
import { useSupplyChain } from '../../shared/context/SupplyChainContext.jsx'

export default function RetailPage() {
  const { account, connectWallet, rechazarLote, obtenerLote, isConnecting, isTransacting } = useSupplyChain()

  const [id, setId] = useState('')
  const [acceptedLotId, setAcceptedLotId] = useState(null)
  const [status, setStatus] = useState(null)
  const [localLoading, setLocalLoading] = useState(false)
  const [lote, setLote] = useState(null)

  const busy = isConnecting || isTransacting || localLoading

  const rejectedOnChain = useMemo(() => {
    if (!lote) return false
    const n = typeof lote.estado === 'bigint' ? Number(lote.estado) : Number(lote.estado)
    return n === 5
  }, [lote])

  const finalized = (acceptedLotId && acceptedLotId === id.trim()) || rejectedOnChain

  const ensureWallet = useCallback(async () => {
    if (account) return account
    return await connectWallet()
  }, [account, connectWallet])

  const canReject = useMemo(() => {
    return id.trim().length > 0 && !busy && !finalized
  }, [id, busy, finalized])

  const loadLote = useCallback(async () => {
    const v = id.trim()
    if (!v) return null
    const res = await obtenerLote(v)
    setLote(res)
    return res
  }, [id, obtenerLote])

  const handleAccept = useCallback(async () => {
    if (!id.trim()) {
      alert('Ingresa el ID del lote')
      return
    }

    setLocalLoading(true)
    try {
      const res = await loadLote()
      if (!res) return
      const n = typeof res.estado === 'bigint' ? Number(res.estado) : Number(res.estado)
      if (n === 5) {
        setStatus('Bloqueado: el lote ya está RECHAZADO en blockchain')
        return
      }
      setAcceptedLotId(id.trim())
      setStatus('Recepción confirmada (visual)')
    } finally {
      setLocalLoading(false)
    }
  }, [id, loadLote])

  const handleReject = useCallback(async () => {
    setStatus(null)
    setAcceptedLotId(null)

    if (!id.trim()) {
      alert('Ingresa el ID del lote')
      return
    }

    setLocalLoading(true)
    try {
      const acc = await ensureWallet()
      if (!acc) return

      const before = await loadLote()
      if (!before) return
      const n = typeof before.estado === 'bigint' ? Number(before.estado) : Number(before.estado)
      if (n === 5) {
        setStatus('Bloqueado: el lote ya está RECHAZADO en blockchain')
        return
      }

      const receipt = await rechazarLote(id.trim(), 'Empaque dañado')
      if (!receipt) return
      setStatus('Éxito: lote rechazado')
      await loadLote()
    } finally {
      setLocalLoading(false)
    }
  }, [ensureWallet, id, loadLote, rechazarLote])

  return (
    <div className="space-y-4">
      {!account ? (
        <Card className="p-4 bg-white">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-xl">Conecta tu wallet</div>
              <div className="mt-1 text-sm font-bold">Necesitas MetaMask para rechazar lotes</div>
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
            <Badge variant="secondary">RETAIL</Badge>
          </div>
        </Card>
      )}

      <Card className="p-6 bg-secondary">
        <div className="text-3xl">Recepción en Tienda</div>
        <div className="mt-2 text-sm font-bold">Acepta visualmente o rechaza el lote en blockchain.</div>

        <div className="mt-6">
          <div className="text-sm">ID Lote</div>
          <div className="mt-2">
            <Input
              value={id}
              onChange={(e) => {
                setId(e.target.value)
                setStatus(null)
                setLote(null)
              }}
              placeholder="Ej: 1"
              disabled={busy}
            />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <Button
            className="w-full bg-highlight text-black"
            disabled={busy || !id.trim() || finalized}
            onClick={handleAccept}
          >
            <CheckCircle2 className="h-4 w-4" />
            ACEPTAR RECEPCIÓN
          </Button>

          <Button className="w-full bg-black text-white" disabled={!canReject} onClick={handleReject}>
            <XCircle className="h-4 w-4" />
            {busy ? 'Cargando...' : 'RECHAZAR LOTE'}
          </Button>
        </div>

        {acceptedLotId && acceptedLotId === id.trim() ? (
          <Card className="mt-6 p-4 bg-white">
            <div className="text-sm">Estado</div>
            <div className="mt-1 text-sm font-bold">Recepción aceptada (visual)</div>
          </Card>
        ) : null}

        {status ? (
          <Card className="mt-4 p-4 bg-white">
            <div className="text-sm">{status}</div>
          </Card>
        ) : null}
      </Card>
    </div>
  )
}
