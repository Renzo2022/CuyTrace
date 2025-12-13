import Card from '../../../shared/ui/Card.jsx'
import Button from '../../../shared/ui/Button.jsx'
import { useAuth } from '../../../shared/context/AuthContext.jsx'

export default function LogisticsDashboard() {
  const { user, logout } = useAuth()

  return (
    <div className="mx-auto max-w-5xl p-6">
      <Card className="p-6 bg-accent">
        <div className="text-xs uppercase tracking-wide">Logistics · Transporte + IoT Simulado</div>
        <div className="mt-2 text-3xl">Panel LOGISTICS</div>
        <div className="mt-4 border-2 border-black bg-white p-4">
          <div className="text-sm">Sesión</div>
          <div className="mt-1">{user?.name}</div>
          <div className="mt-1 text-sm">Device: {user?.deviceId}</div>
        </div>
        <div className="mt-6">
          <Button variant="ghost" onClick={logout}>
            Logout
          </Button>
        </div>
      </Card>
    </div>
  )
}
