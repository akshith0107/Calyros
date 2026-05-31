import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'nutrimind_onboarding';
const STEP_ORDER = [
  'age', 'gender', 'height', 'weight',
  'health', 'allergies', 'goals', 'activity',
  'diet', 'alternatives'
];

const defaultData = {
  age: '',
  gender: '',
  height: '',
  heightUnit: 'cm',
  weight: '',
  weightUnit: 'kg',
  health: [],
  healthOther: '',
  allergies: [],
  allergiesOther: '',
  goals: '',
  activity: '',
  diet: '',
  alternatives: '',
  completedSteps: [],
};

const OnboardingContext = createContext(null);

function loadFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...defaultData, ...JSON.parse(stored) };
    }
  } catch {
    // Ignore parse errors
  }
  return { ...defaultData };
}

function saveToStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage errors
  }
}

export function OnboardingProvider({ children }) {
  const [data, setData] = useState(loadFromStorage);

  useEffect(() => {
    saveToStorage(data);
  }, [data]);

  const updateField = useCallback((field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
  }, []);

  const markStepComplete = useCallback((step) => {
    setData(prev => {
      const completed = prev.completedSteps.includes(step)
        ? prev.completedSteps
        : [...prev.completedSteps, step];
      return { ...prev, completedSteps: completed };
    });
  }, []);

  const getNextStep = useCallback((currentStep) => {
    const idx = STEP_ORDER.indexOf(currentStep);
    return idx < STEP_ORDER.length - 1 ? STEP_ORDER[idx + 1] : null;
  }, []);

  const getPrevStep = useCallback((currentStep) => {
    const idx = STEP_ORDER.indexOf(currentStep);
    return idx > 0 ? STEP_ORDER[idx - 1] : null;
  }, []);

  const getStepNumber = useCallback((step) => {
    return STEP_ORDER.indexOf(step) + 1;
  }, []);

  const getLastCompletedRoute = useCallback(() => {
    const completed = data.completedSteps;
    if (completed.length === 0) return '/onboarding/age';
    // Find the first incomplete step
    for (const step of STEP_ORDER) {
      if (!completed.includes(step)) {
        return `/onboarding/${step}`;
      }
    }
    return '/profile-complete';
  }, [data.completedSteps]);

  const clearData = useCallback(() => {
    setData({ ...defaultData });
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const totalSteps = STEP_ORDER.length;
  const progress = (step) => (STEP_ORDER.indexOf(step) + 1) / totalSteps;

  return (
    <OnboardingContext.Provider value={{
      data,
      updateField,
      markStepComplete,
      getNextStep,
      getPrevStep,
      getStepNumber,
      getLastCompletedRoute,
      clearData,
      totalSteps,
      progress,
      STEP_ORDER,
    }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboardingStore() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboardingStore must be used within OnboardingProvider');
  return ctx;
}
