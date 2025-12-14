import { useCallback, useMemo, useState } from 'react'
import { Thermometer, Truck, Wallet } from 'lucide-react'
import Button from '../../shared/ui/Button.jsx'
import Card from '../../shared/ui/Card.jsx'
import Input from '../../shared/ui/Input.jsx'
import Badge from '../../shared/ui/Badge.jsx'
import { useSupplyChain } from '../../shared/context/SupplyChainContext.jsx'

export default function LogisticsPage() {
  const { account, connectWallet, transferirCustodia, reportarIoT, isConnecting, isTransacting } = useSupplyChain()

  const [idCustodia, setIdCustodia] = useState('')
  const [addressRetail, setAddressRetail] = useState(() => import.meta.env.VITE_WALLET_RETAIL || '')
  const [idIoT, setIdIoT] = useState('')
  const [temperatura, setTemperatura] = useState('3')
  const [coordenadas, setCoordenadas] = useState('')

  const [status, setStatus] = useState(null)
  const [localLoading, setLocalLoading] = useState(false)

  const busy = isConnecting || isTransacting || localLoading

  const tempNumber = Number(temperatura)
  const riesgo = Number.isFinite(tempNumber) && tempNumber > 4

  const ensureWallet = useCallback(async () => {
    if (account) return account
    return await connectWallet()
  }, [account, connectWallet])

  const canDeliver = useMemo(() => {
    return idCustodia.trim().length > 0 && addressRetail.trim().length > 0 && !busy
  }, [idCustodia, addressRetail, busy])

  const canIoT = useMemo(() => {
    return idIoT.trim().length > 0 && coordenadas.trim().length > 0 && !busy
  }, [idIoT, coordenadas, busy])

  const handleDeliver = useCallback(async () => {
    setStatus(null)
    if (!idCustodia.trim()) {
      alert('Ingresa el ID del lote')
      return
    }
    if (!addressRetail.trim()) {
      alert('Ingresa la address del retail')
      return
    }

    setLocalLoading(true)
    try {
      const acc = await ensureWallet()
      if (!acc) return

      const receipt = await transferirCustodia(idCustodia.trim(), addressRetail.trim(), 'RETAIL')
      if (!receipt) return
      setStatus('Éxito: entrega registrada a Retail')
    } finally {
      setLocalLoading(false)
    }
  }, [addressRetail, ensureWallet, idCustodia, transferirCustodia])

  const handleIoT = useCallback(async () => {
    setStatus(null)
    if (!idIoT.trim()) {
      alert('Ingresa el ID del lote')
      return
    }
    if (!coordenadas.trim()) {
      alert('Ingresa las coordenadas / GPS')
      return
    }

    const temp = Number.isFinite(tempNumber) ? Math.trunc(tempNumber) : 0

    setLocalLoading(true)
    try {
      const acc = await ensureWallet()
      if (!acc) return

      const receipt = await reportarIoT(idIoT.trim(), temp, coordenadas.trim())
      if (!receipt) return
      setStatus(riesgo ? 'Reporte enviado (RIESGO: temperatura alta)' : 'Reporte IoT enviado')
    } finally {
      setLocalLoading(false)
    }
  }, [coordenadas, ensureWallet, idIoT, reportarIoT, riesgo, tempNumber])

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
            <Badge variant="accent">LOGISTICS</Badge>
          </div>
        </Card>
      )}

      <Card className="p-6 bg-accent">
        <div className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          <div className="text-3xl">Zona de Custodia</div>
        </div>
        <div className="mt-2 text-sm font-bold">Entrega y traspaso de custodia a tienda.</div>

        <div className="mt-6 grid grid-cols-1 gap-4">
          <div>
            <div className="text-sm">ID Lote</div>
            <div className="mt-2">
              <Input value={idCustodia} onChange={(e) => setIdCustodia(e.target.value)} placeholder="Ej: 1" disabled={busy} />
            </div>
          </div>

          <div>
            <div className="text-sm">Address Retail</div>
            <div className="mt-2">
              <Input
                value={addressRetail}
                onChange={(e) => setAddressRetail(e.target.value)}
                placeholder="0x..."
                disabled={busy}
              />
            </div>
          </div>

          <Button className="w-full" disabled={!canDeliver} onClick={handleDeliver}>
            {busy ? 'Cargando...' : 'ENTREGAR A TIENDA'}
          </Button>
        </div>
      </Card>

      <Card className={`p-6 ${riesgo ? 'bg-secondary' : 'bg-highlight'}`}>
        <div className="flex items-center gap-2">
          <Thermometer className="h-5 w-5" />
          <div className="text-3xl">Zona IoT (Simulador)</div>
        </div>

        {riesgo ? (
          <div className="mt-3 border-2 border-black bg-white p-3 rounded-lg">
            <div className="text-sm">RIESGO</div>
            <div className="mt-1 text-sm font-bold">Temperatura &gt; 4°C. Cadena de frío en peligro.</div>
          </div>
        ) : null}

        <div className="mt-6 grid grid-cols-1 gap-4">
          <div>
            <div className="text-sm">ID Lote</div>
            <div className="mt-2">
              <Input value={idIoT} onChange={(e) => setIdIoT(e.target.value)} placeholder="Ej: 1" disabled={busy} />
            </div>
          </div>

          <div>
            <div className="text-sm">Temperatura (°C)</div>
            <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-[1fr_140px]">
              <input
                type="range"
                min={-5}
                max={10}
                step={1}
                value={temperatura}
                onChange={(e) => setTemperatura(e.target.value)}
                disabled={busy}
                className="w-full"
              />
              <Input
                value={temperatura}
                onChange={(e) => setTemperatura(e.target.value)}
                placeholder="3"
                disabled={busy}
              />
            </div>
          </div>

          <div>
            <div className="text-sm">Coordenadas / GPS</div>
            <div className="mt-2">
              <Input
                value={coordenadas}
                onChange={(e) => setCoordenadas(e.target.value)}
                placeholder="-12.0464,-77.0428"
                disabled={busy}
              />
            </div>
          </div>

          <Button variant="secondary" className="w-full" disabled={!canIoT} onClick={handleIoT}>
            {busy ? 'Cargando...' : 'ENVIAR REPORTE IOT'}
          </Button>
        </div>
      </Card>

      {status ? (
        <Card className="p-4 bg-white">
          <div className="text-sm">{status}</div>
        </Card>
      ) : null}
    </div>
  )
}
