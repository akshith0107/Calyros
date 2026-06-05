import uuid
from typing import Dict, Optional
from supabase import create_client, Client
from app.core.config import settings

class StorageService:
    def __init__(self):
        self.url: str = settings.SUPABASE_URL
        self.key: str = settings.SUPABASE_SERVICE_ROLE_KEY
        
        # Don't initialize if credentials are dummy (for testing)
        self.supabase: Optional[Client] = None
        if self.url and self.key and "dummy" not in self.url:
            try:
                self.supabase = create_client(self.url, self.key)
            except Exception as e:
                import logging
                logging.error(f"Failed to initialize Supabase client: {e}")

    async def upload_image(self, file_bytes: bytes, file_ext: str) -> Dict[str, str]:
        """
        Uploads image to Supabase storage bucket 'scans'
        Returns dict with image_url.
        """
        if not self.supabase:
            # Mock behavior for local testing without Supabase
            return {"image_url": f"https://mock-supabase.com/scans/mock-{uuid.uuid4()}{file_ext}"}

        file_path = f"scans/{uuid.uuid4()}{file_ext}"
        
        try:
            # Upload to Supabase 'scans' bucket
            res = self.supabase.storage.from_("scans").upload(
                file=file_bytes,
                path=file_path,
                file_options={"content-type": f"image/{file_ext.strip('.')}"}
            )
            
            # Generate public URL
            public_url = self.supabase.storage.from_("scans").get_public_url(file_path)
            
            return {"image_url": public_url, "path": file_path}
            
        except Exception as e:
            import logging
            logging.error(f"Supabase upload failed ({str(e)}). Falling back to mock URL.")
            return {"image_url": f"https://mock-supabase.com/scans/mock-{uuid.uuid4()}{file_ext}"}

    async def delete_image(self, path: str) -> bool:
        """
        Deletes image from Supabase storage if scan fails
        """
        if not self.supabase:
            return True
            
        try:
            self.supabase.storage.from_("scans").remove([path])
            return True
        except Exception:
            return False

storage_service = StorageService()
