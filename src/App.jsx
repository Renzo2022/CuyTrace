import AppRouter from './AppRouter.jsx'
import Footer from './shared/ui/Footer.jsx'

export default function App() {
  return (
    <div className="min-h-screen bg-background text-text flex flex-col">
      <div className="flex-1">
        <AppRouter />
      </div>
      <Footer />
    </div>
  )
}
