import { motion, AnimatePresence } from 'framer-motion';
import OnboardingLayout from '../../components/OnboardingLayout';
import SelectionCard from '../../components/SelectionCard';
import InputField from '../../components/InputField';
import { useOnboardingStore } from '../../hooks/useOnboardingStore';

const conditions = [
  { value: 'diabetes', label: 'Diabetes / Prediabetes' },
  { value: 'high-bp', label: 'High Blood Pressure' },
  { value: 'high-cholesterol', label: 'High Cholesterol' },
  { value: 'heart-disease', label: 'Heart Disease' },
  { value: 'kidney-disease', label: 'Kidney Disease' },
  { value: 'liver-disease', label: 'Liver Disease' },
  { value: 'thyroid', label: 'Thyroid Disorder' },
  { value: 'pcos', label: 'PCOS' },
  { value: 'other', label: 'Other Condition' },
  { value: 'none', label: 'None' },
];

export default function HealthPage() {
  const { data, updateField } = useOnboardingStore();

  const toggle = (value) => {
    let current = [...data.health];

    if (value === 'none') {
      // If user selects "none", clear everything else and just set "none"
      updateField('health', ['none']);
      updateField('healthOther', '');
      return;
    }

    // If user selects anything other than "none", remove "none"
    current = current.filter(v => v !== 'none');

    if (current.includes(value)) {
      // Deselect
      const filtered = current.filter(v => v !== value);
      updateField('health', filtered);
      if (value === 'other') {
        updateField('healthOther', ''); // Clear custom input if deselected
      }
    } else {
      // Select
      updateField('health', [...current, value]);
    }
  };

  const isOtherSelected = data.health.includes('other');
  
  // Can continue if:
  // 1. Array length > 0 AND
  // 2. If 'other' is selected, the 'healthOther' input is not empty
  const canContinue = data.health.length > 0 && (!isOtherSelected || data.healthOther.trim().length > 0);

  return (
    <OnboardingLayout
      step="health"
      title="Do you have any health conditions?"
      description="This helps us flag ingredients that may affect your specific health needs."
      canContinue={canContinue}
    >
      <div className="w-full max-w-2xl">
        <div className="onboarding-grid onboarding-grid--2 mb-6" role="listbox" aria-label="Health conditions" aria-multiselectable="true">
          {conditions.map((c) => (
            <SelectionCard
              key={c.value}
              label={c.label}
              selected={data.health.includes(c.value)}
              onClick={() => toggle(c.value)}
              showCheck
            />
          ))}
        </div>

        <AnimatePresence>
          {isOtherSelected && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              style={{ overflow: 'hidden' }}
            >
              <div className="pt-2 pb-4">
                <InputField
                  id="health-other"
                  label="Other Condition"
                  value={data.healthOther}
                  onChange={(val) => updateField('healthOther', val)}
                  placeholder="Enter your health condition"
                  type="text"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </OnboardingLayout>
  );
}
