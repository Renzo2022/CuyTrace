import { Link } from 'react-router-dom'
import Card from '../../../shared/ui/Card.jsx'
import Button from '../../../shared/ui/Button.jsx'

export default function PublicTracePage() {
  return (
    <div className="mx-auto max-w-5xl p-6">
      <Card className="p-6 bg-background">
        <div className="text-xs uppercase tracking-wide">Public Trace</div>
        <div className="mt-2 text-3xl">Vista pública (placeholder)</div>
        <div className="mt-4 border-2 border-black bg-white p-4">
          <div className="text-sm">Objetivo</div>
          <div className="mt-1 text-sm font-bold">
            Aquí irá la consulta por lote y la visualización de eventos (granja → acopio → transporte → retail → auditoría).
          </div>
        </div>
        <div className="mt-6">
          <Link to="/">
            <Button>Ir a Login</Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
