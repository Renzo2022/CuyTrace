import { useCallback, useMemo, useState } from 'react'
import { ClipboardCheck, Wallet } from 'lucide-react'
import Button from '../../shared/ui/Button.jsx'
import Card from '../../shared/ui/Card.jsx'
import Input from '../../shared/ui/Input.jsx'
import Badge from '../../shared/ui/Badge.jsx'
import { useSupplyChain } from '../../shared/context/SupplyChainContext.jsx'

export default function AuditPage() {
  const { account, connectWallet, inspeccionarSenasa, isConnecting, isTransacting } = useSupplyChain()

  const [id, setId] = useState('')
  const [aprobado, setAprobado] = useState(true)
  const [ipfsActa, setIpfsActa] = useState('')
  const [status, setStatus] = useState(null)
  const [localLoading, setLocalLoading] = useState(false)

  const busy = isConnecting || isTransacting || localLoading

  const ensureWallet = useCallback(async () => {
    if (account) return account
    return await connectWallet()
  }, [account, connectWallet])

  const canSubmit = useMemo(() => {
    return id.trim().length > 0 && ipfsActa.trim().length > 0 && !busy
  }, [id, ipfsActa, busy])

  const handleSubmit = useCallback(async () => {
    setStatus(null)
    if (!id.trim()) {
      alert('Ingresa el ID del lote')
      return
    }
    if (!ipfsActa.trim()) {
      alert('Ingresa el link/hash del acta PDF')
      return
    }

    setLocalLoading(true)
    try {
      const acc = await ensureWallet()
      if (!acc) return

      const receipt = await inspeccionarSenasa(id.trim(), ipfsActa.trim(), aprobado)
      if (!receipt) return
      setStatus(aprobado ? 'Éxito: inspección aprobada registrada' : 'Éxito: inspección registrada (no aprobada)')
    } finally {
      setLocalLoading(false)
    }
  }, [aprobado, ensureWallet, id, inspeccionarSenasa, ipfsActa])

  return (
    <div className="space-y-4">
      {!account ? (
        <Card className="p-4 bg-white">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-xl">Conecta tu wallet</div>
              <div className="mt-1 text-sm font-bold">Necesitas MetaMask para registrar inspecciones</div>
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
            <Badge variant="default">AUDITOR</Badge>
          </div>
        </Card>
      )}

      <Card className="p-6 bg-white">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="h-5 w-5" />
          <div className="text-3xl">Inspección SENASA</div>
        </div>
        <div className="mt-2 text-sm font-bold">Sube acta (simulada) y registra aprobación en blockchain.</div>

        <div className="mt-6 grid grid-cols-1 gap-4">
          <div>
            <div className="text-sm">ID Lote</div>
            <div className="mt-2">
              <Input value={id} onChange={(e) => setId(e.target.value)} placeholder="Ej: 1" disabled={busy} />
            </div>
          </div>

          <div className="border-2 border-black shadow-brutal bg-background p-4 rounded-lg">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={aprobado}
                onChange={(e) => setAprobado(e.target.checked)}
                disabled={busy}
              />
              <div className="text-sm">¿Aprobado?</div>
            </label>
          </div>

          <div>
            <div className="text-sm">Link Acta PDF</div>
            <div className="mt-2">
              <Input
                value={ipfsActa}
                onChange={(e) => setIpfsActa(e.target.value)}
                placeholder="ipfs://... o https://..."
                disabled={busy}
              />
            </div>
          </div>

          <Button className="w-full" disabled={!canSubmit} onClick={handleSubmit}>
            {busy ? 'Cargando...' : 'REGISTRAR INSPECCIÓN'}
          </Button>

          {status ? (
            <Card className="p-4 bg-background">
              <div className="text-sm">{status}</div>
            </Card>
          ) : null}
        </div>
      </Card>
    </div>
  )
}
