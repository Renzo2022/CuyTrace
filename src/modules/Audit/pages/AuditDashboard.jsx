import Card from '../../../shared/ui/Card.jsx'
import Button from '../../../shared/ui/Button.jsx'
import { useAuth } from '../../../shared/context/AuthContext.jsx'

export default function AuditDashboard() {
  const { user, logout } = useAuth()

  return (
    <div className="mx-auto max-w-5xl p-6">
      <Card className="p-6 bg-white">
        <div className="text-xs uppercase tracking-wide">Audit · SENASA + PDF upload</div>
        <div className="mt-2 text-3xl">Panel AUDITOR</div>
        <div className="mt-4 border-2 border-black bg-background p-4">
          <div className="text-sm">Sesión</div>
          <div className="mt-1">{user?.name}</div>
          <div className="mt-1 text-sm">Licencia: {user?.license}</div>
        </div>
        <div className="mt-6">
          <Button variant="secondary" onClick={logout}>
            Logout
          </Button>
        </div>
      </Card>
    </div>
  )
}
