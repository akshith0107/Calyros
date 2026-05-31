import OnboardingLayout from '../../components/OnboardingLayout';
import SelectionCard from '../../components/SelectionCard';
import { useOnboardingStore } from '../../hooks/useOnboardingStore';

const goals = [
  { value: 'lose-weight', label: 'Lose Weight', description: 'Reduce body fat and maintain muscle' },
  { value: 'build-muscle', label: 'Build Muscle', description: 'Increase strength and muscle mass' },
  { value: 'eat-healthier', label: 'Eat Healthier', description: 'Improve overall nutrition quality' },
  { value: 'manage-condition', label: 'Manage a Condition', description: 'Support a specific health condition' },
  { value: 'more-energy', label: 'More Energy', description: 'Boost daily energy and vitality' },
  { value: 'maintain-weight', label: 'Maintain Weight', description: 'Keep current weight stable' },
];

export default function GoalsPage() {
  const { data, updateField } = useOnboardingStore();

  return (
    <OnboardingLayout
      step="goals"
      title="What's your primary goal?"
      description="We'll tailor our analysis and recommendations to match your objectives."
      canContinue={data.goals !== ''}
    >
      <div className="onboarding-grid onboarding-grid--2" role="listbox" aria-label="Goals selection">
        {goals.map((g) => (
          <SelectionCard
            key={g.value}
            label={g.label}
            description={g.description}
            selected={data.goals === g.value}
            onClick={() => updateField('goals', g.value)}
          />
        ))}
      </div>
    </OnboardingLayout>
  );
}
