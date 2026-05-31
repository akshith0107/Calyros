import OnboardingLayout from '../../components/OnboardingLayout';
import SelectionCard from '../../components/SelectionCard';
import { useOnboardingStore } from '../../hooks/useOnboardingStore';

const diets = [
  { value: 'none', label: 'No Specific Diet' },
  { value: 'keto', label: 'Keto' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'paleo', label: 'Paleo' },
  { value: 'mediterranean', label: 'Mediterranean' },
  { value: 'low-carb', label: 'Low Carb' },
  { value: 'whole30', label: 'Whole30' },
  { value: 'intermittent-fasting', label: 'Intermittent Fasting' },
];

export default function DietPage() {
  const { data, updateField } = useOnboardingStore();

  return (
    <OnboardingLayout
      step="diet"
      title="Which diet best describes you?"
      description="We'll customize food scoring based on your dietary framework."
      canContinue={data.diet !== ''}
    >
      <div className="onboarding-grid onboarding-grid--3" role="listbox" aria-label="Diet selection">
        {diets.map((d) => (
          <SelectionCard
            key={d.value}
            label={d.label}
            selected={data.diet === d.value}
            onClick={() => updateField('diet', d.value)}
          />
        ))}
      </div>
    </OnboardingLayout>
  );
}
