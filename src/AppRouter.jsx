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
import MainLayout from './shared/layouts/MainLayout.jsx'

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />

      <Route element={<RequireRole allowedRoles={["PRODUCER"]} />}>
        <Route
          path="/producer"
          element={
            <MainLayout title="Production · Granja">
              <ProducerDashboard />
            </MainLayout>
          }
        />
      </Route>

      <Route element={<RequireRole allowedRoles={["PROCESSOR"]} />}>
        <Route
          path="/processor"
          element={
            <MainLayout title="Processing · Acopio + IPFS">
              <ProcessorDashboard />
            </MainLayout>
          }
        />
      </Route>

      <Route element={<RequireRole allowedRoles={["LOGISTICS"]} />}>
        <Route
          path="/logistics"
          element={
            <MainLayout title="Logistics · Transporte + IoT">
              <LogisticsDashboard />
            </MainLayout>
          }
        />
      </Route>

      <Route element={<RequireRole allowedRoles={["RETAIL"]} />}>
        <Route
          path="/retail"
          element={
            <MainLayout title="Retail · Supermercado">
              <RetailDashboard />
            </MainLayout>
          }
        />
      </Route>

      <Route element={<RequireRole allowedRoles={["AUDITOR"]} />}>
        <Route
          path="/audit"
          element={
            <MainLayout title="Audit · SENASA">
              <AuditDashboard />
            </MainLayout>
          }
        />
      </Route>

      <Route path="/trace" element={<PublicTracePage />} />

      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
