/**
 * Simulates an AI reasoning layer (e.g., Groq API call) that compares 
 * the extracted nutrition data against the user's specific health profile.
 */
export async function analyzeNutritionVsProfile(ocrData, userProfile) {
  return new Promise((resolve) => {
    // Simulate API latency for "AI thinking" (2 seconds)
    setTimeout(() => {
      const { parsedData, productName } = ocrData;
      
      let healthScore = 85; 
      let status = 'Excellent';
      let insights = [];
      let alternative = null;

      // 1. Check Allergies
      const userAllergies = userProfile.allergies || [];
      if (userAllergies.includes('dairy') && productName.toLowerCase().includes('milk')) {
        // We know it's oat milk from the mock, but let's simulate a check
        insights.push("Great choice! This is dairy-free and aligns with your allergy profile.");
      }

      if (userAllergies.includes('gluten')) {
        insights.push("This product is naturally gluten-free.");
      }

      // 2. Check Health Conditions
      const conditions = userProfile.health || [];
      if (conditions.includes('diabetes') || conditions.includes('high-bp')) {
        if (parsedData.sugar > 5) {
          healthScore -= 15;
          insights.push(`The sugar content (${parsedData.sugar}g) is slightly elevated for your blood sugar goals.`);
        }
        if (parsedData.sodium > 200) {
          healthScore -= 10;
          insights.push(`Sodium levels are moderate but watch your overall daily intake.`);
        }
      }

      // 3. Check Goals
      if (userProfile.goals === 'muscle' || userProfile.goals === 'weight-loss') {
        if (parsedData.protein < 5) {
          insights.push("Protein content is low. Consider pairing this with a protein source to meet your goals.");
          healthScore -= 5;
        }
      }

      // Determine Status based on calculated score
      if (healthScore >= 80) status = 'Excellent';
      else if (healthScore >= 60) status = 'Good';
      else if (healthScore >= 40) status = 'Moderate';
      else status = 'Poor';

      // Generate a smart alternative if score isn't perfect
      if (healthScore < 90) {
        alternative = {
          original: productName,
          suggestion: "Unsweetened Almond Milk",
          improvement: "+12%"
        };
      }

      // Provide a fallback generic insight if none triggered
      if (insights.length === 0) {
        insights.push("This product generally aligns well with your daily nutritional targets.");
      }

      resolve({
        healthScore,
        status,
        insights,
        alternative,
        timestamp: new Date().toISOString()
      });
    }, 2000);
  });
}
