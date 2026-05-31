import OnboardingLayout from '../../components/OnboardingLayout';
import SelectionCard from '../../components/SelectionCard';
import { useOnboardingStore } from '../../hooks/useOnboardingStore';
import { useNavigate } from 'react-router-dom';

const options = [
  { value: 'yes', label: 'Yes, enable suggestions', description: 'Show healthier alternatives automatically when available' },
  { value: 'no', label: 'No, skip this feature', description: 'I\'ll explore alternatives on my own' },
];

export default function AlternativesPage() {
  const { data, updateField } = useOnboardingStore();
  const navigate = useNavigate();

  return (
    <OnboardingLayout
      step="alternatives"
      title="Would you like healthier alternatives suggested automatically?"
      description="We can recommend better options when we detect products that don't match your goals."
      canContinue={data.alternatives !== ''}
      onContinue={() => navigate('/profile-complete')}
    >
      <div className="onboarding-grid onboarding-grid--2" role="listbox" aria-label="Alternatives preference">
        {options.map((o) => (
          <SelectionCard
            key={o.value}
            label={o.label}
            description={o.description}
            selected={data.alternatives === o.value}
            onClick={() => updateField('alternatives', o.value)}
          />
        ))}
      </div>
    </OnboardingLayout>
  );
}
