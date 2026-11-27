import { Suspense, lazy, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useHRStore } from './store/useHRStore';
import { AppShell } from './components/layout/AppShell';
import { Toaster } from './components/ui/Toaster';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { HomeScreen } from './components/screens/HomeScreen';

const EmployeesScreen = lazy(() =>
  import('./components/screens/EmployeesScreen').then((m) => ({ default: m.EmployeesScreen }))
);
const AttendanceScreen = lazy(() =>
  import('./components/screens/AttendanceScreen').then((m) => ({ default: m.AttendanceScreen }))
);
const PayrollScreen = lazy(() =>
  import('./components/screens/PayrollScreen').then((m) => ({ default: m.PayrollScreen }))
);
const ComplianceScreen = lazy(() =>
  import('./components/screens/ComplianceScreen').then((m) => ({ default: m.ComplianceScreen }))
);
const MobileEmployeeScreen = lazy(() =>
  import('./components/screens/MobileEmployeeScreen').then((m) => ({
    default: m.MobileEmployeeScreen,
  }))
);
const OnboardingScreen = lazy(() =>
  import('./components/screens/OnboardingScreen').then((m) => ({ default: m.OnboardingScreen }))
);

const ScreenSkeleton = () => (
  <div className="space-y-4 animate-pulse" aria-busy="true" aria-label="Loading view">
    <div className="h-8 w-56 rounded-lg bg-[var(--bg-raised)]" />
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-28 rounded-2xl bg-[var(--bg-raised)]" />
      ))}
    </div>
    <div className="h-72 rounded-2xl bg-[var(--bg-raised)]" />
  </div>
);

export function App() {
  const { activeTab, darkMode, role } = useHRStore();
  const [globalSearch, setGlobalSearch] = useState('');

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  const effectiveTab = role === 'Employee' ? 'mobile' : activeTab;

  return (
    <ErrorBoundary>
      <AppShell globalSearch={globalSearch} onGlobalSearch={setGlobalSearch}>
        <AnimatePresence mode="wait">
          <motion.div
            key={effectiveTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
          >
            <Suspense fallback={<ScreenSkeleton />}>
              {effectiveTab === 'home' && <HomeScreen />}
              {effectiveTab === 'employees' && (
                <EmployeesScreen
                  externalSearch={globalSearch}
                  onExternalSearchChange={setGlobalSearch}
                />
              )}
              {effectiveTab === 'attendance' && <AttendanceScreen />}
              {effectiveTab === 'payroll' && <PayrollScreen />}
              {effectiveTab === 'compliance' && <ComplianceScreen />}
              {effectiveTab === 'mobile' && <MobileEmployeeScreen />}
              {effectiveTab === 'onboarding' && <OnboardingScreen />}
            </Suspense>
          </motion.div>
        </AnimatePresence>
        <Toaster />
      </AppShell>
    </ErrorBoundary>
  );
}

export default App;
