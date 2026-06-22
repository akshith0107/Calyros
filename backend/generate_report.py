import json

BEFORE_FILE = r'C:\Users\AKSHITH REDDY\.gemini\antigravity-ide\brain\955b33d6-bd38-4a59-b378-5057d7f96fc8\scratch\benchmark_before.json'
AFTER_FILE = r'C:\Users\AKSHITH REDDY\.gemini\antigravity-ide\brain\955b33d6-bd38-4a59-b378-5057d7f96fc8\scratch\benchmark_after.json'
REPORT_FILE = r'C:\Users\AKSHITH REDDY\.gemini\antigravity-ide\brain\955b33d6-bd38-4a59-b378-5057d7f96fc8\accuracy_report.md'

with open(BEFORE_FILE, 'r') as f:
    before_data = json.load(f)

with open(AFTER_FILE, 'r') as f:
    after_data = json.load(f)

before_dict = {i['name']: i for i in before_data}
after_dict = {i['name']: i for i in after_data}

report = []
report.append("# Accuracy Improvement Phase 1 - Benchmark Report\n")

report.append("## Multi-Dimensional Scoring Improvements\n")
report.append("The legacy engine used a single score. The v3 engine introduces 4 dimensions: Nutrition, Ingredient, Processing, and Goal Alignment.\n\n")

report.append("| Product | Legacy Score (Before) | Overall Score (After) | Nutrition | Ingredient | Processing | Goal Align |\n")
report.append("|---------|-----------------------|-----------------------|-----------|------------|------------|------------|\n")

# Just list first 10 for brevity in the summary table
for name in list(before_dict.keys())[:15]:
    b = before_dict[name]
    a = after_dict[name]
    report.append(f"| {name} | {b['overall_score']} | **{a['overall_score']}** | {a['nutrition_score']} | {a['ingredient_score']} | {a['processing_score']} | {a['goal_alignment_score']} |\n")

report.append("\n## Sugar Intelligence Enhancements\n")
report.append("Before, products like Apple and 100% Fruit Juice were severely penalized for natural sugars. Now, the engine differentiates added sugar.\n\n")

for name in ["Apple", "Banana", "Fruit Juice (100% Apple)", "Snickers", "Coca-Cola"]:
    b = before_dict[name]
    a = after_dict[name]
    report.append(f"### {name}\n")
    report.append(f"- **Before**: Score {b['overall_score']}, Concerns: {b['concerns']}\n")
    report.append(f"- **After**: Score {a['overall_score']}, Concerns: {a['concerns']}\n\n")

report.append("## Ingredient Intelligence v3 Enhancements\n")
report.append("Keyword matching has been replaced with the Ingredient Knowledge Base, eliminating false positives and properly flagging additives/seed oils.\n\n")

for name in ["Oats", "Doritos", "Snickers", "Diet Coke", "Peanut Butter"]:
    b = before_dict[name]
    a = after_dict[name]
    report.append(f"### {name}\n")
    report.append(f"- **Before Findings**: {b['ingredient_findings']}\n")
    report.append(f"- **After Findings**: {a['ingredient_findings']}\n\n")

with open(REPORT_FILE, 'w') as f:
    f.writelines(report)

print("Report generated.")
