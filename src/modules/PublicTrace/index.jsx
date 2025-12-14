import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Search } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../../shared/ui/Button.jsx'
import Card from '../../shared/ui/Card.jsx'
import Input from '../../shared/ui/Input.jsx'
import Badge from '../../shared/ui/Badge.jsx'
import { useSupplyChain } from '../../shared/context/SupplyChainContext.jsx'
import { USERS } from '../../shared/data/mockUsers.js'

function toPinataGatewayUrl(value) {
  if (!value) return null
  const v = String(value)
  if (v.startsWith('http://') || v.startsWith('https://')) return v
  if (v.startsWith('ipfs://')) return `https://gateway.pinata.cloud/ipfs/${v.replace('ipfs://', '')}`
  return `https://gateway.pinata.cloud/ipfs/${v}`
}

function estadoLabel(estado) {
  const n = typeof estado === 'bigint' ? Number(estado) : Number(estado)
  const map = {
    0: 'CREADO',
    1: 'PROCESADO',
    2: 'EN_TRÁNSITO',
    3: 'EN_RETAIL',
    4: 'INSPECCIONADO',
    5: 'RECHAZADO',
  }
  return map[n] || `ESTADO_${String(estado)}`
}

function formatDate(seconds) {
  try {
    const s = typeof seconds === 'bigint' ? Number(seconds) : Number(seconds)
    if (!s) return '-'
    return new Date(s * 1000).toLocaleString()
  } catch {
    return '-'
  }
}

function normalizeAddress(value) {
  if (!value) return ''
  return String(value).toLowerCase()
}

function shortAddress(value) {
  const v = String(value || '')
  if (v.length < 12) return v
  return `${v.slice(0, 6)}...${v.slice(-4)}`
}

export default function PublicTracePage() {
  const { obtenerLote } = useSupplyChain()
  const params = useParams()
  const navigate = useNavigate()

  const addressLabels = useMemo(() => {
    const map = {}
    for (const u of USERS || []) {
      const key = normalizeAddress(u?.walletAddress)
      if (!key) continue
      map[key] = `${u.name} (${u.role})`
    }
    return map
  }, [])

  const formatAddress = useCallback(
    (addr) => {
      const v = String(addr || '')
      const label = addressLabels[normalizeAddress(v)]
      if (!label) return v
      return `${label} — ${shortAddress(v)}`
    },
    [addressLabels],
  )

  const [id, setId] = useState('')
  const [lote, setLote] = useState(null)
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  const canSearch = useMemo(() => id.trim().length > 0 && !loading, [id, loading])

  const handleBack = useCallback(() => {
    if (window.history.length > 1) {
      navigate(-1)
      return
    }
    navigate('/', { replace: true })
  }, [navigate])

  const loadById = useCallback(
    async (value) => {
      setStatus(null)
      setLote(null)

      const v = String(value || '').trim()
      if (!v) {
        alert('Ingresa un ID')
        return
      }

      setLoading(true)
      try {
        const res = await obtenerLote(v)
        if (!res) {
          setStatus('No se encontró el lote o no pudo leerse')
          return
        }
        setLote(res)
        setStatus('Lote cargado')
      } finally {
        setLoading(false)
      }
    },
    [obtenerLote],
  )

  const handleSearch = useCallback(async () => {
    return loadById(id)
  }, [id, loadById])

  useEffect(() => {
    const paramId = params?.id
    if (!paramId) return
    setId(String(paramId))
    loadById(paramId)
  }, [loadById, params?.id])

  const timeline = useMemo(() => {
    if (!lote) return []

    const origenUrl = toPinataGatewayUrl(lote.ipfsCertificadoOrigen)
    const procesoUrl = toPinataGatewayUrl(lote.ipfsCertificadoProceso)
    const actaUrl = toPinataGatewayUrl(lote.ipfsActaSenasa)

    return [
      {
        title: 'Origen (Granja)',
        detail: lote.ipfsCertificadoOrigen ? 'PDF/Hash registrado' : 'Pendiente',
        url: origenUrl,
      },
      {
        title: 'Procesamiento (Acopio)',
        detail: lote.ipfsCertificadoProceso ? 'PDF/Hash registrado' : 'Pendiente',
        url: procesoUrl,
      },
      {
        title: 'Logística (IoT)',
        detail: lote.ultimasCoordenadas ? String(lote.ultimasCoordenadas) : 'Sin reporte',
        url: null,
      },
      {
        title: 'Auditoría (SENASA)',
        detail: lote.ipfsActaSenasa ? 'Acta registrada' : 'Pendiente',
        url: actaUrl,
      },
    ]
  }, [lote])

  return (
    <div className="mx-auto max-w-6xl p-6">
      <Card className="p-6 bg-background">
        <div className="flex items-center justify-between gap-3">
          <div className="text-3xl">Trazabilidad Pública</div>
          <Button variant="secondary" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
        </div>
        <div className="mt-2 text-sm font-bold">Ingresa el ID del lote y revisa su historia.</div>

        <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px]">
          <Input value={id} onChange={(e) => setId(e.target.value)} placeholder="Ingresa ID del Lote" disabled={loading} />
          <Button disabled={!canSearch} onClick={handleSearch}>
            <Search className="h-4 w-4" />
            {loading ? 'Cargando...' : 'Buscar'}
          </Button>
        </div>

        {status ? (
          <div className="mt-4">
            <Card className="p-4 bg-white">
              <div className="text-sm">{status}</div>
            </Card>
          </div>
        ) : null}

        {lote ? (
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
            <Card className="p-5 bg-white">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-wide">Lote</div>
                  <div className="mt-1 text-2xl">#{String(lote.id)}</div>
                </div>
                <Badge variant={lote.cadenaFrioOk ? 'primary' : 'secondary'}>
                  Cadena de Frío: {lote.cadenaFrioOk ? 'OK' : 'ROTA'}
                </Badge>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3">
                <Card className="p-4 bg-background">
                  <div className="text-xs uppercase tracking-wide">Producto</div>
                  <div className="mt-1 text-sm">{String(lote.producto)}</div>
                </Card>

                <Card className="p-4 bg-background">
                  <div className="text-xs uppercase tracking-wide">Estado</div>
                  <div className="mt-1 text-sm">{estadoLabel(lote.estado)}</div>
                </Card>

                <Card className="p-4 bg-background">
                  <div className="text-xs uppercase tracking-wide">Custodio Actual</div>
                  <div className="mt-1 text-xs break-all">{formatAddress(lote.custodioActual)}</div>
                </Card>

                <Card className="p-4 bg-background">
                  <div className="text-xs uppercase tracking-wide">Fecha Registro</div>
                  <div className="mt-1 text-sm">{formatDate(lote.fechaRegistro)}</div>
                </Card>
              </div>
            </Card>

            <Card className="p-5 bg-white">
              <div className="text-xl">Línea de tiempo</div>
              <div className="mt-4 space-y-4">
                {timeline.map((t, idx) => (
                  <div key={t.title} className="relative pl-6">
                    <div className="absolute left-1 top-2 h-3 w-3 border-2 border-black bg-highlight" />
                    {idx < timeline.length - 1 ? (
                      <div className="absolute left-[7px] top-5 h-full w-[2px] bg-black" />
                    ) : null}

                    <div className="border-2 border-black shadow-brutal bg-background p-4 rounded-lg">
                      <div className="text-sm">{t.title}</div>
                      <div className="mt-1 text-sm font-bold break-words">{t.detail}</div>
                      {t.url ? (
                        <div className="mt-3">
                          <a
                            href={t.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex border-2 border-black shadow-brutal bg-white px-3 py-2 rounded-lg"
                          >
                            VER CERTIFICADO
                          </a>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 border-2 border-black bg-white p-4 rounded-lg">
                <div className="text-sm">Historial de custodios</div>
                <div className="mt-2 space-y-2">
                  {(lote.historialCustodios || []).length ? (
                    lote.historialCustodios.map((addr, i) => (
                      <div key={`${addr}-${i}`} className="text-xs break-all">
                        {i + 1}. {formatAddress(addr)}
                      </div>
                    ))
                  ) : (
                    <div className="text-xs">Sin historial</div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        ) : null}
      </Card>
    </div>
  )
}
