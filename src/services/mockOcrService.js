/**
 * Simulates an OCR service that extracts text from an image 
 * and structures it into a JSON Nutrition Label format.
 */
export async function extractNutritionLabel(imageBlobOrFile) {
  return new Promise((resolve) => {
    // Simulate network delay (1.5 seconds)
    setTimeout(() => {
      // Return a mocked structure of a generic scanned product
      resolve({
        productName: "Organic Oat Milk",
        confidence: 0.94,
        rawText: "Nutrition Facts Serving Size 1 cup... Calories 120...",
        parsedData: {
          calories: 120,
          protein: 3,
          sugar: 7,
          sodium: 105,
          saturatedFat: 0.5,
          fiber: 2,
          carbohydrates: 16
        }
      });
    }, 1500);
  });
}
