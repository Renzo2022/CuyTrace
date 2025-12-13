import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import Card from '../../../shared/ui/Card.jsx'
import { useAuth } from '../../../shared/context/AuthContext.jsx'

const ROLE_HOME = {
  PRODUCER: '/producer',
  PROCESSOR: '/processor',
  LOGISTICS: '/logistics',
  RETAIL: '/retail',
  AUDITOR: '/audit',
}

const ROLE_LABEL = {
  PRODUCER: 'Granja',
  PROCESSOR: 'Acopio',
  LOGISTICS: 'Transporte',
  RETAIL: 'Retail',
  AUDITOR: 'Auditoría',
}

const ROLE_COLOR = {
  PRODUCER: 'bg-primary',
  PROCESSOR: 'bg-highlight',
  LOGISTICS: 'bg-accent',
  RETAIL: 'bg-secondary',
  AUDITOR: 'bg-white',
}

export default function LoginPage() {
  const { users, login } = useAuth()
  const navigate = useNavigate()

  const handleLogin = useCallback(
    (role) => {
      const ok = login(role)
      if (!ok) return
      const to = ROLE_HOME[role] || '/'
      navigate(to, { replace: true })
    },
    [login, navigate],
  )

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="border-2 border-black shadow-brutal bg-white p-6">
        <div className="flex items-center gap-3">
          <div className="border-2 border-black shadow-brutal bg-highlight p-2">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="text-3xl">CuyTrace</div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {users.map((u) => (
            <Card
              key={u.id}
              as="button"
              type="button"
              onClick={() => handleLogin(u.role)}
              className={`p-5 text-left transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${ROLE_COLOR[u.role]}`}
            >
              <div className="text-xs uppercase tracking-wide">{ROLE_LABEL[u.role]}</div>
              <div className="mt-2 text-xl">{u.name}</div>
              <div className="mt-2 text-sm font-bold">
                <div>Rol: {u.role}</div>
                {u.location ? <div>Ubicación: {u.location}</div> : null}
                {u.deviceId ? <div>Device: {u.deviceId}</div> : null}
                {u.branch ? <div>Sede: {u.branch}</div> : null}
                {u.license ? <div>Licencia: {u.license}</div> : null}
              </div>
              <div className="mt-4 inline-flex border-2 border-black bg-white px-3 py-1 text-xs shadow-brutal">
                Entrar
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
