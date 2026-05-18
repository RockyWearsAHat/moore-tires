import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { ErrorBoundary, ToastContainer } from '@moore-tires/shared';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { DashboardPage } from './pages/Dashboard';
import { InboxPage } from './pages/Inbox';
import { CalendarPage } from './pages/Calendar';
import { OrdersPage } from './pages/Orders';
import { ProductsPage } from './pages/Products';
import { CompaniesPage } from './pages/Companies';
import { UsersPage } from './pages/Users';
import { InventoryPage } from './pages/Inventory';
import { DistributionCentersPage } from './pages/DistributionCenters';

export function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ProtectedRoute>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Navigate to="/dispatch" replace />} />
              <Route path="dispatch"  element={<DashboardPage />} />
              <Route path="orders"    element={<OrdersPage />} />
              <Route path="products"  element={<ProductsPage />} />
              <Route path="companies" element={<CompaniesPage />} />
              <Route path="inventory" element={<InventoryPage />} />
              <Route
                path="centers"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <DistributionCentersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="users"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <UsersPage />
                  </ProtectedRoute>
                }
              />
              <Route path="inbox"     element={<InboxPage />} />
              <Route path="calendar"  element={<CalendarPage />} />
            </Route>
          </Routes>
        </ProtectedRoute>
      </BrowserRouter>
      <ToastContainer />
    </ErrorBoundary>
  );
}
