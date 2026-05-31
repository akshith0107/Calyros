import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { OnboardingProvider } from './hooks/useOnboardingStore';
import ParticleGrid from './components/ParticleGrid';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import ProfileComplete from './pages/ProfileComplete';
import AgePage from './pages/onboarding/AgePage';
import GenderPage from './pages/onboarding/GenderPage';
import HeightPage from './pages/onboarding/HeightPage';
import WeightPage from './pages/onboarding/WeightPage';
import HealthPage from './pages/onboarding/HealthPage';
import AllergiesPage from './pages/onboarding/AllergiesPage';
import GoalsPage from './pages/onboarding/GoalsPage';
import ActivityPage from './pages/onboarding/ActivityPage';
import DietPage from './pages/onboarding/DietPage';
import AlternativesPage from './pages/onboarding/AlternativesPage';
import Dashboard from './pages/Dashboard';

const pageTransition = {
  initial: { opacity: 0, y: 12, scale: 0.99 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -8, scale: 0.99 },
  transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
};

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        {...pageTransition}
        style={{ minHeight: '100vh' }}
      >
        <Routes location={location}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/profile-complete" element={<ProfileComplete />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/onboarding/age" element={<AgePage />} />
          <Route path="/onboarding/gender" element={<GenderPage />} />
          <Route path="/onboarding/height" element={<HeightPage />} />
          <Route path="/onboarding/weight" element={<WeightPage />} />
          <Route path="/onboarding/health" element={<HealthPage />} />
          <Route path="/onboarding/allergies" element={<AllergiesPage />} />
          <Route path="/onboarding/goals" element={<GoalsPage />} />
          <Route path="/onboarding/activity" element={<ActivityPage />} />
          <Route path="/onboarding/diet" element={<DietPage />} />
          <Route path="/onboarding/alternatives" element={<AlternativesPage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <OnboardingProvider>
        <ParticleGrid />
        <AnimatedRoutes />
      </OnboardingProvider>
    </BrowserRouter>
  );
}
