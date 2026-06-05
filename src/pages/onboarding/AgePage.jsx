import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingLayout from '../../components/OnboardingLayout';
import InputField from '../../components/InputField';
import { useOnboardingStore } from '../../hooks/useOnboardingStore';
import { useAuth } from '../../contexts/AuthContext';

export default function AgePage() {
  const { data, updateField } = useOnboardingStore();
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user?.has_profile) {
      console.warn("User already has a profile. Redirecting to Dashboard.");
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, isLoading, navigate]);

  return (
    <OnboardingLayout
      step="age"
      title="How old are you?"
      description="Your age helps us calculate accurate nutritional recommendations."
      canContinue={data.age !== '' && Number(data.age) > 0 && Number(data.age) < 150}
    >
      <div style={{ maxWidth: 280, margin: '0 auto' }}>
        <InputField
          id="age-input"
          value={data.age}
          onChange={(v) => updateField('age', v.replace(/\D/g, ''))}
          placeholder="25"
          large
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          aria-label="Your age"
          autoFocus
        />
      </div>
    </OnboardingLayout>
  );
}
