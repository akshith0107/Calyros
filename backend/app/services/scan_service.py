from typing import Dict, Any
from uuid import UUID
from sqlalchemy.orm import Session
import logging
import json

from app.models.product import Product
from app.models.nutrition_fact import NutritionFact
from app.models.ingredient import Ingredient
from app.models.scan_history import ScanHistory
from app.services.storage_service import storage_service
from app.services.extraction_service import extraction_service
from app.services.nutrition_parser import nutrition_parser

logger = logging.getLogger(__name__)

class ScanService:
    async def process_scan(self, db: Session, user_id: UUID, file_bytes: bytes, file_ext: str) -> Dict[str, Any]:
        """
        Orchestrates the entire label scanning pipeline.
        """
        # 1. Image Prep
        mime_type = f"image/{file_ext.lower()}"
        if mime_type == "image/jpg":
            mime_type = "image/jpeg"
            
        try:
            storage_res = {}
            import time
            import asyncio
            from datetime import datetime, timezone
            
            def ts():
                return datetime.now(timezone.utc).isoformat(timespec='milliseconds')
            
            logger.info("=" * 60)
            logger.info("SCAN PIPELINE TIMELINE")
            logger.info("=" * 60)
            total_start = time.time()
            
            ocr_text = "Extracted via Gemini Vision"
            ocr_duration_ms = 0.0
            
            # STAGE 1: PARALLEL UPLOAD & EXTRACTION (Gemini 2.5 Flash)
            logger.info("Step 1: Uploading image to Supabase and extracting data with Gemini in parallel")
            gemini_start_ts = ts()
            ext_start = time.time()
            
            storage_task = storage_service.upload_image(file_bytes, file_ext)
            extraction_task = extraction_service.extract_data(file_bytes, mime_type)
            
            storage_res, raw_ai_data = await asyncio.gather(storage_task, extraction_task)
            
            image_url = storage_res["image_url"]
            ext_end = time.time()
            gemini_end_ts = ts()
            extraction_time_ms = (ext_end - ext_start) * 1000
            logger.info(f"GEMINI_START        = {gemini_start_ts}")
            logger.info(f"GEMINI_END          = {gemini_end_ts}")
            logger.info(f"GEMINI_DURATION_MS  = {extraction_time_ms:.2f}")
            
            # Parse & Validate
            parsed_data = nutrition_parser.parse(raw_ai_data)
            
            # STAGE 2: DB WRITE (Store extracted data)
            db_write_start_ts = ts()
            db_start_1 = time.time()
            result_payload = self._store_scan_results(
                db=db,
                user_id=user_id,
                image_url=image_url,
                data=parsed_data,
                raw_ocr_text=ocr_text,
                extracted_json=raw_ai_data,
                ocr_time_ms=ocr_duration_ms,
                extraction_time_ms=extraction_time_ms
            )
            db_time_ms_1 = (time.time() - db_start_1) * 1000
            scan_id = result_payload["scan_id"]
            
            # STAGE 3: PARALLEL DETERMINISTIC ANALYSIS & RECOMMENDATIONS
            from app.services.scoring_service import scoring_service
            from app.services.recommendation_service import recommendation_service
            from app.services.alternatives_service import alternatives_service
            
            scoring_start_ts = ts()
            scoring_start = time.time()
            
            score_response = scoring_service.calculate_score(
                db=db, 
                scan_id=scan_id, 
                user_id=user_id,
                scan_history=result_payload["scan_history"],
                product=result_payload["product"],
                facts=result_payload["nutrition_facts"],
                ingredients=result_payload["ingredients"]
            )

            _, _ = await asyncio.gather(
                recommendation_service.generate_recommendation(db, scan_id, user_id),
                alternatives_service.get_alternatives(db, scan_id, user_id)
            )
            
            scoring_end = time.time()
            scoring_end_ts = ts()
            scoring_duration_ms = (scoring_end - scoring_start) * 1000
            logger.info(f"SCORING_START       = {scoring_start_ts}")
            logger.info(f"SCORING_END         = {scoring_end_ts}")
            logger.info(f"SCORING_DURATION_MS = {scoring_duration_ms:.2f}")
            
            # STAGE 4: DB UPDATE (Write analysis back)
            analysis_result = score_response.model_dump()
            db_start_2 = time.time()
            scan_history = db.query(ScanHistory).filter(ScanHistory.id == scan_id).first()
            if scan_history:
                scan_history.analysis_json = analysis_result
                scan_history.analysis_time_ms = scoring_duration_ms
                scan_history.overall_score = score_response.score
                db.commit()
            db_time_ms_2 = (time.time() - db_start_2) * 1000
            db_write_end_ts = ts()
            db_total_ms = db_time_ms_1 + db_time_ms_2
            logger.info(f"DB_WRITE_START      = {db_write_start_ts}")
            logger.info(f"DB_WRITE_END        = {db_write_end_ts}")
            logger.info(f"DB_WRITE_DURATION_MS= {db_total_ms:.2f}")
            
            # RESPONSE ASSEMBLY (Phase 6 API Redesign)
            api_resp_start_ts = ts()
            api_resp_start = time.time()
            score_dict = score_response.model_dump()
            
            # Reconstruct exactly as requested by Phase 6
            final_response = {
                "success": True,
                "scan_id": str(scan_id),
                "image_url": result_payload.get("image_url", ""),
                "score": score_dict["score"],
                "classification": score_dict["classification"],
                "nutrition_facts": score_dict["nutrition_facts"],
                "all_detected_nutrients": score_dict["all_detected_nutrients"],
                "vitamins": score_dict["vitamins"],
                "minerals": score_dict["minerals"],
                "ingredients": score_dict["ingredients"],
                "allergens": score_dict["allergens"],
                "additives": score_dict["additives"],
                "key_findings": score_dict["key_findings"],
                "positive_factors": score_dict["positive_factors"],
                "concerns": score_dict["concerns"],
                "allergy_analysis": score_dict["allergy_analysis"],
                "personalized_analysis": score_dict["personalized_analysis"],
                "recommendations": score_dict["recommendations"],
                "ingredient_quality_score": score_dict["ingredient_quality_score"],
                "ingredient_findings": score_dict["ingredient_findings"],
                "processing_assessment": score_dict["processing_assessment"]
            }
            
            api_resp_end = time.time()
            api_resp_end_ts = ts()
            api_resp_duration_ms = (api_resp_end - api_resp_start) * 1000
            logger.info(f"API_RESPONSE_START  = {api_resp_start_ts}")
            logger.info(f"API_RESPONSE_END    = {api_resp_end_ts}")
            logger.info(f"API_RESPONSE_DURATION_MS = {api_resp_duration_ms:.2f}")
            
            total_time_ms = (time.time() - total_start) * 1000
            
            logger.info("━━━━━━━━━━━━━━━━━━━━━━ TRACEABILITY ━━━━━━━━━━━━━━━━━━━━━━")
            logger.info(f"OCR Output:\n{ocr_text}")
            logger.info(f"Parsed JSON:\n{json.dumps(parsed_data, indent=2)}")
            logger.info(f"Key Findings:\n{json.dumps(score_dict['key_findings'], indent=2)}")
            
            # Need to handle SQLAlchemy objects safely in json.dumps
            def safe_serialize(obj):
                if hasattr(obj, "__dict__"):
                    d = obj.__dict__.copy()
                    d.pop("_sa_instance_state", None)
                    return d
                return str(obj)
                
            logger.info(f"Final API Response:\n{json.dumps(final_response, indent=2, default=safe_serialize)}")
            logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
            
            logger.info("-" * 60)
            logger.info(f"SCAN_ID             = {scan_id}")
            logger.info(f"TOTAL_DURATION_MS   = {total_time_ms:.2f}")
            logger.info("=" * 60)
            
            return final_response
            
        except Exception as e:
            # Rollback image if processing fails
            logger.exception(f"Scan pipeline failed: {str(e)}")
            if "path" in storage_res:
                await storage_service.delete_image(storage_res["path"])
            raise RuntimeError("Failed to process scan. Please try again.") from e

    def _store_scan_results(
        self, 
        db: Session, 
        user_id: UUID, 
        image_url: str, 
        data: Dict[str, Any],
        raw_ocr_text: str = None,
        extracted_json: Dict[str, Any] = None,
        analysis_json: Dict[str, Any] = None,
        ocr_time_ms: float = None,
        extraction_time_ms: float = None,
        analysis_time_ms: float = None
    ) -> Dict[str, Any]:
        import time
        t_start = time.time()
        timings = {}
        
        product_name = data["product_name"]
        
        from sqlalchemy.orm import joinedload
        t0 = time.time()
        
        product = None
        # Never reuse records if the name is empty or Unknown Product
        if product_name and product_name.strip() and product_name.lower() != "unknown product":
            product = db.query(Product)\
                .options(joinedload(Product.nutrition_fact), joinedload(Product.ingredients))\
                .filter(Product.product_name == product_name)\
                .first()
        
        timings["product_lookup"] = (time.time() - t0) * 1000
        
        if not product:
            logger.info("━━━━━━━━━━━━━━━━━━━━━━ PRODUCT SAVED ━━━━━━━━━━━━━━━━━━━━━━")
            logger.info(f"NEW PRODUCT CREATED: {product_name}")
            logger.info(f"Nutrition Facts Saved: {json.dumps(data['nutrition_facts'])}")
            logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
            
            t1 = time.time()
            product = Product(
                product_name=product_name if product_name else "Unknown Product",
                brand=data.get("brand", "Unknown"),
                image_url=image_url,
                allergens=data.get("allergens", []),
                additives=data.get("additives", []),
                claims=data.get("claims", [])
            )
            db.add(product)
            db.flush()
            timings["product_create"] = (time.time() - t1) * 1000
            
            t2 = time.time()
            valid_db_fields = ["calories", "protein", "carbohydrates", "sugar", "fiber", "sodium", "total_fat", "saturated_fat", "trans_fat"]
            db_facts = {k: v for k, v in data["nutrition_facts"].items() if k in valid_db_fields}
            dynamic_facts = {k: v for k, v in data["nutrition_facts"].items() if k not in valid_db_fields}
            
            facts = NutritionFact(
                product_id=product.id,
                serving_size=data.get("serving_size"),
                dynamic_facts=dynamic_facts,
                vitamins=data.get("vitamins", {}),
                minerals=data.get("minerals", {}),
                amino_acids=data.get("amino_acids", {}),
                **db_facts
            )
            db.add(facts)
            db.flush()
            timings["facts_create"] = (time.time() - t2) * 1000
            
            t3 = time.time()
            if data.get("ingredients"):
                ing_names = data["ingredients"]
                existing_ings = db.query(Ingredient).filter(Ingredient.ingredient_name.in_(ing_names)).all()
                existing_map = {ing.ingredient_name: ing for ing in existing_ings}
                
                new_ingredients = []
                for ing_name in ing_names:
                    if ing_name not in existing_map:
                        new_ing = Ingredient(ingredient_name=ing_name)
                        new_ingredients.append(new_ing)
                        existing_map[ing_name] = new_ing
                        
                if new_ingredients:
                    db.add_all(new_ingredients)
                    db.flush()
                    
                for ing_name in ing_names:
                    product.ingredients.append(existing_map[ing_name])
                    
                db.flush()
            timings["ingredients_create"] = (time.time() - t3) * 1000
        else:
            logger.info("━━━━━━━━━━━━━━━━━━━━━━ PRODUCT SAVED ━━━━━━━━━━━━━━━━━━━━━━")
            logger.info(f"EXISTING PRODUCT FOUND: {product_name}")
            # Print the nutrition values we are linking to (which come from the DB)
            existing_facts = {
                "calories": product.nutrition_fact.calories if product.nutrition_fact else None,
                "protein": product.nutrition_fact.protein if product.nutrition_fact else None,
                "carbohydrates": product.nutrition_fact.carbohydrates if product.nutrition_fact else None,
                "sugar": product.nutrition_fact.sugar if product.nutrition_fact else None,
                "fiber": product.nutrition_fact.fiber if product.nutrition_fact else None,
                "sodium": product.nutrition_fact.sodium if product.nutrition_fact else None,
                "total_fat": product.nutrition_fact.total_fat if product.nutrition_fact else None
            }
            logger.info(f"Nutrition Facts Reused: {json.dumps(existing_facts)}")
            logger.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
            
            # Since we are reusing the product, the facts are what's in the DB, so we should update data to match
            # This ensures the final API response sends back the actual DB values it was linked to!
            data["nutrition_facts"] = existing_facts
            
            timings["product_create"] = 0
            timings["facts_create"] = 0
            timings["ingredients_create"] = 0

        t4 = time.time()
        scan_history = ScanHistory(
            user_id=user_id,
            product_id=product.id,
            image_url=image_url,
            raw_ocr_text=raw_ocr_text,
            extracted_json=extracted_json,
            analysis_json=analysis_json,
            ocr_time_ms=ocr_time_ms,
            extraction_time_ms=extraction_time_ms,
            analysis_time_ms=analysis_time_ms,
            overall_score=analysis_json.get("health_score") if analysis_json else None
        )
        db.add(scan_history)
        timings["history_create_obj"] = (time.time() - t4) * 1000
        
        t5 = time.time()
        db.commit()
        timings["commit"] = (time.time() - t5) * 1000
        
        t6 = time.time()
        # db.refresh(product)  # Unnecessary and very slow (requires DB trip)
        # db.refresh(scan_history)  # Unnecessary and very slow (requires DB trip)
        timings["refresh"] = (time.time() - t6) * 1000
        
        t7 = time.time()
        if "facts" not in locals() or not facts:
            nf = product.nutrition_fact
        else:
            nf = facts
            
        ingredients = product.ingredients
        timings["fetch_relations"] = (time.time() - t7) * 1000
        
        logger.info("--- DB_WRITE_1 BREAKDOWN ---")
        for k, v in timings.items():
            logger.info(f"  {k}: {v:.2f}ms")
            
        return {
            "success": True,
            "scan_id": scan_history.id,
            "scan_history": scan_history,
            "product": product,
            "nutrition_facts": nf,
            "ingredients": ingredients,
            "image_url": image_url
        }

scan_service = ScanService()
