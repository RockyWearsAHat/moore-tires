import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { DashboardPage } from './pages/Dashboard';
import { InboxPage } from './pages/Inbox';
import { CalendarPage } from './pages/Calendar';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/dispatch" replace />} />
          <Route path="dispatch"  element={<DashboardPage />} />
          <Route path="inbox"     element={<InboxPage />} />
          <Route path="calendar"  element={<CalendarPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
