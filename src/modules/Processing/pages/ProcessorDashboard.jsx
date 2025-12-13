import Card from '../../../shared/ui/Card.jsx'
import { useAuth } from '../../../shared/context/AuthContext.jsx'

export default function ProcessorDashboard() {
  const { user } = useAuth()

  return (
    <Card className="p-6 bg-highlight">
      <div className="text-3xl">Procesamiento + IPFS</div>
      <div className="mt-2 text-sm font-bold">
        Aquí irá la vista de recepción desde granja, procesamiento y subida de evidencias a IPFS.
      </div>
      <div className="mt-6 border-2 border-black bg-white p-4 rounded-lg">
        <div className="text-xs uppercase tracking-wide">Sesión</div>
        <div className="mt-1">{user?.name}</div>
        <div className="mt-1 text-sm">Ubicación: {user?.location}</div>
      </div>
    </Card>
  )
}
