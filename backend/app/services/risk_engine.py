from typing import List, Tuple

class RiskEngine:
    """Aggregates, deduplicates, and formats the warnings and flags from all engines."""
    
    @staticmethod
    def process_warnings_and_flags(
        nut_warnings: List[str], nut_flags: List[str],
        ing_warnings: List[str],
        pro_warnings: List[str], pro_flags: List[str],
        com_warnings: List[str], com_flags: List[str]
    ) -> Tuple[List[str], List[str]]:
        
        # Aggregate
        all_warnings = nut_warnings + ing_warnings + pro_warnings + com_warnings
        all_flags = nut_flags + pro_flags + com_flags
        
        # Deduplicate while preserving order
        final_warnings = list(dict.fromkeys(all_warnings))
        final_flags = list(dict.fromkeys(all_flags))
        
        return final_warnings, final_flags
        
    @staticmethod
    def classify_score(overall_score: float, flags: List[str]) -> str:
        """Classifies the overall score into SAFE, MODERATE, or AVOID."""
        if "ALLERGEN_PRESENT" in flags:
            return "AVOID"
            
        if overall_score >= 70:
            return "SAFE"
        elif overall_score >= 40:
            return "MODERATE"
        else:
            return "AVOID"

risk_engine = RiskEngine()
