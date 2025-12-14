import { useCallback, useMemo, useState } from 'react'
import { ClipboardCheck, Wallet } from 'lucide-react'
import Button from '../../shared/ui/Button.jsx'
import Card from '../../shared/ui/Card.jsx'
import Input from '../../shared/ui/Input.jsx'
import Badge from '../../shared/ui/Badge.jsx'
import { uploadToIPFS } from '../../shared/services/ipfsService.js'
import { useSupplyChain } from '../../shared/context/SupplyChainContext.jsx'

export default function AuditPage() {
  const { account, connectWallet, inspeccionarSenasa, obtenerLote, isConnecting, isTransacting } = useSupplyChain()

  const [id, setId] = useState('')
  const [aprobado, setAprobado] = useState(true)
  const [actaFile, setActaFile] = useState(null)
  const [actaUrl, setActaUrl] = useState('')
  const [isUploadingActa, setIsUploadingActa] = useState(false)
  const [fileInputKey, setFileInputKey] = useState(0)
  const [lote, setLote] = useState(null)
  const [status, setStatus] = useState(null)
  const [localLoading, setLocalLoading] = useState(false)

  const busy = isConnecting || isTransacting || localLoading || isUploadingActa

  const inspectionLocked = useMemo(() => {
    if (!lote) return false
    const n = typeof lote.estado === 'bigint' ? Number(lote.estado) : Number(lote.estado)
    return n === 4 || n === 5
  }, [lote])

  const ensureWallet = useCallback(async () => {
    if (account) return account
    return await connectWallet()
  }, [account, connectWallet])

  const canSubmit = useMemo(() => {
    return id.trim().length > 0 && actaUrl.trim().length > 0 && !busy && !inspectionLocked
  }, [id, actaUrl, busy, inspectionLocked])

  const handleActaFile = useCallback(async (e) => {
    const file = e.target.files?.[0] || null
    setActaFile(file)
    setActaUrl('')

    if (!file) return

    setIsUploadingActa(true)
    try {
      const url = await uploadToIPFS(file)
      setActaUrl(url)
      setStatus('Acta PDF subida a IPFS')
    } catch (error) {
      const msg = error?.message || 'No se pudo subir el PDF a IPFS'
      alert(msg)
    } finally {
      setIsUploadingActa(false)
    }
  }, [])

  const handleBuscar = useCallback(async () => {
    setStatus(null)
    setLote(null)
    if (!id.trim()) {
      alert('Ingresa el ID del lote')
      return
    }

    setLocalLoading(true)
    try {
      const res = await obtenerLote(id.trim())
      if (!res) {
        setStatus('No se pudo leer el lote')
        return
      }
      setLote(res)
      setStatus('Lote cargado (puedes adjuntar acta en cualquier estado)')
    } finally {
      setLocalLoading(false)
    }
  }, [id, obtenerLote])

  const handleSubmit = useCallback(async () => {
    setStatus(null)
    if (!id.trim()) {
      alert('Ingresa el ID del lote')
      return
    }
    if (!actaUrl.trim()) {
      alert('Sube el acta PDF para continuar')
      return
    }

    setLocalLoading(true)
    try {
      const before = await obtenerLote(id.trim())
      if (!before) {
        setStatus('No se pudo leer el lote antes de registrar la inspección')
        return
      }
      setLote(before)
      const n = typeof before.estado === 'bigint' ? Number(before.estado) : Number(before.estado)
      if (n === 4 || n === 5) {
        setStatus('Bloqueado: el lote ya fue inspeccionado o rechazado')
        return
      }

      const acc = await ensureWallet()
      if (!acc) return

      const receipt = await inspeccionarSenasa(id.trim(), actaUrl.trim(), aprobado)
      if (!receipt) return
      setStatus(aprobado ? 'Éxito: inspección aprobada registrada' : 'Éxito: inspección registrada (no aprobada)')
      setActaFile(null)
      setActaUrl('')
      setFileInputKey((k) => k + 1)

      const after = await obtenerLote(id.trim())
      if (after) setLote(after)
    } finally {
      setLocalLoading(false)
    }
  }, [actaUrl, aprobado, ensureWallet, id, inspeccionarSenasa, obtenerLote])

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

          <Button variant="secondary" className="w-full" disabled={!id.trim() || busy} onClick={handleBuscar}>
            {busy ? 'Cargando...' : 'BUSCAR LOTE'}
          </Button>

          {lote ? (
            <Card className="p-4 bg-background">
              <div className="text-xs uppercase tracking-wide">Resumen</div>
              <div className="mt-2 text-sm">Producto: {String(lote.producto)}</div>
              <div className="mt-1 text-sm">Estado: {String(lote.estado)}</div>
              <div className="mt-1 text-xs break-all">Custodio: {String(lote.custodioActual)}</div>
            </Card>
          ) : null}

          <div className="border-2 border-black shadow-brutal bg-background p-4 rounded-lg">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={aprobado}
                onChange={(e) => setAprobado(e.target.checked)}
                disabled={busy || inspectionLocked}
              />
              <div className="text-sm">¿Aprobado?</div>
            </label>
          </div>

          <div>
            <div className="text-sm">Acta PDF (Pinata IPFS)</div>
            <div className="mt-2">
              <input
                key={fileInputKey}
                type="file"
                accept="application/pdf"
                onChange={handleActaFile}
                disabled={busy || inspectionLocked}
                className="w-full border-2 border-black shadow-brutal bg-white px-3 py-2 rounded-lg font-bold"
              />
              <div className="mt-2 text-xs">
                {isUploadingActa ? 'Subiendo a IPFS...' : actaUrl ? 'Listo para registrar' : actaFile ? 'Archivo seleccionado' : 'Selecciona un PDF'}
              </div>
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
