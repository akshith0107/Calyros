import OnboardingLayout from '../../components/OnboardingLayout';
import SelectionCard from '../../components/SelectionCard';
import { useOnboardingStore } from '../../hooks/useOnboardingStore';

const levels = [
  { value: 'sedentary', label: 'Sedentary', description: 'Little to no exercise' },
  { value: 'light', label: 'Lightly Active', description: 'Light exercise 1–3 days per week' },
  { value: 'moderate', label: 'Moderately Active', description: 'Moderate exercise 3–5 days per week' },
  { value: 'very-active', label: 'Very Active', description: 'Hard exercise 6–7 days per week' },
];

export default function ActivityPage() {
  const { data, updateField } = useOnboardingStore();

  return (
    <OnboardingLayout
      step="activity"
      title="How active are you?"
      description="Your activity level affects your daily calorie and nutrient requirements."
      canContinue={data.activity !== ''}
    >
      <div className="onboarding-grid onboarding-grid--2" role="listbox" aria-label="Activity level selection">
        {levels.map((l) => (
          <SelectionCard
            key={l.value}
            label={l.label}
            description={l.description}
            selected={data.activity === l.value}
            onClick={() => updateField('activity', l.value)}
          />
        ))}
      </div>
    </OnboardingLayout>
  );
}
