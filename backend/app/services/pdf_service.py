import os
from fpdf import FPDF
from typing import Dict, Any
from uuid import UUID

class NutritionReportPDF(FPDF):
    def header(self):
        self.set_font('helvetica', 'B', 20)
        self.cell(0, 10, 'Calyros AI - Nutrition Scan Report', border=False, ln=True, align='C')
        self.ln(10)

    def footer(self):
        self.set_y(-15)
        self.set_font('helvetica', 'I', 8)
        self.cell(0, 10, f'Page {self.page_no()}', 0, 0, 'C')
        
    def add_section_title(self, title: str):
        self.set_font('helvetica', 'B', 14)
        self.cell(0, 10, title, ln=True)
        self.ln(2)
        
    def add_text(self, text: str):
        self.set_font('helvetica', '', 11)
        self.multi_cell(0, 8, text)
        self.ln(2)

class PDFService:
    def generate_report(self, user_profile: Dict[str, Any], analytics: Dict[str, Any], scan_data: Dict[str, Any], recommendation: Dict[str, Any], extracted_data: Dict[str, Any]) -> str:
        pdf = NutritionReportPDF()
        pdf.add_page()
        
        # 1. User Information & BMI
        pdf.add_section_title("1. Personal Profile & Analytics")
        profile_text = f"Age: {user_profile.get('age')} | Gender: {user_profile.get('gender')}\n"
        
        bmi = analytics.get("bmi")
        if bmi:
            profile_text += f"BMI: {bmi.bmi} ({bmi.category})\n"
            profile_text += f"Assessment: {bmi.health_assessment}\n"
            
        targets = analytics.get("targets")
        if targets:
            profile_text += f"Daily Targets: {targets.daily_calories} kcal, Protein: {targets.protein_target_g}g, Carbs: {targets.carb_target_g}g, Fat: {targets.fat_target_g}g, Water: {targets.water_target_liters}L"
            
        pdf.add_text(profile_text)
        pdf.ln(5)
        
        # 2. Product Info
        pdf.add_section_title("2. Scanned Product")
        prod = scan_data.get('product_name', 'Unknown Product')
        pdf.add_text(f"Product: {prod}\nProcessing Level: {recommendation.get('processing_level', 'Unknown')}\nReason: {recommendation.get('processing_reason', '')}")
        pdf.ln(5)
        
        # 3. Overall Health Score
        pdf.add_section_title("3. Health Score & Breakdown")
        score = recommendation.get("health_score", "N/A")
        pdf.add_text(f"Overall Health Score: {score} / 100")
        
        breakdown = recommendation.get("score_breakdown", {})
        if breakdown:
            brk_txt = "\n".join([f"- {k.replace('_', ' ').title()}: {v}/100" for k, v in breakdown.items()])
            pdf.add_text(brk_txt)
        pdf.ln(5)
            
        # 4. Goal & Disease Compatibility
        pdf.add_section_title("4. Goal & Disease Compatibility")
        goals = recommendation.get("goal_compatibility", {})
        if goals:
            gls_txt = "\n".join([f"- {k.replace('_', ' ').title()}: {v}" for k, v in goals.items()])
            pdf.add_text(gls_txt)
            pdf.ln(2)
            
        diseases = recommendation.get("disease_compatibility", {})
        if diseases:
            pdf.add_text("Condition Risks & Recommendations:")
            for k, v in diseases.items():
                pdf.add_text(f"- {k.replace('_', ' ').title()}: {v.get('suitability', 'Unknown')}\n  Risks: {v.get('risks', 'None')}\n  Advice: {v.get('recommendations', 'None')}")
            pdf.ln(5)
            
        # 5. Ingredient Intelligence
        pdf.add_section_title("5. Ingredient Intelligence")
        ingredients = extracted_data.get("ingredient_intelligence", [])
        if ingredients:
            for ing in ingredients:
                pdf.add_text(f"- {ing.get('name')} ({ing.get('category')}): {ing.get('benefit_or_risk')}\n  Reason: {ing.get('reason')}")
            pdf.ln(5)
            
        # 6. Recommendations & Alternatives
        pdf.add_section_title("6. Recommendations")
        recs = recommendation.get("recommendations", [])
        if recs:
            rec_txt = "\n".join([f"- {r}" for r in recs])
            pdf.add_text(rec_txt)
            
        alts = recommendation.get("healthier_alternatives", [])
        if alts:
            pdf.add_section_title("Healthier Alternatives")
            alts_txt = "\n".join([f"- {a.get('name', '')}: {a.get('reason', '')}" for a in alts])
            pdf.add_text(alts_txt)
            
        # Save to temp file
        temp_dir = os.path.join(os.path.dirname(__file__), '..', '..', 'tmp')
        os.makedirs(temp_dir, exist_ok=True)
        file_path = os.path.join(temp_dir, f"report_{scan_data.get('scan_id')}.pdf")
        
        pdf.output(file_path)
        return file_path

pdf_service = PDFService()
