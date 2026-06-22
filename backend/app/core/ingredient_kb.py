import re

INGREDIENT_KB = {
    # Artificial Colors
    "red 40": {"category": "artificial_color", "flags": ["artificial", "additive"], "health_impact": "negative", "severity": 2, "description": "Synthetic food dye.", "specific_impact": "May cause hyperactivity in sensitive children."},
    "yellow 5": {"category": "artificial_color", "flags": ["artificial", "additive"], "health_impact": "negative", "severity": 2, "description": "Synthetic food dye (Tartrazine).", "specific_impact": "Associated with allergic reactions in some individuals."},
    "yellow 6": {"category": "artificial_color", "flags": ["artificial", "additive"], "health_impact": "negative", "severity": 2, "description": "Synthetic food dye.", "specific_impact": "May cause hyperactivity in sensitive children."},
    "blue 1": {"category": "artificial_color", "flags": ["artificial", "additive"], "health_impact": "negative", "severity": 2, "description": "Synthetic food dye.", "specific_impact": "May cause hyperactivity in sensitive children."},
    "caramel color": {"category": "artificial_color", "flags": ["artificial", "additive"], "health_impact": "negative", "severity": 2, "description": "Color additive often made with ammonia.", "specific_impact": "May contain 4-MEI, a possible carcinogen."},
    
    # Natural Colors
    "annatto": {"category": "natural_color", "flags": ["natural", "additive"], "health_impact": "neutral", "severity": 0, "description": "Natural color derived from achiote seeds.", "specific_impact": "Generally recognized as safe."},
    "beet juice": {"category": "natural_color", "flags": ["natural", "additive"], "health_impact": "positive", "severity": 0, "description": "Natural coloring from beets.", "specific_impact": "Contains beneficial nitrates."},
    "turmeric": {"category": "natural_color", "flags": ["natural", "additive"], "health_impact": "positive", "severity": 0, "description": "Natural coloring and spice.", "specific_impact": "Contains curcumin, a potent anti-inflammatory."},
    "beta carotene": {"category": "natural_color", "flags": ["natural", "additive"], "health_impact": "positive", "severity": 0, "description": "Natural orange pigment.", "specific_impact": "Precursor to Vitamin A."},
    
    # Flavors
    "artificial flavor": {"category": "artificial_flavor", "flags": ["artificial", "additive"], "health_impact": "negative", "severity": 1, "description": "Synthetic flavoring agents.", "specific_impact": "Unknown long-term effects due to proprietary blends."},
    "natural flavor": {"category": "natural_flavor", "flags": ["natural", "additive"], "health_impact": "neutral", "severity": 0, "description": "Flavoring derived from natural sources.", "specific_impact": "Often highly processed despite the 'natural' label."},
    
    # Preservatives
    "sodium benzoate": {"category": "preservative", "flags": ["artificial", "additive"], "health_impact": "negative", "severity": 2, "description": "Chemical preservative.", "specific_impact": "Can form benzene (a carcinogen) when combined with Vitamin C."},
    "potassium benzoate": {"category": "preservative", "flags": ["artificial", "additive"], "health_impact": "negative", "severity": 2, "description": "Chemical preservative.", "specific_impact": "Can form benzene when combined with Vitamin C."},
    "bha": {"category": "preservative", "flags": ["artificial", "additive"], "health_impact": "negative", "severity": 3, "description": "Butylated hydroxyanisole.", "specific_impact": "Anticipated to be a human carcinogen by the NIH."},
    "bht": {"category": "preservative", "flags": ["artificial", "additive"], "health_impact": "negative", "severity": 2, "description": "Butylated hydroxytoluene.", "specific_impact": "Possible endocrine disruptor."},
    "sodium nitrite": {"category": "preservative", "flags": ["artificial", "additive"], "health_impact": "negative", "severity": 3, "description": "Used in cured meats.", "specific_impact": "Can form carcinogenic nitrosamines when cooked at high heat."},
    "tbhq": {"category": "preservative", "flags": ["artificial", "additive"], "health_impact": "negative", "severity": 2, "description": "Synthetic antioxidant.", "specific_impact": "Linked to immune system issues in animal studies."},
    
    # Industrial Oils
    "canola oil": {"category": "industrial_oil", "flags": ["processed", "seed_oil"], "health_impact": "negative", "severity": 1, "description": "Highly refined seed oil.", "specific_impact": "High in Omega-6 which may promote inflammation when imbalanced."},
    "soybean oil": {"category": "industrial_oil", "flags": ["processed", "seed_oil"], "health_impact": "negative", "severity": 2, "description": "Highly refined seed oil.", "specific_impact": "Strongly linked to obesity and metabolic dysfunction in animal models."},
    "palm oil": {"category": "industrial_oil", "flags": ["ultra_processed", "seed_oil"], "health_impact": "negative", "severity": 2, "description": "Highly refined tropical oil.", "specific_impact": "High in saturated fat; major environmental concerns."},
    "vegetable oil": {"category": "industrial_oil", "flags": ["processed", "seed_oil"], "health_impact": "negative", "severity": 2, "description": "Generic term usually meaning soybean oil.", "specific_impact": "High in inflammatory Omega-6 fatty acids."},
    
    # Healthy Fats
    "extra virgin olive oil": {"category": "whole_food", "flags": ["natural", "healthy_fat"], "health_impact": "positive", "severity": 0, "description": "Unrefined oil from olives.", "specific_impact": "Rich in oleic acid and antioxidants; heart-protective."},
    "olive oil": {"category": "whole_food", "flags": ["natural", "healthy_fat"], "health_impact": "positive", "severity": 0, "description": "Oil from olives.", "specific_impact": "Heart healthy monounsaturated fats."},
    "avocado oil": {"category": "whole_food", "flags": ["natural", "healthy_fat"], "health_impact": "positive", "severity": 0, "description": "Unrefined oil from avocados.", "specific_impact": "High smoke point; excellent monounsaturated fat profile."},
    
    # Sugars
    "high fructose corn syrup": {"category": "added_sugar", "flags": ["ultra_processed", "additive"], "health_impact": "negative", "severity": 3, "description": "Highly processed sweetener from corn.", "specific_impact": "Strongly linked to non-alcoholic fatty liver disease and insulin resistance."},
    "corn syrup": {"category": "added_sugar", "flags": ["ultra_processed", "additive"], "health_impact": "negative", "severity": 3, "description": "Processed sweetener.", "specific_impact": "Spikes blood glucose rapidly."},
    "sugar": {"category": "added_sugar", "flags": ["processed"], "health_impact": "negative", "severity": 2, "description": "Refined sucrose.", "specific_impact": "Contributes to weight gain and metabolic syndrome if overconsumed."},
    "maltodextrin": {"category": "added_sugar", "flags": ["ultra_processed", "additive"], "health_impact": "negative", "severity": 3, "description": "Highly processed carbohydrate.", "specific_impact": "Has a higher glycemic index than table sugar; can spike blood glucose dramatically."},
    "dextrose": {"category": "added_sugar", "flags": ["ultra_processed", "additive"], "health_impact": "negative", "severity": 2, "description": "Simple sugar derived from corn.", "specific_impact": "Spikes blood glucose rapidly."},
    
    # Artificial Sweeteners
    "sucralose": {"category": "artificial_sweetener", "flags": ["artificial", "additive"], "health_impact": "negative", "severity": 2, "description": "Zero-calorie synthetic sweetener.", "specific_impact": "May negatively alter gut microbiome composition."},
    "aspartame": {"category": "artificial_sweetener", "flags": ["artificial", "additive"], "health_impact": "negative", "severity": 2, "description": "Synthetic sweetener.", "specific_impact": "Classified as possibly carcinogenic by WHO; causes headaches in some."},
    "erythritol": {"category": "sugar_alcohol", "flags": ["processed", "additive"], "health_impact": "neutral", "severity": 1, "description": "Sugar alcohol.", "specific_impact": "Recent studies suggest potential link to cardiovascular events, though generally considered safe."},
    "stevia": {"category": "natural_sweetener", "flags": ["natural"], "health_impact": "neutral", "severity": 0, "description": "Zero-calorie sweetener from stevia leaf.", "specific_impact": "Does not spike blood sugar; generally well tolerated."},
    
    # Additives
    "monosodium glutamate": {"category": "additive", "flags": ["artificial", "flavor_enhancer"], "health_impact": "negative", "severity": 2, "description": "Flavor enhancer (MSG).", "specific_impact": "Can cause headaches or numbness in sensitive individuals (MSG symptom complex)."},
    
    # Protein
    "whey protein isolate": {"category": "processed", "flags": ["quality_protein"], "health_impact": "positive", "severity": 0, "description": "Highly bioavailable milk protein.", "specific_impact": "Excellent for muscle protein synthesis."},
    "pea protein": {"category": "processed", "flags": ["quality_protein"], "health_impact": "positive", "severity": 0, "description": "Plant-based protein.", "specific_impact": "Good alternative for dairy sensitivities."},
    
    # Whole Foods
    "apple": {"category": "whole_food", "flags": ["natural", "quality_fiber"], "health_impact": "positive", "severity": 0, "description": "Whole fruit.", "specific_impact": "Rich in pectin and polyphenols."},
    "oats": {"category": "whole_food", "flags": ["natural", "quality_fiber"], "health_impact": "positive", "severity": 0, "description": "Whole grain.", "specific_impact": "High in beta-glucan fiber, which lowers cholesterol."},
    "almonds": {"category": "whole_food", "flags": ["natural", "healthy_fat"], "health_impact": "positive", "severity": 0, "description": "Tree nut.", "specific_impact": "Rich in Vitamin E and monounsaturated fats."},
    "broccoli": {"category": "whole_food", "flags": ["natural", "quality_fiber"], "health_impact": "positive", "severity": 0, "description": "Cruciferous vegetable.", "specific_impact": "Contains sulforaphane, a potent antioxidant."}
}

def analyze_ingredient(ingredient_name: str) -> dict:
    name_lower = ingredient_name.lower().strip()
    
    # Exact match first
    if name_lower in INGREDIENT_KB:
        return INGREDIENT_KB[name_lower]
    
    # Substring match using word boundaries to avoid 'sugar' in 'sugar snap peas'
    for kb_name, data in INGREDIENT_KB.items():
        pattern = r'\b' + re.escape(kb_name) + r'\b'
        if re.search(pattern, name_lower):
            return data
            
    return {
        "category": "unknown", 
        "flags": [], 
        "health_impact": "unknown", 
        "description": "Unknown ingredient.",
        "specific_impact": "No specific health data available."
    }

