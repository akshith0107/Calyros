import OnboardingLayout from '../../components/OnboardingLayout';
import InputField from '../../components/InputField';
import { useOnboardingStore } from '../../hooks/useOnboardingStore';

export default function WeightPage() {
  const { data, updateField } = useOnboardingStore();

  const toggleUnit = () => {
    updateField('weightUnit', data.weightUnit === 'kg' ? 'lbs' : 'kg');
  };

  return (
    <OnboardingLayout
      step="weight"
      title="What's your weight?"
      description="Your weight helps us calculate personalized calorie and nutrient targets."
      canContinue={data.weight !== '' && Number(data.weight) > 0}
    >
      <div style={{ maxWidth: 320, margin: '0 auto' }}>
        <InputField
          id="weight-input"
          value={data.weight}
          onChange={(v) => updateField('weight', v.replace(/[^\d.]/g, ''))}
          placeholder={data.weightUnit === 'kg' ? '70.0' : '154.0'}
          large
          type="text"
          inputMode="decimal"
          unit={data.weightUnit}
          aria-label={`Your weight in ${data.weightUnit}`}
          autoFocus
        />
        <div style={{ textAlign: 'center', marginTop: 'var(--space-4)' }}>
          <button
            onClick={toggleUnit}
            style={{
              padding: '6px 16px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--color-border-secondary)',
              background: 'var(--color-glass-bg)',
              color: 'var(--color-text-secondary)',
              fontSize: 'var(--font-size-sm)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            type="button"
          >
            Switch to {data.weightUnit === 'kg' ? 'lbs' : 'kg'}
          </button>
        </div>
      </div>
    </OnboardingLayout>
  );
}
