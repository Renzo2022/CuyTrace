import Card from '../../../shared/ui/Card.jsx'
import { useAuth } from '../../../shared/context/AuthContext.jsx'

export default function AuditDashboard() {
  const { user } = useAuth()

  return (
    <Card className="p-6 bg-white">
      <div className="text-3xl">Subir Acta de Inspección</div>
      <div className="mt-2 text-sm font-bold">
        Aquí irá la subida de PDF/acta, firma/verificación y anexos para auditoría.
      </div>
      <div className="mt-6 border-2 border-black bg-background p-4 rounded-lg">
        <div className="text-xs uppercase tracking-wide">Sesión</div>
        <div className="mt-1">{user?.name}</div>
        <div className="mt-1 text-sm">Licencia: {user?.license}</div>
      </div>
    </Card>
  )
}
