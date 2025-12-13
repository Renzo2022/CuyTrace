import { Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './modules/Auth/pages/LoginPage.jsx'
import ProductionPage from './modules/Production/index.jsx'
import ProcessingPage from './modules/Processing/index.jsx'
import LogisticsPage from './modules/Logistics/index.jsx'
import RetailPage from './modules/Retail/index.jsx'
import AuditPage from './modules/Audit/index.jsx'
import PublicTracePage from './modules/PublicTrace/index.jsx'
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
              <ProductionPage />
            </MainLayout>
          }
        />
      </Route>

      <Route element={<RequireRole allowedRoles={["PROCESSOR"]} />}>
        <Route
          path="/processor"
          element={
            <MainLayout title="Processing · Acopio + IPFS">
              <ProcessingPage />
            </MainLayout>
          }
        />
      </Route>

      <Route element={<RequireRole allowedRoles={["LOGISTICS"]} />}>
        <Route
          path="/logistics"
          element={
            <MainLayout title="Logistics · Transporte + IoT">
              <LogisticsPage />
            </MainLayout>
          }
        />
      </Route>

      <Route element={<RequireRole allowedRoles={["RETAIL"]} />}>
        <Route
          path="/retail"
          element={
            <MainLayout title="Retail · Supermercado">
              <RetailPage />
            </MainLayout>
          }
        />
      </Route>

      <Route element={<RequireRole allowedRoles={["AUDITOR"]} />}>
        <Route
          path="/audit"
          element={
            <MainLayout title="Audit · SENASA">
              <AuditPage />
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
