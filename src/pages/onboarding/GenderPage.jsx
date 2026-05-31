import OnboardingLayout from '../../components/OnboardingLayout';
import SelectionCard from '../../components/SelectionCard';
import { useOnboardingStore } from '../../hooks/useOnboardingStore';

const genders = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

export default function GenderPage() {
  const { data, updateField } = useOnboardingStore();

  return (
    <OnboardingLayout
      step="gender"
      title="What's your gender?"
      description="This helps personalize your nutritional needs and recommendations."
      canContinue={data.gender !== ''}
    >
      <div className="onboarding-grid onboarding-grid--3" role="listbox" aria-label="Gender selection">
        {genders.map((g) => (
          <SelectionCard
            key={g.value}
            label={g.label}
            selected={data.gender === g.value}
            onClick={() => updateField('gender', g.value)}
          />
        ))}
      </div>
    </OnboardingLayout>
  );
}
