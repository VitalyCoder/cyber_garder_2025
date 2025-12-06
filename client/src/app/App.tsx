import { BlacklistPage } from '@/pages/blacklistPage/BlacklistPage';
import { ChatPage } from '@/pages/chatPage';
import { CoolingRangesPage } from '@/pages/coolingRangesPage/CoolingRangesPage';
import { DashboardPage } from '@/pages/dashboardPage';
import { EditProfilePage } from '@/pages/editProfilePage/EditProfilePage';
import { OnboardingPage } from '@/pages/onboardingPage/OnboardingPage';
import { ResultPage } from '@/pages/resultPage';
import { SurveyPage } from '@/pages/surveyPage/SurveyPage';
import { UserSettingsPage } from '@/pages/userSettingsPage/UserSettingsPage';
import { useUserStore } from '@/store/userStore';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

function App() {
	const isLoggedIn = useUserStore(state => state.isLoggedIn());

	return (
		<BrowserRouter>
			<Routes>
				<Route
					path='/onboarding'
					element={
						isLoggedIn ? <Navigate to='/dashboard' /> : <OnboardingPage />
					}
				/>
				<Route
					path='/dashboard'
					element={
						isLoggedIn ? <DashboardPage /> : <Navigate to='/onboarding' />
					}
				/>
				<Route
					path='/result'
					element={isLoggedIn ? <ResultPage /> : <Navigate to='/onboarding' />}
				/>
				<Route
					path='/settings/blacklist'
					element={
						isLoggedIn ? <BlacklistPage /> : <Navigate to='/onboarding' />
					}
				/>
				<Route
					path='/settings/cooling-ranges'
					element={
						isLoggedIn ? <CoolingRangesPage /> : <Navigate to='/onboarding' />
					}
				/>
				<Route
					path='/settings/notifications'
					element={
						isLoggedIn ? <UserSettingsPage /> : <Navigate to='/onboarding' />
					}
				/>
				<Route
					path="/settings/profile"
					element={isLoggedIn ? <EditProfilePage /> : <Navigate to="/onboarding" />}
				/>
				<Route
					path='/chat'
					element={isLoggedIn ? <ChatPage /> : <Navigate to='/onboarding' />}
				/>
				<Route
					path='/survey'
					element={isLoggedIn ? <SurveyPage /> : <Navigate to='/onboarding' />}
				/>
				<Route
					path='/'
					element={
						<Navigate to={isLoggedIn ? '/dashboard' : '/onboarding'} replace />
					}
				/>
			</Routes>
		</BrowserRouter>
	);
}

export default App;
