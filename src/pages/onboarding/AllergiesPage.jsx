import { motion, AnimatePresence } from 'framer-motion';
import OnboardingLayout from '../../components/OnboardingLayout';
import SelectionCard from '../../components/SelectionCard';
import InputField from '../../components/InputField';
import { useOnboardingStore } from '../../hooks/useOnboardingStore';

const allergens = [
  { value: 'milk', label: 'Milk' },
  { value: 'peanut', label: 'Peanut' },
  { value: 'tree-nuts', label: 'Tree Nuts' },
  { value: 'soy', label: 'Soy' },
  { value: 'egg', label: 'Egg' },
  { value: 'gluten', label: 'Gluten / Celiac' },
  { value: 'shellfish', label: 'Shellfish' },
  { value: 'other', label: 'Other Allergy' },
  { value: 'none', label: 'None' },
];

export default function AllergiesPage() {
  const { data, updateField } = useOnboardingStore();

  const toggle = (value) => {
    let current = [...data.allergies];

    if (value === 'none') {
      // If user selects "none", clear everything else and just set "none"
      updateField('allergies', ['none']);
      updateField('allergiesOther', '');
      return;
    }

    // If user selects anything other than "none", remove "none"
    current = current.filter(v => v !== 'none');

    if (current.includes(value)) {
      // Deselect
      const filtered = current.filter(v => v !== value);
      updateField('allergies', filtered);
      if (value === 'other') {
        updateField('allergiesOther', ''); // Clear custom input if deselected
      }
    } else {
      // Select
      updateField('allergies', [...current, value]);
    }
  };

  const isOtherSelected = data.allergies.includes('other');
  
  // Can continue if:
  // 1. Array length > 0 AND
  // 2. If 'other' is selected, the 'allergiesOther' input is not empty
  const canContinue = data.allergies.length > 0 && (!isOtherSelected || data.allergiesOther.trim().length > 0);

  return (
    <OnboardingLayout
      step="allergies"
      title="Do you have any food allergies or intolerances?"
      description="We'll automatically flag products containing your allergens."
      canContinue={canContinue}
    >
      <div className="w-full max-w-2xl">
        <div className="onboarding-grid onboarding-grid--2 mb-6" role="listbox" aria-label="Allergies selection" aria-multiselectable="true">
          {allergens.map((a) => (
            <SelectionCard
              key={a.value}
              label={a.label}
              selected={data.allergies.includes(a.value)}
              onClick={() => toggle(a.value)}
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
                  id="allergies-other"
                  label="Other Allergy"
                  value={data.allergiesOther}
                  onChange={(val) => updateField('allergiesOther', val)}
                  placeholder="Enter your allergy"
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
