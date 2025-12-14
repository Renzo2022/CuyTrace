import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, Wallet } from 'lucide-react'
import Card from '../../../shared/ui/Card.jsx'
import Button from '../../../shared/ui/Button.jsx'
import { useAuth } from '../../../shared/context/AuthContext.jsx'
import { useSupplyChain } from '../../../shared/context/SupplyChainContext.jsx'

const ROLE_HOME = {
  PRODUCER: '/producer',
  PROCESSOR: '/processor',
  LOGISTICS: '/logistics',
  RETAIL: '/retail',
  AUDITOR: '/audit',
}

function normalizeAddress(value) {
  if (!value) return ''
  if (typeof value !== 'string') return ''
  return value.trim().toLowerCase()
}

function CuyWalker() {
  const containerRef = useState(() => ({ current: null }))[0]

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const types = ['type-black', 'type-grey', 'type-camel']
    let lastType = null
    let lastDirection = null
    const MIN_DURATION = 12
    const MAX_DURATION = 20
    let nextTimeout = null
    let active = true

    const svg = `
      <div class="cuy-bouncer">
        <svg viewBox="0 0 32 32" class="cuy">
          <rect x="6" y="26" width="4" height="4" fill="#000" class="leg leg-back" style="opacity:0.6"/>
          <rect x="22" y="26" width="4" height="4" fill="#000" class="leg leg-back" style="opacity:0.6"/>
          <path d="M4 14 h20 v2 h2 v2 h2 v8 h-2 v2 h-20 v-2 h-2 v-8 h2 v-2 z" fill="var(--cuy-main)"/>
          <path d="M6 14 h4 v4 h-4 z" fill="var(--cuy-spot)"/>
          <path d="M14 14 h4 v2 h-4 z" fill="var(--cuy-spot)"/>
          <rect x="20" y="12" width="4" height="4" fill="var(--cuy-ear)"/>
          <rect x="24" y="18" width="2" height="2" fill="var(--cuy-eye)"/>
          <rect x="25" y="18" width="1" height="1" fill="#fff"/>
          <rect x="28" y="20" width="2" height="2" fill="#ffab91"/>
          <rect x="8" y="26" width="4" height="4" fill="#000" class="leg"/>
          <rect x="24" y="26" width="4" height="4" fill="#000" class="leg"/>
        </svg>
      </div>
    `.trim()

    const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

    const spawnCuy = () => {
      if (!active) return

      const walker = document.createElement('div')
      walker.classList.add('cuy-walker')

      const availableTypes = types.filter((t) => t !== lastType)
      const selectedType = availableTypes[getRandomInt(0, availableTypes.length - 1)]
      lastType = selectedType
      walker.classList.add(selectedType)
      walker.innerHTML = svg

      let direction
      if (lastDirection === null) {
        direction = getRandomInt(0, 1)
      } else {
        direction = lastDirection === 0 ? 1 : 0
      }
      lastDirection = direction

      const rect = container.getBoundingClientRect()
      const screenW = rect.width
      const cuyW = 200

      let startX
      let endX
      if (direction === 0) {
        startX = -cuyW
        endX = screenW + cuyW
      } else {
        startX = screenW + cuyW
        endX = -cuyW
        walker.classList.add('facing-left')
      }

      walker.style.transform = `translateX(${startX}px)`
      container.appendChild(walker)

      const duration = getRandomInt(MIN_DURATION, MAX_DURATION) * 1000

      const animation = walker.animate([{ transform: `translateX(${startX}px)` }, { transform: `translateX(${endX}px)` }], {
        duration,
        easing: 'linear',
        fill: 'forwards',
      })

      let isScared = false
      walker.addEventListener('pointerdown', () => {
        if (isScared) return
        isScared = true
        animation.updatePlaybackRate(8)
        walker.style.setProperty('--anim-speed', '0.08s')
      })

      animation.onfinish = () => {
        walker.remove()
        if (!active) return
        nextTimeout = window.setTimeout(spawnCuy, 1000)
      }
    }

    spawnCuy()

    return () => {
      active = false
      if (nextTimeout) window.clearTimeout(nextTimeout)
      if (container) container.innerHTML = ''
    }
  }, [containerRef])

  return (
    <div
      ref={(el) => {
        containerRef.current = el
      }}
      className="relative h-[130px] overflow-hidden bg-white rounded-lg"
    />
  )
}

export default function LoginPage() {
  const { users, login } = useAuth()
  const { account, connectWallet, disconnectWallet, hasMetaMask, isConnecting, isTransacting } = useSupplyChain()
  const navigate = useNavigate()

  const matchedUser = useMemo(() => {
    const acc = normalizeAddress(account)
    if (!acc) return null
    return users.find((u) => normalizeAddress(u.walletAddress) === acc) || null
  }, [account, users])

  useEffect(() => {
    if (!account) return
    if (!matchedUser) return
    if (isConnecting || isTransacting) return

    const ok = login(matchedUser.role)
    if (!ok) return
    const to = ROLE_HOME[matchedUser.role] || '/'
    navigate(to, { replace: true })
  }, [account, isConnecting, isTransacting, login, matchedUser, navigate])

  const handleConnect = useCallback(async () => {
    if (!hasMetaMask) {
      alert('Instala MetaMask para ingresar')
      return
    }

    const current = normalizeAddress(account)
    const currentUser = current ? users.find((usr) => normalizeAddress(usr.walletAddress) === current) || null : null
    if (account && !currentUser) {
      await disconnectWallet()
    }

    try {
      await window.ethereum.request({ method: 'wallet_requestPermissions', params: [{ eth_accounts: {} }] })
    } catch {}

    const acc = await connectWallet()
    if (!acc) return

    const normalized = normalizeAddress(acc)
    const u = users.find((usr) => normalizeAddress(usr.walletAddress) === normalized) || null
    if (!u) {
      alert('Wallet no registrada para ningún rol. Cambia de cuenta en MetaMask o configura VITE_WALLET_* en .env')
      return
    }

    const ok = login(u.role)
    if (!ok) return
    const to = ROLE_HOME[u.role] || '/'
    navigate(to, { replace: true })
  }, [account, connectWallet, disconnectWallet, hasMetaMask, login, navigate, users])

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="border-2 border-black shadow-brutal bg-white p-6">
        <style>{`
          :root {
            --cuy-ear: #ffccbc;
            --cuy-eye: #000;
          }

          .cuy-walker {
            position: absolute;
            bottom: 6px;
            width: 160px;
            height: 160px;
            will-change: transform;
            cursor: pointer;
            --anim-speed: 0.5s;
            -webkit-tap-highlight-color: transparent;
            user-select: none;
          }

          .cuy-bouncer {
            width: 100%;
            height: 100%;
            animation: bounce var(--anim-speed) infinite alternate ease-in-out;
          }

          svg.cuy {
            width: 100%;
            height: 100%;
            shape-rendering: crisp-edges;
            filter: drop-shadow(0px 8px 4px rgba(0,0,0,0.1));
            transition: transform 0.1s;
          }

          .cuy-walker.facing-left svg.cuy {
            transform: scaleX(-1);
          }

          .leg {
            animation: legMove var(--anim-speed) infinite alternate;
          }
          .leg-back {
            animation-delay: calc(var(--anim-speed) / 2);
          }

          @keyframes bounce {
            0% { transform: translateY(0); }
            100% { transform: translateY(-6px); }
          }

          @keyframes legMove {
            0% { transform: translateX(0); }
            100% { transform: translateX(6px); }
          }

          .type-black { --cuy-main: #2d2d2d; --cuy-spot: #0a0a0a; }
          .type-grey  { --cuy-main: #9e9e9e; --cuy-spot: #ffffff; }
          .type-camel  { --cuy-main: #caa472; --cuy-spot: #ffffff; }
        `}</style>
        <div className="flex items-center gap-3">
          <div className="border-2 border-black shadow-brutal bg-highlight p-2">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="text-3xl">CuyTrace</div>
          </div>
        </div>

        <Card className="mt-6 p-6 bg-secondary border-0 shadow-none">
          <div className="text-sm font-bold">
            DApp para trazabilidad: Registra lotes de carne de cuy en Blockchain, adjunta certificados y genera QR para consulta pública
          </div>

          <div className="mt-4">
            <CuyWalker />
          </div>

          {!hasMetaMask ? <div className="mt-4 text-sm font-bold">MetaMask no está disponible en este navegador.</div> : null}

          <div className="mt-4">
            <Button className="w-full bg-black text-white" disabled={isConnecting || isTransacting} onClick={handleConnect}>
              <Wallet className="h-4 w-4" />
              {isConnecting ? 'Conectando...' : 'INGRESAR CON METAMASK'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
