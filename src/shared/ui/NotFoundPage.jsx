import { Link } from 'react-router-dom'
import Card from './Card.jsx'
import Button from './Button.jsx'

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-5xl p-6">
      <Card className="p-6">
        <div className="text-2xl">404</div>
        <div className="mt-2">Ruta no encontrada</div>
        <Link className="inline-block mt-4" to="/">
          <Button>Volver al Login</Button>
        </Link>
      </Card>
    </div>
  )
}
