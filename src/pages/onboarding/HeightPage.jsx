import OnboardingLayout from '../../components/OnboardingLayout';
import InputField from '../../components/InputField';
import { useOnboardingStore } from '../../hooks/useOnboardingStore';

export default function HeightPage() {
  const { data, updateField } = useOnboardingStore();

  const toggleUnit = () => {
    updateField('heightUnit', data.heightUnit === 'cm' ? 'ft' : 'cm');
  };

  return (
    <OnboardingLayout
      step="height"
      title="What's your height?"
      description="We use your height to better assess your nutritional needs."
      canContinue={data.height !== '' && Number(data.height) > 0}
    >
      <div style={{ maxWidth: 320, margin: '0 auto' }}>
        <InputField
          id="height-input"
          value={data.height}
          onChange={(v) => updateField('height', v.replace(/[^\d.]/g, ''))}
          placeholder={data.heightUnit === 'cm' ? '175' : '5.9'}
          large
          type="text"
          inputMode="decimal"
          unit={data.heightUnit}
          aria-label={`Your height in ${data.heightUnit}`}
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
            Switch to {data.heightUnit === 'cm' ? 'ft' : 'cm'}
          </button>
        </div>
      </div>
    </OnboardingLayout>
  );
}
