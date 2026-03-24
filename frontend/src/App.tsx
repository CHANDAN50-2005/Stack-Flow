import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DefaultLayout from './layouts/DefaultLayout';
import LandingPage from './pages/LandingPage';
import AuthForms from './pages/AuthForms';
import DashboardPage from './pages/DashboardPage';
import WorkspacePage from './pages/WorkspacePage';
import ProblemsPage from './pages/ProblemsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DefaultLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="auth" element={<AuthForms />} />
            <Route path="register" element={<AuthForms />} />
            <Route path="signup" element={<AuthForms />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="problems" element={<ProblemsPage />} />
            <Route path="leaderboard" element={<LeaderboardPage />} />
            <Route path="workspace/:id" element={<WorkspacePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
