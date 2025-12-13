import Card from '../../../shared/ui/Card.jsx'
import { useAuth } from '../../../shared/context/AuthContext.jsx'

export default function LogisticsDashboard() {
  const { user } = useAuth()

  return (
    <Card className="p-6 bg-accent">
      <div className="text-3xl">Custodia + IoT Simulado</div>
      <div className="mt-2 text-sm font-bold">
        Aquí irá la aceptación de custodia y la generación de telemetría simulada (temperatura, humedad, GPS).
      </div>
      <div className="mt-6 border-2 border-black bg-white p-4 rounded-lg">
        <div className="text-xs uppercase tracking-wide">Sesión</div>
        <div className="mt-1">{user?.name}</div>
        <div className="mt-1 text-sm">Device: {user?.deviceId}</div>
      </div>
    </Card>
  )
}
