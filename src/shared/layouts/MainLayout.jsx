import { Link, useLocation } from 'react-router-dom'
import { Factory, ShieldCheck, ShoppingCart, Tractor, Truck } from 'lucide-react'
import Card from '../ui/Card.jsx'
import Button from '../ui/Button.jsx'
import Badge from '../ui/Badge.jsx'
import { useAuth } from '../context/AuthContext.jsx'

const ROLE_HOME = {
  PRODUCER: { to: '/producer', label: 'Production', icon: Tractor },
  PROCESSOR: { to: '/processor', label: 'Processing', icon: Factory },
  LOGISTICS: { to: '/logistics', label: 'Logistics', icon: Truck },
  RETAIL: { to: '/retail', label: 'Retail', icon: ShoppingCart },
  AUDITOR: { to: '/audit', label: 'Audit', icon: ShieldCheck },
}

export default function MainLayout({ title, children }) {
  const { user, logout } = useAuth()
  const location = useLocation()

  const home = user ? ROLE_HOME[user.role] : null

  const items = [
    ...(home ? [home] : []),
    { to: '/trace', label: 'Public Trace', icon: ShieldCheck },
  ]

  return (
    <div className="min-h-screen bg-background text-text">
      <div className="mx-auto max-w-6xl p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
          <Card className="p-4 rounded-lg bg-white">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xl">CuyTrace</div>
                <div className="mt-1 text-xs font-bold uppercase tracking-wide">Neo-brutal DApp</div>
              </div>
              {user ? <Badge variant="highlight">{user.role}</Badge> : null}
            </div>

            {user ? (
              <div className="mt-4 border-2 border-black bg-background p-3 rounded-lg">
                <div className="text-sm">{user.name}</div>
                {user.location ? <div className="text-xs mt-1">{user.location}</div> : null}
                {user.deviceId ? <div className="text-xs mt-1">{user.deviceId}</div> : null}
                {user.branch ? <div className="text-xs mt-1">{user.branch}</div> : null}
                {user.license ? <div className="text-xs mt-1">{user.license}</div> : null}
              </div>
            ) : null}

            <div className="mt-4 space-y-2">
              {items.map((it) => {
                const Icon = it.icon
                const active = location.pathname === it.to
                return (
                  <Link key={it.to} to={it.to} className="block">
                    <div
                      className={`flex items-center gap-2 border-2 border-black shadow-brutal px-3 py-2 rounded-lg bg-white transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${
                        active ? 'bg-highlight' : ''
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <div className="text-sm">{it.label}</div>
                    </div>
                  </Link>
                )
              })}
            </div>

            <div className="mt-4">
              <Button variant="secondary" className="w-full" onClick={logout}>
                Logout
              </Button>
            </div>
          </Card>

          <div>
            <div className="border-2 border-black shadow-brutal bg-white p-4 rounded-lg">
              <div className="text-xs uppercase tracking-wide">{title}</div>
            </div>
            <div className="mt-4">{children}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
