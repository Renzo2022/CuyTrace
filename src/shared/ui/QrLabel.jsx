import { useCallback, useMemo, useState } from 'react'
import QRCode from 'react-qr-code'
import { Printer } from 'lucide-react'
import Card from './Card.jsx'
import Button from './Button.jsx'

function getTrackUrl(id) {
  if (!id && id !== 0) return ''
  const safeId = String(id)
  const baseFromEnv = import.meta.env.VITE_PUBLIC_APP_URL
  const base =
    baseFromEnv ||
    (typeof window !== 'undefined' ? window.location.origin : null) ||
    'https://cuytrace.vercel.app'
  return `${String(base).replace(/\/+$/, '')}/track/${safeId}`
}

export default function QrLabel({ lotId }) {
  const [printed, setPrinted] = useState(false)

  const url = useMemo(() => getTrackUrl(lotId), [lotId])

  const handlePrint = useCallback(() => {
    setPrinted(true)
    alert('Impresión simulada: etiqueta lista para imprimir')
  }, [])

  if (!lotId && lotId !== 0) return null

  return (
    <Card className="p-6 bg-white rotate-[-1deg]">
      <div className="border-2 border-black shadow-brutal bg-highlight px-3 py-2 rounded-lg">
        <div className="text-xs uppercase tracking-wide">Etiqueta de trazabilidad</div>
        <div className="mt-1 text-3xl">Lote #{String(lotId)}</div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-[180px_1fr]">
        <div className="border-2 border-black shadow-brutal bg-white p-3 rounded-lg inline-flex items-center justify-center">
          <QRCode value={url} size={160} />
        </div>

        <div className="border-2 border-black bg-background p-4 rounded-lg">
          <div className="text-xs uppercase tracking-wide">URL pública</div>
          <div className="mt-2 text-xs break-all">{url}</div>
          <div className="mt-4">
            <Button className="w-full" onClick={handlePrint}>
              <Printer className="h-4 w-4" />
              IMPRIMIR
            </Button>
          </div>
          {printed ? <div className="mt-3 text-xs">Estado: listo</div> : null}
        </div>
      </div>
    </Card>
  )
}
