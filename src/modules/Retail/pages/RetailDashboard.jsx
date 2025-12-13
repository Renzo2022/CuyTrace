import Card from '../../../shared/ui/Card.jsx'
import { useAuth } from '../../../shared/context/AuthContext.jsx'

export default function RetailDashboard() {
  const { user } = useAuth()

  return (
    <Card className="p-6 bg-secondary">
      <div className="text-3xl">Aceptar / Rechazar Lote</div>
      <div className="mt-2 text-sm font-bold">
        Aquí irá la validación final de recepción, control de calidad y emisión de rechazo si aplica.
      </div>
      <div className="mt-6 border-2 border-black bg-white p-4 rounded-lg">
        <div className="text-xs uppercase tracking-wide">Sesión</div>
        <div className="mt-1">{user?.name}</div>
        <div className="mt-1 text-sm">Sede: {user?.branch}</div>
      </div>
    </Card>
  )
}
