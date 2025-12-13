import { Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './modules/Auth/pages/LoginPage.jsx'
import ProducerDashboard from './modules/Production/pages/ProducerDashboard.jsx'
import ProcessorDashboard from './modules/Processing/pages/ProcessorDashboard.jsx'
import LogisticsDashboard from './modules/Logistics/pages/LogisticsDashboard.jsx'
import RetailDashboard from './modules/Retail/pages/RetailDashboard.jsx'
import AuditDashboard from './modules/Audit/pages/AuditDashboard.jsx'
import PublicTracePage from './modules/PublicTrace/pages/PublicTracePage.jsx'
import NotFoundPage from './shared/ui/NotFoundPage.jsx'
import { RequireRole } from './shared/context/RequireRole.jsx'

export default function App() {
  return (
    <div className="min-h-screen bg-background text-black">
      <Routes>
        <Route path="/" element={<LoginPage />} />

        <Route element={<RequireRole allowedRoles={["PRODUCER"]} />}>
          <Route path="/producer" element={<ProducerDashboard />} />
        </Route>

        <Route element={<RequireRole allowedRoles={["PROCESSOR"]} />}>
          <Route path="/processor" element={<ProcessorDashboard />} />
        </Route>

        <Route element={<RequireRole allowedRoles={["LOGISTICS"]} />}>
          <Route path="/logistics" element={<LogisticsDashboard />} />
        </Route>

        <Route element={<RequireRole allowedRoles={["RETAIL"]} />}>
          <Route path="/retail" element={<RetailDashboard />} />
        </Route>

        <Route element={<RequireRole allowedRoles={["AUDITOR"]} />}>
          <Route path="/audit" element={<AuditDashboard />} />
        </Route>

        <Route path="/trace" element={<PublicTracePage />} />

        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  )
}
