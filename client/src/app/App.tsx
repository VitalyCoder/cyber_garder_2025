import { ChatPage } from "@/pages/chatPage";
import { CheckProductPage } from "@/pages/checkProduct/CheckProducts";
import { DashboardPage } from "@/pages/dashboardPage";
import { Onboarding } from "@/pages/onboarding/Onboarding";
import { ProfilePage } from "@/pages/profilePage";
import { ResultPage } from "@/pages/resultPage";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./layouts/protectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/onboarding"
          element={<Onboarding />}
        />
        <Route element={<ProtectedRoute />}>
          <Route
            path="/check"
            element={<CheckProductPage />}
          />
          <Route
            path="/dashboard"
            element={<DashboardPage />}
          />
          <Route
            path="/result"
            element={<ResultPage />}
          />
          <Route
            path="/profile"
            element={<ProfilePage />}
          />
          <Route
            path="/chat"
            element={<ChatPage />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
