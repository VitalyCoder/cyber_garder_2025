import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardPage } from '@/pages/dashboardPage'; 
import { ResultPage } from '@/pages/resultPage';
import { ProfilePage } from '@/pages/profilePage';
import { ChatPage } from '@/pages/chatPage';
import { useUserStore } from '@/store/userStore';
import { OnboardingPage } from '@/pages/onboardingPage/OnboardingPage';

function App() {
  const isLoggedIn = useUserStore((state) => state.isLoggedIn());

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/onboarding" 
          element={isLoggedIn ? <Navigate to="/dashboard" /> : <OnboardingPage />} 
        />
        <Route 
          path="/dashboard" 
          element={isLoggedIn ? <DashboardPage /> : <Navigate to="/onboarding" />} 
        />
        <Route 
          path="/result" 
          element={isLoggedIn ? <ResultPage /> : <Navigate to="/onboarding" />} 
        />
        <Route 
          path="/profile" 
          element={isLoggedIn ? <ProfilePage /> : <Navigate to="/onboarding" />} 
        />
        <Route 
          path="/chat" 
          element={isLoggedIn ? <ChatPage /> : <Navigate to="/onboarding" />} 
        />
        <Route 
          path="/" 
          element={<Navigate to={isLoggedIn ? "/dashboard" : "/onboarding"} replace />} 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;